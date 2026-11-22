import React, { useState, useEffect, useRef } from 'react';
import {
  StoreSettings,
  Product,
  Order,
  Coupon,
  FinancialRecord,
  TagCategory,
  CartItem,
  OrderStatus,
  AdminUser,
  SystemNotification,
} from './types';
import {
  getStoredSettings,
  saveStoredSettings,
  hasStoredSettings,
  getStoredProducts,
  getStoredCategories,
  getStoredTags,
  getStoredCoupons,
  getStoredOrders,
  getStoredFinance,
  getStoredAdminUser,
  getAuthSession,
  saveAuthSession,
  resetAllToDefault,
} from './lib/storage';
import { initialStoreSettings } from './data/initialData';
import {
  seedInitialDataIfEmpty,
  subscribeToSettings,
  saveSettingsToDb,
  subscribeToProducts,
  saveProductToDb,
  deleteProductFromDb,
  subscribeToCategories,
  saveCategoryToDb,
  deleteCategoryFromDb,
  subscribeToTags,
  saveTagToDb,
  deleteTagFromDb,
  subscribeToCoupons,
  saveCouponToDb,
  deleteCouponFromDb,
  subscribeToOrders,
  saveOrderToDb,
  deleteOrderFromDb,
  subscribeToFinance,
  saveFinanceToDb,
  deleteFinanceFromDb,
  resetDatabaseToDefaults,
  saveClient,
  subscribeToSystemNotifications,
  markSystemNotificationAsRead,
  markAllSystemNotificationsAsRead,
} from './lib/firestoreService';
import { sendBrowserPushNotification } from './lib/pushNotifications';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { StoreSetupModal } from './components/StoreSetupModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { LoginModal } from './components/LoginModal';
import { RegisterStoreModal } from './components/RegisterStoreModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { AdminPanel } from './components/AdminPanel';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { VulnerabilityPanel } from './components/VulnerabilityPanel';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { LandingHeroModal } from './components/LandingHeroModal';
import { StoreHoursModal } from './components/StoreHoursModal';
import { ShareProductModal } from './components/ShareProductModal';
import { ShareSystemModal } from './components/ShareSystemModal';
import { PaymentSuccessModal } from './components/PaymentSuccessModal';
import { AppEntranceAnimation } from './components/AppEntranceAnimation';
import { InstallFloatingBar } from './components/InstallFloatingBar';
import { CartFloatingBar } from './components/CartFloatingBar';
import { SlidersHorizontal, AlertCircle, Tag as TagIcon, ShoppingBag, ArrowLeft, MessageCircle, ChevronDown, Check, Instagram, MapPin, Clock, ExternalLink, Bell, X } from 'lucide-react';
import { getFontFamilyCss, checkStoreHoursStatus, applyStoreTheme } from './lib/themeUtils';
import { formatCurrency, cleanPhoneForWhatsapp } from './lib/formatters';
import { motion, AnimatePresence } from 'motion/react';

const hasStoreRouteInBrowserUrl = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('sistema') === '1' || params.get('page') === 'landing') {
    return false;
  }
  if (
    params.get('loja') ||
    params.get('u') ||
    params.get('store') ||
    params.get('slug') ||
    params.get('page') === 'store'
  ) {
    return true;
  }
  if (/^\/loja\/[^/]+/i.test(window.location.pathname)) {
    return true;
  }
  if (window.location.hash) {
    const hashClean = window.location.hash.replace(/^#\/?/, '');
    if (hashClean.startsWith('loja/') || /(^|&)loja=|(^|&)u=|(^|&)store=|(^|&)slug=/.test(hashClean)) {
      return true;
    }
  }
  return false;
};

