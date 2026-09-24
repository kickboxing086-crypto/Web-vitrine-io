import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Check, X, Share, PlusSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PWAInstallButtonProps {
  variant?: 'gold' | 'dark' | 'outline' | 'pill';
  className?: string;
  showText?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'gold',
  className = '',
  showText = true,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span>App Instalado</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setInstalledNotice(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Browser doesn't trigger beforeinstallprompt yet or standard Android/Chrome prompt guidance
      setShowIOSGuide(true);
    }
  };

  const buttonStyles = {
    gold: 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-stone-950 font-bold hover:brightness-110 shadow-md shadow-amber-500/10',
    dark: 'bg-stone-900 border border-amber-500/30 text-amber-300 font-bold hover:bg-stone-800 shadow-sm',
    outline: 'border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 font-bold',
    pill: 'bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 font-bold text-xs rounded-full',
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        type="button"
        className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${buttonStyles[variant]} ${className}`}
        title="Instalar aplicativo no celular ou computador"
        id="btn-install-pwa-app"
      >
        <Smartphone className="w-4 h-4 text-amber-600" />
        {showText && <span>Instalar App PWA</span>}
      </button>

      {/* Guide Modal for iOS Safari / Unsupported prompt */}
      <AnimatePresence>
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-stone-900 border border-amber-500/30 p-6 shadow-2xl text-stone-100 relative"
            >
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white rounded-full bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-stone-950 shadow-md">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400">Instalação Direta</span>
                  <h3 className="text-base font-serif-luxury font-bold text-white">Instalar o App no Celular</h3>
                </div>
              </div>

              {isIOS ? (
                <div className="space-y-3 text-xs text-stone-300">
                  <p>Para instalar na tela inicial do seu iPhone ou iPad:</p>
                  <ol className="space-y-2 bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800">
                    <li className="flex items-start gap-2">
                      <Share className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>1. Toque no botão <strong>Compartilhar</strong> no menu do Safari (ícone de quadrado com seta).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <PlusSquare className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>2. Role a lista e selecione <strong>Adicionar à Tela de Início</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>3. Toque em <strong>Adicionar</strong> no canto superior direito!</span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3 text-xs text-stone-300">
                  <p>Adicione a Web Vitrine à sua tela de início para ter navegação instantânea em modo aplicativo sem baixar nada pela loja de aplicativos:</p>
                  <ol className="space-y-2 bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800">
                    <li className="flex items-start gap-2">
                      <Smartphone className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>1. No menu do Chrome/Navegador (3 pontinhos), escolha <strong>Instalar Aplicativo</strong> ou <strong>Adicionar à Tela Inicial</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>2. O ícone oficial da sua vitrine ficará salvo no seu celular como um app nativo!</span>
                    </li>
                  </ol>
                </div>
              )}

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-stone-950 font-bold text-xs hover:brightness-110 shadow-md"
              >
                Entendi, voltar para a vitrine
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
