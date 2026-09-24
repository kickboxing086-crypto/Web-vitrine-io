import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Check, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PWAInstallButtonProps {
  variant?: 'gold' | 'dark' | 'outline' | 'pill' | 'floating';
  className?: string;
  showText?: boolean;
  label?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'gold',
  className = '',
  showText = true,
  label = 'Instalar',
}) => {
  const { isInstalled, install } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsInstalling(true);

    try {
      // 1. Immediately trigger the file download (WebVitrine-App.apk)
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = '/WebVitrine-App.apk';
      downloadAnchor.download = 'WebVitrine-App.apk';
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      // 2. Also trigger the browser's native PWA prompt if available
      try {
        await install();
      } catch (pwaErr) {
        console.debug('PWA prompt handled alongside download:', pwaErr);
      }

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 4500);
    } catch (err) {
      console.error('Erro ao gerar arquivo do aplicativo:', err);
    } finally {
      setTimeout(() => {
        setIsInstalling(false);
      }, 600);
    }
  };

  const buttonStyles = {
    gold: 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-stone-950 font-bold hover:brightness-110 shadow-md shadow-amber-500/20 active:scale-95',
    dark: 'bg-stone-900 border border-amber-500/30 text-amber-300 font-bold hover:bg-stone-800 shadow-sm active:scale-95',
    outline: 'border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 font-bold active:scale-95',
    pill: 'bg-gradient-to-r from-amber-500/15 to-amber-600/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 font-bold text-xs rounded-full shadow-2xs active:scale-95',
    floating: 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-stone-950 font-extrabold shadow-xl shadow-amber-600/30 border border-white/40 active:scale-95',
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        type="button"
        disabled={isInstalling}
        className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${buttonStyles[variant]} ${className} disabled:opacity-85 disabled:cursor-wait`}
        title="Baixar e instalar aplicativo"
        id="btn-install-app"
      >
        {isInstalling ? (
          <Loader2 className="w-4 h-4 text-amber-700 animate-spin" />
        ) : (
          <Download className="w-4 h-4 text-amber-700" />
        )}
        {showText && <span>{isInstalling ? 'Gerando arquivo...' : label}</span>}
      </button>

      {/* Instant Notification Toast that file was generated and downloaded */}
      <AnimatePresence>
        {downloadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed top-5 right-5 z-[9999] max-w-sm bg-stone-950/95 border border-[#D4AF37] rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-white flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-stone-950 flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-bold text-white">
                Arquivo do Aplicativo Gerado!
              </span>
              <p className="text-[11px] text-stone-300 mt-0.5 leading-tight">
                O arquivo <strong>WebVitrine-App.apk</strong> foi baixado com sucesso. Verifique seus downloads para instalar!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
