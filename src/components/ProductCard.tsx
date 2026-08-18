import React from 'react';
import { Product, StoreSettings } from '../types';
import { formatCurrency, generateWhatsappDirectProductMessage, cleanPhoneForWhatsapp } from '../lib/formatters';
import { MessageCircle, Eye, ShoppingBag, Images, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  settings: StoreSettings;
  onOpenDetails: (product: Product) => void;
  onQuickAddToCart: (product: Product) => void;
  onShareProduct?: (product: Product) => void;
  isShopee?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  settings,
  onOpenDetails,
  onQuickAddToCart,
  onShareProduct,
  isShopee = false,
}) => {
  const [selectedColorIndex, setSelectedColorIndex] = React.useState<number>(0);

  const currentPrice =
    product.isOnSale && product.promotionalPrice
      ? product.promotionalPrice
      : product.price;

  const hasColorVariants = product.hasColors !== false && Array.isArray(product.colors) && product.colors.length > 0;
  const activeColor = hasColorVariants ? product.colors[selectedColorIndex] : undefined;

  // If active color has a dedicated photo, use it; otherwise use product.images[0]
  const mainImage =
    (activeColor?.imageUrl && activeColor.imageUrl.trim()) ||
    product.images[0] ||
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80';

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={() => onOpenDetails(product)}
      className={`group relative bg-white border overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer ${isShopee ? "rounded-none border-transparent hover:border-brand-primary/50 shadow-sm" : "rounded-2xl border-brand-border shadow-xs hover:shadow-xl hover:border-brand-border-dark"}`}
      id={`product-card-${product.id}`}
    >
      {/* Image Container */}
      <div className={`relative w-full overflow-hidden bg-brand-bg-alt shrink-0 ${isShopee ? "aspect-square" : "aspect-[3/4]"}`}>
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Esgotado Overlay */}
        {(product.stock === 0 || product.stock === undefined) && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-3xs flex items-center justify-center z-10">
            <span className="px-4 py-2 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg border border-red-500">
              Sem Estoque
            </span>
          </div>
        )}

        {/* Gradient overlay on bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges on Top Left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isOnSale && (
            <span className="px-2.5 py-0.5 bg-[#9C3A3A] text-white text-[10px] font-bold tracking-wider uppercase rounded-full shadow-xs">
              Promoção
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-0.5 bg-brand-primary-dark text-white text-[10px] font-bold tracking-wider uppercase rounded-full shadow-xs">
              Novo
            </span>
          )}
        </div>

        {/* Top Right Controls: Share Button & Photo count */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          {/* Share Button (Always Visible) */}
          <button
            type="button"
            onClick={handleShareClick}
            className="p-1.5 bg-white/90 hover:bg-white text-stone-700 hover:text-brand-primary-dark rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer"
            title="Compartilhar nas Redes Sociais"
            id={`btn-share-product-card-${product.id}`}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Photo count indicator */}
          {product.images && product.images.length > 1 && (
            <div className="px-2 py-0.5 bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-xs">
              <Images className="w-3 h-3 text-brand-primary" />
              <span>{product.images.length}</span>
            </div>
          )}
        </div>

        {/* Quick Action Overlay Buttons (Desktop Hover) */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="flex-1 py-2.5 px-3 bg-white/95 hover:bg-white text-stone-900 rounded-xl text-xs font-semibold shadow-md flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-brand-primary-dark" />
            <span>Ver Detalhes</span>
          </button>

          <button
            type="button"
            onClick={handleShareClick}
            className="p-2.5 bg-white/95 hover:bg-white text-stone-800 hover:text-brand-primary-dark rounded-xl shadow-md transition-colors cursor-pointer"
            title="Compartilhar Peça"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleWhatsappClick}
            className="p-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl shadow-md transition-colors cursor-pointer"
            title="Pedir no WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className={`flex flex-col flex-1 justify-between bg-white ${isShopee ? "p-2 sm:p-3" : "p-4 sm:p-5"}`}>
        <div>
          {/* Category & Stock */}
          <div className="flex items-center justify-between text-[11px] text-brand-primary-darker font-semibold tracking-wider uppercase mb-1">
            <span>{product.category}</span>
            {product.stock <= 3 && product.stock > 0 && (
              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-normal">
                Últimas peças
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className={`${isShopee ? "font-sans text-xs sm:text-sm font-medium leading-tight" : "font-serif-luxury text-base font-semibold leading-snug"} text-stone-900 line-clamp-2 group-hover:text-brand-primary-dark transition-colors`}>
            {product.name}
          </h3>

          {/* Sizes & Colors preview */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              {product.sizes?.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="px-1.5 py-0.5 bg-brand-bg-alt border border-brand-border text-stone-700 text-[10px] font-semibold rounded"
                >
                  {s}
                </span>
              ))}
              {product.sizes && product.sizes.length > 4 && (
                <span className="text-[10px] text-stone-400 font-medium">
                  +{product.sizes.length - 4}
                </span>
              )}
            </div>

            {/* Colors Swatches with dynamic photo change */}
            {hasColorVariants && (
              <div className="flex items-center gap-1">
                {product.colors.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => handleColorClick(e, i)}
                    className={`w-4 h-4 rounded-full border shadow-2xs transition-all cursor-pointer ${
                      selectedColorIndex === i
                        ? 'ring-2 ring-stone-900 scale-110'
                        : 'border-white hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={`${c.name}${c.imageUrl ? ' (Clique para ver a foto)' : ''}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Active color name indicator if available */}
          {hasColorVariants && activeColor && (
            <div className="mt-1 flex items-center gap-1 text-[10px] text-stone-500 font-medium">
              <span>Cor:</span>
              <span className="text-stone-800 font-semibold">{activeColor.name}</span>
            </div>
          )}
        </div>

        {/* Price & Action Row */}
        <div className={`mt-3 flex items-end justify-between ${isShopee ? "" : "pt-3 border-t border-[#F0E8DF]"}`}>
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className={`font-bold ${isShopee ? "text-brand-primary text-base sm:text-lg" : "text-stone-900 text-lg"}`}>
                {formatCurrency(currentPrice)}
              </span>
              {product.isOnSale && product.promotionalPrice && (
                <span className="text-xs text-stone-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            {settings.enableInstallments !== false &&
            currentPrice >= (settings.minOrderValueForInstallments || 0) &&
            Math.min(settings.maxInstallments || 6, Math.floor(currentPrice / (settings.minInstallmentAmount || 30))) >= 2 ? (
              <span className="text-[10px] text-stone-500 block">
                {Math.min(settings.maxInstallments || 6, Math.floor(currentPrice / (settings.minInstallmentAmount || 30)))}x de {formatCurrency(currentPrice / Math.min(settings.maxInstallments || 6, Math.floor(currentPrice / (settings.minInstallmentAmount || 30))))} s/ juros
              </span>
            ) : (
              <span className="text-[10px] text-emerald-700 font-semibold block">
                À vista no Pix ou Cartão
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handleShareClick}
              className="p-2.5 bg-brand-bg hover:bg-stone-200 text-stone-700 rounded-xl transition-all cursor-pointer"
              title="Compartilhar produto"
            >
              <Share2 className="w-4 h-4 text-stone-700" />
            </button>

            <button
              type="button"
              disabled={product.stock === 0}
              onClick={(e) => {
                e.stopPropagation();
                if (product.stock > 0) {
                  onQuickAddToCart(product);
                }
              }}
              className={`p-2.5 rounded-xl transition-all ${
                product.stock === 0
                  ? 'bg-stone-100 text-stone-300 cursor-not-allowed border border-stone-200/50'
                  : 'bg-stone-100 hover:bg-stone-900 text-stone-700 hover:text-white cursor-pointer'
              }`}
              title={product.stock === 0 ? 'Produto temporariamente sem estoque' : 'Adicionar à Sacola'}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
