import React, { useState } from 'react';
import { CartItem, StoreSettings, Coupon, Order, OrderItem } from '../types';
import {
  formatCurrency,
  cleanPhoneForWhatsapp,
  generateWhatsappOrderMessage,
} from '../lib/formatters';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  Truck,
  Building2,
  Tag,
  CheckCircle2,
  CreditCard,
  User,
  ArrowLeft,
  ChevronDown,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: StoreSettings;
  coupons: Coupon[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onOrderCreated: (newOrder: Order) => void;
  onSaveCoupon?: (coupon: Coupon) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  settings,
  coupons,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCreated,
  onSaveCoupon,
}) => {
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>(
    settings.deliveryMode === 'pickup' ? 'pickup' : 'delivery'
  );
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [isNeighborhoodOpen, setIsNeighborhoodOpen] = useState(false);
  const getInitialCityAndState = () => {
    const val = settings.cityState || '';
    if (val.includes('-')) {
      const parts = val.split('-');
      return { city: parts[0].trim(), state: parts[1]?.trim() || '' };
    }
    if (val.length === 2) {
      return { city: '', state: val.toUpperCase() };
    }
    return { city: val, state: '' };
  };
  const initialAddr = getInitialCityAndState();

  const [city, setCity] = useState(initialAddr.city);
  const [addressState, setAddressState] = useState(initialAddr.state);
  const [complement, setComplement] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card_delivery' | 'card_pickup' | 'cash' | 'pix'>(
    'pix'
  );
  const [cashAmount, setCashAmount] = useState<string>('');
  const [noChangeNeeded, setNoChangeNeeded] = useState(false);
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit');
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [shakeName, setShakeName] = useState(false);
  const [shakePhone, setShakePhone] = useState(false);
  const [shakeStreet, setShakeStreet] = useState(false);
  const [shakeCash, setShakeCash] = useState(false);
  const [cashError, setCashError] = useState('');
  const [shakeNumber, setShakeNumber] = useState(false);
  const [shakeNeighborhood, setShakeNeighborhood] = useState(false);

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => {
    const price = item.product.isOnSale && item.product.promotionalPrice
      ? item.product.promotionalPrice
      : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
    if (discountAmount > subtotal) discountAmount = subtotal;
  }

  // Delivery fee calculation
  const isDelivery = orderType === 'delivery';
  let deliveryFee = 0;
  if (isDelivery) {
    if (subtotal >= settings.freeDeliveryThreshold && settings.freeDeliveryThreshold > 0) {
      deliveryFee = 0;
    } else if (
      settings.deliveryFeeType === 'custom' &&
      settings.customDeliveryRates &&
      settings.customDeliveryRates.length > 0
    ) {
      const matchedRate = settings.customDeliveryRates.find((r) => {
        return neighborhood && r.neighborhood.toLowerCase().trim() === neighborhood.toLowerCase().trim();
      });
      deliveryFee = matchedRate ? matchedRate.fee : (settings.deliveryFee || 0);
    } else {
      deliveryFee = settings.deliveryFee || 0;
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponInput.trim()) return;
    const found = coupons.find(
      (c) => c.code.toUpperCase() === couponInput.trim().toUpperCase() && c.isActive
    );
    if (!found) {
      setCouponError('Cupom inválido ou expirado');
      return;
    }
    if (found.minOrderValue && subtotal < found.minOrderValue) {
      setCouponError(`Pedido mínimo de ${formatCurrency(found.minOrderValue)} para este cupom`);
      return;
    }
    setAppliedCoupon(found);
    setCouponInput('');
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      if (!customerName.trim()) {
        setShakeName(true);
        setTimeout(() => setShakeName(false), 500);
      }
      if (!customerPhone.trim()) {
        setShakePhone(true);
        setTimeout(() => setShakePhone(false), 500);
      }
      return;
    }

    if (paymentMethod === 'cash' && !noChangeNeeded) {
      const parsedAmount = parseFloat(cashAmount.replace(',', '.'));
      if (isNaN(parsedAmount) || parsedAmount < finalTotal) {
        setShakeCash(true);
        setCashError('O valor precisa ser maior ou igual ao total (' + formatCurrency(finalTotal) + ')');
        setTimeout(() => setShakeCash(false), 500);
        return;
      }
      setCashError('');
    }

    if (isDelivery && (!street.trim() || !number.trim() || !neighborhood.trim())) {
      if (!street.trim()) {
        setShakeStreet(true);
        setTimeout(() => setShakeStreet(false), 500);
      }
      if (!number.trim()) {
        setShakeNumber(true);
        setTimeout(() => setShakeNumber(false), 500);
      }
      if (!neighborhood.trim()) {
        setShakeNeighborhood(true);
        setTimeout(() => setShakeNeighborhood(false), 500);
      }
      return;
    }

    const orderItems: OrderItem[] = cart.map((item) => {
      const unitPrice = item.product.isOnSale && item.product.promotionalPrice
        ? item.product.promotionalPrice
        : item.product.price;
      return {
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images[0] || '',
        selectedSize: item.selectedSize,
        selectedColorName: item.selectedColor.name,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      };
    });

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: 'PED-' + Math.floor(1000 + Math.random() * 9000),
      customerName: customerName.trim(),
      customerWhatsapp: customerPhone.trim(),
      orderType,
      deliveryAddress: isDelivery
        ? {
            cep: cep.trim(),
            street: street.trim(),
            number: number.trim(),
            neighborhood: neighborhood.trim(),
            city: addressState ? `${city.trim()} - ${addressState.trim()}` : city.trim(),
            complement: complement.trim(),
          }
        : undefined,
      items: orderItems,
      subtotal,
      discountAmount,
      deliveryFee,
      finalTotal,
      appliedCoupon: appliedCoupon?.code,
      customerNotes: customerNotes.trim(),
      paymentMethod,
      cardType: (paymentMethod === 'card_delivery' || paymentMethod === 'card_pickup') ? cardType : undefined,
      cashAmount: paymentMethod === 'cash' && !noChangeNeeded ? parseFloat(cashAmount) : undefined,
      noChangeNeeded: paymentMethod === 'cash' ? noChangeNeeded : undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    onOrderCreated(newOrder);

    if (appliedCoupon && onSaveCoupon) {
      onSaveCoupon({
        ...appliedCoupon,
        usageCount: (appliedCoupon.usageCount || 0) + 1,
      });
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const encodedMsg = generateWhatsappOrderMessage(newOrder, settings);
    const storePhone = cleanPhoneForWhatsapp(settings.phoneWhatsapp);
    window.open(`https://wa.me/${storePhone}?text=${encodedMsg}`, '_blank');

    onClearCart();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-xs"
          onClick={onClose}
        />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.18 }}
          className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-8 z-10"
        >
          <div className="w-screen max-w-lg bg-[#121215] text-stone-100 border-l border-[#27272A] shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-[#141417] border-b border-[#27272A] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#1C1C22] text-[#D4AF37] rounded-xl border border-[#2B2B33]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif-luxury font-semibold text-white">
                    Sua Sacola
                  </h2>
                  <span className="text-xs text-stone-400">
                    {cart.reduce((acc, i) => acc + i.quantity, 0)} {cart.length === 1 ? 'item' : 'itens'} adicionados
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1C1C22] hover:bg-stone-800 text-stone-300 rounded-xl text-xs font-semibold border border-[#2B2B33] transition-colors cursor-pointer"
                  id="btn-cart-header-continue-shopping"
                  title="Continuar Comprando"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Continuar</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
                  id="btn-close-cart"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stepper */}
            {cart.length > 0 && (
              <div className="px-6 sm:px-10 py-3 bg-[#16161A] border-b border-[#232328] flex items-center justify-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                        checkoutStep === step 
                          ? 'bg-[#D4AF37] text-stone-950 shadow-md scale-105' 
                          : checkoutStep > step 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-[#22222A] text-stone-400'
                      }`}
                    >
                      {checkoutStep > step ? '✓' : (step as number)}
                    </div>
                    {step < 3 && <div className={`w-8 h-0.5 rounded-full ${checkoutStep > step ? 'bg-emerald-500' : 'bg-[#27272A]'}`} />}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 mx-auto bg-[#1C1C22] border border-[#2B2B33] rounded-full flex items-center justify-center text-stone-400">
                    <ShoppingBag className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                  <h3 className="font-serif-luxury text-lg text-white font-medium">
                    Sua sacola está vazia
                  </h3>
                  <p className="text-xs text-stone-400 max-w-xs mx-auto">
                    Navegue pelo catálogo e escolha suas peças favoritas para fazer o pedido.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex items-center space-x-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#C5A059] text-stone-950 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                    id="btn-empty-cart-continue-shopping"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Ver Catálogo</span>
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {checkoutStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      className="space-y-5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[11px] text-stone-400 pb-1.5 border-b border-[#232328]">
                          <span className="font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
                            Itens Selecionados ({cart.length})
                          </span>
                          <button
                            onClick={onClearCart}
                            className="text-stone-400 hover:text-red-400 transition-colors font-medium text-xs cursor-pointer"
                          >
                            Limpar Sacola
                          </button>
                        </div>

                        {cart.map((item, index) => {
                          const itemPrice = item.product.isOnSale && item.product.promotionalPrice
                            ? item.product.promotionalPrice
                            : item.product.price;
                          return (
                            <div
                              key={`${item.product.id}-${index}`}
                              className="flex gap-3.5 p-3.5 bg-[#18181E] rounded-2xl border border-[#27272A] hover:border-[#3F3F46] transition-all"
                            >
                              <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-black border border-[#27272A] shrink-0">
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <div>
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-xs sm:text-sm font-bold text-white truncate pr-2">
                                      {item.product.name}
                                    </h4>
                                    <button
                                      onClick={() => onRemoveItem(index)}
                                      className="p-1 text-stone-500 hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                                      title="Remover"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 bg-[#22222A] border border-[#2E2E38] rounded text-[9px] font-bold text-stone-300 uppercase">
                                      {item.selectedSize}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#22222A] border border-[#2E2E38] rounded text-[9px] font-bold text-stone-300 uppercase">
                                      <span
                                        className="w-2 h-2 rounded-full border border-black/30"
                                        style={{ backgroundColor: item.selectedColor.hex }}
                                      />
                                      {item.selectedColor.name}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-2.5">
                                  <span className="text-sm font-bold text-white">
                                    {formatCurrency(itemPrice * item.quantity)}
                                  </span>

                                  <div className="flex items-center border border-[#2E2E38] rounded-lg bg-[#22222A] p-0.5">
                                    <button
                                      onClick={() => onUpdateQuantity(index, -1)}
                                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-6 text-center text-[10px] font-bold text-white">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => onUpdateQuantity(index, 1)}
                                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <button
                          type="button"
                          onClick={onClose}
                          className="w-full py-2.5 px-4 border border-dashed border-[#2E2E38] hover:border-[#D4AF37] rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-[#16161A] flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Adicionar mais peças</span>
                        </button>
                      </div>

                      {/* Coupon Area */}
                      <div className="p-4 bg-[#18181E] rounded-2xl border border-[#27272A]">
                        <div className="flex items-center space-x-2 mb-2.5">
                          <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">Cupom de Desconto</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="CÓDIGO DO CUPOM"
                            className="flex-1 px-3 py-2 bg-[#121215] border border-[#2B2B33] rounded-xl text-xs uppercase font-mono font-semibold text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#C5A059] text-stone-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Aplicar
                          </button>
                        </div>
                        {couponError && <p className="text-xs text-red-400 mt-1.5">{couponError}</p>}
                        {appliedCoupon && (
                          <div className="flex items-center justify-between text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1.5 rounded-lg mt-2 font-bold">
                            <span>✓ CUPOM {appliedCoupon.code} ATIVADO</span>
                            <button onClick={() => setAppliedCoupon(null)} className="text-emerald-400 cursor-pointer">✕</button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {checkoutStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      className="space-y-5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 pb-1 border-b border-[#232328]">
                          <Truck className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-xs font-bold uppercase tracking-wider text-stone-200">Entrega ou Retirada</span>
                        </div>

                        {settings.deliveryMode === 'both' ? (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setOrderType('delivery')}
                              className={`p-3.5 rounded-xl border text-left flex flex-col space-y-1 transition-all cursor-pointer ${
                                orderType === 'delivery'
                                  ? 'bg-[#1E1E26] border-[#D4AF37] text-white shadow-sm'
                                  : 'bg-[#18181E] border-[#27272A] text-stone-400 hover:border-stone-600'
                              }`}
                            >
                              <span className="text-xs font-bold text-white">Receber em Casa</span>
                              <span className="text-[10px] text-stone-400">Entrega rápida</span>
                            </button>
                            <button
                              onClick={() => setOrderType('pickup')}
                              className={`p-3.5 rounded-xl border text-left flex flex-col space-y-1 transition-all cursor-pointer ${
                                orderType === 'pickup'
                                  ? 'bg-[#1E1E26] border-[#D4AF37] text-white shadow-sm'
                                  : 'bg-[#18181E] border-[#27272A] text-stone-400 hover:border-stone-600'
                              }`}
                            >
                              <span className="text-xs font-bold text-white">Retirar na Loja</span>
                              <span className="text-[10px] text-stone-400">Direto no endereço</span>
                            </button>
                          </div>
                        ) : (
                          <div className="p-3.5 bg-[#18181E] border border-[#27272A] rounded-xl text-xs font-bold text-stone-300 flex items-center gap-2.5">
                            {settings.deliveryMode === 'pickup' ? <Building2 className="w-4 h-4 text-[#D4AF37]" /> : <Truck className="w-4 h-4 text-[#D4AF37]" />}
                            <span>{settings.deliveryMode === 'pickup' ? 'Somente Retirada na Loja' : 'Somente Entrega'}</span>
                          </div>
                        )}
                      </div>

                      {/* Customer Info Form */}
                      <div className="space-y-3.5">
                        <div className="flex items-center space-x-2 pb-1 border-b border-[#232328]">
                          <User className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-xs font-bold uppercase tracking-wider text-stone-200">Seus Dados</span>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Nome Completo</label>
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Como quer ser chamado(a)?"
                              className={`w-full px-3.5 py-2.5 bg-[#18181E] border rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none ${
                                shakeName ? 'border-red-500' : 'border-[#27272A] focus:border-[#D4AF37]'
                              }`}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Seu WhatsApp</label>
                            <input
                              type="text"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="(00) 00000-0000"
                              className={`w-full px-3.5 py-2.5 bg-[#18181E] border rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none ${
                                shakePhone ? 'border-red-500' : 'border-[#27272A] focus:border-[#D4AF37]'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Address if delivery */}
                        {isDelivery && (
                          <div className="space-y-3 pt-3 border-t border-[#232328]">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Rua e Número</label>
                              <div className="grid grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  value={street}
                                  onChange={(e) => setStreet(e.target.value)}
                                  placeholder="Rua / Avenida"
                                  className={`col-span-2 px-3.5 py-2.5 bg-[#18181E] border rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none ${
                                    shakeStreet ? 'border-red-500' : 'border-[#27272A] focus:border-[#D4AF37]'
                                  }`}
                                />
                                <input
                                  type="text"
                                  value={number}
                                  onChange={(e) => setNumber(e.target.value)}
                                  placeholder="Nº"
                                  className={`px-3.5 py-2.5 bg-[#18181E] border rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none ${
                                    shakeNumber ? 'border-red-500' : 'border-[#27272A] focus:border-[#D4AF37]'
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Bairro de Entrega</label>
                              {settings.deliveryFeeType === 'custom' && settings.customDeliveryRates?.length ? (
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setIsNeighborhoodOpen(!isNeighborhoodOpen)}
                                    className={`w-full px-3.5 py-2.5 bg-[#18181E] border rounded-xl text-xs flex items-center justify-between text-left ${
                                      shakeNeighborhood ? 'border-red-500' : 'border-[#27272A] focus:border-[#D4AF37]'
                                    }`}
                                  >
                                    <span className={neighborhood ? 'text-white' : 'text-stone-500'}>
                                      {neighborhood || 'Selecione seu bairro...'}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-stone-400" />
                                  </button>
                                  {isNeighborhoodOpen && (
                                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#18181E] border border-[#27272A] shadow-xl rounded-xl p-1 max-h-48 overflow-y-auto">
                                      {settings.customDeliveryRates.map((r, i) => (
                                        <button
                                          key={i}
                                          type="button"
                                          onClick={() => {
                                            setNeighborhood(r.neighborhood);
                                            setIsNeighborhoodOpen(false);
                                          }}
                                          className="w-full text-left px-3 py-2 text-xs hover:bg-[#22222A] text-stone-200 rounded-lg flex items-center justify-between cursor-pointer"
                                        >
                                          <span>{r.neighborhood}</span>
                                          <span className="font-bold text-[#D4AF37]">R$ {r.fee.toFixed(2)}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  value={neighborhood}
                                  onChange={(e) => setNeighborhood(e.target.value)}
                                  placeholder="Digite seu bairro"
                                  className={`w-full px-3.5 py-2.5 bg-[#18181E] border rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none ${
                                    shakeNeighborhood ? 'border-red-500' : 'border-[#27272A] focus:border-[#D4AF37]'
                                  }`}
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {checkoutStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      className="space-y-5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 pb-1 border-b border-[#232328]">
                          <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-xs font-bold uppercase tracking-wider text-stone-200">Forma de Pagamento</span>
                        </div>

                        <div className="space-y-2">
                          {[
                            { id: 'pix', label: 'Pix', sub: 'Chave direta e aprovação rápida', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
                            { id: orderType === 'delivery' ? 'card_delivery' : 'card_pickup', label: 'Cartão de Crédito/Débito', sub: 'Pagar na maquininha', icon: <CreditCard className="w-4 h-4 text-[#D4AF37]" /> },
                            { id: 'cash', label: 'Dinheiro', sub: 'Com troco se necessário', icon: <span className="font-bold text-[11px] text-stone-300">R$</span> },
                          ].map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setPaymentMethod(p.id as any)}
                              className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                                paymentMethod === p.id
                                  ? 'bg-[#1E1E26] border-[#D4AF37] text-white shadow-sm'
                                  : 'bg-[#18181E] border-[#27272A] text-stone-300 hover:border-stone-600'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#22222A]">
                                  {p.icon}
                                </div>
                                <div className="text-left">
                                  <span className="text-xs font-bold block text-white">{p.label}</span>
                                  <span className="text-[10px] text-stone-400">{p.sub}</span>
                                </div>
                              </div>
                              {paymentMethod === p.id && <Check className="w-4 h-4 text-[#D4AF37]" />}
                            </button>
                          ))}
                        </div>

                        {/* Cash Info */}
                        {paymentMethod === 'cash' && (
                          <div className="p-3.5 bg-[#18181E] rounded-xl border border-[#27272A] space-y-3">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={noChangeNeeded}
                                onChange={(e) => setNoChangeNeeded(e.target.checked)}
                                className="w-4 h-4 rounded accent-[#D4AF37]"
                              />
                              <span className="text-xs font-semibold text-stone-200">Não preciso de troco</span>
                            </label>
                            {!noChangeNeeded && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase">Troco para quanto?</label>
                                <input
                                  type="number"
                                  value={cashAmount}
                                  onChange={(e) => {
                                    setCashAmount(e.target.value);
                                    setCashError('');
                                  }}
                                  placeholder="Ex: 100"
                                  className={`w-full px-3.5 py-2.5 bg-[#121215] border rounded-xl text-xs text-white focus:outline-none ${
                                    shakeCash ? 'border-red-500' : 'border-[#27272A] focus:border-[#D4AF37]'
                                  }`}
                                />
                                {cashError && <p className="text-xs text-red-400">{cashError}</p>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Observations */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-stone-400 uppercase">Observações (Opcional)</label>
                        <textarea
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          placeholder="Ex: Ponto de referência, observações para o atendente..."
                          rows={2}
                          className="w-full px-3.5 py-2 bg-[#18181E] border border-[#27272A] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Sticky Footer Summary */}
            {cart.length > 0 && (
              <div className="p-5 sm:p-6 bg-[#141417] border-t border-[#27272A] space-y-3.5">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-stone-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Desconto</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  {isDelivery && deliveryFee > 0 && (
                    <div className="flex justify-between text-stone-400">
                      <span>Taxa de Entrega</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-[#232328]">
                    <span>Total</span>
                    <span className="text-[#D4AF37]">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {checkoutStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCheckoutStep((prev) => (prev - 1) as any)}
                      className="flex-1 py-3 bg-[#1C1C22] hover:bg-stone-800 text-stone-200 border border-[#2B2B33] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar</span>
                    </button>
                  )}
                  
                  {checkoutStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (checkoutStep === 2) {
                          let hasError = false;
                          if (!customerName.trim()) { setShakeName(true); hasError = true; }
                          if (!customerPhone.trim()) { setShakePhone(true); hasError = true; }
                          if (isDelivery && !street.trim()) { setShakeStreet(true); hasError = true; }
                          if (isDelivery && !number.trim()) { setShakeNumber(true); hasError = true; }
                          if (isDelivery && !neighborhood.trim()) { setShakeNeighborhood(true); hasError = true; }
                          
                          if (hasError) {
                            setTimeout(() => {
                              setShakeName(false); setShakePhone(false); setShakeStreet(false); setShakeNumber(false); setShakeNeighborhood(false);
                            }, 500);
                            return;
                          }
                        }
                        setCheckoutStep((prev) => (prev + 1) as any);
                      }}
                      className="flex-[2] py-3 bg-[#D4AF37] hover:bg-[#C5A059] text-stone-950 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Avançar</span>
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="flex-[2] py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Enviar Pedido no WhatsApp</span>
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-center text-stone-500">
                  Ao clicar, a lista formatada com as peças será enviada direto no WhatsApp da loja.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
