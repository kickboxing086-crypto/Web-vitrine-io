import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Sparkles, Check, ArrowRight, LogOut, ShieldAlert } from 'lucide-react';
import { MercadoPagoRenewalModal } from './MercadoPagoRenewalModal';
import { SINGLE_PLAN_CONFIG } from '../lib/mercadoPagoService';

interface ExpiredStoreBlockModalProps {
  currentClient: any;
  storeName?: string;
  onLogout?: () => void;
  onRenewalSuccess?: (updatedClient: any) => void;
}

export const ExpiredStoreBlockModal: React.FC<ExpiredStoreBlockModalProps> = ({
  currentClient,
  storeName,
  onLogout,
  onRenewalSuccess,
}) => {
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);

  const activeStoreName = currentClient?.storeName || storeName || 'Sua Loja';

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
        id="expired-store-educational-block"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg bg-[#141417] text-white border-2 border-[#D4AF37] rounded-3xl shadow-2xl overflow-hidden my-auto"
        >
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-b from-[#1C1C22] to-[#141417] border-b border-[#27272A] text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Período de Testes Expirado
            </div>

            <h2 className="text-2xl font-serif-luxury font-bold text-white tracking-tight">
              Acesso Temporariamente Pausado
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              Loja: <strong className="text-[#D4AF37]">{activeStoreName}</strong>
            </p>
          </div>

          {/* Educational Body */}
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-2xl bg-[#18181E] border border-[#27272A] text-xs text-stone-300 leading-relaxed space-y-2.5">
              <p>
                Olá, <strong className="text-white font-bold">{activeStoreName}</strong>! O seu período de <strong className="text-[#D4AF37]">5 dias de acesso gratuito</strong> à Web Vitrine chegou ao fim.
              </p>
              <p>
                Para continuar utilizando o painel administrativo da sua loja, cadastrando novos produtos e mantendo seu catálogo ativo para as suas clientes enviarem pedidos no seu WhatsApp, realize a renovação do seu plano.
              </p>
              <div className="pt-1 flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Seus produtos e fotos continuam salvos e seguros</span>
              </div>
            </div>

            {/* Single Official Plan Card */}
            <div className="p-4 rounded-2xl bg-[#1A1A22] border-2 border-[#D4AF37]/70 flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                  Plano Oficial
                </span>
                <h4 className="font-serif-luxury font-bold text-base text-white">
                  {SINGLE_PLAN_CONFIG.title}
                </h4>
                <span className="text-[11px] text-stone-400">
                  Renovação direta via Mercado Pago (Pix ou Cartão)
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-white">
                  R$ 29,99
                </span>
                <span className="text-xs text-stone-400 block">/mês</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsRenewalModalOpen(true)}
                className="w-full py-3.5 px-4 bg-[#D4AF37] hover:bg-[#E5C378] text-stone-950 font-extrabold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer"
                id="btn-educational-renew-mercadopago"
              >
                <Sparkles className="w-4 h-4 fill-stone-950" />
                <span>Renovar Meu Acesso por R$ 29,99 via Mercado Pago</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-2.5 px-4 bg-[#18181E] hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl text-xs font-semibold border border-[#27272A] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mercado Pago Renewal Modal */}
      <MercadoPagoRenewalModal
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
        currentClient={currentClient}
        storeName={activeStoreName}
        onRenewalSuccess={(updated) => {
          setIsRenewalModalOpen(false);
          if (onRenewalSuccess) {
            onRenewalSuccess(updated);
          }
        }}
      />
    </>
  );
};
