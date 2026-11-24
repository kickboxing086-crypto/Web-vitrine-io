import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Check,
  ArrowRight,
  LogOut,
  ShieldAlert,
  RefreshCw,
  QrCode,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageCircle,
  RotateCw,
} from 'lucide-react';
import { PixRenewalModal } from './PixRenewalModal';
import { SINGLE_PLAN_CONFIG, getSubscriptionStatus } from '../lib/mercadoPagoService';
import { getClientById } from '../lib/firestoreService';

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
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'expired' | 'error';
    message: string;
    checkedAt: string;
    dueDate?: string;
  } | null>(null);

  const activeStoreName = currentClient?.storeName || storeName || 'Sua Loja';

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return 'Não informado';
    try {
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleRefreshAndCheckStatus = async () => {
    setIsCheckingStatus(true);
    setStatusFeedback(null);
    const nowTime = new Date().toLocaleTimeString('pt-BR');

    try {
      const clientIdOrUsername = currentClient?.id || currentClient?.username;
      let freshClient: any = null;

      if (clientIdOrUsername) {
        freshClient = await getClientById(clientIdOrUsername);
      }

      // Fallback: also check registered_clients cache in localStorage if Firestore had delay
      if (!freshClient && currentClient?.username) {
        try {
          const cachedAll = localStorage.getItem('registered_clients');
          if (cachedAll) {
            const list = JSON.parse(cachedAll);
            const found = list.find((c: any) => c.username === currentClient.username || c.id === currentClient.id);
            if (found) freshClient = found;
          }
        } catch {
          // ignore
        }
      }

      if (freshClient) {
        const sub = getSubscriptionStatus(freshClient);

        // Update local storage so browser reload keeps the latest client status
        localStorage.setItem('store_current_client', JSON.stringify(freshClient));

        if (!sub.isExpired) {
          setStatusFeedback({
            type: 'success',
            message: 'Pagamento identificado e acesso liberado com sucesso! Atualizando sistema...',
            checkedAt: nowTime,
            dueDate: freshClient.dueDate,
          });

          setTimeout(() => {
            if (onRenewalSuccess) {
              onRenewalSuccess(freshClient);
            }
            window.location.reload();
          }, 1200);
          return;
        } else {
          setStatusFeedback({
            type: 'expired',
            message: 'O pagamento ainda não foi identificado pelo sistema. Se você já realizou o Pix ou transferência, clique em "Recarregar Página" ou envie o comprovante no WhatsApp.',
            checkedAt: nowTime,
            dueDate: freshClient.dueDate,
          });
        }
      } else {
        // If could not fetch doc, prompt reload
        setStatusFeedback({
          type: 'expired',
          message: 'Sua assinatura continua registrada como expirada. Caso tenha efetuado o pagamento, recarregue a página ou envie o comprovante para liberação imediata.',
          checkedAt: nowTime,
          dueDate: currentClient?.dueDate,
        });
      }
    } catch (err) {
      console.error('Error refreshing client status:', err);
      setStatusFeedback({
        type: 'error',
        message: 'Não foi possível consultar os dados neste momento. Clique no botão de recarregar a página para tentar novamente.',
        checkedAt: nowTime,
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSendProofWhatsapp = () => {
    const phone = '5511999999999';
    const store = activeStoreName;
    const user = currentClient?.username || '';
    const text = encodeURIComponent(
      `Olá! Já realizei o pagamento da minha Web Vitrine (${store} - Usuário: ${user}), mas a conta ainda não liberou no sistema. Segue meu comprovante de pagamento para liberação imediata:`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

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
          <div className="p-6 space-y-4">
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
                  Renovação rápida via Pix com QR Code
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-white">
                  R$ 29,99
                </span>
                <span className="text-xs text-stone-400 block">/mês</span>
              </div>
            </div>

            {/* Feedback / Status Card when checked */}
            <AnimatePresence>
              {statusFeedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                      statusFeedback.type === 'success'
                        ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-200'
                        : 'bg-[#1C1C24] border-amber-500/40 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        {statusFeedback.type === 'success' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-300">Pagamento Confirmado!</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-300">Status Atual da Conta</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Checado às {statusFeedback.checkedAt}
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-stone-300">
                      {statusFeedback.message}
                    </p>

                    {statusFeedback.dueDate && (
                      <div className="text-[11px] text-stone-400">
                        Vencimento no cadastro: <strong className="text-white">{formatDueDate(statusFeedback.dueDate)}</strong>
                      </div>
                    )}

                    {statusFeedback.type !== 'success' && (
                      <div className="pt-2 flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => window.location.reload()}
                          className="flex-1 py-2 px-3 bg-[#24242F] hover:bg-[#2C2C39] text-white text-[11px] font-bold rounded-xl border border-stone-700 hover:border-stone-500 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Recarregar Página Agora</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleSendProofWhatsapp}
                          className="flex-1 py-2 px-3 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 text-[11px] font-bold rounded-xl border border-emerald-700/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Enviar Comprovante</span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              {/* Primary: Pix Renewal Modal */}
              <button
                type="button"
                onClick={() => setIsRenewalModalOpen(true)}
                className="w-full py-3.5 px-4 bg-[#D4AF37] hover:bg-[#E5C378] text-stone-950 font-extrabold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer"
                id="btn-educational-renew-pix"
              >
                <QrCode className="w-4 h-4 text-stone-950" />
                <span>Renovar Meu Acesso por R$ 29,99 via Pix</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Dedicated Status Check & Page Reload Button */}
              <button
                type="button"
                onClick={handleRefreshAndCheckStatus}
                disabled={isCheckingStatus}
                className="w-full py-3 px-4 bg-[#1A1A22] hover:bg-[#242430] active:bg-[#15151C] text-stone-200 hover:text-white font-bold rounded-xl text-xs sm:text-sm border border-[#33333F] hover:border-[#D4AF37]/60 transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer disabled:opacity-60"
                id="btn-reload-check-status"
              >
                <RefreshCw className={`w-4 h-4 text-[#D4AF37] ${isCheckingStatus ? 'animate-spin' : ''}`} />
                <span>
                  {isCheckingStatus
                    ? 'Consultando Pagamento e Atualizando...'
                    : 'Recarregar Página & Atualizar Status'}
                </span>
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

      {/* Pix Renewal Modal */}
      <PixRenewalModal
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
