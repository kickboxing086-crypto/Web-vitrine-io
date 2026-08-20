import React, { useState, useEffect } from 'react';
import { Download, X, Loader2, Smartphone, CheckCircle, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../lib/pwa';
import { motion, AnimatePresence } from 'motion/react';

interface PwaInstallBannerProps {
  storeName?: string;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ storeName = 'Web Vitrine' }) => {
  const { isStandalone, installApp } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const [helperNotice, setHelperNotice] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Do not show if already running inside installed standalone app or dismissed
  if (!isMounted || isStandalone || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    setHelperNotice(null);
    try {
      const result = await installApp();
      if (result === 'accepted') {
        setIsDismissed(true);
      } else if (result === 'unavailable') {
        // If the browser hasn't fired beforeinstallprompt or is in iOS/Webview, give brief helpful tip
        const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
        if (isIOS) {
          setHelperNotice('No iPhone: toque em Compartilhar ⎋ e "Adicionar à Tela de Início"');
        } else {
          setHelperNotice('Abra o menu (⋮) do seu navegador e toque em "Instalar aplicativo"');
        }
      }
    } catch (err) {
      console.warn('Native install error:', err);
      setHelperNotice('Abra o menu (⋮) do seu navegador e toque em "Instalar aplicativo"');
    } finally {
      setIsInstalling(false);
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
        className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-[999990] bg-[#121114] text-white p-3.5 sm:p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] border-2 border-[#D4AF37]/80 flex flex-col gap-2.5"
        id="pwa-install-banner"
        style={{ backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* App Icon with guaranteed uncorrupted fallback */}
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#1A181C] border border-[#D4AF37] flex-shrink-0 flex items-center justify-center shadow-lg relative">
              {!imgError ? (
                <img
                  src="/icon-192.png"
                  alt={storeName || 'Web Vitrine App'}
                  className="w-full h-full object-cover rounded-lg"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1E1C22] to-black flex items-center justify-center">
                  <span className="font-serif font-black text-xs text-[#E5C378] tracking-tighter">
                    WV
                  </span>
                </div>
              )}
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

        {/* Dynamic Helper Notice if browser needs direct menu trigger */}
        {helperNotice && (
          <div className="bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F3E5AB] px-3 py-2 rounded-xl text-[11px] leading-snug flex items-center gap-2">
            <Smartphone className="w-4 h-4 flex-shrink-0 text-[#E5C378]" />
            <span>{helperNotice}</span>
          </div>
        )}

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
            <span>{isInstalling ? 'ACESSANDO INSTALADOR...' : 'INSTALAR APLICATIVO'}</span>
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
