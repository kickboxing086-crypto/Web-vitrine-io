import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Check } from 'lucide-react';
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
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);
  }, []);

  // Do not show if already in standalone app mode or dismissed for session
  if (isStandalone || isDismissed) {
    return null;
  }

  // Show if native install prompt is ready OR on iOS Safari (where install prompt isn't standard)
  const shouldShow = canInstall || (isIOS && !isStandalone);

  if (!shouldShow) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    const success = await installApp();
    if (success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <>
      <AnimatePresence>
        <motion.aside
          aria-label="Instalação do Aplicativo"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-stone-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-[#D4AF37]/30 flex flex-col gap-2.5"
          id="pwa-install-banner"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-[#D4AF37]/40 flex-shrink-0 flex items-center justify-center shadow-md">
                <img
                  src="/icon-192-v3.png"
                  alt="App Icon"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to SVG if image not rendered
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-stone-100 line-clamp-1">
                    Web Vitrine
                  </span>
                  <span className="px-1.5 py-0.5 bg-[#D4AF37]/20 text-[#E5C378] text-[9px] font-bold rounded">
                    App PWA
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 line-clamp-1">
                  Instale no seu celular para acesso rápido e direto!
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

          <div className="flex items-center gap-2 pt-1 border-t border-stone-800">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] hover:from-[#E5C378] hover:to-[#B8860B] text-stone-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              id="btn-install-pwa"
            >
              <Download className="w-3.5 h-3.5 text-stone-950" />
              <span>Instalar Aplicativo</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="py-2 px-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-xl font-medium transition-colors cursor-pointer"
              id="btn-later-pwa"
            >
              Agora não
            </button>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* iOS Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-stone-900 text-white max-w-sm w-full p-5 rounded-2xl border border-stone-800 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm text-stone-100">Instalar no iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#E5C378] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  1
                </span>
                <p>
                  Toque no botão de <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) na barra inferior do Safari.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#E5C378] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  2
                </span>
                <p>
                  Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#E5C378] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  3
                </span>
                <p>
                  Toque em <strong>"Adicionar"</strong> no canto superior direito para concluir.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};
