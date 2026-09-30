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
  ArrowLeft,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductModalProps {
  product: Product | null;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: { name: string; hex: string }, qty: number) => void;
  onOpenCart?: () => void;
  onShareProduct?: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  settings,
  isOpen,
  onClose,
  onAddToCart,
  onOpenCart,
  onShareProduct,
}) => {
  if (!isOpen || !product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string; imageUrl?: string }>(
    product.colors && product.colors[0] ? product.colors[0] : { name: 'Padrão', hex: '#111111' }
  );
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const hasColorVariants = product.hasColors !== false && Array.isArray(product.colors) && product.colors.length > 0;
  const allImages = Array.from(
    new Set([
      ...(product.images || []),
    ])
  ).filter((img) => img && img.trim().length > 0);

  const images = allImages.length > 0 ? allImages : ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'];

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
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        {/* Background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ type: 'tween', duration: 0.15 }}
          className="relative w-full max-w-4xl max-h-[92vh] md:max-h-[88vh] bg-[#121215] text-stone-100 rounded-3xl border border-[#27272A] shadow-2xl overflow-hidden my-auto flex flex-col z-10"
          id="product-modal-container"
        >
          {/* Top Actions: Share & Close buttons */}
          <div className="absolute top-4 right-4 z-30 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onShareProduct && onShareProduct(product)}
              className="p-2 sm:px-3 sm:py-2 bg-stone-900/90 hover:bg-stone-900 text-stone-300 hover:text-[#D4AF37] border border-stone-800 rounded-full shadow-md transition-colors cursor-pointer flex items-center space-x-1.5 text-xs font-semibold"
              id="btn-share-product-modal-top"
              title="Compartilhar Peça"
            >
              <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 rounded-full shadow-md transition-colors cursor-pointer"
              id="btn-close-product-modal"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0 overflow-hidden">
            {/* Gallery Column */}
            <div className="relative bg-[#0D0D0F] flex flex-col justify-start p-4 sm:p-6 overflow-y-auto max-h-[40vh] md:max-h-full space-y-4">
              {/* Main Image */}
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-[#27272A] group">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={product.name}
                  onClick={() => setIsZoomOpen(true)}
                  className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-103 cursor-zoom-in"
                />

                {/* Navigation arrows for multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black text-stone-200 rounded-full border border-stone-800 shadow-md backdrop-blur-xs transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black text-stone-200 rounded-full border border-stone-800 shadow-md backdrop-blur-xs transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </>
                )}

                {/* Badge tags */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {product.isOnSale && (
                    <span className="px-3 py-1 bg-[#8C1D1D] text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-sm">
                      Promoção
                    </span>
                  )}
                  {product.isNew && (
                    <span className="px-3 py-1 bg-[#D4AF37] text-stone-950 text-xs font-bold tracking-wider uppercase rounded-full shadow-sm">
                      Novo
                    </span>
                  )}
                </div>
              </div>
              
              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 snap-x scrollbar-none">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 snap-center transition-all ${
                        activeImageIndex === idx ? 'border-[#D4AF37] shadow-md scale-102' : 'border-[#27272A] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info & Buy Column */}
            <div className="flex flex-col h-full min-h-0 bg-[#141417] overflow-hidden justify-between">
              {/* Scrollable details area */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4">
                {/* Category & Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                    {product.category}
                  </span>
                  {product.tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium bg-[#1C1C22] border border-[#2B2B33] text-stone-300 px-2 py-0.5 rounded-full"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Product Name */}
                <h2 className="text-xl sm:text-2xl font-serif-luxury font-bold text-white leading-snug">
                  {product.name}
                </h2>

                {/* Price Display */}
                <div className="flex items-baseline space-x-3">
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {formatCurrency(currentPrice)}
                  </span>
                  {product.isOnSale && product.promotionalPrice && (
                    <span className="text-base text-stone-500 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-400">
                  {settings.enableInstallments !== false &&
                  currentPrice >= (settings.minOrderValueForInstallments || 0) &&
                  Math.min(settings.maxInstallments || 6, Math.floor(currentPrice / (settings.minInstallmentAmount || 30))) >= 2 ? (
                    <>
                      ou em até{' '}
                      <strong className="text-[#D4AF37]">
                        {Math.min(settings.maxInstallments || 6, Math.floor(currentPrice / (settings.minInstallmentAmount || 30)))}x de{' '}
                        {formatCurrency(currentPrice / Math.min(settings.maxInstallments || 6, Math.floor(currentPrice / (settings.minInstallmentAmount || 30))))}
                      </strong>{' '}
                      sem juros
                    </>
                  ) : (
                    <span className="text-emerald-400 font-medium">Pagamento à vista no Pix ou Cartão</span>
                  )}
                </p>

                {/* Description */}
                <div className="pt-3 border-t border-[#232328] text-sm text-stone-300 leading-relaxed">
                  {product.description}
                </div>

                {/* Fabric & Care Accordion */}
                {(product.fabricDetails || product.careInstructions) && (
                  <div className="p-3.5 bg-[#1C1C22] rounded-2xl border border-[#2B2B33] text-xs space-y-1.5 text-stone-300">
                    {product.fabricDetails && (
                      <p>
                        <strong className="text-white">Composição:</strong> {product.fabricDetails}
                      </p>
                    )}
                    {product.careInstructions && (
                      <p>
                        <strong className="text-white">Cuidados:</strong> {product.careInstructions}
                      </p>
                    )}
                  </div>
                )}

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                        Selecione o Tamanho
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSizeGuide(!showSizeGuide)}
                        className="text-[11px] text-[#D4AF37] hover:underline flex items-center space-x-1 font-medium"
                      >
                        <Ruler className="w-3 h-3" />
                        <span>Tabela de Medidas</span>
                      </button>
                    </div>

                    {showSizeGuide && (
                      <div className="mb-3 p-3 bg-[#1C1C22] rounded-xl border border-[#2B2B33] text-[11px] text-stone-300">
                        <p className="font-semibold text-white mb-1">Guia de Medidas Aproximadas:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-stone-400">
                          <li><strong>P:</strong> Busto 84-88cm | Cintura 66-70cm | Quadril 94-98cm</li>
                          <li><strong>M:</strong> Busto 89-93cm | Cintura 71-75cm | Quadril 99-103cm</li>
                          <li><strong>G:</strong> Busto 94-98cm | Cintura 76-80cm | Quadril 104-108cm</li>
                          <li><strong>GG:</strong> Busto 99-104cm | Cintura 81-86cm | Quadril 109-114cm</li>
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(product.sizes || [])).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[44px] h-10 px-3.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selectedSize === size
                              ? 'bg-[#D4AF37] text-stone-950 border-[#D4AF37] shadow-sm'
                              : 'bg-[#1C1C22] text-stone-300 border-[#2B2B33] hover:border-stone-500'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {hasColorVariants && product.colors && product.colors.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-stone-200 uppercase tracking-wider block mb-2">
                      Cor: <span className="font-normal text-stone-400">{selectedColor.name}</span>
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {product.colors.map((color, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedColor(color);
                          }}
                          className={`group relative flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                            selectedColor.name === color.name
                              ? 'bg-[#1E1E26] border-[#D4AF37] text-white shadow-xs font-semibold'
                              : 'bg-[#18181E] border-[#2A2A33] text-stone-300 hover:border-stone-500'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-2xs"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{color.name}</span>
                          {selectedColor.name === color.name && (
                            <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                {product.stock > 0 ? (
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                      Quantidade
                    </span>
                    <div className="flex items-center border border-[#2B2B33] rounded-xl bg-[#1C1C22]">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-3 py-1.5 text-stone-400 hover:text-white font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold text-white min-w-[28px] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => {
                          const maxStock = product.stock || 1;
                          return q >= maxStock ? maxStock : q + 1;
                        })}
                        className="px-3 py-1.5 text-stone-400 hover:text-white font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center justify-between text-stone-500">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Quantidade
                    </span>
                    <span className="text-xs font-bold italic">Sem estoque</span>
                  </div>
                )}

                {/* Stock info */}
                <div className="flex items-center space-x-2 text-xs pt-1">
                  <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className={product.stock === 0 ? "text-red-400 font-semibold" : product.stock <= 3 ? "text-amber-400 font-semibold" : "text-stone-400"}>
                    {product.stock === 0
                      ? 'Produto esgotado no momento'
                      : product.stock <= 3
                      ? `Últimas peças! Apenas ${product.stock} disponíveis`
                      : `${product.stock} peças disponíveis no estoque`}
                  </span>
                </div>

                {/* Trust Highlights */}
                <div className="grid grid-cols-3 gap-2 pt-3 text-[10px] text-stone-400 text-center border-t border-[#232328]">
                  <div className="flex flex-col items-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] mb-0.5" />
                    <span>Peça Autêntica</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Truck className="w-3.5 h-3.5 text-[#D4AF37] mb-0.5" />
                    <span>
                      {settings.deliveryMode === 'pickup'
                        ? 'Retirada na Loja'
                        : settings.deliveryMode === 'delivery'
                        ? 'Envio Seguro'
                        : 'Entrega / Retirada'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37] mb-0.5" />
                    <span>Atendimento Rápido</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="sticky bottom-0 z-30 bg-[#121215] border-t border-[#27272A] p-4 sm:p-5 space-y-2.5 shrink-0">
                {addedAnimation && (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center justify-between text-xs text-emerald-300 font-medium">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Peça adicionada à sacola!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenCart) onOpenCart();
                      }}
                      className="text-xs font-bold text-emerald-300 underline hover:text-emerald-100 cursor-pointer"
                    >
                      Ver Sacola ({quantity}) →
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-[#1C1C22] hover:bg-stone-800 text-stone-200 border border-[#2B2B32] rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    id="btn-fixed-continue-shopping-modal"
                  >
                    <ArrowLeft className="w-4 h-4 text-stone-400" />
                    <span>Continuar Comprando</span>
                  </button>

                  <button
                    type="button"
                    disabled={product.stock === 0}
                    onClick={handleAddBag}
                    className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs transition-all shadow-md ${
                      product.stock === 0
                        ? 'bg-stone-900 text-stone-600 cursor-not-allowed border border-stone-800'
                        : 'bg-[#D4AF37] hover:bg-[#C5A059] text-stone-950 cursor-pointer shadow-amber-500/10'
                    }`}
                    id="btn-fixed-add-to-bag-modal"
                  >
                    <ShoppingBag className="w-4 h-4 text-stone-950" />
                    <span>
                      {product.stock === 0
                        ? 'Indisponível'
                        : `Adicionar à Sacola • ${formatCurrency(currentPrice * quantity)}`}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleDirectWhatsapp}
                    className="sm:col-span-2 w-full flex items-center justify-center space-x-2 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer"
                    id="btn-fixed-whatsapp-direct-modal"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>Pedir pelo WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onShareProduct && onShareProduct(product)}
                    className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-[#1C1C22] hover:bg-stone-800 text-stone-300 font-semibold text-xs rounded-xl border border-[#2B2B32] transition-colors cursor-pointer"
                    id="btn-fixed-share-direct-modal"
                    title="Compartilhar"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Compartilhar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
