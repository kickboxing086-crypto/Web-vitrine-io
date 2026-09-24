import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Check, Loader2 } from 'lucide-react';

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
  const [justInstalled, setJustInstalled] = useState(false);

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
      const accepted = await install();
      if (accepted) {
        setJustInstalled(true);
      }
    } catch (err) {
      console.error('Erro na ação de instalar:', err);
    } finally {
      setTimeout(() => setIsInstalling(false), 800);
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
    <button
      onClick={handleInstallClick}
      type="button"
      disabled={isInstalling}
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer text-xs ${buttonStyles[variant]} ${className} disabled:opacity-85 disabled:cursor-wait`}
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
  );
};
