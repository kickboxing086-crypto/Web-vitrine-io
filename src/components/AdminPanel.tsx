import React, { useState, useRef } from 'react';
import {
  StoreSettings,
  Product,
  Order,
  Coupon,
  FinancialRecord,
  TagCategory,
  OrderStatus,
} from '../types';
import {
  formatCurrency,
  formatDate,
  formatPhone,
  cleanPhoneForWhatsapp,
  generateWhatsappStoreShareMessage,
} from '../lib/formatters';
import { fileToBase64, filesToBase64List } from '../lib/imageUtils';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  TicketPercent,
  Settings,
  Plus,
  Edit2,
  Edit3,
  Save,
  Trash2,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  Share2,
  Sparkles,
  ExternalLink,
  MessageCircle,
  X,
  AlertTriangle,
  RotateCcw,
  Search,
  Upload,
  Image as ImageIcon,
  Grid,
  Layers,
  ArrowLeft,
  ArrowRight,
  Tag as TagIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

interface AdminPanelProps {
  currentClient?: any;
  settings: StoreSettings;
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  finance: FinancialRecord[];
  categories: TagCategory[];
  tags: TagCategory[];
  onSaveProduct: (product: Product) => void;
  onRequestDeleteProduct: (product: Product) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onRequestDeleteOrder: (order: Order) => void;
  onSaveCoupon: (coupon: Coupon) => void;
  onRequestDeleteCoupon: (coupon: Coupon) => void;
  onAddFinanceRecord: (record: Omit<FinancialRecord, 'id'>) => void;
  onRequestDeleteFinance: (record: FinancialRecord) => void;
  onAddTagCategory: (item: TagCategory) => void;
  onRequestDeleteTagCategory: (item: TagCategory) => void;
  onOpenSettingsModal: () => void;
  onResetData: () => void;
  onLogout?: () => void;
  onViewStore?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentClient,
  settings,
  products,
  orders,
  coupons,
  finance,
  categories,
  tags,
  onSaveProduct,
  onRequestDeleteProduct,
  onUpdateOrderStatus,
  onRequestDeleteOrder,
  onSaveCoupon,
  onRequestDeleteCoupon,
  onAddFinanceRecord,
  onRequestDeleteFinance,
  onAddTagCategory,
  onRequestDeleteTagCategory,
  onOpenSettingsModal,
  onResetData,
  onLogout,
  onViewStore,
}) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'orders' | 'tags' | 'coupons' | 'settings'
  >('dashboard');

  // Product Search & Tag Organization states
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productTagFilter, setProductTagFilter] = useState('all');
  const [productViewMode, setProductViewMode] = useState<'grouped' | 'grid'>('grouped');

  // Product Form Modal state
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#111111');
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [newImageInput, setNewImageInput] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Coupon Form state
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState<number>(10);
  const [couponMinOrder, setCouponMinOrder] = useState<number>(0);
  const [couponMaxUses, setCouponMaxUses] = useState<number>(0);

  // Finance Manual Entry state
  const [isAddingFinance, setIsAddingFinance] = useState(false);
  const [finDesc, setFinDesc] = useState('');
  const [finAmount, setFinAmount] = useState<number>(0);
  const [finType, setFinType] = useState<'income' | 'expense'>('income');
  const [finCategory, setFinCategory] = useState('Vendas Vitrine');

  // Tag / Category Form state
  const [newTagName, setNewTagName] = useState('');
  const [newTagType, setNewTagType] = useState<'category' | 'tag'>('category');
  const [newTagColor, setNewTagColor] = useState('#B58D5F');

  // Tag / Category Inline Edit state
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [editingTagColor, setEditingTagColor] = useState('#B58D5F');

  // Invite link copied feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Financial Calculations
  const totalIncome = finance
    .filter((f) => f.type === 'income')
    .reduce((acc, f) => acc + f.amount, 0);

  const totalExpense = finance
    .filter((f) => f.type === 'expense')
    .reduce((acc, f) => acc + f.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const totalOrdersAmount = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.finalTotal, 0);

  const averageTicket =
    orders.length > 0 ? totalOrdersAmount / orders.filter((o) => o.status !== 'cancelled').length : 0;

  // Chart Data: Category Breakdown
  const categorySalesData = categories.map((cat) => {
    const count = products.filter((p) => p.category === cat.name).length;
    const views = products
      .filter((p) => p.category === cat.name)
      .reduce((acc, p) => acc + (p.viewsCount || 0), 0);
    return {
      name: cat.name,
      produtos: count,
      visualizacoes: views,
    };
  });

  const COLORS = ['#B58D5F', '#2C3E50', '#9C3A3A', '#735D78', '#556B2F', '#D4A373'];

  // Handle Product Save
  const handleOpenProductCreate = () => {
    setProductForm({
      id: 'prod-' + Date.now(),
      name: '',
      description: '',
      category: categories[0]?.name || 'Vestidos & Macacões',
      price: 199.9,
      promotionalPrice: undefined,
      isOnSale: false,
      isFeatured: true,
      isNew: true,
      isAvailable: true,
      images: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
      ],
      sizes: ['P', 'M', 'G'],
      colors: [{ name: 'Preto', hex: '#111111' }, { name: 'Off-White', hex: '#F7F5F0' }],
      stock: 10,
      tags: ['Lançamento'],
      fabricDetails: 'Linho misto com elastano',
      careInstructions: 'Lavagem suave à mão',
      viewsCount: 0,
      ordersCount: 0,
      createdAt: new Date().toISOString(),
    });
    setIsEditingProduct(true);
  };

  const handleOpenProductEdit = (product: Product) => {
    setProductForm({ ...product });
    setIsEditingProduct(true);
  };

  const handleToggleProductAvailability = async (product: Product) => {
    const updatedProduct = {
      ...product,
      isAvailable: product.isAvailable === false ? true : false,
    };
    onSaveProduct(updatedProduct);
  };

  const handleProductImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImages = productForm.images || [];
    if (currentImages.length >= 10) {
      alert('Esta peça já atingiu o limite máximo de 10 fotos.');
      return;
    }

    try {
      setIsUploadingImages(true);
      const base64List = await filesToBase64List(files, 10, currentImages.length);
      setProductForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...base64List].slice(0, 10),
      }));
    } catch (err) {
      console.error('Erro ao converter fotos para base64:', err);
      alert('Não foi possível processar algumas imagens. Tente novamente com imagens em formato JPG ou PNG.');
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMoveProductImage = (fromIdx: number, toIdx: number) => {
    const images = [...(productForm.images || [])];
    if (toIdx < 0 || toIdx >= images.length) return;
    const item = images.splice(fromIdx, 1)[0];
    images.splice(toIdx, 0, item);
    setProductForm({ ...productForm, images });
  };

  const handleRemoveProductImage = (idxToRemove: number) => {
    setProductForm({
      ...productForm,
      images: productForm.images?.filter((_, i) => i !== idxToRemove),
    });
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;
    onSaveProduct(productForm as Product);
    setIsEditingProduct(false);
  };

  // Dynamic list of unique tags from both registered tags and products
  const allAvailableTags = Array.from(
    new Set([
      ...tags.map((t) => t.name),
      ...products.flatMap((p) => p.tags || []),
    ])
  ).filter(Boolean);

  // Filter products by search query (Lupa) and tag filter
  const filteredProducts = products.filter((p) => {
    const query = productSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(query))) ||
      (p.fabricDetails && p.fabricDetails.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.sizes && p.sizes.some((s) => s.toLowerCase().includes(query))) ||
      p.price.toString().includes(query) ||
      (p.promotionalPrice && p.promotionalPrice.toString().includes(query));

    const matchesTag =
      productTagFilter === 'all' ||
      (p.tags && p.tags.includes(productTagFilter));

    return matchesSearch && matchesTag;
  });

  // Group products by tag for the "Agrupado por Tags" view
  const tagGroups = allAvailableTags
    .map((tagName) => {
      const tagProducts = filteredProducts.filter((p) => p.tags && p.tags.includes(tagName));
      const tagMeta = tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
      return {
        tag: tagName,
        color: tagMeta?.color || '#B58D5F',
        products: tagProducts,
      };
    })
    .filter((group) => group.products.length > 0);

  // Untagged or pieces without matching group
  const untaggedProducts = filteredProducts.filter(
    (p) => !p.tags || p.tags.length === 0
  );

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || couponValue <= 0) return;
    onSaveCoupon({
      id: 'coup-' + Date.now(),
      code: couponCode.trim().toUpperCase(),
      discountType: couponType,
      discountValue: couponValue,
      minOrderValue: couponMinOrder > 0 ? couponMinOrder : undefined,
      maxUses: couponMaxUses > 0 ? couponMaxUses : undefined,
      isActive: true,
      usageCount: 0,
    });
    setCouponCode('');
    setCouponValue(10);
    setCouponMinOrder(0);
    setCouponMaxUses(0);
    setIsAddingCoupon(false);
  };

  const handleCreateFinanceRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finDesc.trim() || finAmount <= 0) return;
    onAddFinanceRecord({
      type: finType,
      description: finDesc.trim(),
      amount: finAmount,
      category: finCategory,
      date: new Date().toISOString(),
    });
    setFinDesc('');
    setFinAmount(0);
    setIsAddingFinance(false);
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    onAddTagCategory({
      id: `${newTagType}-${Date.now()}`,
      name: newTagName.trim(),
      slug: newTagName.toLowerCase().replace(/\s+/g, '-'),
      type: newTagType,
      color: newTagColor,
    });
    setNewTagName('');
  };

  const startEditTagCategory = (item: TagCategory) => {
    setEditingTagId(item.id);
    setEditingTagName(item.name);
    setEditingTagColor(item.color || '#B58D5F');
  };

  const handleSaveEditTagCategory = (item: TagCategory) => {
    if (!editingTagName.trim()) return;
    onAddTagCategory({
      ...item,
      name: editingTagName.trim(),
      slug: editingTagName.toLowerCase().replace(/\s+/g, '-'),
      color: editingTagColor,
    });
    setEditingTagId(null);
  };

  const handleCopyInvite = () => {
    let inviteUrl = '';
    const activeSlug = currentClient?.storeSlug || currentClient?.username;
    
    if (activeSlug) {
      // Prioritize the standard reliable query param URL that works 100% on Vercel without wildcard DNS
      inviteUrl = `${window.location.origin}/?loja=${activeSlug}`;
    } else {
      inviteUrl = `${window.location.origin}?invite=${settings.inviteCode || 'VIP'}`;
    }

    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-brand-border">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-brand-secondary text-brand-primary rounded-2xl shadow-sm">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary-darker">
                Painel de Gestão da Boutique
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Banco em Nuvem Ativo
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900">
              Controle Geral: {settings.storeName}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyInvite}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-brand-bg-alt text-stone-800 border border-brand-border-dark rounded-xl text-xs font-semibold shadow-2xs transition-colors"
            id="btn-admin-copy-invite"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Link Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-brand-primary-darker" />
                <span>Link da Loja (Clientes)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettingsModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            id="btn-admin-open-settings"
          >
            <Settings className="w-4 h-4 text-brand-primary" />
            <span>Dados da Loja</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const msg = generateWhatsappStoreShareMessage(settings);
              window.open(`https://wa.me/?text=${msg}`, '_blank');
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            id="btn-share-store-whatsapp"
            title="Enviar Link e Abertura Bonita da Loja no WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white text-white" />
            <span>Divulgar Loja (WhatsApp)</span>
          </button>

          {onViewStore && (
            <button
              type="button"
              onClick={onViewStore}
              className="flex items-center space-x-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Acessar a Vitrine"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Vitrine</span>
            </button>
          )}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center space-x-1.5 px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              id="btn-admin-logout"
              title="Sair / Bloquear Painel"
            >
              <span>Sair</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto py-4 no-scrollbar border-b border-brand-border/70 mb-6">
        {[
          { id: 'dashboard', label: 'Controlador Financeiro & Dashboard', icon: DollarSign },
          { id: 'products', label: `Catálogo de Peças (${products.length})`, icon: Package },
          { id: 'orders', label: `Pedidos Recebidos (${orders.length})`, icon: ShoppingBag },
          { id: 'tags', label: 'Tags & Categorias', icon: Tags },
          { id: 'coupons', label: `Cupons & Ofertas (${coupons.length})`, icon: TicketPercent },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white/80 hover:bg-white text-stone-700 border border-brand-border'
              }`}
              id={`tab-${tab.id}`}
            >
              <IconComp
                className={`w-4 h-4 ${isActive ? 'text-brand-primary' : 'text-stone-500'}`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: DASHBOARD & CONTROLADOR FINANCEIRO ================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-brand-border shadow-xs">
              <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Faturamento Total</span>
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-serif-luxury font-bold text-stone-900">
                {formatCurrency(totalIncome)}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">
                Entradas de vendas & pedidos
              </span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-brand-border shadow-xs">
              <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Despesas / Custos</span>
                <div className="p-2 bg-red-100 text-red-800 rounded-xl">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-serif-luxury font-bold text-stone-900">
                {formatCurrency(totalExpense)}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">
                Tecidos, embalagens & fretes
              </span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-brand-border shadow-xs">
              <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Lucro Líquido</span>
                <div className="p-2 bg-brand-bg text-brand-primary-dark rounded-xl border border-brand-border">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div
                className={`text-2xl font-serif-luxury font-bold ${
                  netBalance >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {formatCurrency(netBalance)}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">
                Margem de contribuição da loja
              </span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-brand-border shadow-xs">
              <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Ticket Médio</span>
                <div className="p-2 bg-stone-100 text-stone-700 rounded-xl">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-serif-luxury font-bold text-stone-900">
                {formatCurrency(averageTicket || 0)}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">
                Por pedido realizado na vitrine
              </span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Performance Bar Chart */}
            <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-brand-border shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                    Desempenho por Categoria
                  </h3>
                  <p className="text-xs text-stone-500">
                    Volume de peças cadastradas e interesse dos clientes
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e9e1" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#78716c' }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FAF8F5',
                        borderRadius: '12px',
                        border: '1px solid #D5C7B7',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="visualizacoes" fill="#B58D5F" radius={[6, 6, 0, 0]} name="Interesse / Visualizações" />
                    <Bar dataKey="produtos" fill="#211E1B" radius={[6, 6, 0, 0]} name="Qtd. Peças" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Summary */}
            <div className="p-6 bg-white rounded-2xl border border-brand-border shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-stone-900 mb-1">
                  Resumo de Atendimento
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Modalidade ativa:{' '}
                  <strong className="text-stone-900">
                    {settings.deliveryMode === 'both'
                      ? 'Entrega & Retirada'
                      : settings.deliveryMode === 'pickup'
                      ? 'Apenas Retirada na Loja'
                      : 'Apenas Entrega'}
                  </strong>
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-brand-bg rounded-xl border border-brand-bg-alt flex items-center justify-between">
                    <span className="text-stone-600">Total de Pedidos Gerados:</span>
                    <strong className="text-stone-900 font-bold">{orders.length} pedidos</strong>
                  </div>
                  <div className="p-3 bg-brand-bg rounded-xl border border-brand-bg-alt flex items-center justify-between">
                    <span className="text-stone-600">Peças no Catálogo:</span>
                    <strong className="text-stone-900 font-bold">{products.length} modelos</strong>
                  </div>
                  <div className="p-3 bg-brand-bg rounded-xl border border-brand-bg-alt flex items-center justify-between">
                    <span className="text-stone-600">WhatsApp de Vendas:</span>
                    <strong className="text-stone-900 font-bold">
                      {formatPhone(settings.phoneWhatsapp)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-stone-100 flex gap-2">
                <button
                  type="button"
                  onClick={onOpenSettingsModal}
                  className="w-full py-2.5 bg-brand-bg hover:bg-brand-bg-alt text-brand-primary-darker border border-brand-border rounded-xl text-xs font-bold transition-colors"
                >
                  Editar Dados da Loja
                </button>
              </div>
            </div>
          </div>

          {/* Cash Flow / Transactions Table */}
          <div className="p-6 bg-white rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                  Lançamentos Financeiros & Fluxo de Caixa
                </h3>
                <p className="text-xs text-stone-500">
                  Registro de entradas automáticas por pedidos e despesas operacionais
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingFinance(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start cursor-pointer"
                id="btn-add-finance-record"
              >
                <Plus className="w-3.5 h-3.5 text-brand-primary" />
                <span>Adicionar Lançamento</span>
              </button>
            </div>

            {/* Quick Add Finance Form */}
            {isAddingFinance && (
              <form
                onSubmit={handleCreateFinanceRecord}
                className="p-4 bg-brand-bg rounded-2xl border border-brand-border space-y-3 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                  <span>Novo Registro Financeiro</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingFinance(false)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Descrição (ex: Venda Balcão, Tecidos, Embalagens...)"
                      value={finDesc}
                      onChange={(e) => setFinDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-brand-border-dark rounded-xl text-xs text-stone-900 placeholder:text-stone-400"
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="Valor (R$)"
                      value={finAmount || ''}
                      onChange={(e) => setFinAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-brand-border-dark rounded-xl text-xs text-stone-900 placeholder:text-stone-400"
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={finType}
                      onChange={(e) => setFinType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-brand-border-dark rounded-xl text-xs text-stone-900"
                    >
                      <option value="income">Entrada (+)</option>
                      <option value="expense">Saída (-)</option>
                    </select>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
                    >
                      Confirmar Alterações
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Data</th>
                    <th className="py-3 px-3">Descrição</th>
                    <th className="py-3 px-3">Categoria</th>
                    <th className="py-3 px-3">Tipo</th>
                    <th className="py-3 px-3 text-right">Valor</th>
                    <th className="py-3 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {finance.map((rec) => (
                    <tr key={rec.id} className="hover:bg-brand-bg/80 transition-colors">
                      <td className="py-3 px-3 text-stone-500">{formatDate(rec.date)}</td>
                      <td className="py-3 px-3 font-semibold text-stone-900">{rec.description}</td>
                      <td className="py-3 px-3 text-stone-600">{rec.category}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            rec.type === 'income'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {rec.type === 'income' ? 'Entrada' : 'Despesa'}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          rec.type === 'income' ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {rec.type === 'income' ? '+' : '-'} {formatCurrency(rec.amount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onRequestDeleteFinance(rec)}
                          className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                          title="Excluir Lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CATÁLOGO & PRODUTOS ================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Header & New Product CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-stone-900">
                Gerenciamento de Peças do Catálogo
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Organize roupas por Tags, configure fotos em Base64 (até 10 fotos por peça), tamanhos e promoções.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenProductCreate}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-brand-secondary hover:bg-stone-800 text-brand-primary rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer self-start sm:self-auto"
              id="btn-add-product"
            >
              <Plus className="w-4 h-4 text-brand-primary" />
              <span>Cadastrar Nova Peça</span>
            </button>
          </div>

          {/* Search Bar (Lupa) & View Controls */}
          <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Lupa / Search Input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Pesquisar por nome, tag (#Lançamento), categoria, tecido, tamanho..."
                  className="w-full pl-10 pr-9 py-2.5 bg-brand-bg border border-brand-border-dark rounded-xl text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary-dark/30 focus:border-brand-primary-dark transition-all"
                  id="input-search-products-admin"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                {productSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setProductSearchQuery('')}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 p-0.5"
                    title="Limpar busca"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* View Mode Toggle (Agrupado por Tags vs Grade Geral) */}
              <div className="flex items-center bg-brand-bg p-1 border border-brand-border-dark rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setProductViewMode('grouped')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    productViewMode === 'grouped'
                      ? 'bg-brand-secondary text-brand-primary shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  id="btn-view-grouped-tags"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Separado por Tags</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProductViewMode('grid')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    productViewMode === 'grid'
                      ? 'bg-brand-secondary text-brand-primary shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  id="btn-view-grid"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Grade Geral</span>
                </button>
              </div>
            </div>

            {/* Quick Tag Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1 flex items-center gap-1 flex-shrink-0">
                <TagIcon className="w-3 h-3 text-brand-primary-darker" />
                Filtrar Tag:
              </span>

              <button
                type="button"
                onClick={() => setProductTagFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex-shrink-0 flex items-center space-x-1.5 ${
                  productTagFilter === 'all'
                    ? 'bg-brand-secondary text-white'
                    : 'bg-brand-bg text-stone-600 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                <span>Todas as Peças</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {products.length}
                </span>
              </button>

              {allAvailableTags.map((tagName) => {
                const count = products.filter((p) => p.tags && p.tags.includes(tagName)).length;
                const isSelected = productTagFilter === tagName;
                return (
                  <button
                    key={tagName}
                    type="button"
                    onClick={() => setProductTagFilter(tagName)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex-shrink-0 flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-brand-primary-darker text-white shadow-xs'
                        : 'bg-brand-bg text-stone-700 hover:bg-stone-200 border border-brand-border-dark'
                    }`}
                  >
                    <span>#{tagName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-900/10">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Filter / Search feedback bar */}
          {(productSearchQuery || productTagFilter !== 'all') && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAF4ED] border border-brand-border rounded-xl text-xs text-stone-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900">
                  {filteredProducts.length} peça{filteredProducts.length === 1 ? '' : 's'} encontrada{filteredProducts.length === 1 ? '' : 's'}
                </span>
                {productSearchQuery && (
                  <span className="text-stone-600">
                    para a busca: <strong className="text-stone-900">"{productSearchQuery}"</strong>
                  </span>
                )}
                {productTagFilter !== 'all' && (
                  <span className="text-stone-600">
                    na tag: <strong className="text-stone-900">#{productTagFilter}</strong>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setProductSearchQuery('');
                  setProductTagFilter('all');
                }}
                className="text-stone-700 hover:text-stone-900 font-bold underline text-xs"
              >
                Limpar filtros
              </button>
            </div>
          )}

          {/* No products found state */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-brand-border p-8">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-stone-900 mb-1">
                Nenhuma peça encontrada
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
                Não encontramos produtos com os termos ou tags selecionados. Tente buscar com outras palavras.
              </p>
              <button
                type="button"
                onClick={() => {
                  setProductSearchQuery('');
                  setProductTagFilter('all');
                }}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
              >
                Ver Todas as Peças
              </button>
            </div>
          )}

          {/* VIEW MODE 1: SEPARADO POR TAGS */}
          {productViewMode === 'grouped' && filteredProducts.length > 0 && (
            <div className="space-y-8">
              {tagGroups.map((group) => (
                <div key={group.tag} className="space-y-3">
                  {/* Tag Group Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-brand-border">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                        #{group.tag}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-brand-bg border border-brand-border-dark text-stone-700 rounded-full">
                        {group.products.length} {group.products.length === 1 ? 'peça' : 'peças'}
                      </span>
                    </div>
                  </div>

                  {/* Tag Products Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.products.map((p) => {
                      const currentPrice = p.isOnSale && p.promotionalPrice ? p.promotionalPrice : p.price;
                      return (
                        <div
                          key={`${group.tag}-${p.id}`}
                          className="bg-white rounded-2xl border border-brand-border overflow-hidden p-4 flex space-x-4 shadow-2xs hover:shadow-md transition-shadow"
                        >
                          <div className="relative w-24 h-32 flex-shrink-0">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-full h-full rounded-xl object-cover object-top bg-stone-100"
                            />
                            {p.images.length > 1 && (
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold rounded-md flex items-center gap-0.5">
                                <ImageIcon className="w-2.5 h-2.5" />
                                {p.images.length}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary-darker truncate">
                                  {p.category}
                                </span>
                                {p.isOnSale && (
                                  <span className="text-[9px] font-bold bg-[#9C3A3A] text-white px-1.5 py-0.5 rounded">
                                    PROMO
                                  </span>
                                )}
                              </div>

                              <h4 className="font-serif-luxury text-sm font-bold text-stone-900 truncate mt-0.5">
                                {p.name}
                              </h4>

                              <div className="mt-1 flex items-baseline space-x-1.5">
                                <span className="text-sm font-bold text-stone-900">
                                  {formatCurrency(currentPrice)}
                                </span>
                                {p.isOnSale && p.promotionalPrice && (
                                  <span className="text-xs text-stone-400 line-through">
                                    {formatCurrency(p.price)}
                                  </span>
                                )}
                              </div>

                              {/* Tags preview */}
                              <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                                {p.tags?.map((t) => (
                                  <span
                                    key={t}
                                    className="px-1.5 py-0.2 bg-[#F4ECE1] text-[#7A5734] text-[9px] font-bold rounded"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Actions & Stock */}
                            <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-2">
                              <span className="text-[10px] text-stone-500 font-medium">
                                Estoque: <strong>{p.stock} un.</strong>
                              </span>

                              <div className="flex items-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductAvailability(p)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                    p.isAvailable !== false
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                                  }`}
                                  title={p.isAvailable !== false ? 'Peça na Vitrine (Clique para ocultar)' : 'Peça Oculta (Clique para exibir)'}
                                >
                                  {p.isAvailable !== false ? 'Na Vitrine' : 'Oculto'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenProductEdit(p)}
                                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                  title="Editar Peça"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onRequestDeleteProduct(p)}
                                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Excluir Peça (Confirmação 2 etapas)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Untagged pieces section if any exist */}
              {untaggedProducts.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-brand-border">
                  <div className="flex items-center space-x-2.5 pb-2">
                    <span className="w-3 h-3 rounded-full bg-stone-400" />
                    <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                      Peças Gerais / Sem Tag
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-brand-bg border border-brand-border-dark text-stone-700 rounded-full">
                      {untaggedProducts.length} peças
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {untaggedProducts.map((p) => {
                      const currentPrice = p.isOnSale && p.promotionalPrice ? p.promotionalPrice : p.price;
                      return (
                        <div
                          key={`untagged-${p.id}`}
                          className="bg-white rounded-2xl border border-brand-border overflow-hidden p-4 flex space-x-4 shadow-2xs hover:shadow-md transition-shadow"
                        >
                          <div className="relative w-24 h-32 flex-shrink-0">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-full h-full rounded-xl object-cover object-top bg-stone-100"
                            />
                            {p.images.length > 1 && (
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold rounded-md flex items-center gap-0.5">
                                <ImageIcon className="w-2.5 h-2.5" />
                                {p.images.length}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary-darker">
                                  {p.category}
                                </span>
                                {p.isOnSale && (
                                  <span className="text-[9px] font-bold bg-[#9C3A3A] text-white px-1.5 py-0.5 rounded">
                                    PROMO
                                  </span>
                                )}
                              </div>

                              <h4 className="font-serif-luxury text-sm font-bold text-stone-900 truncate mt-0.5">
                                {p.name}
                              </h4>

                              <div className="mt-1 flex items-baseline space-x-1.5">
                                <span className="text-sm font-bold text-stone-900">
                                  {formatCurrency(currentPrice)}
                                </span>
                                {p.isOnSale && p.promotionalPrice && (
                                  <span className="text-xs text-stone-400 line-through">
                                    {formatCurrency(p.price)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-2">
                              <span className="text-[10px] text-stone-500 font-medium">
                                Estoque: <strong>{p.stock} un.</strong>
                              </span>

                              <div className="flex items-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductAvailability(p)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                    p.isAvailable !== false
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                                  }`}
                                  title={p.isAvailable !== false ? 'Peça na Vitrine (Clique para ocultar)' : 'Peça Oculta (Clique para exibir)'}
                                >
                                  {p.isAvailable !== false ? 'Na Vitrine' : 'Oculto'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenProductEdit(p)}
                                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                  title="Editar Peça"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onRequestDeleteProduct(p)}
                                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Excluir Peça"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: GRADE GERAL */}
          {productViewMode === 'grid' && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p) => {
                const currentPrice = p.isOnSale && p.promotionalPrice ? p.promotionalPrice : p.price;
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-brand-border overflow-hidden p-4 flex space-x-4 shadow-2xs hover:shadow-md transition-shadow"
                  >
                    <div className="relative w-24 h-32 flex-shrink-0">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full rounded-xl object-cover object-top bg-stone-100"
                      />
                      {p.images.length > 1 && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold rounded-md flex items-center gap-0.5">
                          <ImageIcon className="w-2.5 h-2.5" />
                          {p.images.length}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary-darker">
                            {p.category}
                          </span>
                          {p.isOnSale && (
                            <span className="text-[9px] font-bold bg-[#9C3A3A] text-white px-1.5 py-0.5 rounded">
                              PROMO
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif-luxury text-sm font-bold text-stone-900 truncate mt-0.5">
                          {p.name}
                        </h4>

                        <div className="mt-1 flex items-baseline space-x-1.5">
                          <span className="text-sm font-bold text-stone-900">
                            {formatCurrency(currentPrice)}
                          </span>
                          {p.isOnSale && p.promotionalPrice && (
                            <span className="text-xs text-stone-400 line-through">
                              {formatCurrency(p.price)}
                            </span>
                          )}
                        </div>

                        {/* Tags preview */}
                        <div className="mt-2 flex items-center gap-1 flex-wrap">
                          {p.tags?.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.2 bg-[#F4ECE1] text-[#7A5734] text-[9px] font-bold rounded"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-2">
                        <span className="text-[10px] text-stone-500 font-medium">
                          Estoque: <strong>{p.stock} un.</strong>
                        </span>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleOpenProductEdit(p)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar Peça"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRequestDeleteProduct(p)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir Peça (Confirmação 2 etapas)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Product Edit / Create Modal with Base64 Photos & Max 10 Photos */}
      {isEditingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-brand-bg rounded-3xl border border-[#E3D7CA] shadow-2xl p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-6">
              <div>
                <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
                  {productForm.id?.startsWith('prod-') && !products.find((p) => p.id === productForm.id)
                    ? 'Cadastrar Nova Peça'
                    : 'Editar Peça'}
                </h3>
                <p className="text-xs text-stone-500">
                  Adicione até 10 fotos em Base64, organize tamanhos, tags e valores
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProduct(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome da Peça *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name || ''}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ex: Blazer Alfaiataria Italiano"
                  className="w-full px-3.5 py-2.5 bg-white border border-brand-border-dark rounded-xl text-xs text-stone-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={productForm.category || categories[0]?.name}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-brand-border-dark rounded-xl text-xs text-stone-900 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Estoque (Unidades)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock ?? 10}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-brand-border-dark rounded-xl text-xs text-stone-900 font-medium"
                  />
                </div>
              </div>

              {/* Pricing & Promo */}
              <div className="p-4 bg-white rounded-2xl border border-brand-border space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Preço Original (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productForm.price || ''}
                      onChange={(e) =>
                        setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3.5 py-2.5 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Preço Promocional (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.promotionalPrice || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setProductForm({
                          ...productForm,
                          promotionalPrice: val > 0 ? val : undefined,
                          isOnSale: val > 0,
                        });
                      }}
                      placeholder="Deixe vazio se sem promoção"
                      className="w-full px-3.5 py-2.5 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 font-bold text-red-700"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isAvailable !== false}
                      onChange={(e) =>
                        setProductForm({ ...productForm, isAvailable: e.target.checked })
                      }
                      className="rounded text-stone-900 focus:ring-stone-900"
                    />
                    <span className="font-semibold text-stone-900">Exibir na Vitrine Pública</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isOnSale || false}
                      onChange={(e) =>
                        setProductForm({ ...productForm, isOnSale: e.target.checked })
                      }
                      className="rounded text-stone-900 focus:ring-stone-900"
                    />
                    <span className="font-medium text-stone-800">Em Promoção</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isNew || false}
                      onChange={(e) =>
                        setProductForm({ ...productForm, isNew: e.target.checked })
                      }
                      className="rounded text-stone-900 focus:ring-stone-900"
                    />
                    <span className="font-medium text-stone-800">Marcar como Lançamento</span>
                  </label>
                </div>
              </div>

              {/* Tags Selector & Quick Add */}
              <div className="p-4 bg-white rounded-2xl border border-brand-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide">
                    Tags da Peça (para organização no catálogo)
                  </label>
                  <span className="text-[11px] text-stone-500">
                    Clique nas tags para vincular
                  </span>
                </div>

                {/* Available Tag Pills to toggle */}
                <div className="flex flex-wrap gap-1.5">
                  {allAvailableTags.map((tName) => {
                    const isSelected = productForm.tags?.includes(tName);
                    return (
                      <button
                        key={tName}
                        type="button"
                        onClick={() => {
                          const current = productForm.tags || [];
                          if (isSelected) {
                            setProductForm({
                              ...productForm,
                              tags: current.filter((t) => t !== tName),
                            });
                          } else {
                            setProductForm({
                              ...productForm,
                              tags: [...current, tName],
                            });
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1 ${
                          isSelected
                            ? 'bg-brand-primary-darker text-white shadow-xs'
                            : 'bg-brand-bg text-stone-700 hover:bg-stone-200 border border-brand-border-dark'
                        }`}
                      >
                        <span>#{tName}</span>
                        <span>{isSelected ? '✓' : '+'}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Tag Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Adicionar nova tag personalizada..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-brand-bg border border-brand-border-dark rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newTagInput.trim()) return;
                      const formatted = newTagInput.trim().replace(/^#/, '');
                      const cur = productForm.tags || [];
                      if (!cur.includes(formatted)) {
                        setProductForm({ ...productForm, tags: [...cur, formatted] });
                      }
                      setNewTagInput('');
                    }}
                    className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    + Adicionar Tag
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Descrição / Detalhes
                </label>
                <textarea
                  rows={2}
                  value={productForm.description || ''}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-white border border-brand-border-dark rounded-xl text-xs text-stone-900"
                />
              </div>

              {/* Fabric details & Care */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Composição do Tecido
                  </label>
                  <input
                    type="text"
                    value={productForm.fabricDetails || ''}
                    onChange={(e) =>
                      setProductForm({ ...productForm, fabricDetails: e.target.value })
                    }
                    placeholder="Ex: 100% Linho Puro Europeu"
                    className="w-full px-3.5 py-2 bg-white border border-brand-border-dark rounded-xl text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Cuidados de Lavagem
                  </label>
                  <input
                    type="text"
                    value={productForm.careInstructions || ''}
                    onChange={(e) =>
                      setProductForm({ ...productForm, careInstructions: e.target.value })
                    }
                    placeholder="Ex: Lavagem suave à mão"
                    className="w-full px-3.5 py-2 bg-white border border-brand-border-dark rounded-xl text-xs text-stone-900"
                  />
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tamanhos Disponíveis
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Adicionar tamanho (ex: P, M, 38, 40...)"
                    value={newSizeInput}
                    onChange={(e) => setNewSizeInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-1.5 bg-white border border-brand-border-dark rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newSizeInput.trim()) return;
                      const current = productForm.sizes || [];
                      if (!current.includes(newSizeInput.trim())) {
                        setProductForm({
                          ...productForm,
                          sizes: [...current, newSizeInput.trim()],
                        });
                      }
                      setNewSizeInput('');
                    }}
                    className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    + Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {productForm.sizes?.map((sz) => (
                    <span
                      key={sz}
                      className="inline-flex items-center gap-1 bg-white border border-brand-border-dark text-stone-800 text-xs px-2.5 py-1 rounded-lg"
                    >
                      {sz}
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm({
                            ...productForm,
                            sizes: productForm.sizes?.filter((s) => s !== sz),
                          })
                        }
                        className="text-stone-400 hover:text-red-600 ml-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Photos Management (Base64 + Max 10 Photos) */}
              <div className="p-4 bg-white rounded-2xl border border-brand-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-stone-900 uppercase tracking-wide">
                      Galeria de Fotos da Peça (Até 10 Fotos em Base64)
                    </label>
                    <p className="text-[11px] text-stone-500">
                      A 1ª foto é a capa principal exibida na vitrine. Você pode reordenar as fotos pelas setas.
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5 bg-brand-bg px-2.5 py-1 border border-brand-border-dark rounded-lg text-xs font-bold">
                    <span className={(productForm.images?.length || 0) >= 10 ? 'text-amber-600' : 'text-stone-800'}>
                      {productForm.images?.length || 0} / 10 fotos
                    </span>
                  </div>
                </div>

                {/* File Upload Dropzone / Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleProductImageFiles}
                  className="hidden"
                  id="product-photo-upload-input"
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    disabled={isUploadingImages || (productForm.images?.length || 0) >= 10}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border-2 border-dashed font-semibold text-xs transition-all cursor-pointer ${
                      (productForm.images?.length || 0) >= 10
                        ? 'bg-stone-100 border-stone-300 text-stone-400 cursor-not-allowed'
                        : 'bg-brand-bg hover:bg-[#F4ECE1] border-brand-border-dark text-stone-800'
                    }`}
                  >
                    <Upload className="w-4 h-4 text-brand-primary-darker" />
                    <span>
                      {isUploadingImages
                        ? 'Processando fotos (Base64)...'
                        : (productForm.images?.length || 0) >= 10
                        ? 'Limite máximo de 10 fotos atingido'
                        : 'Selecionar Fotos do Computador / Celular (Base64)'}
                    </span>
                  </button>
                </div>

                {/* Secondary URL input fallback */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Ou cole o link direto da imagem (URL)..."
                    value={newImageInput}
                    onChange={(e) => setNewImageInput(e.target.value)}
                    disabled={(productForm.images?.length || 0) >= 10}
                    className="flex-1 px-3 py-1.5 bg-brand-bg border border-brand-border-dark rounded-xl text-xs disabled:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={(productForm.images?.length || 0) >= 10 || !newImageInput.trim()}
                    onClick={() => {
                      if (!newImageInput.trim()) return;
                      const cur = productForm.images || [];
                      if (cur.length >= 10) return;
                      setProductForm({ ...productForm, images: [...cur, newImageInput.trim()] });
                      setNewImageInput('');
                    }}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 disabled:opacity-40 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    + URL
                  </button>
                </div>

                {/* Photo Grid Preview with Reorder and Delete */}
                {productForm.images && productForm.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2">
                    {productForm.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-[3/4] rounded-xl overflow-hidden border group ${
                          idx === 0
                            ? 'ring-2 ring-brand-primary-darker border-brand-primary-darker'
                            : 'border-brand-border'
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover object-top"
                        />

                        {/* Top badges & remove */}
                        <div className="absolute top-1 inset-x-1 flex items-center justify-between pointer-events-none">
                          {idx === 0 ? (
                            <span className="px-1.5 py-0.5 bg-brand-primary-darker text-white text-[8px] font-bold rounded shadow-xs">
                              ⭐ Capa
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-black/60 text-white text-[8px] font-bold rounded">
                              Foto {idx + 1}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveProductImage(idx)}
                            className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-[9px] pointer-events-auto cursor-pointer shadow-xs"
                            title="Remover foto"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Bottom reorder buttons */}
                        <div className="absolute bottom-1 inset-x-1 flex items-center justify-between gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveProductImage(idx, idx - 1)}
                            className="p-1 bg-black/65 hover:bg-black disabled:opacity-20 text-white rounded-md text-[9px] cursor-pointer"
                            title="Mover para a esquerda"
                          >
                            <ArrowLeft className="w-2.5 h-2.5" />
                          </button>

                          <button
                            type="button"
                            disabled={idx === (productForm.images?.length || 1) - 1}
                            onClick={() => handleMoveProductImage(idx, idx + 1)}
                            className="p-1 bg-black/65 hover:bg-black disabled:opacity-20 text-white rounded-md text-[9px] cursor-pointer"
                            title="Mover para a direita"
                          >
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsEditingProduct(false)}
                  className="px-4 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Confirmar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PEDIDOS RECEBIDOS ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
                Histórico de Pedidos & WhatsApp
              </h2>
              <p className="text-xs text-stone-500">
                Acompanhe pedidos enviados pelos clientes e atualize o status em tempo real
              </p>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sincronização Ativa em Tempo Real</span>
            </div>
          </div>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-brand-border space-y-3">
                <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-serif-luxury text-base font-bold text-stone-800">
                  Nenhum pedido recebido até o momento
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Assim que um cliente montar o carrinho e enviar a mensagem pelo WhatsApp, o pedido aparecerá automaticamente nesta aba com todos os detalhes e endereço.
                </p>
              </div>
            ) : (
              [...orders]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((ord) => {
                  const isDelivery = ord.orderType === 'delivery';
                  return (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs space-y-4"
                    >
                  {/* Top line */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs font-bold text-brand-primary-darker bg-brand-bg px-2.5 py-1 rounded-lg border border-brand-border">
                        #{ord.orderNumber}
                      </span>
                      <span className="font-semibold text-stone-900 text-sm">
                        {ord.customerName}
                      </span>
                      <a
                        href={`https://wa.me/${cleanPhoneForWhatsapp(ord.customerWhatsapp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg text-xs font-bold"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                        <span>{formatPhone(ord.customerWhatsapp)}</span>
                      </a>
                    </div>

                    {/* Status badge & selector */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-stone-500">Status:</span>
                      <select
                        value={ord.status}
                        onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold px-3 py-1 rounded-xl border focus:outline-none ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : ord.status === 'ready'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : ord.status === 'preparing'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : ord.status === 'cancelled'
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-stone-100 text-stone-800 border-stone-300'
                        }`}
                      >
                        <option value="pending">Pendente (Recebido)</option>
                        <option value="preparing">Em Separação</option>
                        <option value="ready">Pronto p/ Retirada / Envio</option>
                        <option value="delivered">Concluído / Entregue</option>
                        <option value="cancelled">Cancelado</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => onRequestDeleteOrder(ord)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg"
                        title="Excluir Pedido (Confirmação 2 etapas)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Items in order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2.5 p-2 bg-brand-bg rounded-xl border border-stone-200 text-xs"
                      >
                        <img
                          src={item.productImage}
                          alt=""
                          className="w-12 h-14 object-cover object-top rounded-lg bg-stone-200 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-stone-900 truncate">{item.productName}</p>
                          <p className="text-stone-500 text-[11px]">
                            Tam: <strong>{item.selectedSize}</strong> | Cor: <strong>{item.selectedColorName}</strong>
                          </p>
                          <p className="font-bold text-stone-900 mt-0.5">
                            {item.quantity}x de {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-2 border-t border-stone-100 gap-2">
                    <div className="text-stone-600">
                      <span>Modalidade: </span>
                      <strong className="text-stone-900">
                        {isDelivery ? '🚀 Entrega no Endereço' : '🏬 Retirada na Loja'}
                      </strong>
                      {isDelivery && ord.deliveryAddress && (
                        <span className="text-stone-500 ml-1">
                          ({ord.deliveryAddress.street}, {ord.deliveryAddress.number} - {ord.deliveryAddress.neighborhood})
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline space-x-2">
                      <span className="text-stone-500">Total do Pedido:</span>
                      <span className="text-base font-bold text-stone-900 font-serif-luxury">
                        {formatCurrency(ord.finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: TAGS & CATEGORIAS ================= */}
      {activeTab === 'tags' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
              Gestão de Tags & Categorias
            </h2>
            <p className="text-xs text-stone-500">
              Crie novas categorias de roupas e tags promocionais/exclusivas para organizar sua vitrine
            </p>
          </div>

          {/* Add Form */}
          <form
            onSubmit={handleCreateTag}
            className="p-5 bg-white rounded-2xl border border-brand-border shadow-xs space-y-3"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
              Criar Nova Categoria ou Tag
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Nome (ex: Seda Italiana, Alfaiataria, Verão...)"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 font-medium"
                />
              </div>

              <div>
                <select
                  value={newTagType}
                  onChange={(e) => setNewTagType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 font-medium"
                >
                  <option value="category">Categoria do Catálogo</option>
                  <option value="tag">Tag de Destaque / Selo</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4 text-brand-primary" />
                <span>Confirmar Alterações</span>
              </button>
            </div>
          </form>

          {/* Existing Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories */}
            <div className="p-5 bg-white rounded-2xl border border-brand-border shadow-xs space-y-3">
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                Categorias Ativas ({categories.length})
              </h3>
              <div className="space-y-2">
                {categories.map((c) => {
                  const isEditing = editingTagId === c.id;
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2.5 bg-brand-bg rounded-xl border border-stone-200 text-xs gap-2"
                    >
                      {isEditing ? (
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            type="text"
                            value={editingTagName}
                            onChange={(e) => setEditingTagName(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-white border border-brand-border-dark rounded-lg text-xs font-bold text-stone-900"
                            placeholder="Nome da Categoria"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditTagCategory(c)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Confirmar Alterações</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTagId(null)}
                            className="px-2 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-bold text-stone-800">{c.name}</span>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => startEditTagCategory(c)}
                              className="p-1 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
                              title="Editar Categoria"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRequestDeleteTagCategory(c)}
                              className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Excluir Categoria"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                {categories.length === 0 && (
                  <p className="text-xs text-stone-400 italic py-2">Nenhuma categoria cadastrada.</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="p-5 bg-white rounded-2xl border border-brand-border shadow-xs space-y-3">
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                Tags & Selos de Destaque ({tags.length})
              </h3>
              <div className="space-y-2">
                {tags.map((t) => {
                  const isEditing = editingTagId === t.id;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2.5 bg-brand-bg rounded-xl border border-stone-200 text-xs gap-2"
                    >
                      {isEditing ? (
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            type="color"
                            value={editingTagColor}
                            onChange={(e) => setEditingTagColor(e.target.value)}
                            className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0"
                            title="Cor da Tag"
                          />
                          <input
                            type="text"
                            value={editingTagName}
                            onChange={(e) => setEditingTagName(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-white border border-brand-border-dark rounded-lg text-xs font-bold text-stone-900"
                            placeholder="Nome da Tag"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditTagCategory(t)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Confirmar Alterações</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTagId(null)}
                            className="px-2 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-bold text-stone-800 flex items-center space-x-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: t.color || '#B58D5F' }}
                            />
                            <span>#{t.name}</span>
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => startEditTagCategory(t)}
                              className="p-1 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
                              title="Editar Tag"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRequestDeleteTagCategory(t)}
                              className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Excluir Tag"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                {tags.length === 0 && (
                  <p className="text-xs text-stone-400 italic py-2">Nenhuma tag cadastrada.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: CUPONS & OFERTAS ================= */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
                Cupons de Desconto & Ofertas
              </h2>
              <p className="text-xs text-stone-500">
                Crie códigos promocionais para enviar aos seus clientes e aumentar suas conversões no WhatsApp
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingCoupon(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer self-start"
              id="btn-add-coupon"
            >
              <Plus className="w-4 h-4 text-brand-primary" />
              <span>Criar Novo Cupom</span>
            </button>
          </div>

          {/* Add Coupon Form */}
          {isAddingCoupon && (
            <form
              onSubmit={handleCreateCoupon}
              className="p-5 bg-white rounded-2xl border border-brand-border shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span>Criar Novo Cupom de Desconto</span>
                <button
                  type="button"
                  onClick={() => setIsAddingCoupon(false)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Código do Cupom</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: VERAO15"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border-dark rounded-xl text-xs font-mono font-bold text-stone-900 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Tipo</label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border-dark rounded-xl text-xs font-medium text-stone-900"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Valor do Desconto</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder={couponType === 'percentage' ? 'Ex: 15 (%)' : 'Ex: 50 (R$)'}
                    value={couponValue || ''}
                    onChange={(e) => setCouponValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Limite de Pessoas (Máx. Usos)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ilimitado se 0"
                    value={couponMaxUses || ''}
                    onChange={(e) => setCouponMaxUses(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 font-bold"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold"
                  >
                    Confirmar Alterações
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Coupon Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coup) => (
              <div
                key={coup.id}
                className="p-4 bg-white rounded-2xl border border-brand-border shadow-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-mono text-sm font-bold text-brand-primary-darker bg-brand-bg px-2.5 py-1 rounded-lg border border-brand-border block w-fit mb-1">
                    {coup.code}
                  </span>
                  <p className="text-xs font-bold text-stone-900">
                    Desconto de{' '}
                    {coup.discountType === 'percentage'
                      ? `${coup.discountValue}% OFF`
                      : `${formatCurrency(coup.discountValue)} OFF`}
                  </p>
                  {coup.maxUses ? (
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      Utilizações: {coup.usageCount || 0} / {coup.maxUses} (Restam: {Math.max(0, coup.maxUses - (coup.usageCount || 0))})
                    </p>
                  ) : (
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      Utilizações: {coup.usageCount || 0} (Ilimitado)
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onRequestDeleteCoupon(coup)}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Excluir Cupom"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Danger Zone: Demo reset */}
          <div className="mt-12 pt-6 border-t border-stone-200 flex items-center justify-between bg-stone-50 p-4 rounded-2xl">
            <div className="text-xs text-stone-600">
              <strong className="block text-stone-800">Restaurar Dados da Loja</strong>
              Recarregar o catálogo com os produtos e configurações iniciais de demonstração.
            </div>
            <button
              type="button"
              onClick={onResetData}
              className="flex items-center space-x-1.5 px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
