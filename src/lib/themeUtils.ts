export interface FontOption {
  id: string;
  name: string;
  category: 'Serifada Luxo' | 'Moderna & Clean' | 'Alta Costura';
  fontFamily: string;
  previewText: string;
  description: string;
}

export const STORE_FONTS: FontOption[] = [
  {
    id: 'playfair',
    name: 'Playfair Display',
    category: 'Serifada Luxo',
    fontFamily: "'Playfair Display', Georgia, serif",
    previewText: 'Elegância & Alta Costura',
    description: 'Clássica, editorial e sofisticada para boutiques e alta moda.',
  },
  {
    id: 'cormorant',
    name: 'Cormorant Garamond',
    category: 'Alta Costura',
    fontFamily: "'Cormorant Garamond', Garamond, serif",
    previewText: 'Exclusividade & Requinte',
    description: 'Estilo aristocrático e poético de ateliês europeus.',
  },
  {
    id: 'cinzel',
    name: 'Cinzel',
    category: 'Serifada Luxo',
    fontFamily: "'Cinzel', 'Times New Roman', serif",
    previewText: 'JOIAS & ALFAIATARIA',
    description: 'Imponência romana e traços refinados de marcas premium.',
  },
  {
    id: 'bodoni',
    name: 'Bodoni Moda',
    category: 'Alta Costura',
    fontFamily: "'Bodoni Moda', Didot, serif",
    previewText: 'Vogue & Glamour Fashion',
    description: 'O padrão de ouro das grandes capas de revistas e maisons de luxo.',
  },
  {
    id: 'lora',
    name: 'Lora',
    category: 'Serifada Luxo',
    fontFamily: "'Lora', Georgia, serif",
    previewText: 'Charme & Suavidade Contemporânea',
    description: 'Serifas equilibradas e aconchegantes com ótima legibilidade.',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    category: 'Moderna & Clean',
    fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
    previewText: 'Moderna & Comercial',
    description: 'Impacto visual marcante, proporções elegantes e geométricas.',
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    category: 'Moderna & Clean',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    previewText: 'Clean, Tech & Minimalista',
    description: 'Visual moderno de interfaces de alto padrão e design escandinavo.',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    category: 'Moderna & Clean',
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
    previewText: 'Geométrica & Envolvente',
    description: 'Tipografia circular amigável, jovem e de altíssima conversão.',
  },
  {
    id: 'raleway',
    name: 'Raleway',
    category: 'Moderna & Clean',
    fontFamily: "'Raleway', sans-serif",
    previewText: 'Traços Finos & Minimalismo',
    description: 'Elegância contemporânea com design leve e arejado.',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    category: 'Moderna & Clean',
    fontFamily: "'Outfit', sans-serif",
    previewText: 'Design Arrojado & Dinâmico',
    description: 'Estética cosmopolita perfeita para catálogos digitais de vanguarda.',
  },
];

export interface ColorPaletteOption {
  id: string;
  name: string;
  hex: string;
  darkHex: string;
  bgHex: string;
  description: string;
}

export const STORE_COLOR_PALETTES: ColorPaletteOption[] = [
  {
    id: 'gold',
    name: 'Dourado Imperial',
    hex: '#B8860B',
    darkHex: '#8C6508',
    bgHex: '#FAF7EE',
    description: 'Ouro e sofisticação atemporal.',
  },
  {
    id: 'crimson',
    name: 'Carmesim Haute Couture',
    hex: '#8B0000',
    darkHex: '#660000',
    bgHex: '#FAF4F4',
    description: 'Bordeaux marcante e luxuoso.',
  },
  {
    id: 'emerald',
    name: 'Esmeralda Nobre',
    hex: '#0F5132',
    darkHex: '#093621',
    bgHex: '#F2F8F5',
    description: 'Verde joia profundo e distinto.',
  },
  {
    id: 'rosegold',
    name: 'Rose Gold & Champagne',
    hex: '#B76E79',
    darkHex: '#94535D',
    bgHex: '#FAF5F6',
    description: 'Delicado, feminino e romântico.',
  },
  {
    id: 'sapphire',
    name: 'Safira Noite Real',
    hex: '#104E8B',
    darkHex: '#0A335C',
    bgHex: '#F2F6FA',
    description: 'Azul clássico de extrema elegância.',
  },
  {
    id: 'onyx',
    name: 'Preto Ônix Minimal',
    hex: '#18181B',
    darkHex: '#09090B',
    bgHex: '#F4F4F5',
    description: 'Preto puro sofisticado e de alto contraste.',
  },
  {
    id: 'amethyst',
    name: 'Violeta Imperial',
    hex: '#4A0E4E',
    darkHex: '#300833',
    bgHex: '#F8F3F9',
    description: 'Púrpura nobre de riqueza e mistério.',
  },
  {
    id: 'terracotta',
    name: 'Terracota & Canela',
    hex: '#C05A3E',
    darkHex: '#94412B',
    bgHex: '#FAF5F3',
    description: 'Calor terroso e orgânico da moda artesanal.',
  },
  {
    id: 'chocolate',
    name: 'Chocolate Trufado',
    hex: '#3D2314',
    darkHex: '#25140A',
    bgHex: '#F8F5F2',
    description: 'Marrom aveludado e acolhedor.',
  },
  {
    id: 'olive',
    name: 'Verde Oliva Botânico',
    hex: '#4B5320',
    darkHex: '#313714',
    bgHex: '#F5F7F0',
    description: 'Naturalismo elegante e sustentável.',
  },
];

