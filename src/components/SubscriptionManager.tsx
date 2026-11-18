import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { motion } from 'motion/react';
import {
  Crown,
  Check,
  AlertCircle,
  Clock,
  ShieldCheck,
  QrCode,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  SINGLE_PLAN_CONFIG,
  getSubscriptionStatus,
} from '../lib/mercadoPagoService';
import { PixRenewalModal } from './PixRenewalModal';

interface SubscriptionManagerProps {
  settings: StoreSettings;
  currentClient?: any;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  settings,
  currentClient,
}) => {
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);

  const subStatus = getSubscriptionStatus(currentClient);
  const activeStoreName = currentClient?.storeName || settings.storeName || 'Minha Vitrine';

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="subscription-manager-container">
      {/* Top Status Card */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-[#141417] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-[#27272A]"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C1C22] border border-[#27272A] text-stone-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              Gestão de Assinatura • Pagamento via Pix
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white">
              Status da sua Vitrine Virtual
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              Sua vitrine virtual conta com <strong>5 dias de teste grátis</strong> e renovação instantânea via Pix por apenas <strong>R$ 29,99/mês</strong>. Sem taxas por venda.
            </p>
          </div>

          {/* Time Remaining Card */}
          <div className="bg-[#18181E] border border-[#27272A] rounded-2xl p-4 sm:p-5 flex items-center gap-4 min-w-[220px] shadow-lg">
            <div
              className={`p-3 rounded-2xl ${
                subStatus.dueDateFormatted === 'Conta Vitalícia'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : subStatus.isExpired
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : subStatus.daysRemaining <= 5
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {subStatus.isExpired ? (
                <AlertCircle className="w-7 h-7 text-rose-400" />
              ) : (
                <Crown className="w-7 h-7 text-[#D4AF37]" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {subStatus.dueDateFormatted === 'Conta Vitalícia' ? 'Plano da Conta' : subStatus.isExpired ? 'Status' : 'Tempo de Acesso'}
              </p>
              <p className="text-lg sm:text-xl font-black text-white">
                {subStatus.dueDateFormatted === 'Conta Vitalícia'
                  ? 'Conta Vitalícia'
                  : subStatus.isExpired
                  ? 'Expirado'
                  : `${subStatus.daysRemaining} ${subStatus.daysRemaining === 1 ? 'dia' : 'dias'}`}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5 font-medium">
                {subStatus.dueDateFormatted === 'Conta Vitalícia'
                  ? 'Acesso permanente sem vencimento'
                  : subStatus.isExpired
                  ? 'Renove para desbloquear'
                  : `Vence em: ${subStatus.dueDateFormatted}`}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Single Plan Card */}
      <div className="bg-[#141417] border-2 border-[#D4AF37] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-[#D4AF37] text-stone-950 px-4 py-1 rounded-bl-2xl text-[11px] font-extrabold uppercase tracking-wider shadow-md">
          Plano Oficial Único
        </div>

        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              Assinatura Oficial Web Vitrine
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white mb-2">
            {SINGLE_PLAN_CONFIG.title}
          </h3>

          <p className="text-xs sm:text-sm text-stone-300 mb-6 leading-relaxed">
            Tenha sua vitrine virtual funcionando 24h por dia, sem precisar pagar taxas ou comissões sobre suas vendas. O cliente escolhe os produtos e o pedido chega pronto no seu WhatsApp.
          </p>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl sm:text-5xl font-black text-white">
              R$ 29,99
            </span>
            <span className="text-sm text-stone-400 font-semibold">
              /mês
            </span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-bold">
              5 dias grátis para novos lojistas
            </span>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-xs text-stone-200">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Vitrine virtual ativa 24h</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Pedidos ilimitados no WhatsApp</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Gestão completa de fotos e estoque</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Zero taxas por venda (100% seu lucro)</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Controle financeiro e relatórios</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Renovação instantânea via Pix com QR Code</span>
            </div>
          </div>

          {/* Direct Renewal CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRenewalModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-[#D4AF37] hover:bg-[#E5C378] text-stone-950 font-extrabold rounded-2xl text-sm transition-all shadow-xl flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              id="btn-submanager-renew-pix"
            >
              <Sparkles className="w-4 h-4 fill-stone-950 text-stone-950" />
              <span>Renovar Plano via Pix (R$ 29,99)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs text-stone-400">
              <QrCode className="w-4 h-4 text-[#D4AF37]" />
              <span>Pix com QR Code e validade de 5 minutos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pix Renewal Modal */}
      <PixRenewalModal
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
        currentClient={currentClient}
        storeName={activeStoreName}
      />
    </div>
  );
};
