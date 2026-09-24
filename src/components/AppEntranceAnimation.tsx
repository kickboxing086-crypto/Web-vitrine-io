import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles } from 'lucide-react';

interface AppEntranceAnimationProps {
  storeName?: string;
  onAnimationComplete: () => void;
}

export const AppEntranceAnimation: React.FC<AppEntranceAnimationProps> = ({
  storeName = 'Web Vitrine',
  onAnimationComplete,
}) => {
  const [stage, setStage] = useState<'intro' | 'fadeout'>('intro');

  useEffect(() => {
    // Stage 1: Entrance presentation (1.2 seconds)
    const timer1 = setTimeout(() => {
      setStage('fadeout');
    }, 1100);

    // Stage 2: Complete and unmount (1.5 seconds)
    const timer2 = setTimeout(() => {
      onAnimationComplete();
    }, 1450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onAnimationComplete]);

  return (
    <AnimatePresence>
      {stage !== 'fadeout' ? (
        <motion.div
          key="entrance-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0A0C] text-stone-100 overflow-hidden select-none"
          style={{
            // Keep container proportional and prevent overflow regardless of zoom
            width: '100vw',
            height: '100vh',
          }}
        >
          {/* Subtle Ambient Golden Glows */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.2, 1], opacity: [0, 0.4, 0.25] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#D4AF37]/30 via-amber-500/10 to-transparent blur-3xl"
            />
          </div>

          {/* Proportional Centered Box */}
          <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-xs sm:max-w-sm w-full mx-auto">
            {/* Animated Logo Emblem */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              className="relative mb-5"
            >
              {/* Spinning Glow Ring */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#D4AF37] via-[#FFF3D1] to-[#B8860B] blur-md opacity-50 animate-pulse" />

              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] p-0.5 shadow-2xl">
                <div className="w-full h-full bg-[#121115] rounded-[22px] flex items-center justify-center">
                  <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-[#D4AF37]" />
                </div>
              </div>

              {/* Sparkle badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.35, type: 'spring' }}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-stone-950 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
              </motion.div>
            </motion.div>

            {/* Store Name Title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25, ease: 'easeOut' }}
              className="space-y-1.5"
            >
              <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white tracking-tight">
                {storeName}
              </h1>
              <p className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
                Vitrine Virtual de Luxo
              </p>
            </motion.div>

            {/* Proportional Golden Loader Bar */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '120px', opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35, ease: 'easeInOut' }}
              className="mt-6 h-1 rounded-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent overflow-hidden"
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-full bg-white/80 blur-2xs"
              />
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
