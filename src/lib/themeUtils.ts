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
  archetype?: 'classic' | 'modern' | 'bold' | 'soft';
}

export const STORE_COLOR_PALETTES: ColorPaletteOption[] = [
  {
    id: 'gold',
    name: 'Dourado Imperial',
    hex: '#B8860B',
    darkHex: '#8C6508',
    bgHex: '#FAF7EE',
    description: 'Ouro e sofisticação atemporal.',
    archetype: 'classic',
  },
  {
    id: 'crimson',
    name: 'Carmesim Haute Couture',
    hex: '#8B0000',
    darkHex: '#660000',
    bgHex: '#FAF4F4',
    description: 'Bordeaux marcante e luxuoso.',
    archetype: 'bold',
  },
  {
    id: 'emerald',
    name: 'Esmeralda Nobre',
    hex: '#0F5132',
    darkHex: '#093621',
    bgHex: '#F2F8F5',
    description: 'Verde joia profundo e distinto.',
    archetype: 'classic',
  },
  {
    id: 'rosegold',
    name: 'Rose Gold & Champagne',
    hex: '#B76E79',
    darkHex: '#94535D',
    bgHex: '#FAF5F6',
    description: 'Delicado, feminino e romântico.',
    archetype: 'soft',
  },
  {
    id: 'sapphire',
    name: 'Safira Noite Real',
    hex: '#104E8B',
    darkHex: '#0A335C',
    bgHex: '#F2F6FA',
    description: 'Azul clássico de extrema elegância.',
    archetype: 'modern',
  },
  {
    id: 'onyx',
    name: 'Preto Ônix Minimal',
    hex: '#18181B',
    darkHex: '#09090B',
    bgHex: '#F4F4F5',
    description: 'Preto puro sofisticado e de alto contraste.',
    archetype: 'modern',
  },
  {
    id: 'amethyst',
    name: 'Violeta Imperial',
    hex: '#4A0E4E',
    darkHex: '#300833',
    bgHex: '#F8F3F9',
    description: 'Púrpura nobre de riqueza e mistério.',
    archetype: 'classic',
  },
  {
    id: 'terracotta',
    name: 'Terracota & Canela',
    hex: '#C05A3E',
    darkHex: '#94412B',
    bgHex: '#FAF5F3',
    description: 'Calor terroso e orgânico da moda artesanal.',
    archetype: 'soft',
  },
  {
    id: 'chocolate',
    name: 'Chocolate Trufado',
    hex: '#3D2314',
    darkHex: '#25140A',
    bgHex: '#F8F5F2',
    description: 'Marrom aveludado e acolhedor.',
    archetype: 'classic',
  },
  {
    id: 'olive',
    name: 'Verde Oliva Botânico',
    hex: '#4B5320',
    darkHex: '#313714',
    bgHex: '#F5F7F0',
    description: 'Naturalismo elegante e sustentável.',
    archetype: 'soft',
  },
];

export function getFontFamilyCss(fontIdOrName?: string): string {
  if (!fontIdOrName) return STORE_FONTS[0].fontFamily;
  const clean = fontIdOrName.toLowerCase().trim();
  const found = STORE_FONTS.find(
    (f) =>
      f.id.toLowerCase() === clean ||
      f.name.toLowerCase() === clean ||
      f.fontFamily.toLowerCase().includes(clean)
  );
  return found ? found.fontFamily : fontIdOrName;
}

