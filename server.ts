import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  runTransaction,
  query,
  where,
} from 'firebase/firestore';

interface FirebaseAppletConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

interface CachedEntry<T> {
  data: T;
  expiresAt: number;
}

interface ClientSummary {
  id: string;
  username: string;
  storeSlug: string;
  storeName: string;
  isOfficial?: boolean;
}

interface ProductDoc {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  promotionalPrice?: number;
  isOnSale?: boolean;
  images?: string[];
  updatedAt?: string;
}

interface SettingsDoc {
  storeName?: string;
  slogan?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

interface OgMetadata {
  title: string;
  description: string;
  siteName: string;
  imageUrl: string;
  imageMime: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  url: string;
  type: 'website' | 'product';
  priceAmount?: string;
  priceCurrency?: string;
  jsonLd: Record<string, unknown>;
}

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const CACHE_TTL_MS = 30_000;

const ROOT_DIR = process.cwd();
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');

const firebaseConfigRaw = fs.readFileSync(
  path.resolve(ROOT_DIR, 'firebase-applet-config.json'),
  'utf-8'
);
const firebaseConfig = JSON.parse(firebaseConfigRaw) as FirebaseAppletConfig;
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || undefined);

const clientsCache: { data: ClientSummary[] | null; expiresAt: number } = {
  data: null,
  expiresAt: 0,
};
const productCache = new Map<string, CachedEntry<ProductDoc | null>>();
const settingsCache = new Map<string, CachedEntry<SettingsDoc | null>>();

function slugifyStoreName(name?: string): string {
  if (!name) return '';
  return name
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeCompact(val?: string): string {
  if (!val) return '';
  return val
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeParam(raw: unknown, maxLen = 140): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[\r\n\0]/g, '').trim().slice(0, maxLen);
}

function formatBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

function getRequestOrigin(req: Request): string {
  const rawProto = (req.headers['x-forwarded-proto'] as string | undefined) || req.protocol || 'https';
  const protoCandidate = rawProto.split(',')[0].trim().toLowerCase();
  const proto = protoCandidate === 'http' || protoCandidate === 'https' ? protoCandidate : 'https';

  const rawHost =
    (req.headers['x-forwarded-host'] as string | undefined) ||
    req.headers.host ||
    `localhost:${PORT}`;
  const hostCandidate = rawHost.split(',')[0].trim().replace(/[^a-zA-Z0-9.:-]/g, '');
  const host = hostCandidate || `localhost:${PORT}`;

  return `${proto}://${host}`;
}

function isSafePublicHttpUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const h = parsed.hostname.toLowerCase();
    if (
      h === 'localhost' ||
      h === '127.0.0.1' ||
      h === '::1' ||
      h === '0.0.0.0' ||
      h.startsWith('10.') ||
      h.startsWith('192.168.') ||
      h.startsWith('169.254.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(h)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function getCachedClients(): Promise<ClientSummary[]> {
  const now = Date.now();
  if (clientsCache.data && clientsCache.expiresAt > now) {
    return clientsCache.data;
  }

  try {
    const snap = await getDocs(collection(db, 'clients'));
    const list: ClientSummary[] = snap.docs.map((d) => {
      const data = d.data() || {};
      const u = (data.username || '').toString().trim().toLowerCase().replace(/^@+/, '');
      const s = (data.storeSlug || '').toString().trim().toLowerCase().replace(/^@+/, '');
      const resolvedStoreName = (data.storeName || data.name || 'Vitrine Oficial').toString().trim();
      const nameSlug = slugifyStoreName(resolvedStoreName);
      const effectiveSlug = (s && s !== u ? s : '') || nameSlug || u;
      return {
        id: d.id,
        username: u,
        storeSlug: effectiveSlug,
        storeName: resolvedStoreName,
        isOfficial: data.isOfficial !== false && u !== 'teste@123' && d.id !== 'client-test-natural',
      };
    });
    clientsCache.data = list;
    clientsCache.expiresAt = now + CACHE_TTL_MS;
    return list;
  } catch (err) {
    console.warn('OG resolver could not fetch clients:', err);
    return clientsCache.data || [];
  }
}

async function resolveClientBySlug(slugOrUsername: string): Promise<ClientSummary | null> {
  const rawClean = slugOrUsername.trim().toLowerCase().replace(/^@+/, '');
  if (!rawClean) return null;

  const normalizedQuery = normalizeCompact(rawClean);
  const clients = await getCachedClients();

  let fallbackMatch: ClientSummary | null = null;
  for (const client of clients) {
    const u = client.username;
    const s = client.storeSlug;
    const nameSlug = slugifyStoreName(client.storeName);
    const id = client.id.toLowerCase();

    const sNorm = normalizeCompact(s);
    const nameNorm = normalizeCompact(client.storeName);
    const uNorm = normalizeCompact(u);

    if (
      s === rawClean ||
      nameSlug === rawClean ||
      (normalizedQuery && (sNorm === normalizedQuery || nameNorm === normalizedQuery))
    ) {
      return client;
    }

    if (
      !fallbackMatch &&
      (u === rawClean ||
        id === rawClean ||
        id === `client-${rawClean}` ||
        (normalizedQuery && uNorm === normalizedQuery))
    ) {
      fallbackMatch = client;
    }
  }

  return fallbackMatch;
}

async function fetchStoreSettings(clientId?: string): Promise<SettingsDoc | null> {
  const cacheKey = clientId || '__default__';
  const now = Date.now();
  const cached = settingsCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const colName = clientId ? `client_${clientId}_settings` : 'settings';
    const snap = await getDoc(doc(db, colName, 'store_settings'));
    const data = snap.exists() ? (snap.data() as SettingsDoc) : null;
    settingsCache.set(cacheKey, { data, expiresAt: now + CACHE_TTL_MS });
    return data;
  } catch (err) {
    console.warn('OG resolver could not fetch settings:', err);
    return cached?.data || null;
  }
}

