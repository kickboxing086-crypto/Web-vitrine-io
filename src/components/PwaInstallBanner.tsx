import React, { useState, useEffect } from 'react';
import { Download, X, Loader2, Smartphone, Share, PlusSquare, Check } from 'lucide-react';
import { usePWAInstall } from '../lib/pwa';
import { motion, AnimatePresence } from 'motion/react';

interface PwaInstallBannerProps {
  storeName?: string;
  logoUrl?: string;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({
  storeName = 'Web Vitrine',
  logoUrl,
}) => {
  const { isStandalone, installApp } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));
  }, []);

  // Do not show if already running inside standalone app or dismissed
  if (!isMounted || isStandalone || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const result = await installApp();
      if (result === 'accepted') {
        setIsDismissed(true);
      } else if (result === 'unavailable') {
        // Show manual instructions if browser doesn't support direct prompt
        setShowManualModal(true);
      }
    } catch (err) {
      console.warn('Native install error:', err);
      setShowManualModal(true);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const imageSrc = logoUrl || '/logo-master.jpg';

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
              {/* Store Logo */}
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-black border border-[#D4AF37] flex-shrink-0 flex items-center justify-center shadow-lg relative p-0.5">
                <img
                  src={imageSrc}
                  alt={storeName || 'Web Vitrine App'}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src.indexOf('logo-master.jpg') === -1) {
                      target.src = '/logo-master.jpg';
                    } else if (target.src.indexOf('icon-192.png') === -1) {
                      target.src = '/icon-192.png';
                    }
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
              disabled={isInstalling}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] hover:brightness-110 text-stone-950 font-black text-xs rounded-xl shadow-lg shadow-[#D4AF37]/30 flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-95 border border-[#FFF8DC] disabled:opacity-75"
              id="btn-install-pwa"
            >
              {isInstalling ? (
                <Loader2 className="w-4 h-4 text-stone-950 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-stone-950 stroke-[2.5]" />
              )}
              <span>{isInstalling ? 'ACESSANDO...' : 'INSTALAR APLICATIVO'}</span>
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

      {/* Manual Instructions Modal */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121114] text-white max-w-sm w-full p-5 rounded-2xl border border-[#D4AF37]/40 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-bold text-sm text-stone-100">Instalação Manual</h3>
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
                <div className="space-y-4 text-xs text-stone-300">
                  <p className="text-stone-400">O seu dispositivo requer a instalação manual através do Safari:</p>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-stone-800 rounded-lg text-[#D4AF37] flex-shrink-0">
                      <Share className="w-4 h-4" />
                    </div>
                    <p>
                      1. Toque no botão <strong>Compartilhar</strong> no rodapé do Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-stone-800 rounded-lg text-[#D4AF37] flex-shrink-0">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <p>
                      2. Role a lista e toque em <strong>"Adicionar à Tela de Início"</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-stone-800 rounded-lg text-[#D4AF37] flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <p>
                      3. Toque em <strong>Adicionar</strong> no canto superior direito.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs text-stone-300">
                  <p className="text-stone-400">O seu navegador requer a instalação manual através do menu:</p>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#E5C378] font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                      1
                    </div>
                    <p>
                      Toque no menu do navegador (<strong>os 3 pontinhos ⋮</strong>).
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#E5C378] font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                      2
                    </div>
                    <p>
                      Clique em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7A1E] text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Entendi
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
