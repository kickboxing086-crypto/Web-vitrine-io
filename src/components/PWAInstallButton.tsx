import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Check, X, Share, PlusSquare, Sparkles } from 'lucide-react';
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
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span>Instalado</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setInstalledNotice(true);
      }
    } else {
      setShowIOSGuide(true);
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
        className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${buttonStyles[variant]} ${className}`}
        title="Instalar aplicativo no celular ou computador"
        id="btn-install-app"
      >
        <Download className="w-4 h-4 text-amber-700 animate-bounce" />
        {showText && <span>{label}</span>}
      </button>

      {/* Guide Modal for iOS Safari & unsupported desktop/android */}
      <AnimatePresence>
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-sm rounded-3xl bg-stone-900 border border-[#D4AF37]/40 p-6 shadow-2xl text-stone-100 relative"
            >
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white rounded-full bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-stone-950 shadow-md">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#D4AF37]">Acesso Instantâneo</span>
                  <h3 className="text-base font-serif-luxury font-bold text-white">Instalar o Aplicativo</h3>
                </div>
              </div>

              {isIOS ? (
                <div className="space-y-3 text-xs text-stone-300">
                  <p>Para adicionar o aplicativo na tela inicial do seu iPhone ou iPad:</p>
                  <ol className="space-y-2.5 bg-stone-950/90 p-3.5 rounded-2xl border border-stone-800">
                    <li className="flex items-start gap-2.5">
                      <Share className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <span>1. Toque no ícone <strong>Compartilhar</strong> na barra do Safari (quadrado com seta para cima).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <PlusSquare className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <span>2. Role as opções e selecione <strong>Adicionar à Tela de Início</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <span>3. Toque em <strong>Adicionar</strong> no canto superior direito.</span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3 text-xs text-stone-300">
                  <p>Tenha a vitrine como um aplicativo nativo na sua tela inicial:</p>
                  <ol className="space-y-2.5 bg-stone-950/90 p-3.5 rounded-2xl border border-stone-800">
                    <li className="flex items-start gap-2.5">
                      <Smartphone className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <span>1. No menu do seu navegador (três pontinhos), toque em <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>2. Confirme a instalação para abrir o aplicativo diretamente da tela do seu aparelho com rapidez máxima!</span>
                    </li>
                  </ol>
                </div>
              )}

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-stone-950 font-bold text-xs hover:brightness-110 shadow-lg cursor-pointer"
              >
                Entendi, continuar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
