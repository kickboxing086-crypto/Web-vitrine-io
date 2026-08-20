import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../lib/pwa';
import { motion, AnimatePresence } from 'motion/react';

interface PwaInstallBannerProps {
  storeName?: string;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ storeName = 'Web Vitrine' }) => {
  const { isStandalone, installApp } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If the app is already running as an installed standalone PWA, don't show the banner
  if (!isMounted || isStandalone || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    try {
      const accepted = await installApp();
      if (accepted) {
        setIsDismissed(true);
      }
    } catch (err) {
      console.warn('Installation error:', err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Instalação do Aplicativo"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-[999999] bg-[#121114] text-white p-3.5 sm:p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] border-2 border-[#D4AF37]/80 flex flex-col gap-2.5"
        id="pwa-install-banner"
        style={{ backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-black border border-[#D4AF37] flex-shrink-0 flex items-center justify-center shadow-lg p-0.5 relative">
              <img
                src="/icon-192-v5.png"
                alt="Web Vitrine App"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo-master.jpg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-stone-100 line-clamp-1">
                  {storeName || 'Web Vitrine'}
                </span>
                <span className="px-1.5 py-0.5 bg-[#D4AF37]/30 text-[#F3E5AB] text-[9px] font-extrabold rounded border border-[#D4AF37]/50 tracking-wider">
                  APP OFICIAL
                </span>
              </div>
              <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">
                Instale no seu celular para acesso rápido!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer bg-white/5 hover:bg-white/10"
            title="Fechar"
            id="btn-close-pwa-banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-stone-800">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] hover:brightness-110 text-stone-950 font-black text-xs rounded-xl shadow-lg shadow-[#D4AF37]/30 flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-95 border border-[#FFF8DC]"
            id="btn-install-pwa"
          >
            <Download className="w-4 h-4 text-stone-950 stroke-[2.5]" />
            <span>INSTALAR APLICATIVO</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs rounded-xl font-medium transition-colors cursor-pointer border border-stone-800"
            id="btn-later-pwa"
          >
            Agora não
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
