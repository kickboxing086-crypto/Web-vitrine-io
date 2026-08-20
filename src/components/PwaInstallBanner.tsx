import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { usePwa } from '../lib/pwa';
import { motion, AnimatePresence } from 'motion/react';

export const PwaInstallBanner: React.FC<{ storeName?: string }> = ({ storeName = 'WEB VITRINE' }) => {
  const { canInstall, isStandalone, triggerNativeInstall } = usePwa();
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show banner after 3 seconds if not standalone and not dismissed
    const timer = setTimeout(() => {
      if (!isStandalone && !isDismissed) {
        setIsVisible(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isStandalone, isDismissed]);

  if (!isVisible || isStandalone || isDismissed) return null;

  const handleInstall = async () => {
    if (isInstalling) return;
    setIsInstalling(true);
    
    // Safety timeout to reset "installing" state if nothing happens
    const safetyTimeout = setTimeout(() => {
      setIsInstalling(false);
    }, 5000);

    try {
      const result = await triggerNativeInstall();
      clearTimeout(safetyTimeout);
      
      if (result === 'accepted') {
        setIsDismissed(true);
      } else {
        setIsInstalling(false);
      }
    } catch (error) {
      console.error('Install error:', error);
      clearTimeout(safetyTimeout);
      setIsInstalling(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-4 right-4 z-[9999] bg-[#121114] border-2 border-[#D4AF37] p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 max-w-md mx-auto"
        style={{ backdropFilter: 'blur(10px)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black rounded-xl border border-[#D4AF37] flex items-center justify-center p-1 flex-shrink-0 overflow-hidden">
            <img 
              src="/logo-master.jpg" 
              alt="Logo" 
              className="w-full h-full object-cover" 
              onLoad={(e) => console.log('PWA Logo loaded')}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.includes('logo-master.jpg')) {
                  target.src = '/icon-192.png';
                } else if (target.src.includes('icon-192.png')) {
                  target.src = '/favicon.png';
                }
              }}
            />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-white font-black text-sm leading-tight truncate">{storeName}</h4>
            <p className="text-stone-400 text-[10px] uppercase tracking-wider font-bold">Aplicativo Oficial</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="bg-[#D4AF37] text-black px-5 py-2.5 rounded-xl text-[11px] font-black flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/20 disabled:opacity-70 whitespace-nowrap"
          >
            {isInstalling ? (
              <>
                <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                {canInstall ? 'INSTALANDO...' : 'PREPARANDO...'}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                INSTALAR AGORA
              </>
            )}
          </button>
          
          <button 
            onClick={() => setIsDismissed(true)}
            className="p-1 text-stone-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
