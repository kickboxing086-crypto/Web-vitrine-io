import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Check, Loader2, ExternalLink, Smartphone, X } from 'lucide-react';
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
  const { isInstalled, isIframe, install } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
    actionUrl?: string;
    actionLabel?: string;
  } | null>(null);

  if (isInstalled || justInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-semibold select-none shadow-2xs">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span>Instalado</span>
      </div>
    );
  }

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsInstalling(true);
    try {
      const result = await install();

      if (result.status === 'accepted') {
        setJustInstalled(true);
      } else if (result.status === 'iframe') {
        // Inside AI Studio preview iframe - Chrome blocks native PWA prompts inside iframes
        setToastMessage({
          title: 'Abrir no Navegador para Instalar',
          description: 'Navegadores bloqueiam o instalador nativo dentro do visualizador de testes. Abra o link no seu navegador para instalar com 1 clique!',
          actionUrl: window.location.href,
          actionLabel: 'Abrir e Instalar no Celular/PC',
        });
      } else if (result.status === 'ios') {
        setToastMessage({
          title: 'Instalação no iPhone / iPad',
          description: 'No Safari do iOS, toque no botão Compartilhar (ícone com seta para cima) e selecione "Adicionar à Tela de Início".',
        });
      } else if (result.status === 'manual') {
        setToastMessage({
          title: 'Instalação pelo Navegador',
          description: 'Toque no menu ⋮ do navegador (canto superior direito) e selecione "Instalar aplicativo".',
        });
      }
    } catch (err) {
      console.error('Install action error:', err);
    } finally {
      setIsInstalling(false);
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
        className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${buttonStyles[variant]} ${className} disabled:opacity-80 disabled:cursor-wait`}
        title="Instalar aplicativo"
        id="btn-install-app"
      >
        {isInstalling ? (
          <Loader2 className="w-4 h-4 text-amber-700 animate-spin" />
        ) : (
          <Download className="w-4 h-4 text-amber-700" />
        )}
        {showText && <span>{isInstalling ? 'Instalando...' : label}</span>}
      </button>

      {/* Action Notification if browser/environment needs standalone context */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              className="w-full max-w-sm rounded-3xl bg-stone-900 border border-[#D4AF37]/50 p-6 shadow-2xl text-stone-100 relative"
            >
              <button
                onClick={() => setToastMessage(null)}
                className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white rounded-full bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-stone-950 shadow-md">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {toastMessage.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                {toastMessage.description}
              </p>

              {toastMessage.actionUrl && (
                <a
                  href={toastMessage.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setToastMessage(null)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-stone-950 font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-lg mb-2"
                >
                  <span>{toastMessage.actionLabel || 'Abrir e Instalar'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="w-full py-2.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white text-xs font-semibold"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