export default function App() {
  // Application Data States (initial fallback isolated per client)
  const [currentClient, setCurrentClient] = useState<any>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const explicitLanding = urlParams.get('sistema') === '1' || urlParams.get('page') === 'landing';
      if (explicitLanding) return null;
      if (!hasStoreRouteInBrowserUrl() && !getAuthSession()) {
        localStorage.removeItem('store_current_client');
        return null;
      }
      const saved = localStorage.getItem('store_current_client');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('store_current_client');
      const parsed = saved ? JSON.parse(saved) : null;
      return getStoredSettings(parsed?.id);
    } catch {
      return getStoredSettings();
    }
  });
  const [hasSyncedSettings, setHasSyncedSettings] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('store_current_client');
      const parsed = saved ? JSON.parse(saved) : null;
      return !parsed?.id || hasStoredSettings(parsed.id);
    } catch {
      return true;
    }
  });
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('store_current_client');
      const parsed = saved ? JSON.parse(saved) : null;
      return getStoredProducts(parsed?.id);
    } catch {
      return getStoredProducts();
    }
  });
  const [categories, setCategories] = useState<TagCategory[]>(getStoredCategories);
  const [tags, setTags] = useState<TagCategory[]>(getStoredTags);
  const [coupons, setCoupons] = useState<Coupon[]>(getStoredCoupons);
  const [orders, setOrders] = useState<Order[]>(getStoredOrders);
  const [finance, setFinance] = useState<FinancialRecord[]>(getStoredFinance);
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([]);
  const [localReadNotifIds, setLocalReadNotifIds] = useState<string[]>([]);
  const [livePushToast, setLivePushToast] = useState<{
    id: string;
    sender: string;
    title: string;
    body: string;
    kind: 'order' | 'system';
  } | null>(null);
  const knownOrderIdsRef = useRef<Set<string> | null>(null);
  const knownNotifIdsRef = useRef<Set<string> | null>(null);
  const [adminUser] = useState<AdminUser>(getStoredAdminUser);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(getAuthSession);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [isStoreHoursModalOpen, setIsStoreHoursModalOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isLandingHeroModalOpen, setIsLandingHeroModalOpen] = useState<boolean>(false);
  const [adminRequestedTab, setAdminRequestedTab] = useState<{
    tab: 'dashboard' | 'products' | 'orders' | 'tags' | 'coupons' | 'settings' | 'stock' | 'plan';
    seq: number;
  } | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(true);
  const [showEntranceAnimation, setShowEntranceAnimation] = useState<boolean>(() => {
    return !sessionStorage.getItem('app_entered_session');
  });
  const [paymentSuccessInfo, setPaymentSuccessInfo] = useState<{
    isOpen: boolean;
    planTitle: string;
    period: string;
    storeName: string;
  }>({
    isOpen: false,
    planTitle: 'Plano Mensal',
    period: '30 dias',
    storeName: 'Sua Vitrine',
  });

  // View state: 'store' (Vitrine do Cliente) | 'landing' (Página Oficial) | 'admin' (Painel do Dono) | 'super_admin' (Painel SaaS)
  const [activeView, setActiveView] = useState<'store' | 'admin' | 'super_admin' | 'landing' | 'vulnerability_admin'>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('sistema') === '1' || urlParams.get('page') === 'landing') {
      return 'landing';
    }
    if (urlParams.get('page') === 'admin' || urlParams.get('admin') === '1') {
      return 'store'; // Will trigger login modal in useEffect
    }
    if (hasStoreRouteInBrowserUrl()) {
      return 'store';
    }
    
    // Only bypass the landing page if an official store owner is actively authenticated
    try {
      if (getAuthSession()) {
        const saved = localStorage.getItem('store_current_client');
        if (saved) {
          const client = JSON.parse(saved);
          if (client && typeof client === 'object') {
            const isOfficial = client.username !== 'teste@123' && client.id !== 'client-test-natural' && client.isOfficial !== false;
            if (isOfficial) {
              return 'store';
            }
          }
        }
      }
    } catch (e) {}

    // Default to landing page for visitors and shared system links
    return 'landing';
  });

  const isOfficialStore = Boolean(
    currentClient &&
    currentClient.username !== 'teste@123' &&
    currentClient.id !== 'client-test-natural' &&
    currentClient.isOfficial !== false
  );

  const handleToggleView = (view: 'store' | 'admin' | 'super_admin' | 'landing') => {
    if (view === 'admin' && !isAdminAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      setActiveView(view);
    }
  };

  const handleLoginSuccess = (type?: 'super_admin' | 'store_admin' | 'vulnerability_admin', client?: any) => {
    setIsAdminAuthenticated(true);
    saveAuthSession(true);
    setProducts([]);
    setCategories([]);
    setTags([]);
    setCoupons([]);
    setOrders([]);
    setFinance([]);
    if (client) {
      const isOfficial = client.username !== 'teste@123' && client.id !== 'client-test-natural' && client.isOfficial !== false;
      const enrichedClient = {
        ...client,
        isOfficial,
      };
      const hasCache = hasStoredSettings(enrichedClient.id);
      const clientCached = getStoredSettings(enrichedClient.id);
      setHasSyncedSettings(hasCache);
      setIsCloudSyncing(true);
      setCurrentClient(enrichedClient);
      localStorage.setItem('store_current_client', JSON.stringify(enrichedClient));
      setSettings({
        ...clientCached,
        storeName: clientCached.storeName || client.storeName || '',
        logoUrl: clientCached.logoUrl || '',
        bannerUrl: clientCached.bannerUrl || '',
        phoneWhatsapp: clientCached.phoneWhatsapp || client.phoneWhatsapp || '',
        storeType: client.storeType || clientCached.storeType || 'clothing',
      });
    }
    if (type === 'super_admin') {
      setActiveView('super_admin');
    } else if (type === 'vulnerability_admin') {
      setActiveView('vulnerability_admin');
    } else {
      setActiveView('admin');
    }
  };

  const handleRegisterSuccess = (newClient: any) => {
    setIsAdminAuthenticated(true);
    saveAuthSession(true);
    setProducts([]);
    setCategories([]);
    setTags([]);
    setCoupons([]);
    setOrders([]);
    setFinance([]);
    const { logoUrl: regLogoUrl, ...clientWithoutHeavyLogo } = newClient || {};
    const enrichedClient = {
      ...clientWithoutHeavyLogo,
      isOfficial: true,
    };
    const combinedAddress =
      newClient.address && newClient.neighborhood
        ? `${newClient.address} - ${newClient.neighborhood}`
        : newClient.address || newClient.neighborhood || '';
    const newTenantSettings: StoreSettings = {
      ...initialStoreSettings,
      customDeliveryRates: [],
      storeName: newClient.storeName || 'Minha Loja',
      logoUrl: regLogoUrl || '',
      bannerUrl: '',
      phoneWhatsapp: newClient.phoneWhatsapp || '',
      address: combinedAddress,
      cityState: newClient.cityState || '',
      storeType: newClient.storeType || 'clothing',
      isFirstSetupDone: true,
      showAnnouncementBanner: true,
      announcementBannerText: `💎 Bem-vindo à vitrine oficial da ${newClient.storeName || 'Minha Loja'}! Explore o catálogo e faça seu pedido direto pelo WhatsApp.`,
    };
    saveStoredSettings(newTenantSettings, enrichedClient.id);
    setSettings(newTenantSettings);
    setHasSyncedSettings(true);
    setCurrentClient(enrichedClient);
    localStorage.setItem('store_current_client', JSON.stringify(enrichedClient));
    setActiveView('admin');
    setIsFirstOnboarding(true);
    setIsStoreSetupOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setCurrentClient(null);
    localStorage.removeItem('store_current_client');
    saveAuthSession(false);
    setSettings(getStoredSettings());
    setHasSyncedSettings(true);
    setProducts([]);
    setCategories([]);
    setTags([]);
    setCoupons([]);
    setOrders([]);
    setFinance([]);
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setActiveView('landing');
  };

  const handleEnterStore = async (slug?: string | any) => {
    if (slug && typeof slug === 'string') {
      const cleanSlug = slug.trim().toLowerCase();
      if (cleanSlug === 'teste@123') {
        const testClient = {
          id: 'client-test-natural',
          storeName: 'Elite Fashion Vitrine',
          username: 'teste@123',
          password: '01020304',
          storeType: 'clothing',
          isOfficial: false,
          status: 'active'
        };
        const clientCached = getStoredSettings(testClient.id);
        setHasSyncedSettings(hasStoredSettings(testClient.id));
        setIsCloudSyncing(true);
        setSettings({ ...clientCached, storeName: clientCached.storeName || testClient.storeName });
        setCurrentClient(testClient);
        localStorage.setItem('store_current_client', JSON.stringify(testClient));
      } else {
        const module = await import('./lib/firestoreService');
        const client = await module.getClientByUsername(cleanSlug);
        if (client) {
          const isOfficial = client.username !== 'teste@123' && client.id !== 'client-test-natural';
          const enriched = { ...client, isOfficial };
          const clientCached = getStoredSettings(enriched.id);
          setHasSyncedSettings(hasStoredSettings(enriched.id));
          setIsCloudSyncing(true);
          setSettings({
            ...clientCached,
            storeName: clientCached.storeName || enriched.storeName || '',
            logoUrl: clientCached.logoUrl || '',
            bannerUrl: clientCached.bannerUrl || '',
          });
          setCurrentClient(enriched);
          localStorage.setItem('store_current_client', JSON.stringify(enriched));
        }
      }
    }
    setActiveView('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Customer Showcase Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Interactive Modals / Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isShareSystemModalOpen, setIsShareSystemModalOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isStoreSetupOpen, setIsStoreSetupOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] = useState(false);
  const [isFirstOnboarding, setIsFirstOnboarding] = useState(false);
  const [addedItemToast, setAddedItemToast] = useState<{ name: string; timestamp: number } | null>(null);

  // Smart Checkout Validation Animations
  const [shakeName, setShakeName] = useState(false);
  const [shakeWhatsapp, setShakeWhatsapp] = useState(false);

  const validateStep2 = (name: string, whatsapp: string) => {
    let isValid = true;
    if (!name.trim()) {
      setShakeName(true);
      setTimeout(() => setShakeName(false), 500);
      isValid = false;
    }
    if (!whatsapp.trim() || whatsapp.length < 8) {
      setShakeWhatsapp(true);
      setTimeout(() => setShakeWhatsapp(false), 500);
      isValid = false;
    }
    return isValid;
  };

  // 2-Step Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    title: string;
    itemName: string;
    itemDescription?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    itemName: '',
    onConfirm: () => {},
  });

  // Dynamic document title, meta tags, OpenGraph share metadata, fonts and primary colors update
  useEffect(() => {
    const rawName = (settings.storeName || currentClient?.storeName || '').trim();
    const isGenericName = !rawName || rawName.toLowerCase() === 'web vitrine';
    const storeDisplayName = isGenericName ? 'Vitrine Digital Oficial' : rawName;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    const setMeta = (selector: string, content: string) => {
      const el = document.querySelector(selector);
      if (el && content) el.setAttribute('content', content);
    };

    if (activeView === 'landing' && !selectedProduct) {
      const landingTitle = 'Web Vitrine — Catálogo Digital Profissional e Vendas pelo WhatsApp';
      const landingDesc =
        'Plataforma profissional de catálogo online: apresente seus produtos com fotos em alta definição, variações, preços e receba pedidos organizados direto no WhatsApp.';
      document.title = landingTitle;
      setMeta('meta[name="description"]', landingDesc);
      setMeta('meta[property="og:site_name"]', 'Web Vitrine • Plataforma Profissional de Vendas');
      setMeta('meta[property="og:title"]', landingTitle);
      setMeta('meta[property="og:description"]', landingDesc);
      setMeta('meta[name="twitter:title"]', landingTitle);
      setMeta('meta[name="twitter:description"]', landingDesc);
      if (origin) {
        setMeta('meta[property="og:image"]', `${origin}/logo-master.jpg`);
        setMeta('meta[name="twitter:image"]', `${origin}/logo-master.jpg`);
      }
    } else if (selectedProduct) {
      const activePrice =
        selectedProduct.isOnSale && selectedProduct.promotionalPrice
          ? selectedProduct.promotionalPrice
          : selectedProduct.price;
      const priceStr = formatCurrency(activePrice);
      const prodTitle = `${selectedProduct.name} • ${priceStr} | ${storeDisplayName}`;
      const prodDesc = `Confira ${selectedProduct.name} por ${priceStr} na ${storeDisplayName}. ${selectedProduct.description || 'Veja fotos, opções disponíveis e peça direto pelo WhatsApp!'}`;

      document.title = prodTitle;
      setMeta('meta[name="description"]', prodDesc);
      setMeta('meta[property="og:site_name"]', `${storeDisplayName} • Catálogo Oficial`);
      setMeta('meta[property="og:title"]', prodTitle);
      setMeta('meta[property="og:description"]', prodDesc);
      setMeta('meta[name="twitter:title"]', prodTitle);
      setMeta('meta[name="twitter:description"]', prodDesc);

      const firstImg = selectedProduct.images?.[0] || '';
      if (firstImg && origin) {
        const lojaParam = new URLSearchParams(window.location.search).get('loja') || '';
        const ogImgUrl = firstImg.startsWith('data:image/')
          ? `${origin}/api/og-image?${lojaParam ? `loja=${encodeURIComponent(lojaParam)}&` : ''}produto=${encodeURIComponent(selectedProduct.id)}`
          : firstImg;
        setMeta('meta[property="og:image"]', ogImgUrl);
        setMeta('meta[name="twitter:image"]', ogImgUrl);
      }
    } else {
      const storeTitle = `${storeDisplayName} — Catálogo Oficial & Pedidos Online`;
      const storeDesc =
        settings.description ||
        `Explore o catálogo oficial da ${storeDisplayName}, veja lançamentos com fotos e faça seu pedido direto pelo WhatsApp.`;
      document.title = storeTitle;
      setMeta('meta[name="description"]', storeDesc);
      setMeta('meta[property="og:site_name"]', `${storeDisplayName} • Loja Oficial`);
      setMeta('meta[property="og:title"]', storeTitle);
      setMeta('meta[property="og:description"]', storeDesc);
      setMeta('meta[name="twitter:title"]', storeTitle);
      setMeta('meta[name="twitter:description"]', storeDesc);
      if (settings.logoUrl && origin) {
        const lojaParam = new URLSearchParams(window.location.search).get('loja') || '';
        const ogStoreImg = settings.logoUrl.startsWith('data:image/') && lojaParam
          ? `${origin}/api/og-image?loja=${encodeURIComponent(lojaParam)}&type=store`
          : settings.logoUrl;
        setMeta('meta[property="og:image"]', ogStoreImg);
        setMeta('meta[name="twitter:image"]', ogStoreImg);
      }
    }

    // Apply custom dynamic store font and primary color to root document
    applyStoreTheme(settings);
  }, [settings, selectedProduct, currentClient, activeView]);

  // Check first access and URL params for admin login and tenant stores
  useEffect(() => {
    if (!settings.isFirstSetupDone && !currentClient) {
      setIsFirstOnboarding(true);
      setIsStoreSetupOpen(true);
    }

    const getStoreUsernameFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const queryParam = params.get('loja') || params.get('u') || params.get('store') || params.get('slug');
      if (queryParam) return queryParam.trim().toLowerCase();

      // Check hash fragment (e.g. /#loja=xxx or #/loja/xxx)
      if (window.location.hash) {
        const hashClean = window.location.hash.replace(/^#\/?/, '');
        const hashParams = new URLSearchParams(hashClean);
        const hashLoja = hashParams.get('loja') || hashParams.get('u') || hashParams.get('store') || hashParams.get('slug');
        if (hashLoja) return hashLoja.trim().toLowerCase();
        if (hashClean.startsWith('loja/')) {
          return hashClean.replace('loja/', '').trim().toLowerCase();
        }
      }

      // Check pathname (e.g. /loja/xxx or /loja/xxx/produto/yyy)
      const pathname = window.location.pathname;
      const pathMatch = pathname.match(/^\/loja\/([^/]+)/i);
      if (pathMatch && pathMatch[1]) {
        return decodeURIComponent(pathMatch[1]).trim().toLowerCase();
      }

      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length > 2) {
        const subdomain = parts[0].toLowerCase();
        if (
          subdomain !== 'www' &&
          !subdomain.startsWith('ais-') &&
          subdomain !== 'web-vitrine-site' &&
          subdomain !== 'web-vitrine-net' &&
          subdomain !== 'localhost'
        ) {
          return subdomain;
        }
      }
      
      return null;
    };
    
    const initialSearchParams = new URLSearchParams(window.location.search);
    const isExplicitSystemLanding =
      initialSearchParams.get('sistema') === '1' ||
      initialSearchParams.get('page') === 'landing';

    // Check for client store username (from subdomain or param)
    const lojaParam = !isExplicitSystemLanding ? getStoreUsernameFromUrl() : null;
    if (lojaParam) {
      import('./lib/firestoreService').then(async (module) => {
        const client = await module.getClientByUsername(lojaParam);
        if (client) {
          const isOfficial = client.username !== 'teste@123' && client.id !== 'client-test-natural';
          const enriched = { ...client, isOfficial };
          setCurrentClient(enriched);
          localStorage.setItem('store_current_client', JSON.stringify(enriched));
          setActiveView('store');
        }
      });
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1' || params.get('login') === '1') {
      if (!isAdminAuthenticated) {
        setIsLoginModalOpen(true);
      } else {
        setActiveView('admin');
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        if (!isAdminAuthenticated) {
          setIsLoginModalOpen(true);
        } else {
          setActiveView((prev) => (prev === 'admin' ? 'store' : 'admin'));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.isFirstSetupDone, isAdminAuthenticated]);

  // Listener for Post-Payment Success Message (even after closing the tab and returning)
  useEffect(() => {
    const checkPaymentSuccess = () => {
      try {
        const raw = localStorage.getItem('store_payment_success_data');
        if (raw) {
          const parsed = JSON.parse(raw);
          setPaymentSuccessInfo({
            isOpen: true,
            planTitle: parsed.planTitle || 'Plano Mensal',
            period: parsed.period || '30 dias',
            storeName: parsed.storeName || settings.storeName || 'Sua Vitrine',
          });
        }
      } catch (err) {
        console.error('Error checking payment success data:', err);
      }
    };

    checkPaymentSuccess();
    window.addEventListener('focus', checkPaymentSuccess);
    window.addEventListener('storage', checkPaymentSuccess);
    return () => {
      window.removeEventListener('focus', checkPaymentSuccess);
      window.removeEventListener('storage', checkPaymentSuccess);
    };
  }, [settings.storeName]);

  // Real-time Cloud Firestore synchronization
  useEffect(() => {
    const targetClientId = currentClient?.id;
    const hasCache = !targetClientId || hasStoredSettings(targetClientId);
    setIsCloudSyncing(true);
    setHasSyncedSettings(hasCache);

    const clientCached = getStoredSettings(targetClientId);
    if (currentClient) {
      setSettings({
        ...clientCached,
        storeName: clientCached.storeName || currentClient.storeName || '',
        logoUrl: clientCached.logoUrl || '',
        bannerUrl: clientCached.bannerUrl || '',
        phoneWhatsapp: clientCached.phoneWhatsapp || currentClient.phoneWhatsapp || '',
        storeType: currentClient.storeType || clientCached.storeType || 'clothing',
      });
    } else {
      setSettings(clientCached);
    }

    // Hydrate client-scoped product cache immediately if available while waiting for snapshot
    const cachedClientProducts = targetClientId ? getStoredProducts(targetClientId) : [];
    setProducts(cachedClientProducts);
    setCategories([]);
    setTags([]);
    setCoupons([]);
    setOrders([]);
    setFinance([]);
    setSystemNotifications([]);
    knownOrderIdsRef.current = null;
    knownNotifIdsRef.current = null;

    // Load locally remembered read notification IDs for this store
    const readStorageKey = `read_sys_notifs_${targetClientId || 'default'}`;
    try {
      const savedReads = localStorage.getItem(readStorageKey);
      setLocalReadNotifIds(savedReads ? JSON.parse(savedReads) : []);
    } catch {
      setLocalReadNotifIds([]);
    }

    // Seed initial data if database collections are empty
    seedInitialDataIfEmpty().catch(console.error);

    const unsubSettings = subscribeToSettings((data) => {
      setSettings(data);
      setHasSyncedSettings(true);
      setIsCloudSyncing(false);
    }, currentClient?.id, currentClient?.storeName);

    const unsubProducts = subscribeToProducts((data) => {
      setProducts(data);
    }, currentClient?.id);

    const unsubCategories = subscribeToCategories((data) => {
      setCategories(data);
    }, currentClient?.id);

    const unsubTags = subscribeToTags((data) => {
      setTags(data);
    }, currentClient?.id);

    const unsubCoupons = subscribeToCoupons((data) => {
      setCoupons(data);
    }, currentClient?.id);

    const unsubOrders = subscribeToOrders((data) => {
      setOrders(data);

      // Push notify store owner on newly arriving orders after initial snapshot
      if (isAdminAuthenticated) {
        if (knownOrderIdsRef.current === null) {
          knownOrderIdsRef.current = new Set(data.map((o) => o.id));
          const nowMs = Date.now();
          const freshPending = data.find((o) => {
            if (o.status !== 'pending') return false;
            const ageMs = nowMs - new Date(o.createdAt).getTime();
            const alertedKey = `pushed_order_${currentClient?.id || 'default'}_${o.id}`;
            return ageMs >= 0 && ageMs < 180000 && !sessionStorage.getItem(alertedKey);
          });
          if (freshPending) {
            sessionStorage.setItem(`pushed_order_${currentClient?.id || 'default'}_${freshPending.id}`, '1');
            const storeLabel = currentClient?.storeName || settings.storeName || 'Sua Loja';
            const bodyText = `${freshPending.customerName} enviou um pedido de ${formatCurrency(freshPending.finalTotal)} (${freshPending.orderType === 'delivery' ? 'Entrega' : 'Retirada'}).`;
            sendBrowserPushNotification({
              title: `Novo Pedido #${freshPending.orderNumber} — ${storeLabel}`,
              body: bodyText,
              tag: `order-${freshPending.id}`,
              kind: 'order',
              requireInteraction: true,
            });
            setLivePushToast({
              id: freshPending.id,
              sender: 'Novo Pedido Recebido',
              title: `Pedido #${freshPending.orderNumber} (${formatCurrency(freshPending.finalTotal)})`,
              body: bodyText,
              kind: 'order',
            });
          }
        } else {
          const newOrders = data.filter((o) => !knownOrderIdsRef.current!.has(o.id));
          newOrders.forEach((o) => knownOrderIdsRef.current!.add(o.id));
          if (newOrders.length > 0) {
            const latest = newOrders[0];
            sessionStorage.setItem(`pushed_order_${currentClient?.id || 'default'}_${latest.id}`, '1');
            const storeLabel = currentClient?.storeName || settings.storeName || 'Sua Loja';
            const bodyText = `${latest.customerName} enviou um pedido de ${formatCurrency(latest.finalTotal)} (${latest.orderType === 'delivery' ? 'Entrega' : 'Retirada'}).`;
            sendBrowserPushNotification({
              title: `Novo Pedido #${latest.orderNumber} — ${storeLabel}`,
              body: bodyText,
              tag: `order-${latest.id}`,
              kind: 'order',
              requireInteraction: true,
            });
            setLivePushToast({
              id: latest.id,
              sender: 'Novo Pedido Recebido',
              title: `Pedido #${latest.orderNumber} (${formatCurrency(latest.finalTotal)})`,
              body: bodyText,
              kind: 'order',
            });
          }
        }
      }
    }, currentClient?.id);

    const unsubFinance = subscribeToFinance((data) => {
      setFinance(data);
    }, currentClient?.id);

    let unsubNotifications: (() => void) | undefined;
    if (isAdminAuthenticated && currentClient?.id) {
      unsubNotifications = subscribeToSystemNotifications((notifs) => {
        setSystemNotifications(notifs);

        if (knownNotifIdsRef.current === null) {
          knownNotifIdsRef.current = new Set(notifs.map((n) => n.id));
          // Notify once if an unread notification arrived very recently (last 90s)
          const nowMs = Date.now();
          const freshUnread = notifs.find((n) => {
            const ageMs = nowMs - new Date(n.createdAt).getTime();
            const isRead = n.readByClientIds?.includes(currentClient.id);
            const notifiedKey = `pushed_sysnotif_${currentClient.id}_${n.id}`;
            return !isRead && ageMs >= 0 && ageMs < 90000 && !sessionStorage.getItem(notifiedKey);
          });
          if (freshUnread) {
            sessionStorage.setItem(`pushed_sysnotif_${currentClient.id}_${freshUnread.id}`, '1');
            sendBrowserPushNotification({
              title: 'Notificação do Sistema',
              body: freshUnread.title ? `${freshUnread.title}: ${freshUnread.message}` : freshUnread.message,
              tag: `sysnotif-${freshUnread.id}`,
              kind: 'system',
              requireInteraction: freshUnread.priority === 'urgent',
            });
            setLivePushToast({
              id: freshUnread.id,
              sender: 'Notificação do Sistema',
              title: freshUnread.title || 'Aviso Geral',
              body: freshUnread.message,
              kind: 'system',
            });
          }
        } else {
          const arriving = notifs.filter((n) => !knownNotifIdsRef.current!.has(n.id));
          arriving.forEach((n) => knownNotifIdsRef.current!.add(n.id));
          if (arriving.length > 0) {
            const latest = arriving[0];
            sessionStorage.setItem(`pushed_sysnotif_${currentClient.id}_${latest.id}`, '1');
            sendBrowserPushNotification({
              title: 'Notificação do Sistema',
              body: latest.title ? `${latest.title}: ${latest.message}` : latest.message,
              tag: `sysnotif-${latest.id}`,
              kind: 'system',
              requireInteraction: latest.priority === 'urgent',
            });
            setLivePushToast({
              id: latest.id,
              sender: 'Notificação do Sistema',
              title: latest.title || 'Aviso do Administrador',
              body: latest.message,
              kind: 'system',
            });
          }
        }
      }, currentClient.id);
    }

    return () => {
      unsubSettings();
      unsubProducts();
      unsubCategories();
      unsubTags();
      unsubCoupons();
      unsubOrders();
      unsubFinance();
      if (unsubNotifications) unsubNotifications();
    };
  }, [currentClient, isAdminAuthenticated]);

  // Open product modal automatically if product ID is in URL parameters or path
  useEffect(() => {
    if (products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const pathProdMatch = window.location.pathname.match(/\/produto\/([^/]+)\/?$/i);
      const prodId = params.get('produto') || params.get('product') || (pathProdMatch?.[1] ? decodeURIComponent(pathProdMatch[1]) : '');
      if (prodId) {
        const product = products.find((p) => p.id === prodId);
        if (product) {
          setSelectedProduct(product);
          setIsProductModalOpen(true);
        }
      }
    }
  }, [products]);

  // Persist changes to Cloud Firestore
  const handleUpdateSettings = async (newSettings: StoreSettings) => {
    setSettings(newSettings);
    await saveSettingsToDb(newSettings, currentClient?.id);
  };

  const handleSaveProduct = async (product: Product): Promise<void> => {
    const savedProduct = await saveProductToDb(product, currentClient?.id);
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === savedProduct.id);
      const updated = exists
        ? prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
        : [savedProduct, ...prev];
      return updated;
    });
  };

  const handleDeleteProduct = (product: Product) => {
    setDeleteModalState({
      isOpen: true,
      title: 'Excluir Peça do Catálogo',
      itemName: product.name,
      itemDescription: `Categoria: ${product.category} • Valor: R$ ${product.price.toFixed(2)}`,
      onConfirm: async () => {
        const updated = products.filter((p) => p.id !== product.id);
        setProducts(updated);
        await deleteProductFromDb(product.id, currentClient?.id);
      },
    });
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const oldStatus = targetOrder.status;
      const updatedOrder: Order = { ...targetOrder, status };
      const updated = orders.map((o) => (o.id === orderId ? updatedOrder : o));
      setOrders(updated);
      await saveOrderToDb(updatedOrder, currentClient?.id);

      // If transition to delivered (Dar Baixa), reduce stock
      if (status === 'delivered' && oldStatus !== 'delivered') {
        let updatedProducts = [...products];
        for (const item of targetOrder.items) {
          const matchIndex = updatedProducts.findIndex((p) => p.id === item.productId);
          if (matchIndex !== -1) {
            const p = updatedProducts[matchIndex];
            const currentStock = p.stock !== undefined ? p.stock : 10;
            const newStock = Math.max(0, currentStock - item.quantity);
            const updatedProduct = { ...p, stock: newStock };
            updatedProducts[matchIndex] = updatedProduct;
            await saveProductToDb(updatedProduct, currentClient?.id);
          }
        }
        setProducts(updatedProducts);
      }
      // If transition away from delivered, restore stock
      else if (oldStatus === 'delivered' && status !== 'delivered') {
        let updatedProducts = [...products];
        for (const item of targetOrder.items) {
          const matchIndex = updatedProducts.findIndex((p) => p.id === item.productId);
          if (matchIndex !== -1) {
            const p = updatedProducts[matchIndex];
            const currentStock = p.stock !== undefined ? p.stock : 10;
            const newStock = currentStock + item.quantity;
            const updatedProduct = { ...p, stock: newStock };
            updatedProducts[matchIndex] = updatedProduct;
            await saveProductToDb(updatedProduct, currentClient?.id);
          }
        }
        setProducts(updatedProducts);
      }
    }
  };

  const handleDeleteOrder = (order: Order) => {
    setDeleteModalState({
      isOpen: true,
      title: 'Excluir Registro de Pedido',
      itemName: `Pedido #${order.orderNumber} - ${order.customerName}`,
      itemDescription: `Valor Total: R$ ${order.finalTotal.toFixed(2)}`,
      onConfirm: async () => {
        const updated = orders.filter((o) => o.id !== order.id);
        setOrders(updated);
        await deleteOrderFromDb(order.id, currentClient?.id);
      },
    });
  };

  const handleSaveCoupon = async (coupon: Coupon) => {
    const updated = [coupon, ...coupons.filter((c) => c.id !== coupon.id)];
    setCoupons(updated);
    await saveCouponToDb(coupon, currentClient?.id);
  };

  const handleDeleteCoupon = (coupon: Coupon) => {
    setDeleteModalState({
      isOpen: true,
      title: 'Excluir Cupom de Desconto',
      itemName: `Cupom ${coupon.code}`,
      itemDescription: `Desconto: ${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : ' R$'}`,
      onConfirm: async () => {
        const updated = coupons.filter((c) => c.id !== coupon.id);
        setCoupons(updated);
        await deleteCouponFromDb(coupon.id, currentClient?.id);
      },
    });
  };

  const handleAddFinanceRecord = async (record: Omit<FinancialRecord, 'id'>) => {
    const newRecord: FinancialRecord = {
      ...record,
      id: 'fin-' + Date.now(),
    };
    const updated = [newRecord, ...finance];
    setFinance(updated);
    await saveFinanceToDb(newRecord, currentClient?.id);
  };

  const handleDeleteFinance = (record: FinancialRecord) => {
    setDeleteModalState({
      isOpen: true,
      title: 'Excluir Lançamento Financeiro',
      itemName: record.description,
      itemDescription: `Valor: R$ ${record.amount.toFixed(2)} (${record.type === 'income' ? 'Entrada' : 'Despesa'})`,
      onConfirm: async () => {
        const updated = finance.filter((f) => f.id !== record.id);
        setFinance(updated);
        await deleteFinanceFromDb(record.id, currentClient?.id);
      },
    });
  };

  const handleAddTagCategory = async (item: TagCategory) => {
    if (item.type === 'category') {
      const updated = [...categories.filter((c) => c.id !== item.id), item];
      setCategories(updated);
      await saveCategoryToDb(item, currentClient?.id);
    } else {
      const updated = [...tags.filter((t) => t.id !== item.id), item];
      setTags(updated);
      await saveTagToDb(item, currentClient?.id);
    }
  };

  const handleDeleteTagCategory = (item: TagCategory) => {
    setDeleteModalState({
      isOpen: true,
      title: item.type === 'category' ? 'Excluir Categoria' : 'Excluir Tag',
      itemName: item.name,
      itemDescription:
        item.type === 'tag'
          ? 'A tag será removida do sistema e desvinculada de todas as peças do catálogo.'
          : 'A categoria será removida do sistema.',
      onConfirm: async () => {
        if (item.type === 'category') {
          const updated = categories.filter((c) => c.id !== item.id);
          setCategories(updated);
          await deleteCategoryFromDb(item.id, currentClient?.id);
        } else {
          // Remove from tags list
          const updatedTags = tags.filter((t) => t.id !== item.id);
          setTags(updatedTags);
          await deleteTagFromDb(item.id, currentClient?.id);

          // Clean up tag from all products
          const tagName = item.name;
          const affectedProducts = products.filter(
            (p) => p.tags && p.tags.includes(tagName)
          );

          if (affectedProducts.length > 0) {
            const updatedProducts = products.map((p) => {
              if (p.tags && p.tags.includes(tagName)) {
                return { ...p, tags: p.tags.filter((t) => t !== tagName) };
              }
              return p;
            });
            setProducts(updatedProducts);

            // Persist updated products to DB
            for (const prod of updatedProducts) {
              if (affectedProducts.some((ap) => ap.id === prod.id)) {
                await saveProductToDb(prod, currentClient?.id);
              }
            }
          }
        }
      },
    });
  };

  const handleResetData = () => {
    setDeleteModalState({
      isOpen: true,
      title: 'Restaurar Dados da Loja',
      itemName: 'Todos os produtos, pedidos e lançamentos serão restaurados para o padrão.',
      onConfirm: async () => {
        resetAllToDefault();
        await resetDatabaseToDefaults();
      },
    });
  };

  // Cart operations
  const handleAddToCart = (
    product: Product,
    selectedSize: string,
    selectedColor: { name: string; hex: string },
    quantity: number
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor.name === selectedColor.name
        );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, selectedSize, selectedColor, quantity }];
      }
    });
  };

  const handleQuickAddToCart = (product: Product) => {
    handleAddToCart(
      product,
      product.sizes?.[0] || 'M',
      product.colors?.[0] || { name: 'Padrão', hex: '#111111' },
      1
    );
    setAddedItemToast({ name: product.name, timestamp: Date.now() });
    setTimeout(() => {
      setAddedItemToast((current) => {
        if (current && Date.now() - current.timestamp >= 2400) {
          return null;
        }
        return current;
      });
    }, 2500);
  };

  const handleUpdateCartQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderCreated = async (newOrder: Order) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    await saveOrderToDb(newOrder, currentClient?.id);

    // Also register income entry in financial dashboard
    const newFinance: FinancialRecord = {
      id: 'fin-' + Date.now(),
      type: 'income',
      description: `Venda Pedido #${newOrder.orderNumber} (${newOrder.customerName})`,
      amount: newOrder.finalTotal,
      category: 'Vendas Loja / Vitrine',
      date: new Date().toISOString(),
      relatedOrderId: newOrder.id,
    };
    const updatedFinance = [newFinance, ...finance];
    setFinance(updatedFinance);
    await saveFinanceToDb(newFinance, currentClient?.id);
  };

  const handleOpenProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleShareProduct = (product: Product) => {
    setSharingProduct(product);
    setIsShareModalOpen(true);
  };

  // Filter and Sort Products for Vitrine
  const filteredProducts = products.filter((p) => {
    // Hide from vitrine if not available (unless in admin view)
    if (activeView !== 'admin' && p.isAvailable === false) {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }
    // Tag filter
    if (selectedTag !== 'all' && !(p.tags || []).includes(selectedTag)) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchCat = (p.category || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      const matchTags = (p.tags || []).some((t) => (t || '').toLowerCase().includes(q));
      if (!matchName && !matchCat && !matchDesc && !matchTags) {
        return false;
      }
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.isOnSale && a.promotionalPrice ? a.promotionalPrice : a.price;
    const priceB = b.isOnSale && b.promotionalPrice ? b.promotionalPrice : b.price;

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return b.viewsCount - a.viewsCount; // default featured
  });

  const categoryNames = Array.from(new Set(categories.map((c) => c.name).filter(Boolean)));
  const tagNames = Array.from(new Set(tags.map((t) => t.name).filter(Boolean)));

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    }
    return counts;
  }, [products]);


  const activeStoreType = currentClient?.storeType || settings.storeType || 'clothing';

  if (activeView === 'vulnerability_admin') {
    return <VulnerabilityPanel onLogout={handleLogout} />;
  }

  if (activeView === 'super_admin') {
    return (
      <>
        <SuperAdminPanel
          onLogout={handleLogout}
          onShareSystem={() => setIsShareSystemModalOpen(true)}
        />
        <ShareSystemModal
          isOpen={isShareSystemModalOpen}
          onClose={() => setIsShareSystemModalOpen(false)}
        />
        <PaymentSuccessModal
          isOpen={paymentSuccessInfo.isOpen}
          planTitle={paymentSuccessInfo.planTitle}
          period={paymentSuccessInfo.period}
          storeName={paymentSuccessInfo.storeName}
          onClose={() => {
            localStorage.removeItem('store_payment_success_data');
            setPaymentSuccessInfo((prev) => ({ ...prev, isOpen: false }));
          }}
        />
      </>
    );
  }

  if (activeView === 'landing') {
    return (
      <>
        {showEntranceAnimation && (
          <AppEntranceAnimation
            storeName="Web Vitrine"
            onAnimationComplete={() => {
              setShowEntranceAnimation(false);
              sessionStorage.setItem('app_entered_session', 'true');
            }}
          />
        )}
        <LandingPage
          settings={settings}
          onEnterStore={handleEnterStore}
          onAdminLogin={() => setIsLoginModalOpen(true)}
          onOpenRegister={() => setIsRegisterModalOpen(true)}
          onShareSystem={() => setIsShareSystemModalOpen(true)}
        />
        <ShareSystemModal
          isOpen={isShareSystemModalOpen}
          onClose={() => setIsShareSystemModalOpen(false)}
        />
        {/* Admin Login Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          onOpenRegister={() => setIsRegisterModalOpen(true)}
          onOpenForgotPassword={() => {
            setIsLoginModalOpen(false);
            setIsForgotPasswordModalOpen(true);
          }}
          adminUser={adminUser}
          settings={settings}
        />
        {/* Self-Service Autonomous Store Registration Modal */}
        <RegisterStoreModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onRegisterSuccess={handleRegisterSuccess}
        />
        {/* Forgot Password Modal */}
        <ForgotPasswordModal
          isOpen={isForgotPasswordModalOpen}
          onClose={() => setIsForgotPasswordModalOpen(false)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
        {/* Privacy Policy Modal */}
        <PrivacyPolicyModal
          isOpen={isPrivacyPolicyModalOpen}
          onClose={() => setIsPrivacyPolicyModalOpen(false)}
        />
        <PaymentSuccessModal
          isOpen={paymentSuccessInfo.isOpen}
          planTitle={paymentSuccessInfo.planTitle}
          period={paymentSuccessInfo.period}
          storeName={paymentSuccessInfo.storeName}
          onClose={() => {
            localStorage.removeItem('store_payment_success_data');
            setPaymentSuccessInfo((prev) => ({ ...prev, isOpen: false }));
          }}
        />
      </>
    );
  }

  // Wait for tenant settings sync when switching to an uncached account so no stale photo ever flashes
  if (
    ((isCloudSyncing && !hasSyncedSettings) || (isCloudSyncing && !settings.storeName && products.length === 0)) &&
    !showEntranceAnimation
  ) {
    return (
      <div className="min-h-screen bg-[#0B0A0C] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#D4AF37] text-xs font-bold tracking-wider animate-pulse uppercase">Carregando Vitrine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-stone-100 flex flex-col selection:bg-[#D4AF37] selection:text-stone-950">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        activeView={activeView}
        onToggleView={handleToggleView}
        cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categoryNames}
        categoryCounts={categoryCounts}
        totalProductsCount={products.length}
        onOpenStoreSetup={() => setIsStoreSetupOpen(true)}
        onOpenStoreHours={() => setIsStoreHoursModalOpen(true)}
        onOpenLandingHero={() => setActiveView('landing')}
        isOfficialStore={isOfficialStore}
        isAdminAuthenticated={isAdminAuthenticated}
        pendingOrdersCount={orders.filter((o) => o.status === 'pending').length}
        onOpenOrders={() => {
          setAdminRequestedTab((prev) => ({ tab: 'orders', seq: (prev?.seq || 0) + 1 }));
          handleToggleView('admin');
        }}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeView === 'store' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Store Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="pt-2 pb-6 text-center max-w-2xl mx-auto border-b border-[#27272A] mb-6"
              id="storefront-instagram-profile-header"
            >
              {/* Centered Avatar with Gold Accent */}
              <div className="flex justify-center mb-3.5">
                <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#FFF3D1] to-[#B8860B] shadow-xl">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-[#16161A] border-2 border-[#121215] flex items-center justify-center shadow-inner">
                    {settings.logoUrl ? (
                      <img
                        src={settings.logoUrl}
                        alt={settings.storeName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#16161A] text-[#D4AF37] flex items-center justify-center font-serif-luxury font-bold text-3xl sm:text-4xl">
                        {settings.storeName ? settings.storeName.charAt(0) : 'V'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Store Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif-luxury font-bold text-white tracking-tight">
                {settings.storeName || 'Web Vitrine'}
              </h1>

              {/* Slogan */}
              {settings.slogan && (
                <p className="text-xs sm:text-sm font-semibold text-[#D4AF37] tracking-wider mt-1 uppercase">
                  {settings.slogan}
                </p>
              )}

              {/* Bio / Description */}
              {settings.description && (
                <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-lg mx-auto leading-relaxed px-4">
                  {settings.description}
                </p>
              )}

              {/* Contact & Meta Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 px-2">
                {/* Instagram link */}
                {settings.instagramHandle && (
                  <a
                    href={`https://instagram.com/${settings.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16161A] border border-[#27272A] text-stone-200 text-xs font-semibold hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>@{settings.instagramHandle.replace('@', '')}</span>
                  </a>
                )}

                {/* WhatsApp contact */}
                {settings.phoneWhatsapp && (
                  <a
                    href={`https://wa.me/${cleanPhoneForWhatsapp(settings.phoneWhatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white text-white" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {/* Hours status badge */}
                <button
                  type="button"
                  onClick={() => setIsStoreHoursModalOpen(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
                    checkStoreHoursStatus(settings).isBreakNow
                      ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                      : checkStoreHoursStatus(settings).isOpenNow
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                      : 'bg-[#16161A] text-stone-400 border-[#27272A]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {checkStoreHoursStatus(settings).isBreakNow
                      ? 'Em Intervalo'
                      : checkStoreHoursStatus(settings).isOpenNow
                      ? 'Loja Aberta'
                      : 'Fechado no Momento'}
                  </span>
                </button>

                {/* Location / City */}
                {(settings.cityState || settings.address) && (
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#16161A] border border-[#27272A] text-stone-200 text-xs font-medium hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Localização</span>
                  </button>
                )}
              </div>
            </motion.div>

            {/* Quick Tag Pills (if tags exist) */}
            {tagNames.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 pt-1 scrollbar-none text-xs mb-3">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1 flex items-center gap-1 flex-shrink-0">
                  <TagIcon className="w-3 h-3 text-[#D4AF37]" />
                  Tags:
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedTag('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 cursor-pointer ${
                    selectedTag === 'all'
                      ? 'bg-[#D4AF37] text-stone-950 font-bold'
                      : 'bg-[#16161A] hover:bg-[#202026] text-stone-300 border border-[#27272A]'
                  }`}
                >
                  Todas as Tags
                </button>

                {tagNames.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-[#D4AF37] text-stone-950 font-bold'
                        : 'bg-[#16161A] hover:bg-[#202026] text-stone-300 border border-[#27272A]'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* Catalog Header & Sorting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif-luxury font-bold text-white">
                  {selectedCategory === 'all' ? 'Catálogo de Peças' : selectedCategory}
                  {selectedTag !== 'all' && (
                    <span className="text-sm font-sans font-semibold text-[#D4AF37] ml-2">
                      (Tag: #{selectedTag})
                    </span>
                  )}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {sortedProducts.length} {sortedProducts.length === 1 ? 'peça disponível' : 'peças disponíveis'}
                </p>
              </div>

              {/* Sort selector */}
              <div className="flex items-center space-x-2 self-start sm:self-auto relative">
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-xs font-semibold text-stone-400">Ordenar por:</span>
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="bg-[#16161A] border border-[#27272A] hover:border-stone-600 rounded-xl px-3 py-1.5 text-xs font-medium text-stone-200 focus:outline-none flex items-center gap-1.5 cursor-pointer transition-colors"
                  id="select-sort-vitrine-btn"
                >
                  <span>
                    {sortBy === 'featured' && 'Mais Procurados / Destaques'}
                    {sortBy === 'price-asc' && 'Menor Preço'}
                    {sortBy === 'price-desc' && 'Maior Preço'}
                    {sortBy === 'newest' && 'Lançamentos Recentes'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsSortOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        transition={{ duration: 0.12, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-64 bg-[#16161A] border border-[#27272A] shadow-xl rounded-2xl p-2 z-50 space-y-1"
                      >
                        {[
                          { value: 'featured', label: 'Mais Procurados / Destaques' },
                          { value: 'price-asc', label: 'Menor Preço' },
                          { value: 'price-desc', label: 'Maior Preço' },
                          { value: 'newest', label: 'Lançamentos Recentes' }
                        ].map((item) => {
                          const isSelected = sortBy === item.value;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => {
                                setSortBy(item.value as any);
                                setIsSortOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-[#22222A] text-[#D4AF37] font-bold'
                                  : 'text-stone-300 hover:bg-[#1E1E26] hover:text-white'
                              }`}
                            >
                              <span>{item.label}</span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-[#141417] rounded-3xl border border-[#27272A] p-8">
                <AlertCircle className="w-10 h-10 text-stone-500 mx-auto" />
                <h3 className="font-serif-luxury text-lg font-medium text-white">
                  Nenhuma peça encontrada
                </h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Não encontramos produtos para os filtros ou busca aplicados. Tente selecionar outra categoria ou limpar a busca.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedTag('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#C5A059] text-stone-950 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Ver Todas as Peças
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    settings={settings}
                    onOpenDetails={handleOpenProductDetails}
                    onQuickAddToCart={handleQuickAddToCart}
                    onShareProduct={handleShareProduct}
                    cartQuantity={cart
                      .filter((item) => item.product.id === product.id)
                      .reduce((sum, item) => sum + item.quantity, 0)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Admin Panel View */
          <AdminPanel
            currentClient={currentClient}
            settings={settings}
            products={products}
            orders={orders}
            coupons={coupons}
            finance={finance}
            categories={categories}
            tags={tags}
            systemNotifications={systemNotifications}
            localReadNotifIds={localReadNotifIds}
            onMarkNotificationRead={async (notifId: string) => {
              const targetId = currentClient?.id || 'default';
              setLocalReadNotifIds((prev) => {
                const next = Array.from(new Set([...prev, notifId]));
                localStorage.setItem(`read_sys_notifs_${targetId}`, JSON.stringify(next));
                return next;
              });
              if (currentClient?.id) {
                await markSystemNotificationAsRead(notifId, currentClient.id);
              }
            }}
            onMarkAllNotificationsRead={async () => {
              const targetId = currentClient?.id || 'default';
              const allIds = systemNotifications.map((n) => n.id);
              setLocalReadNotifIds((prev) => {
                const next = Array.from(new Set([...prev, ...allIds]));
                localStorage.setItem(`read_sys_notifs_${targetId}`, JSON.stringify(next));
                return next;
              });
              if (currentClient?.id && allIds.length > 0) {
                await markAllSystemNotificationsAsRead(allIds, currentClient.id);
              }
            }}
            onSaveProduct={handleSaveProduct}
            onRequestDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onRequestDeleteOrder={handleDeleteOrder}
            onSaveCoupon={handleSaveCoupon}
            onRequestDeleteCoupon={handleDeleteCoupon}
            onAddFinanceRecord={handleAddFinanceRecord}
            onRequestDeleteFinance={handleDeleteFinance}
            onAddTagCategory={handleAddTagCategory}
            onRequestDeleteTagCategory={handleDeleteTagCategory}
            onOpenSettingsModal={() => setIsStoreSetupOpen(true)}
            onResetData={handleResetData}
            onLogout={handleLogout}
            onViewStore={() => setActiveView('store')}
            onShareProduct={handleShareProduct}
            onShareSystem={() => setIsShareSystemModalOpen(true)}
            requestedTab={adminRequestedTab}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={() => handleToggleView('admin')}
        onOpenLanding={() => setActiveView('landing')}
        onOpenPrivacyPolicy={() => setIsPrivacyPolicyModalOpen(true)}
        onShareSystem={() => setIsShareSystemModalOpen(true)}
      />

      {/* Store Hours Status Modal */}
      <StoreHoursModal
        isOpen={isStoreHoursModalOpen}
        onClose={() => setIsStoreHoursModalOpen(false)}
        settings={settings}
      />

      {/* Landing / Acquisition Modal ("Adquira Sua Vitrine") */}
      <LandingHeroModal
        isOpen={isLandingHeroModalOpen}
        onClose={() => setIsLandingHeroModalOpen(false)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        onEnterStore={handleEnterStore}
        onShareSystem={() => setIsShareSystemModalOpen(true)}
      />

      {/* Admin Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        onOpenForgotPassword={() => {
          setIsLoginModalOpen(false);
          setIsForgotPasswordModalOpen(true);
        }}
        adminUser={adminUser}
        settings={settings}
      />

      {/* Self-Service Autonomous Store Registration Modal */}
      <RegisterStoreModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyPolicyModalOpen}
        onClose={() => setIsPrivacyPolicyModalOpen(false)}
      />

      {/* Product Details Modal */}
      <ProductModal
        product={selectedProduct}
        settings={settings}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddToCart={(prod, sz, col, qty) => {
          handleAddToCart(prod, sz, col, qty);
          setAddedItemToast({ name: `${qty > 1 ? `${qty}x ` : ''}${prod.name}`, timestamp: Date.now() });
          setTimeout(() => {
            setAddedItemToast((current) => {
              if (current && Date.now() - current.timestamp >= 2400) {
                return null;
              }
              return current;
            });
          }, 2500);
        }}
        onOpenCart={() => {
          setIsProductModalOpen(false);
          setIsCartOpen(true);
        }}
        onShareProduct={handleShareProduct}
      />

      {/* Share Product Modal */}
      <ShareProductModal
        product={sharingProduct}
        settings={settings}
        currentClient={currentClient}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Share System Modal */}
      <ShareSystemModal
        isOpen={isShareSystemModalOpen}
        onClose={() => setIsShareSystemModalOpen(false)}
      />

      {/* Cart / Order Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        settings={settings}
        coupons={coupons}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOrderCreated={handleOrderCreated}
        onSaveCoupon={handleSaveCoupon}
      />

      {/* Store Setup & Onboarding Modal */}
      <StoreSetupModal
        currentClient={currentClient}
        isOpen={isStoreSetupOpen}
        isFirstSetup={isFirstOnboarding}
        settings={settings}
        onUpdateClientSlug={async (newSlug, newStoreName) => {
          if (currentClient) {
            const updatedClient = {
              ...currentClient,
              storeSlug: newSlug,
              ...(newStoreName ? { storeName: newStoreName } : {}),
            };
            setCurrentClient(updatedClient);
            localStorage.setItem('store_current_client', JSON.stringify(updatedClient));
            await saveClient(updatedClient);
          }
        }}
        onAutoSave={(newSettings) => {
          handleUpdateSettings(newSettings);
        }}
        onSave={(newSettings) => {
          handleUpdateSettings(newSettings);
          setIsFirstOnboarding(false);
          setIsStoreSetupOpen(false);
        }}
        onClose={() => setIsStoreSetupOpen(false)}
      />

      {/* 2-Step Delete Safety Confirmation Modal ("apagar") */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        title={deleteModalState.title}
        itemName={deleteModalState.itemName}
        itemDescription={deleteModalState.itemDescription}
        onConfirm={deleteModalState.onConfirm}
        onClose={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
      />



      {/* Centered Post-Payment Success Notification Modal */}
      <PaymentSuccessModal
        isOpen={paymentSuccessInfo.isOpen}
        planTitle={paymentSuccessInfo.planTitle}
        period={paymentSuccessInfo.period}
        storeName={paymentSuccessInfo.storeName}
        onClose={() => {
          localStorage.removeItem('store_payment_success_data');
          setPaymentSuccessInfo((prev) => ({ ...prev, isOpen: false }));
        }}
      />

      {/* Location Modal */}
      <AnimatePresence>
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-[#121215] text-stone-100 rounded-3xl border border-[#27272A] shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-[#18181E] rounded-full flex items-center justify-center mx-auto text-[#D4AF37] border border-[#2B2B33]">
                  <MapPin className="w-7 h-7" />
                </div>
                
                <div>
                  <h3 className="font-serif-luxury text-xl font-bold text-white">
                    Localização da Loja
                  </h3>
                  <p className="text-xs text-[#D4AF37] mt-1 font-semibold uppercase tracking-wider">
                    {settings.storeName}
                  </p>
                </div>

                <div className="p-4 bg-[#18181E] rounded-2xl border border-[#27272A] space-y-1">
                  <p className="text-sm font-semibold text-stone-200">
                    {settings.address || 'Endereço sob consulta'}
                  </p>
                  <p className="text-xs text-stone-400">
                    {settings.cityState}
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${settings.address}, ${settings.cityState}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#D4AF37] hover:bg-[#C5A059] text-stone-950 rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-stone-950" />
                    <span>Ver no Google Maps</span>
                  </a>
                  
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(false)}
                    className="w-full py-2.5 bg-[#18181E] hover:bg-stone-800 text-stone-300 text-xs font-semibold rounded-xl border border-[#27272A] transition-colors cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Luxury Entrance Animation (proportional to screen and zoom) */}
      {showEntranceAnimation && (
        <AppEntranceAnimation
          storeName={currentClient?.storeName || settings.storeName || 'Web Vitrine'}
          onAnimationComplete={() => {
            setShowEntranceAnimation(false);
            sessionStorage.setItem('app_entered_session', 'true');
          }}
        />
      )}

      {/* Floating Install Bar (hidden when order items exist to give full priority to the order bar) */}
      <InstallFloatingBar hide={cart.length > 0} />

      {/* Digital Menu Persistent Floating Order Bar (Cardápio Digital UI/UX) */}
      {activeView === 'store' && (
        <CartFloatingBar
          cart={cart}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {/* Instant Live Notification Toast (Red Alert for Orders & Gold for Notificação do Sistema) */}
      <AnimatePresence>
        {livePushToast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="fixed top-4 right-4 z-[60] max-w-sm w-[calc(100%-2rem)]"
          >
            <div
              className={`p-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 flex items-start gap-3 ${
                livePushToast.kind === 'order'
                  ? 'bg-[#25090E]/95 border-red-500 text-white shadow-red-900/40'
                  : 'bg-[#16161A]/95 border-[#D4AF37] text-white'
              }`}
            >
              <div
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  livePushToast.kind === 'order'
                    ? 'bg-red-600/25 text-red-400 border border-red-500/40'
                    : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                }`}
              >
                <Bell className="w-5 h-5" />
                {livePushToast.kind === 'order' && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-85" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                    livePushToast.kind === 'order' ? 'text-red-400' : 'text-[#D4AF37]'
                  }`}
                >
                  {livePushToast.sender}
                </span>
                <p className="text-xs font-bold text-white mt-0.5 truncate">
                  {livePushToast.title}
                </p>
                <p className="text-[11px] text-stone-300 mt-0.5 line-clamp-3 leading-relaxed">
                  {livePushToast.body}
                </p>
                {livePushToast.kind === 'order' && isAdminAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      setAdminRequestedTab((prev) => ({ tab: 'orders', seq: (prev?.seq || 0) + 1 }));
                      setActiveView('admin');
                      setLivePushToast(null);
                    }}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    id="btn-toast-view-orders"
                  >
                    <span>Ver Pedido Agora</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setLivePushToast(null)}
                className="p-1 text-stone-400 hover:text-white rounded-lg cursor-pointer"
                title="Fechar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instant Feedback Toast when an item is added to cart */}
      <AnimatePresence>
        {addedItemToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-[#16161A]/95 border-2 border-[#D4AF37] text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-2.5 text-xs font-semibold">
              <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-stone-950 flex items-center justify-center font-extrabold text-[11px] shrink-0 shadow-sm">
                ✓
              </span>
              <span>
                <strong className="text-white font-bold">{addedItemToast.name}</strong> adicionado ao pedido!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