export function getFontFamilyCss(fontId?: string): string {
  const found = STORE_FONTS.find((f) => f.id === fontId);
  return found ? found.fontFamily : STORE_FONTS[0].fontFamily;
}

// Preset color variants with suggested Hex colors
export const PRESET_PRODUCT_COLORS = [
  { name: 'Preto Clássico', hex: '#111111' },
  { name: 'Off-White Nobre', hex: '#F8F6F0' },
  { name: 'Branco Puro', hex: '#FFFFFF' },
  { name: 'Rosa Chiclete / Rosa Quartz', hex: '#E87A90' },
  { name: 'Azul Sereno', hex: '#6C9BCF' },
  { name: 'Azul Marinho', hex: '#1B2A4A' },
  { name: 'Verde Menta', hex: '#88D49E' },
  { name: 'Verde Oliva / Militar', hex: '#556B2F' },
  { name: 'Terracota / Telha', hex: '#C05A3E' },
  { name: 'Fúcsia Vibrante', hex: '#C2185B' },
  { name: 'Lilás Lavanda', hex: '#B39DDB' },
  { name: 'Nude / Bege Areia', hex: '#D7C4B7' },
  { name: 'Dourado / Ouro', hex: '#D4AF37' },
  { name: 'Vermelho Paixão', hex: '#C0392B' },
  { name: 'Vinho Bordô', hex: '#6B1D2F' },
  { name: 'Mostarda / Caramelo', hex: '#C68B59' },
  { name: 'Cinza Mescla', hex: '#757575' },
];

export interface DayOption {
  dayIndex: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  shortName: string;
  fullName: string;
}

export const WEEK_DAYS: DayOption[] = [
  { dayIndex: 1, shortName: 'Seg', fullName: 'Segunda-feira' },
  { dayIndex: 2, shortName: 'Ter', fullName: 'Terça-feira' },
  { dayIndex: 3, shortName: 'Qua', fullName: 'Quarta-feira' },
  { dayIndex: 4, shortName: 'Qui', fullName: 'Quinta-feira' },
  { dayIndex: 5, shortName: 'Sex', fullName: 'Sexta-feira' },
  { dayIndex: 6, shortName: 'Sáb', fullName: 'Sábado' },
  { dayIndex: 0, shortName: 'Dom', fullName: 'Domingo' },
];

export function formatBusinessDaysLabel(days?: number[]): string {
  if (!days || days.length === 0) {
    return 'Não informado';
  }
  if (days.length === 7) {
    return 'Todos os dias (Seg a Dom)';
  }
  
  // Sort according to Mon (1) -> Sat (6) -> Sun (0)
  const order = [1, 2, 3, 4, 5, 6, 0];
  const sorted = [...days].sort((a, b) => order.indexOf(a) - order.indexOf(b));

  const namesMap: Record<number, string> = {
    0: 'Domingo',
    1: 'Segunda',
    2: 'Terça',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sábado',
  };

  const shortNamesMap: Record<number, string> = {
    0: 'Dom',
    1: 'Seg',
    2: 'Ter',
    3: 'Qua',
    4: 'Qui',
    5: 'Sex',
    6: 'Sáb',
  };

  // Check common patterns
  const isMonToSat = days.length === 6 && !days.includes(0);
  if (isMonToSat) return 'Segunda a Sábado';

  const isMonToFri = days.length === 5 && !days.includes(0) && !days.includes(6);
  if (isMonToFri) return 'Segunda a Sexta';

  if (sorted.length <= 3) {
    return sorted.map((d) => namesMap[d]).join(', ');
  }

  return sorted.map((d) => shortNamesMap[d]).join(', ');
}

