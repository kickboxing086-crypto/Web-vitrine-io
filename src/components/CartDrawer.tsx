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
  const [shakeWhatsapp, setShakeWhatsapp] = useState(false);


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
      if (!customerPhone.trim()) {
        setShakeWhatsapp(true);
        setTimeout(() => setShakeWhatsapp(false), 500);
      }
      alert('Por favor, informe seu Nome e WhatsApp de contato.');
      return;
    }

    if (isDelivery && (!street.trim() || !number.trim() || !neighborhood.trim())) {
      alert('Por favor, informe seu endereço completo de entrega (Rua, Número e Bairro).');
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
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
                <>
                  {/* Items List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[11px] text-stone-500 pb-1.5 border-b border-stone-100">
                      <span className="font-bold uppercase tracking-widest text-stone-900">
                        Sua Seleção
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
                          className="flex gap-4 p-5 bg-white rounded-3xl border border-brand-border shadow-sm hover:shadow-md transition-all group"
                        >
                          <div className="w-20 h-24 sm:w-24 sm:h-32 rounded-2xl overflow-hidden bg-brand-bg border border-brand-border/40 shrink-0">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-sm font-bold text-stone-900 truncate pr-2">
                                  {item.product.name}
                                </h4>
                                <button
                                  onClick={() => onRemoveItem(index)}
                                  className="p-1 text-stone-300 hover:text-red-500 transition-colors shrink-0"
                                  title="Remover item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="inline-flex items-center px-2 py-0.5 bg-stone-50 border border-stone-100 rounded-lg text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                                  TAM: {item.selectedSize}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-stone-50 border border-stone-100 rounded-lg text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/10"
                                    style={{ backgroundColor: item.selectedColor.hex }}
                                  />
                                  {item.selectedColor.name}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <span className="text-base font-bold text-stone-900">
                                {formatCurrency(itemPrice * item.quantity)}
                              </span>

                              {/* Quantity Controls */}
                              <div className="flex items-center border border-brand-border rounded-xl bg-brand-bg p-1 shadow-2xs">
                                <button
                                  onClick={() => onUpdateQuantity(index, -1)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-stone-400 hover:text-stone-900 transition-colors"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-8 text-center text-xs font-bold text-stone-800">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(index, 1)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-stone-400 hover:text-stone-900 transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Quick action to continue browsing catalog */}
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-3.5 px-4 border border-dashed border-stone-300 hover:border-brand-primary-dark rounded-2xl text-xs font-bold text-stone-600 hover:text-stone-900 bg-white/80 hover:bg-white flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs"
                      id="btn-cart-items-add-more"
                    >
                      <ShoppingBag className="w-4 h-4 text-brand-primary-dark" />
                      <span>Adicionar mais peças ao pedido</span>
                    </button>
                  </div>

                  {/* Coupon Area */}
                  <div className="p-3.5 bg-white rounded-2xl border border-brand-border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Tag className="w-4 h-4 text-brand-primary-dark" />
                      <span className="text-xs font-bold text-stone-800">Possui cupom de desconto?</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Ex: ELEGANCE10"
                        className="flex-1 px-3 py-1.5 bg-brand-bg border border-brand-border-dark rounded-xl text-xs uppercase font-mono font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
                      >
                        Aplicar
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-red-600 mt-1.5">{couponError}</p>}
                    {appliedCoupon && (
                      <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg mt-2">
                        <span>
                          Cupom <strong>{appliedCoupon.code}</strong> aplicado (-
                          {appliedCoupon.discountType === 'percentage'
                            ? `${appliedCoupon.discountValue}%`
                            : formatCurrency(appliedCoupon.discountValue)}
                          )
                        </span>
                        <button
                          onClick={() => setAppliedCoupon(null)}
                          className="text-stone-400 hover:text-red-500 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Order Mode (Retirada vs Entrega) */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                      Opção de Entrega / Retirada
                    </span>

                    {settings.deliveryMode === 'both' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          onClick={() => setOrderType('delivery')}
                          className={`p-3 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                            orderType === 'delivery'
                              ? 'bg-brand-bg-alt border-brand-primary-dark ring-1 ring-brand-primary-dark text-stone-900'
                              : 'bg-white border-brand-border text-stone-600 hover:border-stone-400'
                          }`}
                        >
                          <Truck className="w-4 h-4 text-brand-primary-dark" />
                          <div>
                            <span className="text-xs font-bold block">Entrega</span>
                            <span className="text-[10px] text-stone-500">No seu endereço</span>
                          </div>
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          onClick={() => setOrderType('pickup')}
                          className={`p-3 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                            orderType === 'pickup'
                              ? 'bg-brand-bg-alt border-brand-primary-dark ring-1 ring-brand-primary-dark text-stone-900'
                              : 'bg-white border-brand-border text-stone-600 hover:border-stone-400'
                          }`}
                        >
                          <Building2 className="w-4 h-4 text-brand-primary-dark" />
                          <div>
                            <span className="text-xs font-bold block">Retirada</span>
                            <span className="text-[10px] text-stone-500">Na loja física</span>
                          </div>
                        </motion.button>
                      </div>
                    ) : settings.deliveryMode === 'pickup' ? (
                      <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-xs text-stone-700 flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-stone-600 flex-shrink-0" />
                        <div>
                          <strong>Retirada na Loja Física:</strong> {settings.address || 'Consulte nosso endereço'}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-xs text-stone-700 flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-stone-600 flex-shrink-0" />
                        <div>
                          <strong>Entrega no seu Endereço:</strong> Enviaremos com todo cuidado.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Customer Information Form */}
                  <div className="space-y-8 p-6 sm:p-10 bg-white rounded-3xl border border-brand-border shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-widest text-stone-900 flex items-center space-x-2.5 pb-2 border-b border-stone-50">
                      <div className="p-1.5 bg-brand-bg rounded-lg border border-[#E8DACB]">
                        <User className="w-4 h-4 text-brand-primary-dark" />
                      </div>
                      <span>Informações de Entrega</span>
                    </span>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase ml-1 tracking-wider">Nome Completo</label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Digite seu nome..."
                          className="w-full px-5 py-4 bg-brand-bg border border-brand-border-dark rounded-2xl text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark transition-all shadow-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase ml-1 tracking-wider">WhatsApp de Contato</label>
                        <motion.div
                          animate={shakeWhatsapp ? { 
                            x: [-6, 6, -6, 6, -3, 3, 0],
                            scale: [1, 1.02, 1],
                            boxShadow: ["0 0 0 0px rgba(239, 68, 68, 0)", "0 0 0 4px rgba(239, 68, 68, 0.2)", "0 0 0 0px rgba(239, 68, 68, 0)"]
                          } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <input
                            type="text"
                            required
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="(00) 00000-0000"
                            className={`w-full px-5 py-4 bg-brand-bg border rounded-2xl text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-1 transition-all shadow-xs ${
                              shakeWhatsapp ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border-dark focus:ring-brand-primary-dark'
                            }`}
                          />
                        </motion.div>
                      </div>

                      {/* Delivery Address Fields */}
                      {isDelivery && (
                        <div className="space-y-6 pt-6 border-t border-stone-50">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-stone-800 uppercase tracking-tight flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-brand-primary-dark" /> 
                              Endereço para Entrega
                            </span>
                          </div>

                          {/* CEP Field */}
                          <div className="relative space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase ml-1 tracking-wider">CEP (opcional)</label>
                            <input
                              type="text"
                              value={cep}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCep(val);
                                handleCepSearch(val);
                              }}
                              placeholder="00000-000"
                              maxLength={9}
                              className="w-full px-5 py-4 bg-brand-bg border border-brand-border-dark rounded-2xl text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark shadow-xs"
                            />
                            {isLoadingCep && (
                              <span className="absolute right-5 bottom-4 text-[10px] text-brand-primary-dark font-bold animate-pulse">
                                BUSCANDO...
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-400 uppercase ml-1 tracking-wider">Rua / Avenida</label>
                              <input
                                type="text"
                                required
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                placeholder="Nome da rua..."
                                className="w-full px-5 py-4 bg-brand-bg border border-brand-border-dark rounded-2xl text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark shadow-xs"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-stone-400 uppercase ml-1 tracking-wider">Número</label>
                              <input
                                type="text"
                                required
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                placeholder="S/N ou Nº"
                                className="w-full px-5 py-4 bg-brand-bg border border-brand-border-dark rounded-2xl text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark shadow-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-6">
                            {settings.deliveryFeeType === 'custom' &&
                            settings.customDeliveryRates &&
                            settings.customDeliveryRates.length > 0 ? (
                              <div className="relative space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase ml-1 tracking-wider">Bairro de Entrega</label>
                                <button
                                  type="button"
                                  onClick={() => setIsNeighborhoodOpen(!isNeighborhoodOpen)}
                                  className="w-full px-5 py-4 bg-brand-bg border border-brand-border-dark rounded-2xl text-sm text-stone-900 focus:outline-none flex items-center justify-between hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xs"
                                  id="select-neighborhood-btn"
                                >
                                  <span className="truncate">
                                    {neighborhood ? (
                                      <>
                                        {neighborhood}
                                        {(() => {
                                          const rate = settings.customDeliveryRates?.find(r => r.neighborhood === neighborhood);
                                          return rate ? ` (Taxa: R$ ${rate.fee.toFixed(2)})` : '';
                                        })()}
                                      </>
                                    ) : (
                                      'Selecione seu bairro...'
                                    )}
                                  </span>
                                  <ChevronDown className="w-4 h-4 opacity-70 shrink-0" />
                                </button>

                                <AnimatePresence>
                                  {isNeighborhoodOpen && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsNeighborhoodOpen(false)}
                                      />
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                        transition={{ duration: 0.12, ease: "easeOut" }}
                                        className="absolute left-0 right-0 bottom-full mb-2 max-h-60 overflow-y-auto bg-stone-900 border border-brand-border-dark shadow-xl rounded-2xl p-2 z-50 space-y-1"
                                      >
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setNeighborhood('');
                                            setIsNeighborhoodOpen(false);
                                          }}
                                          className={`w-full text-left px-4 py-2.5 text-xs rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                                            !neighborhood
                                              ? 'bg-stone-800 text-brand-primary font-bold shadow-xs'
                                              : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
                                          }`}
                                        >
                                          <span>Selecione o Bairro *</span>
                                          {!neighborhood && (
                                            <Check className="w-4 h-4 text-brand-primary" />
                                          )}
                                        </button>

                                        {settings.customDeliveryRates.map((r, idx) => {
                                          const isSelected = neighborhood === r.neighborhood;
                                          return (
                                            <button
                                              key={`rate-${idx}`}
                                              type="button"
                                              onClick={() => {
                                                setNeighborhood(r.neighborhood);
                                                if (r.city) setCity(r.city);
                                                if (r.state) setAddressState(r.state);
                                                setIsNeighborhoodOpen(false);
                                              }}
                                              className={`w-full text-left px-4 py-2.5 text-xs rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                                                isSelected
                                                  ? 'bg-stone-800 text-brand-primary font-bold shadow-xs'
                                                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
                                              }`}
                                            >
                                              <span className="truncate">
                                                {r.neighborhood} - {r.city}/{r.state || 'SP'} (R$ {r.fee.toFixed(2)})
                                              </span>
                                              {isSelected && (
                                                <Check className="w-4 h-4 text-brand-primary" />
                                              )}
                                            </button>
                                          );
                                        })}

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setNeighborhood('Outro');
                                            setIsNeighborhoodOpen(false);
                                          }}
                                          className={`w-full text-left px-4 py-2.5 text-xs rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                                            neighborhood === 'Outro'
                                              ? 'bg-stone-800 text-brand-primary font-bold shadow-xs'
                                              : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
                                          }`}
                                        >
                                          <span>Outro Bairro</span>
                                          {neighborhood === 'Outro' && (
                                            <Check className="w-4 h-4 text-brand-primary" />
                                          )}
                                        </button>
                                      </motion.div>
                                    </>
                                  )}
                                </AnimatePresence>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase ml-1 tracking-wider">Bairro</label>
                                <input
                                  type="text"
                                  required
                                  value={neighborhood}
                                  onChange={(e) => setNeighborhood(e.target.value)}
                                  placeholder="Digite seu bairro..."
                                  className="w-full px-5 py-4 bg-brand-bg border border-brand-border-dark rounded-2xl text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark shadow-xs"
                                />
                              </div>
                            )}

                            <div className="grid grid-cols-1 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase ml-1 tracking-wider">Cidade</label>
                                <input
                                  type="text"
                                  required
                                  value={city}
                                  onChange={(e) => setCity(e.target.value)}
                                  className="w-full px-5 py-4 bg-brand-bg border border-brand-border-dark rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark shadow-xs"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase ml-1 tracking-wider">UF</label>
                                <input
                                  type="text"
                                  required
                                  maxLength={2}
                                  value={addressState}
                                  onChange={(e) => setAddressState(e.target.value.toUpperCase())}
                                  className="w-full px-5 py-4 bg-brand-bg border border-brand-border-dark rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark uppercase shadow-xs"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase ml-1 tracking-wider">Complemento</label>
                            <input
                              type="text"
                              value={complement}
                              onChange={(e) => setComplement(e.target.value)}
                              placeholder="Apto, Bloco, Casa..."
                              className="w-full px-5 py-4 bg-brand-bg border border-brand-border-dark rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark shadow-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Method Option */}
                    <div className="pt-6 border-t border-stone-100">
                      <label className="block text-xs font-bold uppercase tracking-widest text-stone-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-brand-primary-dark" />
                        Forma de Pagamento
                      </label>
                      
                      <div className="space-y-3">
                        {[
                          { id: 'pix', label: 'Pix (Pagamento Instantâneo)', icon: <CheckCircle2 className="w-4 h-4" />, detail: 'Chave Pix será exibida após selecionar' },
                          {
                            id: isDelivery ? 'card_delivery' : 'card_pickup',
                            label: isDelivery ? 'Cartão de Débito ou Crédito (Na Entrega)' : 'Cartão de Débito ou Crédito (Na Retirada)',
                            icon: <CreditCard className="w-4 h-4" />,
                            detail: 'Levaremos a maquininha até você'
                          },
                          { id: 'cash', label: 'Dinheiro (Pagamento na Entrega)', icon: <div className="font-bold text-xs">R$</div>, detail: 'Informe se precisará de troco abaixo' },
                        ].map((p) => (
                          <motion.button
                            key={p.id}
                            type="button"
                            onClick={() => setPaymentMethod(p.id as any)}
                            className={`w-full py-4 px-5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer group ${
                              paymentMethod === p.id
                                ? 'bg-stone-900 text-white border-stone-900 shadow-lg ring-2 ring-stone-900/10'
                                : 'bg-white border-brand-border text-stone-700 hover:border-stone-400 hover:bg-stone-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-2.5 rounded-xl transition-colors ${paymentMethod === p.id ? 'bg-white/15 text-white' : 'bg-brand-bg text-stone-500 group-hover:text-stone-700'}`}>
                                {p.icon}
                              </div>
                              <div className="text-left">
                                <span className="text-xs font-bold block">{p.label}</span>
                                <span className={`text-[10px] block mt-0.5 ${paymentMethod === p.id ? 'text-white/60' : 'text-stone-400'}`}>
                                  {p.detail}
                                </span>
                              </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              paymentMethod === p.id ? 'bg-brand-primary border-brand-primary scale-110 shadow-sm' : 'border-stone-200 group-hover:border-stone-300'
                            }`}>
                              {paymentMethod === p.id && <Check className="w-4 h-4 text-stone-900" strokeWidth={3} />}
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {(paymentMethod === 'card_delivery' || paymentMethod === 'card_pickup') && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 bg-brand-bg rounded-2xl border border-brand-border-dark space-y-3"
                        >
                          <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-2">
                            Tipo de Cartão
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['credit', 'debit'] as const).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setCardType(type)}
                                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                  cardType === type
                                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                                    : 'bg-white border-brand-border text-stone-600 hover:border-stone-400'
                                }`}
                              >
                                {type === 'credit' ? 'Crédito' : 'Débito'}
                                {cardType === type && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {paymentMethod === 'cash' && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-5 bg-brand-bg rounded-2xl border border-brand-border-dark space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                              Informações para Troco
                            </label>
                            <label className="flex items-center space-x-2.5 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={noChangeNeeded}
                                onChange={(e) => setNoChangeNeeded(e.target.checked)}
                                className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-stone-600 group-hover:text-stone-900 transition-colors">Não preciso de troco</span>
                            </label>
                          </div>
                          
                          {!noChangeNeeded && (
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-sm">
                                R$
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="Vou pagar com..."
                                value={cashAmount}
                                onChange={(e) => setCashAmount(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-brand-border-dark rounded-xl text-sm text-stone-900 font-bold focus:ring-1 focus:ring-stone-900 focus:outline-none shadow-sm"
                              />
                              {parseFloat(cashAmount) > finalTotal && (
                                <div className="flex items-center gap-2 mt-2 ml-1 text-emerald-600">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <p className="text-[11px] font-bold uppercase tracking-tight">
                                    Seu troco: {formatCurrency(parseFloat(cashAmount) - finalTotal)}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {paymentMethod === 'pix' && settings.pixKey && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 flex items-center justify-between"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold uppercase text-[9px] tracking-widest text-emerald-600 mb-0.5">Chave Pix</span>
                            <strong className="text-xs font-mono">{settings.pixKey}</strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-emerald-200 px-2 py-1 rounded-lg font-bold text-emerald-800">PIX ATIVO</span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Customer Notes */}
                    <div className="pt-4 space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Observações Adicionais</label>
                      <textarea
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="Ex: Tocar campainha, deixar na portaria..."
                        rows={2}
                        className="w-full px-4 py-3 bg-brand-bg border border-brand-border-dark rounded-2xl text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark transition-all resize-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Summary & Action */}
            {cart.length > 0 && (
              <div className="p-5 sm:p-6 bg-white border-t border-brand-border space-y-4">
                {/* Financial Summary */}
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Desconto ({appliedCoupon?.code}):</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  {isDelivery && (
                    <div className="flex justify-between">
                      <span>Taxa de Entrega:</span>
                      <span>
                        {deliveryFee === 0 ? (
                          <span className="text-emerald-700 font-bold">Grátis</span>
                        ) : (
                          formatCurrency(deliveryFee)
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-100">
                    <span>Total do Pedido:</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                {/* Operating hours context banner */}
                {(() => {
                  const hoursStatus = checkStoreHoursStatus(settings);
                  if (hoursStatus.isBreakNow) {
                    return (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-start space-x-2 text-amber-900">
                        <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-bold block">Loja em Intervalo de Almoço</span>
                          <span className="text-[11px] opacity-90 block mt-0.5 leading-tight">
                            {settings.acceptOrdersDuringBreak ?? true
                              ? 'Você pode enviar o pedido agora! Nossa equipe atenderá na volta do intervalo.'
                              : 'Atendimento temporariamente pausado. Retornamos em breve!'}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (!hoursStatus.isOpenNow) {
                    if (hoursStatus.acceptsOrdersNow) {
                      return (
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs flex items-start space-x-2 text-stone-800">
                          <Clock className="w-4 h-4 text-brand-primary-dark mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold block">{hoursStatus.statusLabel}</span>
                            <span className="text-[11px] text-stone-600 block mt-0.5 leading-tight">
                              Seu pedido será enviado normalmente pelo WhatsApp e processado no início do próximo expediente!
                            </span>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-start space-x-2 text-amber-900">
                          <Clock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold block">Atendimento Pausado ({hoursStatus.statusLabel})</span>
                            <span className="text-[11px] opacity-90 block mt-0.5 leading-tight">
                              A loja não está recebendo pedidos fora do expediente ({settings.businessDaysLabel || 'Segunda a Sábado'}, {settings.openingTime || '08:00'} às {settings.closingTime || '18:00'}).
                            </span>
                          </div>
                        </div>
                      );
                    }
                  }

                  return null;
                })()}

                {/* Confirm & Send to WhatsApp Button */}
                {(() => {
                  const hoursStatus = checkStoreHoursStatus(settings);
                  const isBlocked = !hoursStatus.acceptsOrdersNow;

                  if (isBlocked) {
                    return (
                      <button
                        type="button"
                        disabled
                        className="w-full flex items-center justify-center space-x-2.5 py-4 bg-stone-300 text-stone-600 rounded-2xl font-bold text-sm cursor-not-allowed shadow-none"
                        id="btn-send-whatsapp-order-disabled"
                      >
                        <Clock className="w-5 h-5 text-stone-500" />
                        <span>Pedidos Temporariamente Fechados</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="w-full flex items-center justify-center space-x-2.5 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                      id="btn-send-whatsapp-order"
                    >
                      <MessageCircle className="w-5 h-5 fill-white" />
                      <span>Enviar Pedido pelo WhatsApp</span>
                    </button>
                  );
                })()}

                {/* Secondary Continue Shopping Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-xs transition-all cursor-pointer"
                  id="btn-continue-shopping-cart-footer"
                >
                  <ArrowLeft className="w-4 h-4 text-stone-600" />
                  <span>Continuar Comprando (Explorar Catálogo)</span>
                </button>

                <p className="text-[10px] text-center text-stone-400">
                  Ao clicar, você será direcionado para o WhatsApp oficial da {settings.storeName} com a mensagem pronta.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
