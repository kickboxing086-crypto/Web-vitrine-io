import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, PlusSquare, Check } from 'lucide-react';
import { usePWAInstall } from '../lib/pwa';
import { motion, AnimatePresence } from 'motion/react';

interface PwaInstallBannerProps {
  storeName?: string;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ storeName = 'Web Vitrine' }) => {
  const { isStandalone, canInstall, installApp } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);
  }, []);

  // If the app is already running as an installed standalone PWA, don't show the banner
  if (!isMounted || isStandalone || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    try {
      if (canInstall) {
        const accepted = await installApp();
        if (accepted) {
          setIsDismissed(true);
        }
      } else {
        // Fallback: If browser doesn't permit direct JavaScript prompt, show how to complete it
        setShowManualModal(true);
      }
    } catch (err) {
      console.warn('Installation error:', err);
      setShowManualModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <>
      <AnimatePresence>
        <motion.aside
          aria-label="Instalação do Aplicativo"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-[999990] bg-[#121114] text-white p-3.5 sm:p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] border-2 border-[#D4AF37]/80 flex flex-col gap-2.5"
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

      {/* Helper Modal if browser requires user menu action */}
      {showManualModal && (
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#16151A] text-white max-w-sm w-full p-5 rounded-2xl border border-[#D4AF37]/40 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm text-stone-100">Instalar Web Vitrine</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-stone-300">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-stone-800 rounded-lg text-[#D4AF37] flex-shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <p>
                    No Safari do iPhone, toque no botão <strong>Compartilhar</strong> (ícone no rodapé).
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-stone-800 rounded-lg text-[#D4AF37] flex-shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <p>
                    Role e toque em <strong>"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-stone-800 rounded-lg text-[#D4AF37] flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <p>
                    Toque em <strong>Adicionar</strong> no canto superior direito.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-stone-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#E5C378] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    1
                  </span>
                  <p>
                    Toque no menu do Chrome (<strong>os 3 pontinhos</strong> no canto superior).
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#E5C378] font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    2
                  </span>
                  <p>
                    Clique em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowManualModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-stone-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Entendi
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};
