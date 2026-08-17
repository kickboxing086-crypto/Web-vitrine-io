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
import { SlidersHorizontal, AlertCircle, Tag as TagIcon } from 'lucide-react';

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
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(true);

  // View state: 'store' (Vitrine do Cliente) | 'admin' (Painel do Dono) | 'super_admin' (Painel SaaS)
  const [activeView, setActiveView] = useState<'store' | 'admin' | 'super_admin'>('store');
  const [currentClient, setCurrentClient] = useState<any>(() => {
    const saved = localStorage.getItem('store_current_client');
    return saved ? JSON.parse(saved) : null;
  });

  const handleToggleView = (view: 'store' | 'admin' | 'super_admin') => {
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
      setCurrentClient(client);
      localStorage.setItem('store_current_client', JSON.stringify(client));
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

  // Interactive Modals / Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isStoreSetupOpen, setIsStoreSetupOpen] = useState(false);
  const [isFirstOnboarding, setIsFirstOnboarding] = useState(false);

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

  // Dynamic document title and meta tags update
  useEffect(() => {
    if (settings.storeName) {
      document.title = `${settings.storeName} | Vitrine Virtual`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', settings.description || `Vitrine virtual e catálogo exclusivo da ${settings.storeName}.`);
      }
    }
  }, [settings.storeName, settings.description]);

  // Check first access and URL params for admin login and tenant stores
  useEffect(() => {
    if (!settings.isFirstSetupDone && !currentClient) {
      setIsFirstOnboarding(true);
      setIsStoreSetupOpen(true);
    }

    const getStoreUsernameFromUrl = () => {
      const hostname = window.location.hostname;
      
      // List of base domains. Add custom domains here later (e.g., 'seusite.com.br')
      const baseDomains = ['web-vitrine-site.vercel.app', 'localhost'];
      
      for (const base of baseDomains) {
        if (hostname.endsWith(`.${base}`)) {
          const subdomain = hostname.replace(`.${base}`, '');
          if (subdomain && subdomain !== 'www') {
            return subdomain;
          }
        }
      }
      
      const params = new URLSearchParams(window.location.search);
      return params.get('loja') || params.get('u');
    };
    
    // Check for client store username (from subdomain or param)
    const lojaParam = getStoreUsernameFromUrl();
    if (lojaParam) {
      import('./lib/firestoreService').then(async (module) => {
        const client = await module.getClientByUsername(lojaParam);
        if (client) {
          setCurrentClient(client);
          localStorage.setItem('store_current_client', JSON.stringify(client));
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

  // Real-time Cloud Firestore synchronization
  useEffect(() => {
    // Seed initial data if database collections are empty
    seedInitialDataIfEmpty().then(() => {
      setIsCloudSyncing(false);
    });

    const unsubSettings = subscribeToSettings((data) => {
      setSettings(data);
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
      const updatedOrder: Order = { ...targetOrder, status };
      const updated = orders.map((o) => (o.id === orderId ? updatedOrder : o));
      setOrders(updated);
      await saveOrderToDb(updatedOrder, currentClient?.id);
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
      itemName: 'Todos os produtos, pedidos e lançamentos serão restaurados para o padrão no banco de dados em nuvem.',
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

  const categoryNames = categories.map((c) => c.name);
  const tagNames = tags.map((t) => t.name);


  const activeStoreType = currentClient?.storeType || settings.storeType || 'clothing';

  if (activeView === 'super_admin') {
    return <SuperAdminPanel onLogout={handleLogout} />;
  }

  return (
    <div className={`min-h-screen bg-brand-bg text-stone-900 flex flex-col selection:bg-brand-border ${activeStoreType === 'natural' ? 'theme-natural' : ''}`}>
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
              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-xs font-semibold text-stone-600">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-brand-border-dark rounded-xl px-3 py-1.5 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark shadow-2xs cursor-pointer"
                  id="select-sort-vitrine"
                >
                  <option value="featured">Mais Procurados / Destaques</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                  <option value="newest">Lançamentos Recentes</option>
                </select>
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
          />
        )}
      </main>

      {/* Footer */}
      <Footer settings={settings} onOpenAdmin={() => handleToggleView('admin')} />

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
          setIsProductModalOpen(false);
          setIsCartOpen(true);
        }}
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
    </div>
  );
}
