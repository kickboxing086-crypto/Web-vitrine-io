import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallButton } from './PWAInstallButton';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const InstallFloatingBar: React.FC = () => {
  const { isInstalled } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('install_bar_dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('install_bar_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed bottom-4 right-4 z-40 max-w-xs sm:max-w-sm"
        id="floating-install-bar"
      >
        <div className="bg-stone-950/95 border border-[#D4AF37]/50 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-stone-950 flex-shrink-0 shadow-md">
              <Download className="w-4.5 h-4.5 text-stone-950" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-white leading-tight">
                Aplicativo no Celular
              </span>
              <span className="text-[10px] text-stone-400">
                Acesso rápido em 1 toque
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <PWAInstallButton variant="gold" label="Instalar" showText={true} className="px-3 py-1.5 text-xs font-extrabold" />
            <button
              onClick={handleDismiss}
              className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              title="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
