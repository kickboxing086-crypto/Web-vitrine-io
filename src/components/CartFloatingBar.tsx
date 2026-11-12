import React from 'react';
import { CartItem } from '../types';
import { formatCurrency } from '../lib/formatters';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartFloatingBarProps {
  cart: CartItem[];
  onOpenCart: () => void;
}

export const CartFloatingBar: React.FC<CartFloatingBarProps> = ({
  cart,
  onOpenCart,
}) => {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (totalItems === 0) {
    return null;
  }

  const subtotal = cart.reduce((acc, item) => {
    const price = item.product.isOnSale && item.product.promotionalPrice
      ? item.product.promotionalPrice
      : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-[400px] z-40"
        id="digital-menu-cart-floating-bar"
      >
        <button
          type="button"
          onClick={onOpenCart}
          className="w-full bg-[#16161A] hover:bg-[#1A1A20] text-white border-2 border-[#D4AF37] rounded-2xl p-3 sm:p-3.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99]"
        >
          {/* Left: Bag icon + count badge + label */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-[#D4AF37] text-stone-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <ShoppingBag className="w-5 h-5 fill-stone-950 text-stone-950" />
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-white text-stone-950 text-[11px] font-extrabold rounded-full flex items-center justify-center shadow-md border border-stone-900">
                {totalItems}
              </span>
            </div>

            <div className="text-left">
              <span className="block text-xs font-bold text-white uppercase tracking-wider">
                Ver Sacola do Pedido
              </span>
              <span className="text-[11px] text-stone-300">
                {totalItems === 1 ? '1 peça selecionada' : `${totalItems} peças selecionadas`}
              </span>
            </div>
          </div>

          {/* Right: Subtotal & Action CTA */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block uppercase font-medium">Total</span>
              <span className="text-sm font-extrabold text-[#D4AF37]">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <div className="w-8 h-8 rounded-xl bg-[#D4AF37] group-hover:bg-[#E5C378] text-stone-950 flex items-center justify-center transition-colors shadow-sm">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
