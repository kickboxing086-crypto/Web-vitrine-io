import React, { useState, useEffect } from 'react';
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
} from './types';
import {
  getStoredSettings,
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
} from './lib/firestoreService';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { StoreSetupModal } from './components/StoreSetupModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { LoginModal } from './components/LoginModal';
import { AdminPanel } from './components/AdminPanel';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { LandingHeroModal } from './components/LandingHeroModal';
import { StoreHoursModal } from './components/StoreHoursModal';
import { ShareProductModal } from './components/ShareProductModal';
import { PaymentSuccessModal } from './components/PaymentSuccessModal';
import { SlidersHorizontal, AlertCircle, Tag as TagIcon, ShoppingBag, ArrowLeft, MessageCircle, ChevronDown, Check } from 'lucide-react';
import { getFontFamilyCss } from './lib/themeUtils';
import { formatCurrency } from './lib/formatters';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Application Data States (initial fallback from local cache)
  const [settings, setSettings] = useState<StoreSettings>(getStoredSettings);
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [categories, setCategories] = useState<TagCategory[]>(getStoredCategories);
  const [tags, setTags] = useState<TagCategory[]>(getStoredTags);
  const [coupons, setCoupons] = useState<Coupon[]>(getStoredCoupons);
  const [orders, setOrders] = useState<Order[]>(getStoredOrders);
  const [finance, setFinance] = useState<FinancialRecord[]>(getStoredFinance);
  const [adminUser] = useState<AdminUser>(getStoredAdminUser);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(getAuthSession);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isStoreHoursModalOpen, setIsStoreHoursModalOpen] = useState<boolean>(false);
  const [isLandingHeroModalOpen, setIsLandingHeroModalOpen] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(true);
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
  const [activeView, setActiveView] = useState<'store' | 'admin' | 'super_admin' | 'landing'>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('page') === 'landing' || urlParams.get('landing') === 'true') {
      return 'landing';
    }
    return 'store';
  });
  const [currentClient, setCurrentClient] = useState<any>(() => {
    const saved = localStorage.getItem('store_current_client');
    return saved ? JSON.parse(saved) : null;
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

  const handleLoginSuccess = (type?: 'super_admin' | 'store_admin', client?: any) => {
    setIsAdminAuthenticated(true);
    saveAuthSession(true);
    if (client) {
      const isOfficial = client.username !== 'teste@123' && client.id !== 'client-test-natural' && client.isOfficial !== false;
      const enrichedClient = {
        ...client,
        isOfficial,
      };
      setCurrentClient(enrichedClient);
      localStorage.setItem('store_current_client', JSON.stringify(enrichedClient));
    }
    if (type === 'super_admin') {
      setActiveView('super_admin');
    } else {
      setActiveView('admin');
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setCurrentClient(null);
    localStorage.removeItem('store_current_client');
    saveAuthSession(false);
    setActiveView('store');
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isStoreSetupOpen, setIsStoreSetupOpen] = useState(false);
  const [isFirstOnboarding, setIsFirstOnboarding] = useState(false);

  // Share Product Modal State
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShareProduct = (product: Product) => {
    setSharingProduct(product);
    setIsShareModalOpen(true);
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

  // Dynamic document title, meta tags, fonts and primary colors update
  useEffect(() => {
    if (settings.storeName) {
      document.title = `${settings.storeName} | Vitrine Virtual`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', settings.description || `Vitrine virtual e catálogo exclusivo da ${settings.storeName}.`);
      }
    }

    // Apply custom dynamic store font and primary color to root document
    if (settings.fontFamily) {
      document.documentElement.style.setProperty('--font-serif-luxury', getFontFamilyCss(settings.fontFamily));
    }
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--brand-primary', settings.primaryColor);
      document.documentElement.style.setProperty('--brand-primary-dark', settings.primaryColor);
    }
  }, [settings.storeName, settings.description, settings.fontFamily, settings.primaryColor]);

  // Check first access and URL params for admin login and tenant stores
  useEffect(() => {
    if (!settings.isFirstSetupDone && !currentClient) {
      setIsFirstOnboarding(true);
      setIsStoreSetupOpen(true);
    }

    const getStoreUsernameFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const queryParam = params.get('loja') || params.get('u') || params.get('store');
      if (queryParam) return queryParam.trim().toLowerCase();

      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length > 2) {
        const subdomain = parts[0].toLowerCase();
        if (
          subdomain !== 'www' &&
          !subdomain.startsWith('ais-') &&
          subdomain !== 'web-vitrine-site' &&
          subdomain !== 'localhost'
        ) {
          return subdomain;
        }
      }
      
      return null;
    };
    
    // Check for client store username (from subdomain or param)
    const lojaParam = getStoreUsernameFromUrl();
    if (lojaParam) {
      import('./lib/firestoreService').then(async (module) => {
        const client = await module.getClientByUsername(lojaParam);
        if (client) {
          const isOfficial = client.username !== 'teste@123' && client.id !== 'client-test-natural';
          const enriched = { ...client, isOfficial };
          setCurrentClient(enriched);
          localStorage.setItem('store_current_client', JSON.stringify(enriched));
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
    setIsCloudSyncing(true);

    // Clear local states immediately to prevent flashing data from previous client
    setProducts([]);
    setCategories([]);
    setTags([]);
    setCoupons([]);
    setOrders([]);
    setFinance([]);

    // Seed initial data if database collections are empty
    seedInitialDataIfEmpty().catch(console.error);

    const unsubSettings = subscribeToSettings((data) => {
      setSettings(data);
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
    }, currentClient?.id);

    const unsubFinance = subscribeToFinance((data) => {
      setFinance(data);
    }, currentClient?.id);

    return () => {
      unsubSettings();
      unsubProducts();
      unsubCategories();
      unsubTags();
      unsubCoupons();
      unsubOrders();
      unsubFinance();
    };
  }, [currentClient]);

  // Open product modal automatically if product ID is in URL parameters
  useEffect(() => {
    if (products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('produto') || params.get('product');
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

  const handleSaveProduct = async (product: Product) => {
    const exists = products.some((p) => p.id === product.id);
    let updated: Product[];
    if (exists) {
      updated = products.map((p) => (p.id === product.id ? product : p));
    } else {
      updated = [product, ...products];
    }
    setProducts(updated);
    await saveProductToDb(product, currentClient?.id);
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
      product.sizes[0] || 'M',
      product.colors[0] || { name: 'Padrão', hex: '#111111' },
      1
    );
    setIsCartOpen(true);
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
    if (selectedTag !== 'all' && !p.tags.includes(selectedTag)) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
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


  const activeStoreType = currentClient?.storeType || settings.storeType || 'clothing';

  if (activeView === 'super_admin') {
    return (
      <>
        <SuperAdminPanel onLogout={handleLogout} />
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

  if (isCloudSyncing) {
    return (
      <div className="min-h-screen bg-[#12110F] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#D4AF37] text-sm font-bold animate-pulse">Sincronizando Vitrine...</p>
        </div>
      </div>
    );
  }

  if (activeView === 'landing') {
    return (
      <>
        <LandingPage
          settings={settings}
          onEnterStore={() => setActiveView('store')}
          onAdminLogin={() => setIsLoginModalOpen(true)}
        />
        {/* Admin Login Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          adminUser={adminUser}
          settings={settings}
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

  return (
    <div className={`min-h-screen bg-brand-bg text-stone-900 flex flex-col selection:bg-brand-border ${activeStoreType === 'natural' ? 'theme-natural' : ''}`}>
      {/* Top Global Announcement Switcher */}
      {currentClient && currentClient.username !== 'teste@123' && currentClient.id !== 'client-test-natural' ? (
        <div className="bg-gradient-to-r from-[#141F16] via-stone-950 to-[#141F16] text-white text-xs py-2 px-4 border-b border-emerald-900/40 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-stone-200 text-[11px] sm:text-xs">
                Vitrine Oficial de <strong className="text-white">{currentClient.storeName || settings.storeName}</strong> • <span className="text-emerald-400 font-bold">Conta Ativa & Verificada</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {activeView === 'store' ? (
                <button
                  type="button"
                  onClick={() => handleToggleView('admin')}
                  className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer shadow-xs"
                  id="btn-topbar-admin-official"
                >
                  Painel de Gestão
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveView('store')}
                  className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-semibold rounded-lg border border-white/10 transition-colors cursor-pointer"
                  id="btn-topbar-store-view"
                >
                  Ver Vitrine ao Vivo
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-stone-950 via-[#1C1814] to-stone-950 text-white text-xs py-2 px-4 border-b border-[#3D3328] shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-stone-300 text-[11px] sm:text-xs">
                Você está na <strong className="text-white">Vitrine de Demonstração</strong> • Plataforma por <strong className="text-[#E5C378]">R$ 29,99/mês</strong>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setActiveView('landing')}
                className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-[#D4AF37] hover:bg-[#c59e2a] text-black font-bold text-[11px] rounded-lg transition-colors cursor-pointer shadow-xs"
                id="btn-topbar-landing"
              >
                Conhecer Página Oficial
              </button>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-semibold rounded-lg border border-white/10 transition-colors cursor-pointer"
                id="btn-topbar-admin-login"
              >
                Área do Lojista
              </button>
            </div>
          </div>
        </div>
      )}

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
        onOpenStoreSetup={() => setIsStoreSetupOpen(true)}
        onOpenStoreHours={() => setIsStoreHoursModalOpen(true)}
        onOpenLandingHero={() => setActiveView('landing')}
        isOfficialStore={isOfficialStore}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeView === 'store' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            {/* Quick Tag Pills (if tags exist) */}
            {tagNames.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 pt-1 scrollbar-none text-xs mb-3">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1 flex items-center gap-1 flex-shrink-0">
                  <TagIcon className="w-3 h-3 text-brand-primary-darker" />
                  Tags:
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedTag('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex-shrink-0 cursor-pointer ${
                    selectedTag === 'all'
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border border-brand-border'
                  }`}
                >
                  Todas as Tags
                </button>

                {tagNames.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-brand-primary-darker text-white shadow-2xs'
                        : 'bg-white hover:bg-brand-bg-alt text-stone-700 border border-brand-border-dark'
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
                <h2 className="text-xl sm:text-2xl font-serif-luxury font-bold text-stone-900">
                  {selectedCategory === 'all' ? (activeStoreType === 'natural' ? 'Cardápio de Produtos' : 'Catálogo de Peças') : selectedCategory}
                  {selectedTag !== 'all' && (
                    <span className="text-sm font-sans font-semibold text-brand-primary-darker ml-2">
                      (Tag: #{selectedTag})
                    </span>
                  )}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {sortedProducts.length} {sortedProducts.length === 1 ? 'peça disponível' : 'peças disponíveis'}
                </p>
              </div>

              {/* Sort selector */}
              <div className="flex items-center space-x-2 self-start sm:self-auto relative">
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-xs font-semibold text-stone-600">Ordenar por:</span>
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="bg-white border border-brand-border-dark rounded-xl px-3 py-1.5 text-xs font-medium text-stone-800 focus:outline-none flex items-center gap-1.5 shadow-2xs cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
                  id="select-sort-vitrine-btn"
                >
                  <span>
                    {sortBy === 'featured' && 'Mais Procurados / Destaques'}
                    {sortBy === 'price-asc' && 'Menor Preço'}
                    {sortBy === 'price-desc' && 'Maior Preço'}
                    {sortBy === 'newest' && 'Lançamentos Recentes'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
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
                        className="absolute right-0 top-full mt-2 w-64 bg-stone-900 border border-brand-border-dark shadow-xl rounded-2xl p-2 z-50 space-y-1"
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
                              className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-stone-800 text-brand-primary font-bold shadow-xs'
                                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
                              }`}
                            >
                              <span>{item.label}</span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-brand-primary" />
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
              <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-brand-border p-8">
                <AlertCircle className="w-10 h-10 text-stone-400 mx-auto" />
                <h3 className="font-serif-luxury text-lg font-medium text-stone-800">
                  Nenhuma peça encontrada
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Não encontramos produtos para os filtros ou busca aplicados. Tente selecionar outra categoria ou limpar a busca.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedTag('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Ver Todas as Peças
                </button>
              </div>
            ) : (
              <div className={activeStoreType === 'natural' 
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3" 
                : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"}>
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    settings={settings}
                    onOpenDetails={handleOpenProductDetails}
                    onQuickAddToCart={handleQuickAddToCart}
                    onShareProduct={handleShareProduct}
                    isShopee={activeStoreType === 'natural'}
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
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={() => handleToggleView('admin')}
        onOpenLanding={() => setActiveView('landing')}
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
      />

      {/* Admin Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        adminUser={adminUser}
        settings={settings}
      />

      {/* Product Details Modal */}
      <ProductModal
        product={selectedProduct}
        settings={settings}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddToCart={(prod, sz, col, qty) => {
          handleAddToCart(prod, sz, col, qty);
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
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
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
        onUpdateClientSlug={async (newSlug) => {
          if (currentClient) {
            const updatedClient = { ...currentClient, storeSlug: newSlug };
            setCurrentClient(updatedClient);
            localStorage.setItem('store_current_client', JSON.stringify(updatedClient));
            await saveClient(updatedClient);
          }
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

      {/* Floating Sticky Bottom Action Bar (Fixed on Screen when Items Selected) */}
      <AnimatePresence>
        {cart.length > 0 && activeView === 'store' && !isCartOpen && !selectedProduct && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 z-40 max-w-lg mx-auto sm:mx-0 bg-stone-900/95 backdrop-blur-md text-white p-3 sm:p-3.5 rounded-2xl shadow-2xl border border-stone-700/80 flex items-center justify-between gap-2.5"
            id="floating-fixed-cart-bar"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="relative p-2 bg-brand-primary/20 text-brand-primary rounded-xl border border-brand-primary/30 shrink-0">
                <ShoppingBag className="w-5 h-5 text-brand-primary" />
                <span className="absolute -top-1 -right-1 bg-[#9C3A3A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)} {cart.reduce((acc, item) => acc + item.quantity, 0) === 1 ? 'peça na sacola' : 'peças na sacola'}
                </span>
                <span className="text-[11px] text-stone-300 font-mono">
                  {formatCurrency(
                    cart.reduce((acc, item) => {
                      const p = item.product.isOnSale && item.product.promotionalPrice
                        ? item.product.promotionalPrice
                        : item.product.price;
                      return acc + p * item.quantity;
                    }, 0)
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-2.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-medium text-xs transition-colors hidden sm:flex items-center space-x-1 cursor-pointer"
                id="btn-floating-keep-browsing"
                title="Continuar Comprando"
              >
                <span>+ Ver Catálogo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                id="btn-floating-open-cart"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
                <span>Ver Sacola & Finalizar</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
}