export interface StoreHoursStatus {
  isOpenNow: boolean;
  isBreakNow: boolean;
  isBusinessDayNow: boolean;
  statusLabel: string;
  statusColor: string;
  acceptsOrdersNow: boolean;
  noticeText: string;
}

export function checkStoreHoursStatus(settings: {
  openingTime?: string;
  closingTime?: string;
  hasBreakInterval?: boolean;
  breakStartTime?: string;
  breakEndTime?: string;
  acceptOrdersDuringBreak?: boolean;
  businessDays?: number[];
  businessDaysLabel?: string;
  acceptOrdersOutsideHours?: boolean;
  openingHours?: string;
  breakNoticeMessage?: string;
}): StoreHoursStatus {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Default business days: Monday (1) to Saturday (6) if not specified
  const businessDays = settings.businessDays && settings.businessDays.length > 0
    ? settings.businessDays
    : [1, 2, 3, 4, 5, 6];

  const isBusinessDayNow = businessDays.includes(currentDay);
  const acceptOutside = settings.acceptOrdersOutsideHours ?? true;

  const parseTime = (timeStr?: string): number | null => {
    if (!timeStr) return null;
    const parts = timeStr.trim().split(':');
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
    }
    return null;
  };

  const openMins = parseTime(settings.openingTime) ?? (8 * 60); // 08:00
  const closeMins = parseTime(settings.closingTime) ?? (18 * 60); // 18:00
  const breakStart = parseTime(settings.breakStartTime);
  const breakEnd = parseTime(settings.breakEndTime);

  // If today is not an operating day
  if (!isBusinessDayNow) {
    return {
      isOpenNow: false,
      isBreakNow: false,
      isBusinessDayNow: false,
      statusLabel: 'Fechado Hoje',
      statusColor: 'text-stone-600 bg-stone-100 border-stone-300',
      acceptsOrdersNow: acceptOutside,
      noticeText: acceptOutside
        ? 'Hoje não temos expediente, mas você pode enviar seu pedido pelo WhatsApp normalmente! Responderemos assim que retornarmos.'
        : 'Hoje não temos expediente e os pedidos estão pausados temporariamente.',
    };
  }

  // Check if within break
  let isBreakNow = false;
  if (settings.hasBreakInterval && breakStart !== null && breakEnd !== null) {
    if (currentMinutes >= breakStart && currentMinutes < breakEnd) {
      isBreakNow = true;
    }
  }

  // Check if open
  let isOpenNow = false;
  if (currentMinutes >= openMins && currentMinutes < closeMins) {
    isOpenNow = true;
  }

  if (isBreakNow) {
    const accepts = settings.acceptOrdersDuringBreak ?? true;
    return {
      isOpenNow: true,
      isBreakNow: true,
      isBusinessDayNow: true,
      statusLabel: 'Em Intervalo / Almoço',
      statusColor: 'text-amber-600 bg-amber-50 border-amber-200',
      acceptsOrdersNow: accepts,
      noticeText: settings.breakNoticeMessage || 
        (accepts
          ? 'Estamos em pausa para almoço. Recebemos seu pedido com carinho e prepararemos no retorno do expediente!'
          : 'Estamos em intervalo de almoço e os pedidos estão pausados temporariamente. Retornamos em breve!'),
    };
  }

  if (isOpenNow) {
    return {
      isOpenNow: true,
      isBreakNow: false,
      isBusinessDayNow: true,
      statusLabel: 'Aberto Agora',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      acceptsOrdersNow: true,
      noticeText: 'Estamos abertos e prontos para atender seu pedido!',
    };
  }

  return {
    isOpenNow: false,
    isBreakNow: false,
    isBusinessDayNow: true,
    statusLabel: 'Fechado no Momento',
    statusColor: 'text-stone-600 bg-stone-100 border-stone-200',
    acceptsOrdersNow: acceptOutside,
    noticeText: acceptOutside
      ? 'Estamos fora do horário de atendimento, mas você pode enviar seu pedido agora e responderemos no início do próximo expediente!'
      : 'Estamos fora do horário de atendimento e os pedidos estão temporariamente pausados.',
  };
}
