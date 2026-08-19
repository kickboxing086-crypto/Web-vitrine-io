import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Crown, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  planTitle?: string;
  period?: string;
  storeName?: string;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  planTitle = 'Plano Mensal',
  period = '30 dias',
  storeName = 'Sua Vitrine',
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
          className="relative w-full max-w-lg bg-[#14120E] text-white rounded-3xl border border-[#D4AF37]/40 shadow-2xl shadow-black/90 overflow-hidden"
          id="modal-payment-success"
        >
          {/* Top Decorative Ambient Glow */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#D4AF37]/20 to-transparent pointer-events-none" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10 cursor-pointer"
            id="btn-close-payment-success-modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 text-center relative z-10">
            {/* Animated Check & Crown Badge */}
            <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-400 p-1 shadow-xl shadow-emerald-950/60"
              >
                <div className="w-full h-full bg-[#14120E] rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 12 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 p-2 rounded-2xl shadow-lg border border-amber-300"
              >
                <Crown className="w-5 h-5" />
              </motion.div>
            </div>

            {/* Title & Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pagamento Confirmado</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white mb-3">
              Recebemos seu Pagamento!
            </h2>

            <p className="text-sm text-stone-300 max-w-sm mx-auto leading-relaxed mb-6">
              O seu pagamento Pix foi identificado com sucesso. Sua assinatura foi renovada e a loja{' '}
              <strong className="text-[#E5C378]">{storeName}</strong> está com acesso 100% liberado!
            </p>

            {/* Info Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400 font-medium">Plano Contratado:</span>
                <span className="font-bold text-white">{planTitle}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400 font-medium">Período de Acesso:</span>
                <span className="font-bold text-emerald-400">+{period} liberados</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400 font-medium">Status da Vitrine:</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Ativa & Online
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onClose}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-[#D4AF37] via-[#E5C378] to-[#C59E2A] hover:opacity-95 text-stone-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-950/40 transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              id="btn-confirm-payment-success"
            >
              <span>Acessar Painel da Minha Loja</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
