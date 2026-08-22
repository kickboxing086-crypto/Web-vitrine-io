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
  MapPin,
  User,
  Phone,
  Clock,
  ArrowLeft,
  ChevronDown,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { checkStoreHoursStatus } from '../lib/themeUtils';

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
  // Order details
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>(
    settings.deliveryMode === 'pickup' ? 'pickup' : 'delivery'
  );
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cep, setCep] = useState('');
  const [isLoadingCep, setIsLoadingCep] = useState(false);
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
  const [shakeNumber, setShakeNumber] = useState(false);
  const [shakeNeighborhood, setShakeNeighborhood] = useState(false);

  // CEP Lookup
  const handleCepSearch = async (cepVal: string) => {
    const clean = cepVal.replace(/\D/g, '');
    if (clean.length === 8) {
      setIsLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          if (data.logradouro) setStreet(data.logradouro);
          if (data.bairro) setNeighborhood(data.bairro);
          if (data.localidade) setCity(data.localidade);
          if (data.uf) setAddressState(data.uf);
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

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

  // Delivery fee calculation with custom rate support
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
        const matchNeigh = neighborhood && r.neighborhood.toLowerCase().trim() === neighborhood.toLowerCase().trim();
        const matchCity = !city || !r.city || r.city.toLowerCase().trim() === city.toLowerCase().trim();
        const matchState = !addressState || !r.state || r.state.toLowerCase().trim() === addressState.toLowerCase().trim();
        return matchNeigh && matchCity && matchState;
      }) || settings.customDeliveryRates.find((r) => 
        neighborhood && r.neighborhood.toLowerCase().trim() === neighborhood.toLowerCase().trim()
      );
      deliveryFee = matchedRate ? matchedRate.fee : settings.deliveryFee || 0;
    } else {
      deliveryFee = settings.deliveryFee || 0;
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyCoupon = () => {
    setCouponError('');
    const found = coupons.find(
      (c) => c.code.toUpperCase() === couponInput.trim().toUpperCase() && c.isActive
    );
    if (!found) {
      setCouponError('Cupom inválido ou expirado.');
      setAppliedCoupon(null);
      return;
    }
    if (found.maxUses !== undefined && found.maxUses > 0 && (found.usageCount || 0) >= found.maxUses) {
      setCouponError('Este cupom esgotou o limite máximo de utilizações.');
      setAppliedCoupon(null);
      return;
    }
    if (found.minOrderValue && subtotal < found.minOrderValue) {
      setCouponError(`Válido apenas para compras acima de ${formatCurrency(found.minOrderValue)}`);
      setAppliedCoupon(null);
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
      
      // Auto-scroll to first error
      const firstError = !customerName.trim() ? 'input-name' : 'input-phone';
      document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
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
      
      // Scroll to delivery section
      document.getElementById('delivery-section-header')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

    // Save to order history
    onOrderCreated(newOrder);

    // If coupon was applied, increment usage count
    if (appliedCoupon && onSaveCoupon) {
      onSaveCoupon({
        ...appliedCoupon,
        usageCount: (appliedCoupon.usageCount || 0) + 1,
      });
    }

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Generate WhatsApp link and redirect
    const encodedMsg = generateWhatsappOrderMessage(newOrder, settings);
    const storePhone = cleanPhoneForWhatsapp(settings.phoneWhatsapp);
    window.open(`https://wa.me/${storePhone}?text=${encodedMsg}`, '_blank');

    onClearCart();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Snappy fast overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          onClick={onClose}
        />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', ease: 'easeOut', duration: 0.15 }}
          className="absolute inset-y-0 right-0 max-w-full flex pl-6 z-10"
        >
          <div className="w-screen max-w-lg bg-brand-bg border-l border-brand-border shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-white border-b border-brand-border flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-brand-bg text-brand-primary-dark rounded-xl border border-[#E8DACB]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif-luxury font-semibold text-stone-900">
                    Sua Sacola de Pedidos
                  </h2>
                  <span className="text-xs text-stone-500">
                    {cart.reduce((acc, i) => acc + i.quantity, 0)} {cart.length === 1 ? 'item' : 'itens'} selecionados
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  id="btn-cart-header-continue-shopping"
                  title="Continuar Comprando no Catálogo"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Continuar Comprando</span>
                  <span className="sm:hidden">Comprar +</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                  id="btn-close-cart"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar (Only if cart not empty) */}
            {cart.length > 0 && (
              <div className="px-6 sm:px-10 py-3 bg-stone-50/50 border-b border-stone-100 flex items-center justify-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                        checkoutStep === step 
                          ? 'bg-stone-900 text-white shadow-md scale-110' 
                          : checkoutStep > step 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {checkoutStep > step ? '✓' : (step as number)}
                    </div>
                    {step < 3 && <div className={`w-8 h-0.5 rounded-full ${checkoutStep > step ? 'bg-emerald-500' : 'bg-stone-200'}`} />}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 mx-auto bg-brand-bg-alt rounded-full flex items-center justify-center text-stone-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif-luxury text-lg text-stone-800 font-medium">
                    Sua sacola está vazia
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Explore nossas peças exclusivas no catálogo e adicione suas roupas favoritas.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex items-center space-x-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer transition-all"
                    id="btn-empty-cart-continue-shopping"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Continuar Comprando</span>
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {checkoutStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      {/* Step 1: Items List */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-[11px] text-stone-500 pb-1.5 border-b border-stone-100">
                          <span className="font-bold uppercase tracking-widest text-stone-900 flex items-center gap-2">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Sua Seleção ({cart.length})
                          </span>
                          <button
                            onClick={onClearCart}
                            className="text-stone-400 hover:text-red-600 transition-colors font-semibold"
                          >
                            Remover Tudo
                          </button>
                        </div>

                        {cart.map((item, index) => {
                          const itemPrice = item.product.isOnSale && item.product.promotionalPrice
                            ? item.product.promotionalPrice
                            : item.product.price;
                          return (
                            <div
                              key={`${item.product.id}-${index}`}
                              className="flex gap-4 p-4 bg-white rounded-2xl border border-brand-border shadow-sm hover:shadow-md transition-all group"
                            >
                              <div className="w-16 h-20 sm:w-20 sm:h-28 rounded-xl overflow-hidden bg-brand-bg border border-brand-border/40 shrink-0">
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>

                              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                <div>
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate pr-2">
                                      {item.product.name}
                                    </h4>
                                    <button
                                      onClick={() => onRemoveItem(index)}
                                      className="p-1 text-stone-300 hover:text-red-500 transition-colors shrink-0"
                                      title="Remover item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    <span className="inline-flex items-center px-1.5 py-0.5 bg-stone-50 border border-stone-100 rounded text-[9px] font-bold text-stone-500 uppercase tracking-wider">
                                      {item.selectedSize}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-stone-50 border border-stone-100 rounded text-[9px] font-bold text-stone-500 uppercase tracking-wider">
                                      <span
                                        className="w-2 h-2 rounded-full border border-black/10"
                                        style={{ backgroundColor: item.selectedColor.hex }}
                                      />
                                      {item.selectedColor.name}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                  <span className="text-sm font-bold text-stone-900">
                                    {formatCurrency(itemPrice * item.quantity)}
                                  </span>

                                  <div className="flex items-center border border-brand-border rounded-lg bg-brand-bg p-0.5 shadow-2xs">
                                    <button
                                      onClick={() => onUpdateQuantity(index, -1)}
                                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-white text-stone-400 hover:text-stone-900 transition-colors"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-6 text-center text-[10px] font-bold text-stone-800">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => onUpdateQuantity(index, 1)}
                                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-white text-stone-400 hover:text-stone-900 transition-colors"
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
                          className="w-full py-3 px-4 border border-dashed border-stone-300 hover:border-brand-primary-dark rounded-xl text-[10px] font-bold text-stone-600 hover:text-stone-900 bg-white/50 hover:bg-white flex items-center justify-center space-x-2 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar mais itens</span>
                        </button>
                      </div>

                      {/* Coupon Area */}
                      <div className="p-4 bg-white rounded-2xl border border-brand-border">
                        <div className="flex items-center space-x-2 mb-3">
                          <Tag className="w-3.5 h-3.5 text-brand-primary-dark" />
                          <span className="text-xs font-bold text-stone-800 uppercase tracking-tight">Cupom de Desconto</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="CÓDIGO"
                            className="flex-1 px-3 py-2 bg-brand-bg border border-brand-border-dark rounded-xl text-xs uppercase font-mono font-semibold text-stone-900 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
                          >
                            Aplicar
                          </button>
                        </div>
                        {appliedCoupon && (
                          <div className="flex items-center justify-between text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg mt-2 font-bold">
                            <span>✓ CUPOM {appliedCoupon.code} ATIVADO</span>
                            <button onClick={() => setAppliedCoupon(null)} className="text-emerald-500">✕</button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {checkoutStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      {/* Step 2: Delivery Option */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 pb-1 border-b border-stone-100">
                          <Truck className="w-4 h-4 text-brand-primary-dark" />
                          <span className="text-xs font-bold uppercase tracking-widest text-stone-900">Entrega ou Retirada</span>
                        </div>

                        {settings.deliveryMode === 'both' ? (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setOrderType('delivery')}
                              className={`p-4 rounded-2xl border text-left flex flex-col space-y-1 transition-all ${
                                orderType === 'delivery'
                                  ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                                  : 'bg-white border-brand-border text-stone-600 hover:border-stone-400'
                              }`}
                            >
                              <span className="text-xs font-bold">Receber</span>
                              <span className={`text-[10px] ${orderType === 'delivery' ? 'text-white/60' : 'text-stone-400'}`}>Entrega rápida</span>
                            </button>
                            <button
                              onClick={() => setOrderType('pickup')}
                              className={`p-4 rounded-2xl border text-left flex flex-col space-y-1 transition-all ${
                                orderType === 'pickup'
                                  ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                                  : 'bg-white border-brand-border text-stone-600 hover:border-stone-400'
                              }`}
                            >
                              <span className="text-xs font-bold">Retirar</span>
                              <span className={`text-[10px] ${orderType === 'pickup' ? 'text-white/60' : 'text-stone-400'}`}>Na nossa loja</span>
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 bg-stone-100 rounded-2xl text-xs font-bold text-stone-700 flex items-center gap-3">
                            {settings.deliveryMode === 'pickup' ? <Building2 className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                            <span>{settings.deliveryMode === 'pickup' ? 'Somente Retirada na Loja' : 'Somente Entrega via Motoboy/Envio'}</span>
                          </div>
                        )}
                      </div>

                      {/* Customer Info Form */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 pb-1 border-b border-stone-100">
                          <User className="w-4 h-4 text-brand-primary-dark" />
                          <span className="text-xs font-bold uppercase tracking-widest text-stone-900">Seus Dados</span>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-1">Nome Completo</label>
                            <motion.input
                              animate={shakeName ? { x: [-5, 5, -5, 5, 0] } : {}}
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Como quer ser chamado?"
                              className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-all ${
                                shakeName ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border-dark focus:ring-brand-primary-dark'
                              }`}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-1">Seu WhatsApp</label>
                            <motion.input
                              animate={shakePhone ? { x: [-5, 5, -5, 5, 0] } : {}}
                              type="text"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="(00) 00000-0000"
                              className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-all ${
                                shakePhone ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border-dark focus:ring-brand-primary-dark'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Address if delivery */}
                        {isDelivery && (
                          <div className="space-y-4 pt-4 border-t border-stone-50">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-1">Endereço de Entrega</label>
                              <div className="grid grid-cols-3 gap-2">
                                <motion.input
                                  animate={shakeStreet ? { x: [-5, 5, -5, 5, 0] } : {}}
                                  type="text"
                                  value={street}
                                  onChange={(e) => setStreet(e.target.value)}
                                  placeholder="Rua / Logradouro"
                                  className={`col-span-2 px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none ${
                                    shakeStreet ? 'border-red-500' : 'border-brand-border-dark'
                                  }`}
                                />
                                <motion.input
                                  animate={shakeNumber ? { x: [-5, 5, -5, 5, 0] } : {}}
                                  type="text"
                                  value={number}
                                  onChange={(e) => setNumber(e.target.value)}
                                  placeholder="Nº"
                                  className={`px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none ${
                                    shakeNumber ? 'border-red-500' : 'border-brand-border-dark'
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-1">Bairro de Entrega</label>
                              {settings.deliveryFeeType === 'custom' && settings.customDeliveryRates?.length ? (
                                <div className="relative">
                                  <motion.button
                                    animate={shakeNeighborhood ? { x: [-5, 5, -5, 5, 0] } : {}}
                                    onClick={() => setIsNeighborhoodOpen(!isNeighborhoodOpen)}
                                    className={`w-full px-4 py-3 bg-white border rounded-xl text-sm flex items-center justify-between ${
                                      shakeNeighborhood ? 'border-red-500' : 'border-brand-border-dark'
                                    }`}
                                  >
                                    <span className={neighborhood ? 'text-stone-900' : 'text-stone-400'}>
                                      {neighborhood || 'Escolha o bairro...'}
                                    </span>
                                    <ChevronDown className="w-4 h-4 opacity-50" />
                                  </motion.button>
                                  <AnimatePresence>
                                    {isNeighborhoodOpen && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-brand-border-dark shadow-xl rounded-xl p-1 max-h-48 overflow-y-auto"
                                      >
                                        {settings.customDeliveryRates.map((r, i) => (
                                          <button
                                            key={i}
                                            onClick={() => {
                                              setNeighborhood(r.neighborhood);
                                              setIsNeighborhoodOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 rounded-lg flex items-center justify-between"
                                          >
                                            <span>{r.neighborhood}</span>
                                            <span className="font-bold text-brand-primary-dark">R$ {r.fee.toFixed(2)}</span>
                                          </button>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ) : (
                                <motion.input
                                  animate={shakeNeighborhood ? { x: [-5, 5, -5, 5, 0] } : {}}
                                  type="text"
                                  value={neighborhood}
                                  onChange={(e) => setNeighborhood(e.target.value)}
                                  placeholder="Digite seu bairro"
                                  className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none ${
                                    shakeNeighborhood ? 'border-red-500' : 'border-brand-border-dark'
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
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      {/* Step 3: Payment Method */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 pb-1 border-b border-stone-100">
                          <CreditCard className="w-4 h-4 text-brand-primary-dark" />
                          <span className="text-xs font-bold uppercase tracking-widest text-stone-900">Forma de Pagamento</span>
                        </div>

                        <div className="space-y-2">
                          {[
                            { id: 'pix', label: 'Pix', sub: 'Instantâneo', icon: <CheckCircle2 className="w-4 h-4" /> },
                            { id: orderType === 'delivery' ? 'card_delivery' : 'card_pickup', label: 'Cartão', sub: 'Pagar na entrega', icon: <CreditCard className="w-4 h-4" /> },
                            { id: 'cash', label: 'Dinheiro', sub: 'Com troco se precisar', icon: <span className="font-bold text-[10px]">R$</span> },
                          ].map((p) => (
                            <button
                              key={p.id}
                              onClick={() => setPaymentMethod(p.id as any)}
                              className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                                paymentMethod === p.id
                                  ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                                  : 'bg-white border-brand-border text-stone-600 hover:border-stone-400'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${paymentMethod === p.id ? 'bg-white/10 text-white' : 'bg-stone-50 text-stone-400'}`}>
                                  {p.icon}
                                </div>
                                <div className="text-left">
                                  <span className="text-xs font-bold block">{p.label}</span>
                                  <span className={`text-[10px] ${paymentMethod === p.id ? 'text-white/50' : 'text-stone-400'}`}>{p.sub}</span>
                                </div>
                              </div>
                              {paymentMethod === p.id && <Check className="w-4 h-4 text-brand-primary" />}
                            </button>
                          ))}
                        </div>

                        {/* Cash Info */}
                        {paymentMethod === 'cash' && (
                          <div className="p-4 bg-brand-bg rounded-2xl border border-brand-border-dark space-y-3">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={noChangeNeeded}
                                onChange={(e) => setNoChangeNeeded(e.target.checked)}
                                className="w-4 h-4 rounded text-stone-900"
                              />
                              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-tight">Não preciso de troco</span>
                            </label>
                            {!noChangeNeeded && (
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-stone-400 uppercase">Troco para quanto?</label>
                                <input
                                  type="number"
                                  value={cashAmount}
                                  onChange={(e) => setCashAmount(e.target.value)}
                                  placeholder="R$ 100,00"
                                  className="w-full px-4 py-3 bg-white border border-brand-border-dark rounded-xl text-sm font-bold focus:outline-none"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Observations */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Observações do Pedido</label>
                        <textarea
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          placeholder="Ex: Deixar na portaria, campainha com defeito..."
                          rows={2}
                          className="w-full px-4 py-3 bg-white border border-brand-border-dark rounded-xl text-xs text-stone-900 focus:outline-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Sticky Footer Summary */}
            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-brand-border space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Desconto</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  {isDelivery && deliveryFee > 0 && (
                    <div className="flex justify-between text-stone-500">
                      <span>Taxa de Entrega</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-stone-900 pt-1 border-t border-stone-50">
                    <span>Total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {checkoutStep > 1 && (
                    <button
                      onClick={() => setCheckoutStep((prev) => (prev - 1) as any)}
                      className="flex-1 py-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar</span>
                    </button>
                  )}
                  
                  {checkoutStep < 3 ? (
                    <button
                      onClick={() => {
                        // Minimal validation before moving to step 3
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
                      className="flex-[2] py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-[11px] font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>Continuar</span>
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  ) : (
                    <button
                      onClick={handleCheckout}
                      className="flex-[2] py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl text-[11px] font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Finalizar no WhatsApp</span>
                    </button>
                  )}
                </div>

                <p className="text-[9px] text-center text-stone-400 font-medium">
                  Atendimento via WhatsApp: {settings.openingTime || '08:00'} - {settings.closingTime || '18:00'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
