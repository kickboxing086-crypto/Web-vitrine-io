import { StoreSettings, Product, Coupon, Order, FinancialRecord, TagCategory, AdminUser } from '../types';

export const initialAdminUser: AdminUser = {
  username: 'Web Vitrine',
  password: '88342731',
  storeName: 'Web Vitrine',
  role: 'Administrador / Dono da Loja',
  isRegistered: true,
  createdAt: '2026-08-15T00:00:00.000Z',
};

export const initialStoreSettings: StoreSettings = {
  storeName: 'Elite Fashion & Nature',
  slogan: 'Elegância em Vestir e Bem-estar Natural',
  description: 'Sistema duplo: Uma seleção refinada de moda premium e uma linha completa de produtos naturais para a sua saúde.',
  logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80',
  phoneWhatsapp: '5584986113980',
  instagramHandle: 'elitefashion',
  facebookUrl: '',
  address: 'Centro',
  cityState: 'RN',
  openingHours: 'Seg a Sáb: 09h às 19h',
  deliveryMode: 'both',
  deliveryFee: 15.0,
  freeDeliveryThreshold: 350.0,
  deliveryFeeType: 'flat',
  customDeliveryRates: [
    { id: 'rate-1', city: 'São Paulo', neighborhood: 'Centro', fee: 10.0 },
    { id: 'rate-2', city: 'São Paulo', neighborhood: 'Jardins', fee: 15.0 },
  ],
  enableInstallments: true,
  maxInstallments: 6,
  minInstallmentAmount: 30.0,
  minOrderValueForInstallments: 50.0,
  inviteCode: 'VITRINE-VIP',
  isFirstSetupDone: true,
  announcementBannerText: 'Bem-vindo à Web Vitrine! Confira nossas novidades e lançamentos do catálogo.',
  showAnnouncementBanner: true,
};

export const initialCategories: TagCategory[] = [
  { id: 'cat-1', name: 'Vestidos & Macacões', slug: 'vestidos', type: 'category' },
  { id: 'cat-2', name: 'Alfaiataria & Blazers', slug: 'alfaiataria', type: 'category' },
  { id: 'cat-3', name: 'Camisas & Blusas', slug: 'camisas', type: 'category' },
  { id: 'cat-4', name: 'Calças & Saias', slug: 'calcas', type: 'category' },
  { id: 'cat-5', name: 'Casacos & Trench Coats', slug: 'casacos', type: 'category' },
  { id: 'cat-6', name: 'Linho & Seda', slug: 'linho-seda', type: 'category' },
  { id: 'cat-7', name: 'Acessórios & Bolsas', slug: 'acessorios', type: 'category' },
];

export const initialTags: TagCategory[] = [
  { id: 'tag-1', name: 'Lançamento', slug: 'lancamento', type: 'tag', color: '#B58D5F' },
  { id: 'tag-2', name: 'Promoção', slug: 'promocao', type: 'tag', color: '#9C3A3A' },
  { id: 'tag-3', name: 'Linho Puro', slug: 'linho-puro', type: 'tag', color: '#7E6B56' },
  { id: 'tag-4', name: 'Mais Vendido', slug: 'mais-vendido', type: 'tag', color: '#2C3E50' },
  { id: 'tag-5', name: 'Edição Limitada', slug: 'edicao-limitada', type: 'tag', color: '#735D78' },
  { id: 'tag-6', name: 'Alta Costura', slug: 'alta-costura', type: 'tag', color: '#B38867' },
];

export const initialProducts: Product[] = [];

export const initialCoupons: Coupon[] = [];

export const initialOrders: Order[] = [];

export const initialFinancialRecords: FinancialRecord[] = [];
