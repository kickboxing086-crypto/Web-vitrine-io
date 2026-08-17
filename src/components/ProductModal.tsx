import React, { useState } from 'react';
import { Product, StoreSettings } from '../types';
import { formatCurrency, generateWhatsappDirectProductMessage, cleanPhoneForWhatsapp } from '../lib/formatters';
import {
  X,
  ShoppingBag,
  MessageCircle,
  Ruler,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductModalProps {
  product: Product | null;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: { name: string; hex: string }, qty: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  settings,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>(
    product.colors[0] || { name: 'Padrão', hex: '#111111' }
  );
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const images = product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80'];

  const currentPrice = product.isOnSale && product.promotionalPrice
    ? product.promotionalPrice
    : product.price;

  const handleDirectWhatsapp = () => {
    const encodedMsg = generateWhatsappDirectProductMessage(
      product.name,
      currentPrice,
      selectedSize,
      selectedColor.name,
      settings
    );
    const phone = cleanPhoneForWhatsapp(settings.phoneWhatsapp);
    window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
  };

  const handleAddBag = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-brand-bg rounded-3xl border border-[#E3D7CA] shadow-2xl overflow-hidden my-auto"
          id="product-modal-container"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 rounded-full shadow-md transition-all cursor-pointer"
            id="btn-close-product-modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery Column */}
            <div className="relative bg-[#F2EDE7] flex flex-col justify-between p-4 sm:p-6">
              {/* Main Image */}
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-stone-200 shadow-inner group">
                <img
                  src={images[activeImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />

                {/* Badge tags */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {product.isOnSale && (
                    <span className="px-3 py-1 bg-[#9C3A3A] text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-sm">
                      Promoção
                    </span>
                  )}
                  {product.isNew && (
                    <span className="px-3 py-1 bg-brand-primary-dark text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-sm">
                      Novidade
                    </span>
                  )}
                </div>

                {/* Nav arrows if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-stone-800 rounded-full shadow transition-all opacity-80 hover:opacity-100"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-stone-800 rounded-full shadow transition-all opacity-80 hover:opacity-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImageIndex === idx
                          ? 'border-brand-primary-dark ring-2 ring-brand-primary-dark/30 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info & Buy Column */}
            <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
              <div>
                {/* Category & Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-brand-primary-dark">
                    {product.category}
                  </span>
                  {product.tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium bg-brand-bg-alt text-stone-700 px-2 py-0.5 rounded-full"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Product Name */}
                <h2 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-stone-900 leading-snug">
                  {product.name}
                </h2>

                {/* Price Display */}
                <div className="mt-3 flex items-baseline space-x-3">
                  <span className="text-2xl sm:text-3xl font-bold text-stone-900">
                    {formatCurrency(currentPrice)}
                  </span>
                  {product.isOnSale && product.promotionalPrice && (
                    <span className="text-base text-stone-400 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {settings.enableInstallments !== false &&
                  currentPrice >= (settings.minOrderValueForInstallments || 0) &&
                  Math.min(settings.maxInstallments || 6, Math.floor(currentPrice / (settings.minInstallmentAmount || 30))) >= 2 ? (
                    <>
                      ou em até{' '}
                      <strong>
                        {Math.min(settings.maxInstallments || 6, Math.floor(currentPrice / (settings.minInstallmentAmount || 30)))}x de{' '}
                        {formatCurrency(currentPrice / Math.min(settings.maxInstallments || 6, Math.floor(currentPrice / (settings.minInstallmentAmount || 30))))}
                      </strong>{' '}
                      sem juros
                    </>
                  ) : (
                    <span className="text-emerald-700 font-semibold">Pagamento à vista no Pix ou Cartão</span>
                  )}
                </p>

                {/* Description */}
                <div className="mt-4 pt-4 border-t border-brand-bg-alt text-sm text-stone-600 leading-relaxed">
                  {product.description}
                </div>

                {/* Fabric & Care Accordion */}
                {(product.fabricDetails || product.careInstructions) && (
                  <div className="mt-4 p-3.5 bg-brand-bg-alt rounded-2xl border border-brand-border text-xs space-y-1.5 text-stone-700">
                    {product.fabricDetails && (
                      <p>
                        <strong className="text-stone-900">Composição:</strong> {product.fabricDetails}
                      </p>
                    )}
                    {product.careInstructions && (
                      <p>
                        <strong className="text-stone-900">Cuidados:</strong> {product.careInstructions}
                      </p>
                    )}
                  </div>
                )}

                {/* Color Selection */}
                {product.colors.length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                        Cor Selecionada: <span className="font-normal text-stone-600">{selectedColor.name}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {product.colors.map((color, idx) => {
                        const isChosen = selectedColor.name === color.name;
                        return (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedColor(color)}
                            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                              isChosen
                                ? 'border-brand-primary-dark bg-white ring-2 ring-brand-primary-dark/30 text-stone-900 shadow-xs'
                                : 'border-brand-border-dark bg-white/70 text-stone-700 hover:border-stone-400'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/15 flex-shrink-0"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span>{color.name}</span>
                            {isChosen && <Check className="w-3 h-3 text-brand-primary-dark" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {product.sizes.length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                        Tamanho:
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSizeGuide(!showSizeGuide)}
                        className="flex items-center space-x-1 text-xs text-brand-primary-dark hover:text-[#977349] font-medium cursor-pointer"
                      >
                        <Ruler className="w-3.5 h-3.5" />
                        <span>Guia de Medidas</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => {
                        const isChosen = selectedSize === size;
                        return (
                          <motion.button
                            key={size}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isChosen
                                ? 'bg-stone-900 text-white shadow-md ring-2 ring-stone-900/20'
                                : 'bg-white border border-brand-border-dark text-stone-700 hover:border-stone-800'
                            }`}
                          >
                            {size}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Size Guide Drawer */}
                    {showSizeGuide && (
                      <div className="mt-3 p-3 bg-white rounded-xl border border-brand-border text-[11px] text-stone-600">
                        <div className="font-semibold text-stone-900 mb-1">
                          Tabela de Referência de Medidas (cm):
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-center py-1 font-mono">
                          <span className="font-bold">PP: 36</span>
                          <span className="font-bold">P: 38</span>
                          <span className="font-bold">M: 40</span>
                          <span className="font-bold">G: 42-44</span>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-1">
                          Dúvidas sobre o caimento? Fale conosco pelo botão do WhatsApp abaixo!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock info */}
                <div className="mt-4 flex items-center space-x-2 text-xs text-stone-500">
                  <Tag className="w-3.5 h-3.5 text-brand-primary-dark" />
                  <span>
                    Peça com acabamento fino • {product.stock > 0 ? `${product.stock} unidades disponíveis no estoque` : 'Disponível sob encomenda'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-5 border-t border-brand-bg-alt space-y-3">
                {/* Add to Bag Button */}
                <button
                  type="button"
                  onClick={handleAddBag}
                  className={`w-full flex items-center justify-center space-x-2.5 py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-md ${
                    addedAnimation
                      ? 'bg-emerald-700 text-white shadow-emerald-700/20'
                      : 'bg-stone-900 hover:bg-[#2C2723] text-white shadow-stone-900/15'
                  }`}
                  id="btn-add-to-bag-modal"
                >
                  <ShoppingBag className="w-4 h-4 text-brand-primary" />
                  <span>
                    {addedAnimation
                      ? '✓ Adicionado à Sacola!'
                      : `Adicionar à Sacola • ${formatCurrency(currentPrice)}`}
                  </span>
                </button>

                {/* Direct WhatsApp Button */}
                <button
                  type="button"
                  onClick={handleDirectWhatsapp}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-semibold text-sm shadow-sm transition-all cursor-pointer"
                  id="btn-whatsapp-direct-modal"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Pedir ou Tirar Dúvida via WhatsApp</span>
                </button>

                {/* Trust Highlights */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-stone-500 text-center">
                  <div className="flex flex-col items-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-600 mb-0.5" />
                    <span>Peça Original</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Truck className="w-3.5 h-3.5 text-stone-600 mb-0.5" />
                    <span>
                      {settings.deliveryMode === 'pickup'
                        ? 'Retirada na Loja'
                        : settings.deliveryMode === 'delivery'
                        ? 'Envio Seguro'
                        : 'Entrega / Retirada'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <RotateCcw className="w-3.5 h-3.5 text-stone-600 mb-0.5" />
                    <span>Troca Facilitada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