export function adjustColorBrightness(hex: string, percent: number): string {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (cleanHex.length !== 6) return hex;

  const num = parseInt(cleanHex, 16);
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function getLuminance(hex: string): number {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function applyStoreTheme(settings?: { fontFamily?: string; primaryColor?: string }) {
  if (typeof document === 'undefined' || !settings) return;
  const root = document.documentElement;

  // Visual Archetypes Mapping
  const archetypeConfig = {
    classic: {
      radius: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem' },
      shadow: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }
    },
    modern: {
      radius: { sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.25rem', '2xl': '1.75rem', '3xl': '2.5rem' },
      shadow: { sm: '0 1px 3px 0 rgb(0 0 0 / 0.1)', md: '0 10px 15px -3px rgb(0 0 0 / 0.1)', lg: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }
    },
    bold: {
      radius: { sm: '0', md: '0.125rem', lg: '0.25rem', xl: '0.375rem', '2xl': '0.5rem', '3xl': '0.75rem' },
      shadow: { sm: '2px 2px 0 0 rgb(0 0 0 / 1)', md: '4px 4px 0 0 rgb(0 0 0 / 1)', lg: '8px 8px 0 0 rgb(0 0 0 / 1)' }
    },
    soft: {
      radius: { sm: '0.75rem', md: '1rem', lg: '1.25rem', xl: '1.75rem', '2xl': '2.5rem', '3xl': '4rem' },
      shadow: { sm: '0 2px 10px 0 rgba(0,0,0,0.03)', md: '0 10px 30px 0 rgba(0,0,0,0.04)', lg: '0 20px 50px 0 rgba(0,0,0,0.05)' }
    }
  };

  // Apply Color Palette & Archetype
  if (settings.primaryColor) {
    const hex = settings.primaryColor.trim();
    const matchedPalette = STORE_COLOR_PALETTES.find(
      (p) => p.hex.toLowerCase() === hex.toLowerCase() || p.id.toLowerCase() === hex.toLowerCase()
    );

    const archKey = matchedPalette?.archetype || 'modern';
    const config = archetypeConfig[archKey];

    // Smart Contrast Color
    const luminance = getLuminance(hex);
    const contrastColor = luminance > 0.5 ? '#000000' : '#ffffff';
    root.style.setProperty('--brand-primary-fg', contrastColor);

    // Also determine a readable background for cards if the theme color is used as BG
    const isDarkTheme = luminance < 0.4;
    
    // Apply Radii
    root.style.setProperty('--brand-radius-sm', config.radius.sm);
    root.style.setProperty('--brand-radius-md', config.radius.md);
    root.style.setProperty('--brand-radius-lg', config.radius.lg);
    root.style.setProperty('--brand-radius-xl', config.radius.xl);
    root.style.setProperty('--brand-radius-2xl', config.radius['2xl']);
    root.style.setProperty('--brand-radius-3xl', config.radius['3xl']);

    // Apply Shadows
    root.style.setProperty('--brand-shadow-sm', config.shadow.sm);
    root.style.setProperty('--brand-shadow-md', config.shadow.md);
    root.style.setProperty('--brand-shadow-lg', config.shadow.lg);

    if (matchedPalette) {
      root.style.setProperty('--brand-primary', matchedPalette.hex);
      root.style.setProperty('--brand-primary-dark', matchedPalette.darkHex);
      root.style.setProperty('--brand-primary-darker', adjustColorBrightness(matchedPalette.darkHex, -15));
      root.style.setProperty('--brand-bg', matchedPalette.bgHex);
      root.style.setProperty('--brand-bg-alt', adjustColorBrightness(matchedPalette.bgHex, -6));
      root.style.setProperty('--brand-border', adjustColorBrightness(matchedPalette.bgHex, -12));
      root.style.setProperty('--brand-border-dark', adjustColorBrightness(matchedPalette.bgHex, -22));
      
      // Additional variables for a more complete visual change
      root.style.setProperty('--brand-surface', matchedPalette.bgHex === '#FAF7EE' || matchedPalette.bgHex === '#FFFFFF' ? '#FFFFFF' : adjustColorBrightness(matchedPalette.bgHex, 2));
      root.style.setProperty('--brand-accent', adjustColorBrightness(matchedPalette.hex, 10));
      root.style.setProperty('--brand-muted', adjustColorBrightness(matchedPalette.bgHex, -2));
      root.style.setProperty('--brand-secondary', matchedPalette.darkHex);
      
      // Semantic colors for text visibility
      root.style.setProperty('--brand-text-main', isDarkTheme ? '#FFFFFF' : '#1C1917');
      root.style.setProperty('--brand-text-muted', isDarkTheme ? '#D1D5DB' : '#57534E');
    } else {
      root.style.setProperty('--brand-primary', hex);
      const darkHex = adjustColorBrightness(hex, -20);
      const darkerHex = adjustColorBrightness(hex, -35);
      const bgHex = adjustColorBrightness(hex, 92); // even lighter BG for custom colors
      root.style.setProperty('--brand-primary-dark', darkHex);
      root.style.setProperty('--brand-primary-darker', darkerHex);
      root.style.setProperty('--brand-bg', bgHex);
      root.style.setProperty('--brand-bg-alt', adjustColorBrightness(bgHex, -6));
      root.style.setProperty('--brand-border', adjustColorBrightness(bgHex, -12));
      root.style.setProperty('--brand-border-dark', adjustColorBrightness(bgHex, -22));
      
      root.style.setProperty('--brand-surface', '#FFFFFF');
      root.style.setProperty('--brand-accent', adjustColorBrightness(hex, 10));
      root.style.setProperty('--brand-muted', adjustColorBrightness(bgHex, -2));
      root.style.setProperty('--brand-secondary', darkHex);

      const isCustomDark = getLuminance(hex) < 0.4;
      root.style.setProperty('--brand-text-main', isCustomDark ? '#FFFFFF' : '#1C1917');
      root.style.setProperty('--brand-text-muted', isCustomDark ? '#D1D5DB' : '#57534E');
    }
  }

  // Apply Font (should come after primary color as it might depend on the archetype)
  if (settings.fontFamily) {
    const fontCss = getFontFamilyCss(settings.fontFamily);
    root.style.setProperty('--font-serif-luxury', fontCss);
    
    // Check if it's a clean sans-serif font
    const cleanFontId = settings.fontFamily.toLowerCase().trim();
    const isSans = ['montserrat', 'plus-jakarta', 'poppins', 'raleway', 'outfit'].some(
      (s) => cleanFontId.includes(s)
    );
    if (isSans) {
      root.style.setProperty('--font-body', fontCss);
    } else {
      root.style.setProperty('--font-body', "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
    }
  }
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
