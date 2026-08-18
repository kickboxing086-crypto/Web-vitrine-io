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
  storeName: 'Web Vitrine',
  slogan: 'Elegância em Vestir e Alta Sofisticação',
  description: 'Catálogo de moda exclusivo com tecidos nobres, alta costura e atendimento personalizado via WhatsApp.',
  logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80',
  phoneWhatsapp: '5584986113980',
  instagramHandle: 'webvitrine_oficial',
  facebookUrl: '',
  address: 'Centro',
  cityState: 'RN',
  openingHours: 'Seg a Sáb: 08h às 18h (Intervalo: 12h às 13h30)',
  openingTime: '08:00',
  closingTime: '18:00',
  hasBreakInterval: true,
  breakStartTime: '12:00',
  breakEndTime: '13:30',
  acceptOrdersDuringBreak: true,
  businessDays: [1, 2, 3, 4, 5, 6],
  businessDaysLabel: 'Segunda a Sábado',
  acceptOrdersOutsideHours: true,
  breakNoticeMessage: 'Estamos em intervalo de almoço. Seu pedido é muito bem-vindo e será preparado logo no retorno do expediente!',
  primaryColor: '#B8860B',
  fontFamily: 'playfair',
  allowOutOfAreaOrders: false,
  outOfAreaMessage: 'Entregamos em todas as regiões cadastradas. Caso esteja fora da área habitual, nos chame no WhatsApp para envio especial!',
  deliveryAreasList: 'Centro, Zona Sul, Bairros Adjacentes e Região Metropolitana',
  deliveryMode: 'both',
  deliveryFee: 15.0,
  freeDeliveryThreshold: 350.0,
  deliveryFeeType: 'flat',
  customDeliveryRates: [
    { id: 'rate-1', city: 'Natal', neighborhood: 'Centro', fee: 10.0 },
    { id: 'rate-2', city: 'Natal', neighborhood: 'Ponta Negra', fee: 15.0 },
  ],
  enableInstallments: true,
  maxInstallments: 6,
  minInstallmentAmount: 30.0,
  minOrderValueForInstallments: 50.0,
  inviteCode: 'VITRINE-VIP',
  isFirstSetupDone: true,
  announcementBannerText: '💎 Seja bem-vindo à Web Vitrine! Explore nosso catálogo e faça seu pedido direto pelo WhatsApp.',
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