async function fetchProduct(productId: string, clientId?: string): Promise<ProductDoc | null> {
  const cacheKey = `${clientId || '__default__'}::${productId}`;
  const now = Date.now();
  const cached = productCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const colName = clientId ? `client_${clientId}_products` : 'products';
    let snap = await getDoc(doc(db, colName, productId));
    if (!snap.exists() && !clientId) {
      snap = await getDoc(doc(db, 'client_client-test-natural_products', productId));
    }
    const data = snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<ProductDoc, 'id'>) }) : null;
    productCache.set(cacheKey, { data, expiresAt: now + CACHE_TTL_MS });
    return data;
  } catch (err) {
    console.warn('OG resolver could not fetch product:', err);
    return cached?.data || null;
  }
}

function getFallbackLogoBuffer(): { buffer: Buffer; mime: string } | null {
  const candidates = [
    path.resolve(PUBLIC_DIR, 'logo-master.jpg'),
    path.resolve(DIST_DIR, 'logo-master.jpg'),
    path.resolve(PUBLIC_DIR, 'icon-512.png'),
    path.resolve(DIST_DIR, 'icon-512.png'),
  ];
  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      return {
        buffer: fs.readFileSync(filePath),
        mime: ext === '.png' ? 'image/png' : 'image/jpeg',
      };
    }
  }
  return null;
}

function shortImageHash(str: string): string {
  return crypto.createHash('sha1').update(str.slice(0, 512) + str.length).digest('hex').slice(0, 10);
}

function parseRouteParams(req: Request): { loja: string; produto: string } {
  const qLoja =
    sanitizeParam(req.query.loja) ||
    sanitizeParam(req.query.u) ||
    sanitizeParam(req.query.store) ||
    sanitizeParam(req.query.slug);
  const qProduto = sanitizeParam(req.query.produto) || sanitizeParam(req.query.product);

  let pathLoja = '';
  let pathProduto = '';
  const pathMatch = req.path.match(/^\/loja\/([^/]+)(?:\/produto\/([^/]+))?\/?$/i);
  if (pathMatch) {
    pathLoja = sanitizeParam(decodeURIComponent(pathMatch[1] || ''));
    pathProduto = sanitizeParam(decodeURIComponent(pathMatch[2] || ''));
  }

  return {
    loja: qLoja || pathLoja,
    produto: qProduto || pathProduto,
  };
}

