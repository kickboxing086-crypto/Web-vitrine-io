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
  const [paymentMethod, setPaymentMethod] = useState<'card_delivery' | 'card_pickup' | 'cash' | 'other' | 'pix'>(
    'pix'
  );

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
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute inset-y-0 right-0 max-w-full flex pl-6"
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
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-stone-500 pb-1">
                      <span className="font-bold uppercase tracking-wider text-stone-700">
                        Peças Escolhidas
                      </span>
                      <button
                        onClick={onClearCart}
                        className="text-stone-400 hover:text-red-600 transition-colors"
                      >
                        Limpar tudo
                      </button>
                    </div>

                    {cart.map((item, index) => {
                      const itemPrice = item.product.isOnSale && item.product.promotionalPrice
                        ? item.product.promotionalPrice
                        : item.product.price;
                      return (
                        <div
                          key={`${item.product.id}-${item.selectedSize}-${item.selectedColor.name}-${index}`}
                          className="flex items-center space-x-3.5 p-3 bg-white rounded-2xl border border-brand-border shadow-xs"
                        >
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-16 h-20 rounded-xl object-cover object-top bg-stone-100 flex-shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-stone-900 truncate">
                              {item.product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                              <span className="font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
                                Tam: {item.selectedSize}
                              </span>
                              <span className="flex items-center gap-1">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/10"
                                  style={{ backgroundColor: item.selectedColor.hex }}
                                />
                                {item.selectedColor.name}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs font-bold text-stone-900">
                                {formatCurrency(itemPrice * item.quantity)}
                              </span>

                              {/* Quantity Controls */}
                              <div className="flex items-center border border-brand-border rounded-lg bg-brand-bg">
                                <button
                                  onClick={() => onUpdateQuantity(index, -1)}
                                  className="p-1 text-stone-600 hover:text-stone-900"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-xs font-bold text-stone-800">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(index, 1)}
                                  className="p-1 text-stone-600 hover:text-stone-900"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => onRemoveItem(index)}
                            className="p-1.5 text-stone-300 hover:text-red-600 transition-colors"
                            title="Remover item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Quick action to continue browsing catalog */}
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-2.5 px-3 border border-dashed border-stone-300 hover:border-brand-primary-dark rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white/80 hover:bg-white flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs"
                      id="btn-cart-items-add-more"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-brand-primary-dark" />
                      <span>+ Adicionar mais peças (Continuar Comprando)</span>
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
                  <div className="space-y-3 p-4 bg-white rounded-2xl border border-brand-border">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-brand-primary-dark" />
                      <span>Seus Dados de Contato</span>
                    </span>

                    <div className="space-y-2.5">
                      <div>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Seu Nome Completo *"
                          className="w-full px-3 py-2 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Seu WhatsApp (com DDD) *"
                          className="w-full px-3 py-2 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark"
                        />
                      </div>

                      {/* Delivery Address Fields */}
                      {isDelivery && (
                        <div className="space-y-2 pt-2 border-t border-stone-100">
                          <span className="text-[11px] font-semibold text-stone-600 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-brand-primary-dark" /> Endereço de Entrega:
                            </span>
                            <span className="text-[10px] text-stone-400 font-normal">CEP Opcional</span>
                          </span>

                          {/* CEP Field */}
                          <div className="relative">
                            <input
                              type="text"
                              value={cep}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCep(val);
                                handleCepSearch(val);
                              }}
                              placeholder="CEP (opcional - autopreencher)"
                              maxLength={9}
                              className="w-full px-3 py-2 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark"
                            />
                            {isLoadingCep && (
                              <span className="absolute right-3 top-2 text-[10px] text-brand-primary-dark font-semibold animate-pulse">
                                Buscando...
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              required
                              value={street}
                              onChange={(e) => setStreet(e.target.value)}
                              placeholder="Rua / Avenida *"
                              className="col-span-2 px-3 py-2 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark"
                            />
                            <input
                              type="text"
                              required
                              value={number}
                              onChange={(e) => setNumber(e.target.value)}
                              placeholder="Nº *"
                              className="px-3 py-2 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {settings.deliveryFeeType === 'custom' &&
                            settings.customDeliveryRates &&
                            settings.customDeliveryRates.length > 0 ? (
                              <select
                                required
                                value={neighborhood}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setNeighborhood(val);
                                  const rate = settings.customDeliveryRates?.find(r => r.neighborhood === val);
                                  if (rate) {
                                    if (rate.city) setCity(rate.city);
                                    if (rate.state) setAddressState(rate.state);
                                  }
                                }}
                                className="px-2.5 py-2 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark"
                              >
                                <option value="">Selecione o Bairro *</option>
                                {settings.customDeliveryRates.map((r) => (
                                  <option key={r.id} value={r.neighborhood}>
                                    {r.neighborhood} - {r.city}/{r.state || 'SP'} (R$ {r.fee.toFixed(2)})
                                  </option>
                                ))}
                                <option value="Outro">Outro Bairro</option>
                              </select>
                            ) : (
                              <input
                                type="text"
                                required
                                value={neighborhood}
                                onChange={(e) => setNeighborhood(e.target.value)}
                                placeholder="Bairro *"
                                className="px-3 py-2 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark"
                              />
                            )}

                            <input
                              type="text"
                              required
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="Cidade *"
                              className="px-3 py-2 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark"
                            />

                            <input
                              type="text"
                              required
                              maxLength={2}
                              value={addressState}
                              onChange={(e) => setAddressState(e.target.value.toUpperCase())}
                              placeholder="Estado (UF) *"
                              className="px-3 py-2 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark uppercase"
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              value={complement}
                              onChange={(e) => setComplement(e.target.value)}
                              placeholder="Complemento / Apto"
                              className="w-full px-3 py-2 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark"
                            />
                          </div>
                        </div>
                      )}

                      {/* Payment Method Option */}
                      <div className="pt-2 border-t border-stone-100">
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                          Forma de Pagamento:
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'pix', label: 'Pix (Recomendado)' },
                            {
                              id: isDelivery ? 'card_delivery' : 'card_pickup',
                              label: isDelivery ? 'Cartão (Entrega)' : 'Cartão (Retirada)',
                            },
                            { id: 'cash', label: 'Dinheiro' },
                            { id: 'other', label: 'A Combinar' },
                          ].map((p) => (
                            <motion.button
                              key={p.id}
                              type="button"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                              onClick={() => setPaymentMethod(p.id as any)}
                              className={`py-2 px-2 text-[11px] rounded-lg border font-medium text-center transition-all cursor-pointer ${
                                paymentMethod === p.id
                                  ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                                  : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                              }`}
                            >
                              {p.label}
                            </motion.button>
                          ))}
                        </div>
                        {paymentMethod === 'pix' && settings.pixKey && (
                          <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center justify-between">
                            <span>Chave Pix: <strong>{settings.pixKey}</strong></span>
                            <span className="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded font-bold text-emerald-800">PIX</span>
                          </div>
                        )}
                      </div>

                      {/* Customer Notes */}
                      <div>
                        <input
                          type="text"
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          placeholder="Observações (ex: presente, horário...)"
                          className="w-full px-3 py-1.5 bg-brand-bg border border-brand-border-dark rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-brand-primary-dark"
                        />
                      </div>
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
