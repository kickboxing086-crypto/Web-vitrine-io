export type DeliveryMode = 'pickup' | 'delivery' | 'both';

export interface DeliveryRate {
  id: string;
  city: string;
  neighborhood: string;
  fee: number;
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  phoneWhatsapp: string;
  instagramHandle: string;
  facebookUrl?: string;
  address: string;
  cityState: string;
  openingHours: string;
  
  // Horários de Funcionamento Avançados & Intervalo
  openingTime?: string; // Ex: '08:00'
  closingTime?: string; // Ex: '18:00'
  hasBreakInterval?: boolean; // Se a loja tem pausa/almoço
  breakStartTime?: string; // Ex: '12:00'
  breakEndTime?: string; // Ex: '13:30'
  acceptOrdersDuringBreak?: boolean; // Se aceita pedidos no intervalo (destacado)
  businessDays?: number[]; // [0, 1, 2, 3, 4, 5, 6] onde 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  businessDaysLabel?: string; // Formatado automaticamente a partir dos dias marcados
  acceptOrdersOutsideHours?: boolean; // Se aceita pedidos fora dos dias ou horários de funcionamento
  breakNoticeMessage?: string;

  // Cores da Interface & 10 Estilos de Fontes
  primaryColor?: string; // Hex da cor principal da loja (ex: #B8860B, #8B0000, #0F5132...)
  fontFamily?: string; // 'playfair' | 'cormorant' | 'cinzel' | 'montserrat' | 'plus-jakarta' | 'poppins' | 'raleway' | 'lora' | 'bodoni' | 'outfit'

  // Controle de Pedidos Fora da Área de Entrega
  allowOutOfAreaOrders?: boolean; // Se permite pedidos fora dos locais cadastrados
  outOfAreaMessage?: string; // Mensagem informativa para regiões fora de atendimento
  deliveryAreasList?: string; // Ex: 'Zona Sul, Centro, Ponta Negra, Lagoa Nova'

  pixKey?: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  deliveryMode: DeliveryMode; // 'pickup' (apenas retirada), 'delivery' (apenas entrega), 'both' (ambos)
  deliveryFee: number;
  freeDeliveryThreshold: number;
  deliveryFeeType?: 'flat' | 'custom'; // 'flat' (taxa única) ou 'custom' (taxa por bairro/cidade)
  customDeliveryRates?: DeliveryRate[];
  storeType?: 'clothing' | 'natural';
  
  // Parcelamento no Cartão (Configurável pelo CEO)
  enableInstallments?: boolean; // Se ativa exibição/opção de parcelamento
  maxInstallments?: number; // Ex: 2, 3, 4, 6, 10, 12
  minInstallmentAmount?: number; // Ex: 30, 50 (valor mínimo da parcela)
  minOrderValueForInstallments?: number; // Ex: 80, 100 (mínimo do pedido p/ parcelar)

  inviteCode: string;
  isFirstSetupDone: boolean;
  announcementBannerText?: string;
  showAnnouncementBanner: boolean;
}

export interface ProductColorVariant {
  name: string;
  hex: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  promotionalPrice?: number;
  isOnSale: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isAvailable: boolean;
  images: string[];
  sizes: string[]; // e.g. ['PP', 'P', 'M', 'G', 'GG', '38', '40', '42']
  hasColors?: boolean; // Se o produto utiliza variações de cor ou cor única
  colors: ProductColorVariant[];
  stock: number;
  tags: string[]; // e.g. ['Alfaiataria', 'Linho Puro', 'Edição Limitada', 'Festa']
  fabricDetails?: string;
  careInstructions?: string;
  viewsCount: number;
  ordersCount: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor?: ProductColorVariant;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  isActive: boolean;
  usageCount: number;
  maxUses?: number;
  expiresAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  selectedSize: string;
  selectedColorName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerWhatsapp: string;
  orderType: 'pickup' | 'delivery';
  deliveryAddress?: {
    cep?: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    complement?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  finalTotal: number;
  appliedCoupon?: string;
  customerNotes?: string;
  paymentMethod: 'card_delivery' | 'card_pickup' | 'cash' | 'other' | 'pix';
  status: OrderStatus;
  createdAt: string;
}

export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string;
  relatedOrderId?: string;
}

export interface TagCategory {
  id: string;
  name: string;
  slug: string;
  type: 'category' | 'tag';
  color?: string;
}

export interface StoreClient {
  id: string;
  storeName: string;
  username: string;
  password?: string;
  storeType: 'clothing' | 'natural';
  planPrice?: number; // Valor do plano definido pelo gestor (ex: 89.90)
  dueDate?: string; // Data de vencimento (YYYY-MM-DD)
  billingCycle?: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  phoneWhatsapp?: string;
  storeSlug?: string;
  notes?: string;
  lastRenewedAt?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface AdminUser {
  username: string;
  password: string; // Max 8 chars
  storeName: string;
  role?: string;
  isRegistered: boolean;
  createdAt: string;
  lastLoginAt?: string;
}