async function resolveOgMetadata(req: Request): Promise<OgMetadata> {
  const origin = getRequestOrigin(req);
  const { loja, produto } = parseRouteParams(req);

  const client = loja ? await resolveClientBySlug(loja) : null;
  const effectiveClientId = client?.id;

  const [storeSettings, product] = await Promise.all([
    effectiveClientId || loja ? fetchStoreSettings(effectiveClientId) : Promise.resolve(null),
    produto ? fetchProduct(produto, effectiveClientId) : Promise.resolve(null),
  ]);

  const rawStoreName =
    (storeSettings?.storeName || client?.storeName || '').trim();
  const isGenericDefaultName =
    !rawStoreName ||
    rawStoreName.toLowerCase() === 'web vitrine' ||
    rawStoreName.toLowerCase() === 'minha loja';

  const displayStoreName = isGenericDefaultName
    ? 'Vitrine Digital Oficial'
    : rawStoreName;

  const canonicalUrl = `${origin}${req.originalUrl || '/'}`;

  // 1. Specific Product Share Card (Shopee / Mercado Livre style)
  if (product && product.name) {
    const basePrice = Number(product.price) || 0;
    const promoPrice =
      product.isOnSale && product.promotionalPrice && Number(product.promotionalPrice) > 0
        ? Number(product.promotionalPrice)
        : 0;
    const activePrice = promoPrice > 0 ? promoPrice : basePrice;
    const priceFormatted = formatBRL(activePrice);
    const hasDiscount = promoPrice > 0 && basePrice > promoPrice;
    const discountPct = hasDiscount
      ? Math.round(((basePrice - promoPrice) / basePrice) * 100)
      : 0;

    const firstImg = Array.isArray(product.images)
      ? product.images.find((img) => typeof img === 'string' && img.trim().length > 0)?.trim() || ''
      : '';

    let imageUrl = `${origin}/logo-master.jpg`;
    let imageMime = 'image/jpeg';

    if (firstImg.startsWith('data:image/') && !firstImg.startsWith('data:image/svg')) {
      const mimeMatch = firstImg.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
      if (mimeMatch) imageMime = mimeMatch[1];
      const vHash = shortImageHash(firstImg);
      const lojaQs = loja ? `loja=${encodeURIComponent(loja)}&` : '';
      imageUrl = `${origin}/api/og-image?${lojaQs}produto=${encodeURIComponent(product.id)}&v=${vHash}`;
    } else if (isSafePublicHttpUrl(firstImg)) {
      imageUrl = firstImg;
    } else if (firstImg.startsWith('/')) {
      imageUrl = `${origin}${firstImg}`;
    } else if (storeSettings?.logoUrl) {
      const lojaQs = loja ? `loja=${encodeURIComponent(loja)}&` : '';
      imageUrl = `${origin}/api/og-image?${lojaQs}type=store&v=${shortImageHash(storeSettings.logoUrl)}`;
    }

    const cleanDesc = (product.description || '').replace(/\s+/g, ' ').trim();
    const snippet = cleanDesc.length > 110 ? `${cleanDesc.slice(0, 107)}...` : cleanDesc;

    const ogTitle = hasDiscount
      ? `${product.name} • ${priceFormatted} (${discountPct}% OFF) | ${displayStoreName}`
      : `${product.name} • ${priceFormatted} | ${displayStoreName}`;

    const ogDesc = hasDiscount
      ? `Oferta na ${displayStoreName}: de ${formatBRL(basePrice)} por apenas ${priceFormatted}. ${snippet || 'Veja fotos, tamanhos disponíveis e peça agora pelo WhatsApp!'}`
      : `Confira na ${displayStoreName} por ${priceFormatted}. ${snippet || 'Veja fotos em alta definição, opções disponíveis e faça seu pedido direto pelo WhatsApp!'}`;

    return {
      title: ogTitle,
      description: ogDesc.slice(0, 200),
      siteName: `${displayStoreName} • Catálogo Oficial`,
      imageUrl,
      imageMime,
      imageWidth: 900,
      imageHeight: 1200,
      imageAlt: `${product.name} — ${displayStoreName}`,
      url: canonicalUrl,
      type: 'website',
      priceAmount: activePrice.toFixed(2),
      priceCurrency: 'BRL',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: cleanDesc || ogDesc,
        image: [imageUrl],
        brand: {
          '@type': 'Brand',
          name: displayStoreName,
        },
        offers: {
          '@type': 'Offer',
          url: canonicalUrl,
          priceCurrency: 'BRL',
          price: activePrice.toFixed(2),
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: displayStoreName,
          },
        },
      },
    };
  }

  // 2. Storefront Share Card (?loja=...)
  if (loja && (client || storeSettings)) {
    const storeName = storeSettings?.storeName || client?.storeName || displayStoreName;
    const storeImg = (storeSettings?.logoUrl || storeSettings?.bannerUrl || '').trim();
    let imageUrl = `${origin}/logo-master.jpg`;
    let imageMime = 'image/jpeg';

    if (storeImg.startsWith('data:image/') && !storeImg.startsWith('data:image/svg')) {
      const mimeMatch = storeImg.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
      if (mimeMatch) imageMime = mimeMatch[1];
      imageUrl = `${origin}/api/og-image?loja=${encodeURIComponent(loja)}&type=store&v=${shortImageHash(storeImg)}`;
    } else if (isSafePublicHttpUrl(storeImg)) {
      imageUrl = storeImg;
    }

    const storeDesc =
      (storeSettings?.description || storeSettings?.slogan || '').replace(/\s+/g, ' ').trim() ||
      `Explore o catálogo oficial da ${storeName}, veja lançamentos com fotos e valores atualizados e faça seu pedido direto pelo WhatsApp.`;

    const title = `${storeName} — Catálogo Oficial & Pedidos Online`;

    return {
      title,
      description: storeDesc.slice(0, 180),
      siteName: `${storeName} • Loja Oficial`,
      imageUrl,
      imageMime,
      imageWidth: 1024,
      imageHeight: 1024,
      imageAlt: storeName,
      url: canonicalUrl,
      type: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: storeName,
        description: storeDesc,
        image: imageUrl,
        url: canonicalUrl,
      },
    };
  }

  // 3. Default Platform / Landing Page (Professional branding, never bare "WEB VITRINE")
  const defaultTitle = 'Web Vitrine — Catálogo Digital Profissional e Vendas pelo WhatsApp';
  const defaultDesc =
    'Plataforma profissional de catálogo online: apresente seus produtos com fotos em alta definição, variações, preços e receba pedidos organizados direto no WhatsApp.';
  const defaultImage = `${origin}/logo-master.jpg`;

  return {
    title: defaultTitle,
    description: defaultDesc,
    siteName: 'Web Vitrine • Plataforma Profissional de Vendas',
    imageUrl: defaultImage,
    imageMime: 'image/jpeg',
    imageWidth: 1024,
    imageHeight: 1024,
    imageAlt: 'Web Vitrine — Catálogo Digital Profissional',
    url: canonicalUrl,
    type: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Web Vitrine — Plataforma Profissional de Vendas',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      description: defaultDesc,
      image: defaultImage,
      url: canonicalUrl,
    },
  };
}

