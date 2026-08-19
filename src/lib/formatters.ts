import { Order, StoreSettings } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

export const cleanPhoneForWhatsapp = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('55') && (cleaned.length === 10 || cleaned.length === 11)) {
    cleaned = '55' + cleaned;
  }
  return cleaned;
};

export const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
};

export const generateWhatsappOrderMessage = (
  order: Order,
  settings: StoreSettings
): string => {
  const isDelivery = order.orderType === 'delivery';

  let msg = `*NOVO PEDIDO - ${settings.storeName.toUpperCase()}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `*Pedido:* #${order.orderNumber}\n`;
  msg += `*Cliente:* ${order.customerName}\n`;
  msg += `*WhatsApp:* ${order.customerWhatsapp}\n`;
  msg += `*Modalidade:* ${isDelivery ? 'Entrega no Endereço' : 'Retirada na Loja'}\n`;

  if (isDelivery && order.deliveryAddress) {
    msg += `*Endereço:* ${order.deliveryAddress.street}, ${order.deliveryAddress.number}`;
    if (order.deliveryAddress.complement) msg += ` (${order.deliveryAddress.complement})`;
    msg += ` - ${order.deliveryAddress.neighborhood}, ${order.deliveryAddress.city}\n`;
  }

  msg += `*Forma de Pagamento:* ${
    order.paymentMethod === 'pix'
      ? 'PIX (Chave da Loja)'
      : order.paymentMethod === 'card_delivery'
      ? 'Cartão na Entrega (Maquininha)'
      : order.paymentMethod === 'card_pickup'
      ? 'Cartão na Retirada'
      : order.paymentMethod === 'cash'
      ? 'Dinheiro'
      : 'A Combinar'
  }\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `*ITENS DO PEDIDO:*\n\n`;

  order.items.forEach((item, index) => {
    msg += `${index + 1}. *${item.productName}*\n`;
    msg += `   • Tam: *${item.selectedSize}* | Cor: *${item.selectedColorName}*\n`;
    msg += `   • Qtd: ${item.quantity}x de ${formatCurrency(item.unitPrice)} = *${formatCurrency(item.totalPrice)}*\n\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Subtotal: ${formatCurrency(order.subtotal)}\n`;
  if (order.discountAmount > 0) {
    msg += `Desconto (${order.appliedCoupon || 'Cupom'}): -${formatCurrency(order.discountAmount)}\n`;
  }
  if (order.deliveryFee > 0 && isDelivery) {
    msg += `Taxa de Entrega: +${formatCurrency(order.deliveryFee)}\n`;
  }
  msg += `*TOTAL A PAGAR: ${formatCurrency(order.finalTotal)}*\n`;

  if (order.customerNotes) {
    msg += `\n*Observações:* ${order.customerNotes}\n`;
  }

  msg += `\nObrigado por escolher a ${settings.storeName}! Aguardo a confirmação do pedido.`;

  return encodeURIComponent(msg);
};

export const generateWhatsappDirectProductMessage = (
  productName: string,
  productPrice: number,
  size?: string,
  color?: string,
  settings?: StoreSettings
): string => {
  let msg = `Olá! Vim pela vitrine da *${settings?.storeName || 'Loja'}* e gostaria de informações/comprar a peça:\n\n`;
  msg += `*${productName}*\n`;
  msg += `Valor: *${formatCurrency(productPrice)}*\n`;
  if (size) msg += `Tamanho desejado: *${size}*\n`;
  if (color) msg += `Cor: *${color}*\n`;
  msg += `\nA peça ainda está disponível? Como posso proceder com o pagamento?`;

  return encodeURIComponent(msg);
};

export const copyToClipboardSafe = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard API error, trying fallback:', err);
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed:', err);
    return false;
  }
};

export const getStoreShareUrl = (settings?: StoreSettings, client?: any): string => {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const activeSlug =
    client?.storeSlug ||
    client?.username ||
    (settings?.storeName
      ? settings.storeName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      : '');

  if (activeSlug) {
    return `${origin}/?loja=${encodeURIComponent(activeSlug)}`;
  }
  return `${origin}/`;
};

export const generateWhatsappStoreShareMessage = (
  settings: StoreSettings,
  customUrl?: string
): string => {
  let msg = `*${settings.storeName.toUpperCase()}*\n`;
  if (settings.slogan) {
    msg += `_${settings.slogan}_\n`;
  }
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  if (settings.description) {
    msg += `${settings.description}\n\n`;
  }
  
  const linkToShare = customUrl || getStoreShareUrl(settings);
  if (linkToShare) {
    msg += `*Conheça nossa Vitrine Exclusiva & Lançamentos:*\n${linkToShare}\n\n`;
  }
  msg += `Atendimento personalizado e pedidos direto pelo WhatsApp!\n`;
  msg += `Será um prazer vestir você com elegância e exclusividade.`;
  return encodeURIComponent(msg);
};
