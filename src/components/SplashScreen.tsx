import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  storeName?: string;
  logoUrl?: string;
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  storeName = 'Web Vitrine',
  logoUrl = '/icon-512-v5.png',
  onFinish,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 15;
      });
    }, 180);

    // Auto dismiss after ~2.2s
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 600);
    }, 2200);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 400);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0C0B0E] select-none cursor-pointer overflow-hidden"
          id="splash-screen-overlay"
        >
          {/* Ambient Lighting & Glow effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-[120px]" />
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[140px]" />
            {/* Subtle grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]" 
              style={{
                backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }} 
            />
          </div>

          {/* Center Brand Animation Box */}
          <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-sm">
            
            {/* Pulsing & Rotating Glow Ring */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative mb-6"
            >
              {/* Outer Golden Aura */}
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.4,
                  ease: 'easeInOut',
                }}
                className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#D4AF37] via-[#E5C378] to-[#996515] opacity-50 blur-lg"
              />

              {/* Logo Frame with Golden Gradient Border */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl p-0.5 bg-gradient-to-b from-[#E5C378] via-[#D4AF37] to-[#7A5812] shadow-2xl shadow-black/80">
                <div className="w-full h-full bg-[#16151A] rounded-[14px] overflow-hidden flex items-center justify-center p-2">
                  <motion.img
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    src={logoUrl || '/icon-512-v5.png'}
                    alt={storeName}
                    className="w-full h-full object-contain rounded-lg drop-shadow-md"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.currentTarget as HTMLImageElement).src = '/logo-master.jpg';
                    }}
                  />
                </div>
              </div>

              {/* Floating Sparkle Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="absolute -top-2 -right-2 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black p-1.5 rounded-full shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            </motion.div>

            {/* Brand Title with Golden Typography */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="space-y-1.5"
            >
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Playfair_Display',serif]">
                <span className="bg-gradient-to-r from-stone-100 via-[#E5C378] to-stone-200 bg-clip-text text-transparent">
                  {storeName}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#D4AF37]/90 font-medium tracking-wide uppercase">
                Catálogo & Experiência Exclusiva
              </p>
            </motion.div>

            {/* Elegant Minimal Progress Bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="w-44 mt-8"
            >
              <div className="w-full h-1 bg-stone-800/80 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'linear' }}
                />
              </div>
              <div className="flex items-center justify-between mt-2.5 px-0.5">
                <span className="text-[10px] text-stone-500 font-mono tracking-wider">
                  Carregando vitrine...
                </span>
                <span className="text-[10px] text-[#D4AF37] font-bold font-mono">
                  {progress}%
                </span>
              </div>
            </motion.div>

            {/* Tap to enter hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ delay: 1, duration: 1.8, repeat: Infinity }}
              className="text-[11px] text-stone-400 mt-6 tracking-wide"
            >
              Toque para abrir agora
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