function injectOpenGraphIntoHtml(html: string, meta: OgMetadata): string {
  const safeTitle = escapeHtml(meta.title);
  const safeDesc = escapeHtml(meta.description);
  const safeSiteName = escapeHtml(meta.siteName);
  const safeImageUrl = escapeHtml(meta.imageUrl);
  const safeImageMime = escapeHtml(meta.imageMime);
  const safeImageAlt = escapeHtml(meta.imageAlt);
  const safeUrl = escapeHtml(meta.url);
  const safeJsonLd = JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c');

  const metaBlock = `
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}" />
    <meta name="apple-mobile-web-app-title" content="${safeSiteName}" />
    <meta name="application-name" content="${safeSiteName}" />

    <!-- Open Graph / WhatsApp Rich Preview -->
    <meta property="og:type" content="${meta.type}" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:site_name" content="${safeSiteName}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${safeImageUrl}" />
    <meta property="og:image:secure_url" content="${safeImageUrl}" />
    <meta property="og:image:type" content="${safeImageMime}" />
    <meta property="og:image:width" content="${meta.imageWidth}" />
    <meta property="og:image:height" content="${meta.imageHeight}" />
    <meta property="og:image:alt" content="${safeImageAlt}" />
    <meta property="og:url" content="${safeUrl}" />
    ${meta.priceAmount ? `<meta property="product:price:amount" content="${escapeHtml(meta.priceAmount)}" />` : ''}
    ${meta.priceCurrency ? `<meta property="product:price:currency" content="${escapeHtml(meta.priceCurrency)}" />` : ''}

    <!-- Twitter / X Rich Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImageUrl}" />
    <link rel="canonical" href="${safeUrl}" />
    <script type="application/ld+json">${safeJsonLd}</script>`;

  const markerRegex = /<!-- OG_META_START -->[\s\S]*?<!-- OG_META_END -->/;
  if (markerRegex.test(html)) {
    return html.replace(
      markerRegex,
      `<!-- OG_META_START -->${metaBlock}\n    <!-- OG_META_END -->`
    );
  }

  return html.replace('</head>', `${metaBlock}\n  </head>`);
}

const PLAN_PRICE_BRL = 29.99;
const PLAN_DAYS_DURATION = 30;

function getMercadoPagoAccessToken(): string {
  return (
    process.env.MERCADO_PAGO_ACCESS_TOKEN ||
    'APP_USR-7247429744524217-032816-ab91c2f2e9f3c2af82fb7fdc7a7c6b23-1084123941'
  ).trim();
}

function getSaoPauloDateString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function calculateNextRenewalDueDateServer(currentDueDateStr?: string, daysDuration = PLAN_DAYS_DURATION): string {
  const todayStr = getSaoPauloDateString(new Date());
  const todayDate = new Date(`${todayStr}T12:00:00Z`);

  let baseDate = todayDate;
  if (currentDueDateStr && /^\d{4}-\d{2}-\d{2}/.test(currentDueDateStr)) {
    const cleanDate = currentDueDateStr.slice(0, 10);
    const parsedDue = new Date(`${cleanDate}T12:00:00Z`);
    if (!isNaN(parsedDue.getTime()) && parsedDue > todayDate) {
      baseDate = parsedDue;
    }
  }

  const nextDue = new Date(baseDate);
  nextDue.setUTCDate(nextDue.getUTCDate() + daysDuration);
  return nextDue.toISOString().slice(0, 10);
}

async function resolveTargetClientDocId(clientRefOrSlug: string): Promise<string | null> {
  const cleanRef = sanitizeParam(clientRefOrSlug, 120);
  if (!cleanRef) return null;

  try {
    const directSnap = await getDoc(doc(db, 'clients', cleanRef));
    if (directSnap.exists()) {
      return directSnap.id;
    }
  } catch {
    // continue to slug/username lookup
  }

  // Force fresh client cache before lookup
  clientsCache.expiresAt = 0;
  const matched = await resolveClientBySlug(cleanRef);
  return matched?.id || null;
}

