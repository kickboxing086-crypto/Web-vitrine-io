import React from 'react';
import { Download, X } from 'lucide-react';
import { usePwa } from '../lib/pwa';
import { motion, AnimatePresence } from 'motion/react';

export const PwaInstallBanner: React.FC<{ storeName?: string }> = ({ storeName = 'Vitrine' }) => {
  const { canInstall, triggerNativeInstall } = usePwa();

  if (!canInstall) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-4 right-4 z-[9999] bg-[#121114] border-2 border-[#D4AF37] p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 max-w-md mx-auto"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black rounded-xl border border-[#D4AF37] flex items-center justify-center p-1">
            <img src="/icon-192.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm leading-tight">{storeName}</h4>
            <p className="text-stone-400 text-[11px]">Instalar aplicativo oficial</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerNativeInstall()}
            className="bg-[#D4AF37] text-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Download className="w-4 h-4" />
            INSTALAR
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
