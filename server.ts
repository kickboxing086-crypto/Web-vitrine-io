import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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

async function startServer() {
  const app = express();
  app.set('trust proxy', true);

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
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
      if (req.method !== 'GET' && req.method !== 'HEAD') {
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
