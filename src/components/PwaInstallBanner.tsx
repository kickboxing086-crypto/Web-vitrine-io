import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../lib/pwa';
import { motion, AnimatePresence } from 'motion/react';

interface PwaInstallBannerProps {
  storeName?: string;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ storeName = 'Web Vitrine' }) => {
  const { canInstall, isStandalone, installApp } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('pwa_prompt_dismissed') === 'true';
  });

  // Do not show if already running inside installed standalone app or dismissed for this session
  if (isStandalone || isDismissed) {
    return null;
  }

  // Only display the banner if the browser supports direct installation
  if (!canInstall) {
    return null;
  }

  const handleInstallClick = async () => {
    try {
      const accepted = await installApp();
      if (accepted) {
        setIsDismissed(true);
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
      }
    } catch (err) {
      console.warn('Direct installation error:', err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Instalação do Aplicativo"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-[99990] bg-stone-950/95 backdrop-blur-xl text-white p-3.5 sm:p-4 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] border border-[#D4AF37]/40 flex flex-col gap-2.5"
        id="pwa-install-banner"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-black/60 border border-[#D4AF37]/50 flex-shrink-0 flex items-center justify-center shadow-lg p-0.5">
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
                <span className="px-1.5 py-0.5 bg-[#D4AF37]/20 text-[#E5C378] text-[9px] font-bold rounded border border-[#D4AF37]/30">
                  APP
                </span>
              </div>
              <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">
                Instale no seu celular com apenas um clique!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            title="Fechar"
            id="btn-close-pwa-banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-stone-800/80">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#D4AF37] via-[#E5C378] to-[#AA7A1E] hover:opacity-95 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer transform active:scale-95"
            id="btn-install-pwa"
          >
            <Download className="w-3.5 h-3.5 text-stone-950 stroke-[2.5]" />
            <span>Instalar Aplicativo</span>
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
