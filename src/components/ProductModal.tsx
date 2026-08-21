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

  // If product has colors with images, include them in gallery
  const hasColorVariants = product.hasColors !== false && Array.isArray(product.colors) && product.colors.length > 0;
  const colorImages = hasColorVariants
    ? product.colors.filter((c) => c.imageUrl && c.imageUrl.trim()).map((c) => c.imageUrl!)
    : [];

  const allImages = Array.from(
    new Set([
      ...(product.images || []),
      ...colorImages,
    ])
  ).filter((img) => img && img.trim().length > 0);

  const images = allImages;

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
        {/* Snack-fast background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="fixed inset-0 bg-black/70 backdrop-blur-[2px]"
          onClick={onClose}
        />

        {/* Snappy fast content card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ type: "tween", ease: "easeOut", duration: 0.12 }}
          className="relative w-full max-w-4xl max-h-[92vh] md:max-h-[88vh] bg-brand-bg rounded-3xl border border-[#E3D7CA] shadow-2xl overflow-hidden my-auto flex flex-col z-10"
          id="product-modal-container"
        >
          {/* Top Right Actions: Share & Close buttons */}
          <div className="absolute top-4 right-4 z-30 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onShareProduct && onShareProduct(product)}
              className="p-2 sm:px-3 sm:py-2 bg-white/95 hover:bg-white text-stone-700 hover:text-brand-primary-dark rounded-full shadow-md transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-semibold"
              id="btn-share-product-modal-top"
              title="Compartilhar nas Redes Sociais"
            >
              <Share2 className="w-4 h-4 text-brand-primary-dark" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 rounded-full shadow-md transition-all cursor-pointer"
              id="btn-close-product-modal"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0 overflow-hidden">
            {/* Gallery Column */}
            <div className="relative bg-[#F2EDE7] flex flex-col justify-between p-4 sm:p-6 overflow-y-auto max-h-[40vh] md:max-h-full">
              {/* Main Image */}
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-white shadow-inner border border-brand-border/40 group">
                <img
                  src={images[activeImageIndex]}
                  alt={product.name}
                  onClick={() => setIsZoomOpen(true)}
                  className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
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
            </div>

            {/* Info & Buy Column (With Sticky Bottom Action Bar) */}
            <div className="flex flex-col h-full min-h-0 bg-white overflow-hidden justify-between">
              {/* Scrollable details area */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4">
                {/* Category & Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
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
                <h2 className="text-xl sm:text-2xl font-serif-luxury font-medium text-stone-900 leading-snug">
                  {product.name}
                </h2>

                {/* Price Display */}
                <div className="flex items-baseline space-x-3">
                  <span className="text-2xl sm:text-3xl font-bold text-stone-900">
                    {formatCurrency(currentPrice)}
                  </span>
                  {product.isOnSale && product.promotionalPrice && (
                    <span className="text-base text-stone-400 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500">
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
                <div className="pt-3 border-t border-brand-bg-alt text-sm text-stone-600 leading-relaxed">
                  {product.description}
                </div>

                {/* Fabric & Care Accordion */}
                {(product.fabricDetails || product.careInstructions) && (
                  <div className="p-3.5 bg-brand-bg-alt rounded-2xl border border-brand-border text-xs space-y-1.5 text-stone-700">
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

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                        Selecione o Tamanho
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSizeGuide(!showSizeGuide)}
                        className="text-[11px] text-brand-primary-dark hover:underline flex items-center space-x-1 font-medium"
                      >
                        <Ruler className="w-3 h-3" />
                        <span>Tabela de Medidas</span>
                      </button>
                    </div>

                    {showSizeGuide && (
                      <div className="mb-3 p-3 bg-brand-bg rounded-xl border border-brand-border text-[11px] text-stone-600">
                        <p className="font-semibold text-stone-800 mb-1">Guia de Medidas Aproximadas:</p>
                        <ul className="list-disc list-inside space-y-0.5">
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
                              ? 'bg-stone-900 text-white border-stone-900 shadow-xs scale-105'
                              : 'bg-white text-stone-700 border-brand-border-dark hover:border-stone-500'
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
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
                      Cor: <span className="font-normal text-stone-600">{selectedColor.name}</span>
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {product.colors.map((color, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedColor(color);
                            const matchingImageIdx = images.findIndex((img) => img === color.imageUrl);
                            if (matchingImageIdx !== -1) {
                              setActiveImageIndex(matchingImageIdx);
                            }
                          }}
                          className={`group relative flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                            selectedColor.name === color.name
                              ? 'bg-brand-bg-alt border-stone-900 shadow-2xs font-semibold'
                              : 'bg-white border-brand-border hover:border-brand-border-dark'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{color.name}</span>
                          {selectedColor.name === color.name && (
                            <Check className="w-3.5 h-3.5 text-stone-900" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                {/* Quantity */}
                {product.stock > 0 ? (
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Quantidade
                    </span>
                    <div className="flex items-center border border-brand-border-dark rounded-xl bg-brand-bg-alt">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-3 py-1.5 text-stone-600 hover:text-stone-900 font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold text-stone-900 min-w-[28px] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => {
                          const maxStock = product.stock || 1;
                          return q >= maxStock ? maxStock : q + 1;
                        })}
                        className="px-3 py-1.5 text-stone-600 hover:text-stone-900 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center justify-between text-stone-400">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Quantidade
                    </span>
                    <span className="text-xs font-bold italic">Sem estoque</span>
                  </div>
                )}

                {/* Stock info */}
                <div className="flex items-center space-x-2 text-xs pt-1">
                  <Tag className="w-3.5 h-3.5 text-brand-primary-dark" />
                  <span className={product.stock === 0 ? "text-red-600 font-bold" : product.stock <= 3 ? "text-amber-600 font-bold" : "text-stone-500"}>
                    {product.stock === 0
                      ? 'Produto esgotado (Sem estoque disponível)'
                      : product.stock <= 3
                      ? `Últimas peças! Apenas ${product.stock} unidades disponíveis`
                      : `${product.stock} peças disponíveis no estoque`}
                  </span>
                </div>

                {/* Trust Highlights */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-stone-500 text-center border-t border-brand-bg-alt">
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

              {/* PERMANENTLY FIXED & STICKY ACTION FOOTER */}
              <div className="sticky bottom-0 z-30 bg-white/98 backdrop-blur-md border-t border-brand-border p-4 sm:p-5 shadow-2xl space-y-2.5 shrink-0">
                {/* Status indicator when in cart */}
                {addedAnimation && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-medium animate-fadeIn">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Peça adicionada à sacola!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenCart) onOpenCart();
                      }}
                      className="text-xs font-bold text-emerald-900 underline hover:text-emerald-950 cursor-pointer"
                    >
                      Ver Sacola ({quantity}) →
                    </button>
                  </div>
                )}

                {/* Primary Fixed Buttons Grid: Continuar Comprando + Adicionar/Ver Sacola */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Fixed Continuar Comprando Button */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl font-bold text-xs shadow-2xs transition-all cursor-pointer"
                    id="btn-fixed-continue-shopping-modal"
                    title="Continuar Comprando e Explorando Catálogo"
                  >
                    <ArrowLeft className="w-4 h-4 text-stone-600" />
                    <span>Continuar Comprando</span>
                  </button>

                  {/* Add to Bag or Go to Cart */}
                  <button
                    type="button"
                    disabled={product.stock === 0}
                    onClick={handleAddBag}
                    className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs transition-all shadow-md ${
                      product.stock === 0
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                        : addedAnimation
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20 cursor-pointer'
                        : 'bg-stone-900 hover:bg-stone-800 text-white shadow-stone-900/15 cursor-pointer'
                    }`}
                    id="btn-fixed-add-to-bag-modal"
                  >
                    <ShoppingBag className="w-4 h-4 text-brand-primary" />
                    <span>
                      {product.stock === 0
                        ? 'Indisponível (Sem Estoque)'
                        : addedAnimation
                        ? `Adicionar Mais (${quantity}) • ${formatCurrency(currentPrice * quantity)}`
                        : `Adicionar à Sacola • ${formatCurrency(currentPrice * quantity)}`}
                    </span>
                  </button>
                </div>

                {/* Secondary Actions: WhatsApp Direct & Social Share */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleDirectWhatsapp}
                    className="sm:col-span-2 w-full flex items-center justify-center space-x-2 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-semibold text-xs shadow-2xs transition-all cursor-pointer"
                    id="btn-fixed-whatsapp-direct-modal"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>Pedir / Dúvida no WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onShareProduct && onShareProduct(product)}
                    className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-brand-bg hover:bg-brand-bg-alt text-brand-primary-dark font-bold text-xs rounded-xl border border-brand-border transition-colors cursor-pointer"
                    id="btn-fixed-share-direct-modal"
                    title="Compartilhar nas redes sociais"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Divulgar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interactive Full-Screen Lightbox Zoom Viewer */}
      <AnimatePresence>
        {isZoomOpen && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer z-50"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Zoomed Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-full max-h-[75vh] aspect-[3/4] md:max-w-md rounded-2xl overflow-hidden bg-stone-900 border border-white/10 flex items-center justify-center shadow-2xl"
            >
              <img
                src={images[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Bottom Selector & Info */}
            <div className="mt-6 text-center space-y-4 max-w-lg w-full">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{product.name}</h3>
                <p className="text-xs text-stone-400 mt-1">Navegue pelas fotos da peça bem de perto</p>
              </div>

              {/* Carousel Navigation */}
              <div className="flex items-center justify-center space-x-6">
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="text-xs font-semibold text-stone-300 tracking-wider">
                  Foto {activeImageIndex + 1} de {images.length}
                </span>

                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Selection Action directly inside the Lightbox Zoom! */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsZoomOpen(false);
                  }}
                  className="px-6 py-2.5 bg-stone-100 hover:bg-white text-stone-950 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 mx-auto"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Escolha desta Peça</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