async function fetchMercadoPagoPayment(paymentId: string): Promise<any | null> {
  const token = getMercadoPagoAccessToken();
  if (!token) return null;

  const cleanId = sanitizeParam(paymentId, 64);
  if (!cleanId || !/^[a-zA-Z0-9_-]+$/.test(cleanId) || cleanId.startsWith('pix-instant-')) {
    return null;
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(cleanId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

async function applyPaymentRenewalToClient(
  rawClientRef: string,
  paymentData: {
    id: string;
    amount: number;
    status: string;
    dateApproved?: string;
    storeName?: string;
  }
): Promise<{
  applied: boolean;
  alreadyApplied: boolean;
  clientId: string | null;
  dueDate?: string;
  reason?: string;
}> {
  const paymentId = sanitizeParam(paymentData.id, 64);
  if (!paymentId) {
    return { applied: false, alreadyApplied: false, clientId: null, reason: 'invalid_payment_id' };
  }

  if (paymentData.status !== 'approved') {
    return { applied: false, alreadyApplied: false, clientId: null, reason: 'payment_not_approved' };
  }

  if (Number(paymentData.amount) < 29.0) {
    return { applied: false, alreadyApplied: false, clientId: null, reason: 'insufficient_amount' };
  }

  // Resolve clientId from external_reference or stored pix_payments tracking doc
  let clientCandidate = sanitizeParam(rawClientRef, 120);
  if (!clientCandidate) {
    try {
      const trackedSnap = await getDoc(doc(db, 'pix_payments', paymentId));
      if (trackedSnap.exists()) {
        clientCandidate = sanitizeParam(trackedSnap.data()?.clientId, 120);
      }
    } catch {
      // ignore
    }
  }

  const resolvedClientId = clientCandidate ? await resolveTargetClientDocId(clientCandidate) : null;
  if (!resolvedClientId) {
    return { applied: false, alreadyApplied: false, clientId: null, reason: 'client_not_found' };
  }

  const clientRef = doc(db, 'clients', resolvedClientId);
  const paymentRef = doc(db, 'pix_payments', paymentId);
  const nowIso = new Date().toISOString();

  const txResult = await runTransaction(db, async (tx) => {
    const [clientSnap, pixSnap] = await Promise.all([tx.get(clientRef), tx.get(paymentRef)]);

    if (!clientSnap.exists()) {
      return { applied: false, alreadyApplied: false, dueDate: undefined };
    }

    const clientDoc = clientSnap.data() || {};
    const pixDoc = pixSnap.exists() ? pixSnap.data() : null;

    if (pixDoc?.applied === true || String(clientDoc.lastPaymentId || '') === paymentId) {
      return {
        applied: false,
        alreadyApplied: true,
        dueDate: clientDoc.dueDate || pixDoc?.dueDateAfterRenewal,
      };
    }

    const nextDueDate = calculateNextRenewalDueDateServer(clientDoc.dueDate, PLAN_DAYS_DURATION);

    tx.set(
      clientRef,
      {
        dueDate: nextDueDate,
        status: 'active',
        lastRenewedAt: nowIso,
        lastPaymentId: paymentId,
        lastPaymentAmount: Number(paymentData.amount) || PLAN_PRICE_BRL,
        lastPaymentApprovedAt: paymentData.dateApproved || nowIso,
        planPrice: PLAN_PRICE_BRL,
      },
      { merge: true }
    );

    tx.set(
      paymentRef,
      {
        paymentId,
        clientId: resolvedClientId,
        storeName: paymentData.storeName || clientDoc.storeName || '',
        amount: Number(paymentData.amount) || PLAN_PRICE_BRL,
        status: 'approved',
        applied: true,
        appliedAt: nowIso,
        dueDateAfterRenewal: nextDueDate,
      },
      { merge: true }
    );

    return {
      applied: true,
      alreadyApplied: false,
      dueDate: nextDueDate,
    };
  });

  clientsCache.expiresAt = 0;

  return {
    applied: txResult.applied,
    alreadyApplied: txResult.alreadyApplied,
    clientId: resolvedClientId,
    dueDate: txResult.dueDate,
  };
}

function verifyMercadoPagoWebhookSignature(req: Request, dataId: string): boolean {
  const secret = (process.env.MERCADO_PAGO_WEBHOOK_SECRET || '').trim();
  if (!secret) return true; // Optional secret when not configured

  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];
  if (typeof xSignature !== 'string' || typeof xRequestId !== 'string') {
    return false;
  }

  let ts = '';
  let v1 = '';
  for (const part of xSignature.split(',')) {
    const [k, v] = part.split('=').map((s) => s.trim());
    if (k === 'ts') ts = v || '';
    if (k === 'v1') v1 = v || '';
  }
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const computed = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  try {
    const a = Buffer.from(computed, 'hex');
    const b = Buffer.from(v1, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // Create real Mercado Pago Pix payment via server-side API (no CORS block, secret stays on server)
  app.post('/api/mercadopago/pix', async (req: Request, res: Response) => {
    try {
      const token = getMercadoPagoAccessToken();
      if (!token) {
        res.status(503).json({
          success: false,
          errorCode: 'MP_NOT_CONFIGURED',
          errorMessage:
            'Gateway de pagamento não configurada no servidor. Configure a variável MERCADO_PAGO_ACCESS_TOKEN nas configurações do projeto.',
        });
        return;
      }

      const rawClientId = sanitizeParam(req.body?.clientId, 120);
      const storeName = sanitizeParam(req.body?.storeName || req.body?.name || 'Loja', 80);
      const rawEmail = sanitizeParam(req.body?.email, 120);
      const payerEmail = rawEmail && rawEmail.includes('@') ? rawEmail : 'contato@webvitrine.com.br';

      const resolvedClientId = rawClientId ? await resolveTargetClientDocId(rawClientId) : null;
      const externalRef = resolvedClientId || rawClientId || 'vitrine-client';

      const origin = getRequestOrigin(req);
      const isPublicHttps =
        origin.startsWith('https://') &&
        !origin.includes('localhost') &&
        !origin.includes('127.0.0.1');

      const expirationDate = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      const idempotencyKey = `mp-pix-${externalRef}-${Date.now()}`;

      const payload: Record<string, unknown> = {
        transaction_amount: PLAN_PRICE_BRL,
        description: `Renovacao Web Vitrine (${storeName})`,
        payment_method_id: 'pix',
        date_of_expiration: expirationDate,
        payer: {
          email: payerEmail,
          first_name: storeName.slice(0, 30) || 'Lojista',
        },
        external_reference: externalRef,
        ...(isPublicHttps ? { notification_url: `${origin}/api/mercadopago/webhook` } : {}),
      };

      const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const mpData = await mpRes.json().catch(() => ({}));
      if (!mpRes.ok) {
        res.status(mpRes.status >= 400 && mpRes.status < 500 ? mpRes.status : 502).json({
          success: false,
          errorMessage: mpData?.message || 'Erro ao gerar cobrança Pix no Mercado Pago.',
        });
        return;
      }

      const transactionData = mpData?.point_of_interaction?.transaction_data;
      if (!transactionData?.qr_code || !mpData?.id) {
        res.status(502).json({
          success: false,
          errorMessage: 'O Mercado Pago não retornou o QR Code Pix. Tente novamente.',
        });
        return;
      }

      const paymentId = String(mpData.id);
      await setDoc(
        doc(db, 'pix_payments', paymentId),
        {
          paymentId,
          clientId: externalRef,
          storeName,
          amount: Number(mpData.transaction_amount) || PLAN_PRICE_BRL,
          status: mpData.status || 'pending',
          applied: false,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      res.json({
        success: true,
        paymentId,
        status: mpData.status || 'pending',
        qrCode: transactionData.qr_code,
        qrCodeBase64: transactionData.qr_code_base64,
        ticketUrl: transactionData.ticket_url,
      });
    } catch (err) {
      console.error('Error in POST /api/mercadopago/pix:', err);
      res.status(500).json({
        success: false,
        errorMessage: 'Falha interna ao gerar cobrança Pix.',
      });
    }
  });

  // Check Mercado Pago payment status and automatically renew the client's Firestore subscription
  app.get('/api/mercadopago/status/:paymentId', async (req: Request, res: Response) => {
    try {
      const paymentId = sanitizeParam(req.params.paymentId, 64);
      const clientHint = sanitizeParam(req.query.clientId, 120);

      if (!paymentId || paymentId.startsWith('pix-instant-')) {
        res.json({ status: 'pending', isApproved: false });
        return;
      }

      const mpData = await fetchMercadoPagoPayment(paymentId);
      if (!mpData) {
        res.json({ status: 'unknown', isApproved: false });
        return;
      }

      const isApproved = mpData.status === 'approved';
      let renewalInfo: any = null;

      if (isApproved) {
        const refToUse = sanitizeParam(mpData.external_reference, 120) || clientHint;
        renewalInfo = await applyPaymentRenewalToClient(refToUse, {
          id: String(mpData.id),
          amount: Number(mpData.transaction_amount) || 0,
          status: mpData.status,
          dateApproved: mpData.date_approved,
        });
      }

      res.json({
        status: mpData.status || 'unknown',
        isApproved,
        paymentId: String(mpData.id),
        renewed: Boolean(renewalInfo?.applied || renewalInfo?.alreadyApplied),
        dueDate: renewalInfo?.dueDate,
        clientId: renewalInfo?.clientId,
      });
    } catch (err) {
      console.error('Error in GET /api/mercadopago/status/:paymentId:', err);
      res.status(500).json({ status: 'error', isApproved: false });
    }
  });

  // Reconcile recent Mercado Pago payments for a client (e.g. on page reload or block-screen check)
  app.post('/api/mercadopago/reconcile-client', async (req: Request, res: Response) => {
    try {
      const token = getMercadoPagoAccessToken();
      const rawClientId = sanitizeParam(req.body?.clientId, 120);
      if (!rawClientId) {
        res.status(400).json({ success: false, renewed: false, reason: 'missing_client_id' });
        return;
      }

      const resolvedClientId = await resolveTargetClientDocId(rawClientId);
      if (!resolvedClientId) {
        res.json({ success: false, renewed: false, reason: 'client_not_found' });
        return;
      }

      let newlyApplied = false;
      let latestDueDate: string | undefined;

      if (token) {
        // 1. Query Mercado Pago payments matching this client's external_reference
        try {
          const searchUrl = `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(
            resolvedClientId
          )}&sort=date_created&criteria=desc&limit=10`;
          const searchRes = await fetch(searchUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (searchRes.ok) {
            const searchData = await searchRes.json().catch(() => ({}));
            const results = Array.isArray(searchData?.results) ? searchData.results : [];
            for (const mpPay of results) {
              if (mpPay?.status === 'approved' && Number(mpPay?.transaction_amount) >= 29.0) {
                const outcome = await applyPaymentRenewalToClient(resolvedClientId, {
                  id: String(mpPay.id),
                  amount: Number(mpPay.transaction_amount),
                  status: mpPay.status,
                  dateApproved: mpPay.date_approved,
                });
                if (outcome.applied) newlyApplied = true;
                if (outcome.dueDate) latestDueDate = outcome.dueDate;
              }
            }
          }
        } catch (searchErr) {
          console.warn('Mercado Pago search reconciliation error:', searchErr);
        }

        // 2. Also check any tracked pix_payments in Firestore for this client
        try {
          const q = query(collection(db, 'pix_payments'), where('clientId', '==', resolvedClientId));
          const pixSnaps = await getDocs(q);
          for (const pDoc of pixSnaps.docs) {
            const pData = pDoc.data();
            if (pData?.applied) continue;
            const mpPay = await fetchMercadoPagoPayment(pDoc.id);
            if (mpPay?.status === 'approved' && Number(mpPay?.transaction_amount) >= 29.0) {
              const outcome = await applyPaymentRenewalToClient(resolvedClientId, {
                id: String(mpPay.id),
                amount: Number(mpPay.transaction_amount),
                status: mpPay.status,
                dateApproved: mpPay.date_approved,
              });
              if (outcome.applied) newlyApplied = true;
              if (outcome.dueDate) latestDueDate = outcome.dueDate;
            }
          }
        } catch (pixLookupErr) {
          console.warn('pix_payments lookup reconciliation error:', pixLookupErr);
        }
      }

      const freshClientSnap = await getDoc(doc(db, 'clients', resolvedClientId));
      const freshData = freshClientSnap.exists() ? freshClientSnap.data() : null;

      res.json({
        success: true,
        renewed: newlyApplied,
        clientId: resolvedClientId,
        dueDate: latestDueDate || freshData?.dueDate,
        status: freshData?.status,
      });
    } catch (err) {
      console.error('Error in POST /api/mercadopago/reconcile-client:', err);
      res.status(500).json({ success: false, renewed: false });
    }
  });

  // Create Checkout Pro preference (Cards, MP Account, Boleto) via server
  app.post('/api/mercadopago/preference', async (req: Request, res: Response) => {
    try {
      const token = getMercadoPagoAccessToken();
      if (!token) {
        res.status(503).json({
          success: false,
          errorMessage: 'Gateway Mercado Pago aguardando configuração no servidor (MERCADO_PAGO_ACCESS_TOKEN).',
        });
        return;
      }

      const rawClientId = sanitizeParam(req.body?.clientId, 120);
      const storeName = sanitizeParam(req.body?.storeName || req.body?.name || 'Web Vitrine', 80);
      const rawEmail = sanitizeParam(req.body?.email, 120);
      const payerEmail = rawEmail && rawEmail.includes('@') ? rawEmail : 'contato@webvitrine.com.br';
      const resolvedClientId = rawClientId ? await resolveTargetClientDocId(rawClientId) : null;
      const externalRef = resolvedClientId || rawClientId || 'vitrine-client';

      const origin = getRequestOrigin(req);
      const isPublicHttps =
        origin.startsWith('https://') &&
        !origin.includes('localhost') &&
        !origin.includes('127.0.0.1');

      const payload: Record<string, unknown> = {
        items: [
          {
            id: 'monthly-2999',
            title: 'Plano Mensal Web Vitrine',
            description: `Assinatura mensal para a loja ${storeName} (30 dias)`,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: PLAN_PRICE_BRL,
          },
        ],
        payer: {
          email: payerEmail,
          name: storeName,
        },
        back_urls: {
          success: `${origin}/?payment=success&client=${encodeURIComponent(externalRef)}`,
          failure: `${origin}/?payment=failure`,
          pending: `${origin}/?payment=pending`,
        },
        auto_return: 'approved',
        external_reference: externalRef,
        ...(isPublicHttps ? { notification_url: `${origin}/api/mercadopago/webhook` } : {}),
      };

      const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const mpData = await mpRes.json().catch(() => ({}));
      if (!mpRes.ok) {
        res.status(mpRes.status >= 400 && mpRes.status < 500 ? mpRes.status : 502).json({
          success: false,
          errorMessage: mpData?.message || 'Erro ao gerar link de pagamento Mercado Pago.',
        });
        return;
      }

      res.json({
        success: true,
        preferenceId: mpData.id,
        initPoint: mpData.init_point,
        sandboxInitPoint: mpData.sandbox_init_point,
      });
    } catch (err) {
      console.error('Error in POST /api/mercadopago/preference:', err);
      res.status(500).json({
        success: false,
        errorMessage: 'Falha na conexão com Mercado Pago.',
      });
    }
  });

  // Official Mercado Pago Webhook (verifies payment directly with Mercado Pago API before activating client)
  app.post('/api/mercadopago/webhook', async (req: Request, res: Response) => {
    try {
      const eventType = sanitizeParam(req.body?.type || req.query?.topic || req.query?.type, 40);
      const rawDataId =
        req.body?.data?.id ||
        req.query?.['data.id'] ||
        req.query?.id ||
        '';
      const paymentId = sanitizeParam(String(rawDataId), 64);

      if (!paymentId || (eventType && eventType !== 'payment')) {
        res.status(200).json({ received: true, ignored: true });
        return;
      }

      if (!verifyMercadoPagoWebhookSignature(req, paymentId)) {
        res.status(401).json({ received: false, error: 'Invalid signature' });
        return;
      }

      const mpData = await fetchMercadoPagoPayment(paymentId);
      if (mpData && mpData.status === 'approved') {
        await applyPaymentRenewalToClient(sanitizeParam(mpData.external_reference, 120), {
          id: String(mpData.id),
          amount: Number(mpData.transaction_amount) || 0,
          status: mpData.status,
          dateApproved: mpData.date_approved,
        });
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error('Error in POST /api/mercadopago/webhook:', err);
      res.status(200).json({ received: true });
    }
  });

  // Serves crisp JPEG/PNG binary image bytes for WhatsApp / OpenGraph crawlers
  app.get('/api/og-image', async (req: Request, res: Response) => {
    try {
      const loja = sanitizeParam(req.query.loja);
      const produto = sanitizeParam(req.query.produto);
      const type = sanitizeParam(req.query.type);

      const client = loja ? await resolveClientBySlug(loja) : null;
      const clientId = client?.id;

      let candidateImg = '';

      if (produto && type !== 'store') {
        const prod = await fetchProduct(produto, clientId);
        if (prod && Array.isArray(prod.images)) {
          candidateImg =
            prod.images.find((img) => typeof img === 'string' && img.trim().length > 0)?.trim() || '';
        }
      }

      if (!candidateImg && (clientId || loja || type === 'store')) {
        const settings = await fetchStoreSettings(clientId);
        candidateImg = (settings?.logoUrl || settings?.bannerUrl || '').trim();
      }

      if (candidateImg.startsWith('data:image/') && !candidateImg.startsWith('data:image/svg')) {
        const match = candidateImg.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
        if (match) {
          const mime = match[1];
          const base64Body = match[2].replace(/\s+/g, '');
          const imgBuffer = Buffer.from(base64Body, 'base64');
          if (imgBuffer.length > 0) {
            res.setHeader('Content-Type', mime);
            res.setHeader('Content-Length', imgBuffer.length);
            res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.status(200).send(imgBuffer);
            return;
          }
        }
      }

      if (isSafePublicHttpUrl(candidateImg)) {
        res.setHeader('Cache-Control', 'public, max-age=600');
        res.redirect(302, candidateImg);
        return;
      }

      const fallback = getFallbackLogoBuffer();
      if (fallback) {
        res.setHeader('Content-Type', fallback.mime);
        res.setHeader('Content-Length', fallback.buffer.length);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.status(200).send(fallback.buffer);
        return;
      }

      res.status(404).end();
    } catch (err) {
      console.error('Error serving /api/og-image:', err);
      const fallback = getFallbackLogoBuffer();
      if (fallback) {
        res.setHeader('Content-Type', fallback.mime);
        res.status(200).send(fallback.buffer);
        return;
      }
      res.status(500).end();
    }
  });

  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api/') || (req.method !== 'GET' && req.method !== 'HEAD')) {
        next();
        return;
      }
      try {
        const templatePath = path.resolve(ROOT_DIR, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        const ogMeta = await resolveOgMetadata(req);
        const finalHtml = injectOpenGraphIntoHtml(template, ogMeta);

        res.status(200);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(finalHtml);
      } catch (err) {
        vite.ssrFixStacktrace(err as Error);
        next(err);
      }
    });
  } else {
    app.use(express.static(DIST_DIR, { index: false }));

    app.get('*', async (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      try {
        const distHtmlPath = path.resolve(DIST_DIR, 'index.html');
        const template = fs.readFileSync(distHtmlPath, 'utf-8');
        const ogMeta = await resolveOgMetadata(req);
        const finalHtml = injectOpenGraphIntoHtml(template, ogMeta);

        res.status(200);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(finalHtml);
      } catch (err) {
        next(err);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
