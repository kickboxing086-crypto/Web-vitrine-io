import React from 'react';
import { Product, StoreSettings } from '../types';
import { formatCurrency, generateWhatsappDirectProductMessage, cleanPhoneForWhatsapp } from '../lib/formatters';
import { MessageCircle, Eye, ShoppingBag, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  settings: StoreSettings;
  onOpenDetails: (product: Product) => void;
  onQuickAddToCart: (product: Product) => void;
  onShareProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  settings,
  onOpenDetails,
  onQuickAddToCart,
  onShareProduct,
}) => {
  const [selectedColorIndex, setSelectedColorIndex] = React.useState<number>(0);

  const currentPrice =
    product.isOnSale && product.promotionalPrice
      ? product.promotionalPrice
      : product.price;

  const hasColorVariants = product.hasColors !== false && Array.isArray(product.colors) && product.colors.length > 0;
  const activeColor = hasColorVariants ? product.colors[selectedColorIndex] : undefined;

  const mainImage =
    (activeColor?.imageUrl && activeColor.imageUrl.trim()) ||
    product.images[0] ||
    '';

  const handleWhatsappClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const encoded = generateWhatsappDirectProductMessage(
      product.name,
      currentPrice,
      product.sizes[0],
      activeColor?.name || product.colors[0]?.name,
      settings
    );
    const phone = cleanPhoneForWhatsapp(settings.phoneWhatsapp);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShareProduct) {
      onShareProduct(product);
    }
  };

  const handleColorClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSelectedColorIndex(index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => onOpenDetails(product)}
      className="group relative bg-[#141417] border border-[#27272A] hover:border-[#D4AF37]/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer shadow-sm hover:shadow-xl"
      id={`product-card-${product.id}`}
    >
      {/* Image Container */}
      <div className="relative w-full overflow-hidden bg-[#0D0D0F] aspect-[3/4] shrink-0">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-103"
          loading="lazy"
        />

        {/* Esgotado Overlay */}
        {(product.stock === 0 || product.stock === undefined) && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center z-10">
            <span className="px-3.5 py-1.5 bg-stone-900 text-stone-200 font-bold text-xs uppercase tracking-wider rounded-xl border border-stone-700 shadow-md">
              Esgotado
            </span>
          </div>
        )}

        {/* Subtle Dark Gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges on Top Left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isOnSale && (
            <span className="px-2.5 py-0.5 bg-[#8C1D1D] text-white text-[10px] font-bold tracking-wider uppercase rounded-full shadow-sm">
              Promoção
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-0.5 bg-[#D4AF37] text-stone-950 text-[10px] font-bold tracking-wider uppercase rounded-full shadow-sm">
              Novo
            </span>
          )}
        </div>

        {/* Top Right: Share Button */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <button
            type="button"
            onClick={handleShareClick}
            className="p-1.5 bg-black/60 hover:bg-black/90 text-stone-300 hover:text-[#D4AF37] rounded-full border border-white/10 shadow-sm transition-colors cursor-pointer"
            title="Compartilhar Peça"
            id={`btn-share-product-card-${product.id}`}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Action Overlay (Desktop Hover) */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="flex-1 py-2 px-3 bg-stone-900/90 hover:bg-black text-white border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-xl text-xs font-semibold shadow-md flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Ver Detalhes</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsappClick}
            className="p-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl shadow-md transition-colors cursor-pointer"
            title="Pedir no WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="flex flex-col flex-1 justify-between p-4 bg-[#141417]">
        <div>
          {/* Category & Stock */}
          <div className="flex items-center justify-between text-[11px] text-[#D4AF37] font-semibold tracking-wider uppercase mb-1">
            <span>{product.category}</span>
            {product.stock <= 3 && product.stock > 0 && (
              <span className="text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/50">
                Últimas peças
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-serif-luxury text-base font-semibold leading-snug text-white line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
            {product.name}
          </h3>

          {/* Sizes preview & Colors */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              {Array.from(new Set(product.sizes || [])).slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="px-1.5 py-0.5 bg-[#1C1C22] border border-[#2B2B33] text-stone-300 text-[10px] font-semibold rounded"
                >
                  {s}
                </span>
              ))}
              {product.sizes && product.sizes.length > 4 && (
                <span className="text-[10px] text-stone-500 font-medium">
                  +{product.sizes.length - 4}
                </span>
              )}
            </div>

            {/* Colors Swatches */}
            {hasColorVariants && (
              <div className="flex items-center gap-1">
                {product.colors.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => handleColorClick(e, i)}
                    className={`w-3.5 h-3.5 rounded-full border shadow-2xs transition-all cursor-pointer ${
                      selectedColorIndex === i
                        ? 'ring-2 ring-[#D4AF37] scale-110'
                        : 'border-stone-700 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          {hasColorVariants && activeColor && (
            <div className="mt-1 flex items-center gap-1 text-[10px] text-stone-400">
              <span>Cor:</span>
              <span className="text-stone-200 font-medium">{activeColor.name}</span>
            </div>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="mt-3.5 pt-3 border-t border-[#232328] flex items-end justify-between">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-bold text-white text-base sm:text-lg">
                {formatCurrency(currentPrice)}
              </span>
              {product.isOnSale && product.promotionalPrice && (
                <span className="text-xs text-stone-500 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            {settings.enableInstallments !== false &&
            currentPrice >= (settings.minOrderValueForInstallments || 0) &&
            Math.min(settings.maxInstallments || 6, Math.floor(currentPrice / (settings.minInstallmentAmount || 30))) >= 2 ? (
              <span className="text-[10px] text-[#D4AF37] block">
                {Math.min(settings.maxInstallments || 6, Math.floor(currentPrice / (settings.minInstallmentAmount || 30)))}x de {formatCurrency(currentPrice / Math.min(settings.maxInstallments || 6, Math.floor(currentPrice / (settings.minInstallmentAmount || 30))))} s/ juros
              </span>
            ) : (
              <span className="text-[10px] text-stone-400 block">
                À vista no Pix ou Cartão
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              disabled={product.stock === 0}
              onClick={(e) => {
                e.stopPropagation();
                if (product.stock > 0) {
                  onQuickAddToCart(product);
                }
              }}
              className={`p-2 rounded-xl transition-colors ${
                product.stock === 0
                  ? 'bg-stone-900 text-stone-600 cursor-not-allowed border border-stone-800'
                  : 'bg-[#1C1C22] hover:bg-[#D4AF37] text-stone-300 hover:text-stone-950 border border-[#2B2B33] hover:border-[#D4AF37] cursor-pointer'
              }`}
              title={product.stock === 0 ? 'Sem estoque' : 'Adicionar à Sacola'}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
