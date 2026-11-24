import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import {
  SINGLE_PLAN_CONFIG,
  createMercadoPagoPixPayment,
  checkMercadoPagoPaymentStatus,
  reconcileClientPayments,
  calculateNextRenewalDueDate,
  getSubscriptionStatus,
  MercadoPagoPixResponse,
} from '../lib/mercadoPagoService';
import { saveClient, getClientById } from '../lib/firestoreService';

interface PixRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClient: any;
  storeName?: string;
  onRenewalSuccess?: (updatedClient: any) => void;
}

export const PixRenewalModal: React.FC<PixRenewalModalProps> = ({
  isOpen,
  onClose,
  currentClient,
  storeName,
  onRenewalSuccess,
}) => {
  const [isLoadingPix, setIsLoadingPix] = useState(false);
  const [pixData, setPixData] = useState<MercadoPagoPixResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [renewedClient, setRenewedClient] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // Strict 5 minutes = 300 seconds

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isCompletingRef = useRef(false);

  const activeStoreName = currentClient?.storeName || storeName || 'Minha Loja';
  const clientEmail = currentClient?.email || 'contato@webvitrine.com.br';
  const clientIdentifier = currentClient?.id || currentClient?.username || '';

  // Generate Pix payment on open with 5 min timer
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setRenewedClient(null);
      setErrorMsg(null);
      setTimeLeft(300);
      isCompletingRef.current = false;
      handleGeneratePix();
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen]);

  // Countdown timer (5 minutes max)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && pixData?.success && timeLeft > 0 && !isSuccess) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, pixData, timeLeft, isSuccess]);

  // Real-time polling for Pix approval (every 3 seconds)
  useEffect(() => {
    if (!isOpen || !pixData?.paymentId || isSuccess || timeLeft === 0) return;

    pollingRef.current = setInterval(async () => {
      if (isCompletingRef.current) return;

      let isApproved = false;
      let serverDueDate: string | undefined;

      if (pixData.paymentId) {
        const statusRes = await checkMercadoPagoPaymentStatus(pixData.paymentId, clientIdentifier);
        if (statusRes.isApproved) {
          isApproved = true;
          serverDueDate = statusRes.dueDate;
        }
      }

      if (!isApproved && clientIdentifier) {
        try {
          const fresh = await getClientById(clientIdentifier);
          if (fresh && !getSubscriptionStatus(fresh).isExpired) {
            isApproved = true;
            serverDueDate = fresh.dueDate;
          }
        } catch {
          // ignore transient read errors during polling
        }
      }

      if (isApproved) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        await completeRenewal(String(pixData.paymentId), serverDueDate);
      }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, pixData?.paymentId, isSuccess, timeLeft, clientIdentifier]);

  const handleGeneratePix = async () => {
    setIsLoadingPix(true);
    setErrorMsg(null);
    setTimeLeft(300);
    try {
      const res = await createMercadoPagoPixPayment({
        email: clientEmail,
        name: activeStoreName,
        storeName: activeStoreName,
        clientId: clientIdentifier,
      });

      if (res.success && res.qrCode) {
        setPixData(res);
      } else {
        setPixData(null);
        setErrorMsg(res.errorMessage || 'Não foi possível gerar o QR Code Pix. Tente novamente.');
      }
    } catch {
      setPixData(null);
      setErrorMsg('Falha ao gerar Pix de pagamento.');
    } finally {
      setIsLoadingPix(false);
    }
  };

  const handleManualCheckPayment = async () => {
    if (!pixData?.paymentId && !clientIdentifier) return;
    setIsCheckingPayment(true);
    setErrorMsg(null);
    try {
      let isApproved = false;
      let serverDueDate: string | undefined;

      if (pixData?.paymentId) {
        const statusRes = await checkMercadoPagoPaymentStatus(pixData.paymentId, clientIdentifier);
        if (statusRes.isApproved) {
          isApproved = true;
          serverDueDate = statusRes.dueDate;
        }
      }

      if (!isApproved && clientIdentifier) {
        const reconRes = await reconcileClientPayments(clientIdentifier);
        if (reconRes.renewed) {
          isApproved = true;
          serverDueDate = reconRes.dueDate;
        } else {
          const fresh = await getClientById(clientIdentifier);
          if (fresh && !getSubscriptionStatus(fresh).isExpired) {
            isApproved = true;
            serverDueDate = fresh.dueDate;
          }
        }
      }

      if (isApproved) {
        await completeRenewal(pixData?.paymentId ? String(pixData.paymentId) : undefined, serverDueDate);
      } else {
        setErrorMsg(
          'Pagamento ainda não confirmado. Aguarde alguns segundos após finalizar no app do seu banco e clique novamente.'
        );
        setTimeout(() => setErrorMsg(null), 5000);
      }
    } catch {
      setErrorMsg('Erro ao consultar status do pagamento.');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const completeRenewal = async (confirmedPaymentId?: string, serverDueDate?: string) => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;

    try {
      // Read the latest document updated by the server transaction
      let latestClient = clientIdentifier ? await getClientById(clientIdentifier) : null;

      if (!latestClient || getSubscriptionStatus(latestClient).isExpired) {
        const nextDueDateStr = serverDueDate || calculateNextRenewalDueDate(currentClient?.dueDate);
        const updatedClient = {
          ...(latestClient || currentClient),
          dueDate: nextDueDateStr,
          status: 'active',
          lastRenewedAt: new Date().toISOString(),
          ...(confirmedPaymentId ? { lastPaymentId: confirmedPaymentId } : {}),
          planPrice: SINGLE_PLAN_CONFIG.price,
        };
        await saveClient(updatedClient);
        latestClient = updatedClient;
      }

      localStorage.setItem('store_current_client', JSON.stringify(latestClient));
      setRenewedClient(latestClient);
      setIsSuccess(true);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error('Error completing renewal:', e);
      setIsSuccess(true);
    } finally {
      isCompletingRef.current = false;
    }
  };

  const handleCloseOrContinue = () => {
    if (isSuccess && renewedClient && onRenewalSuccess) {
      onRenewalSuccess(renewedClient);
      return;
    }
    onClose();
  };

  const handleCopyPix = () => {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  const displayDueDate = renewedClient?.dueDate || currentClient?.dueDate;
  const formattedDueDate = (() => {
    if (!displayDueDate) return 'Em 30 dias';
    const parts = String(displayDueDate).slice(0, 10).split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : displayDueDate;
  })();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-[#141417] text-white border-2 border-[#D4AF37] rounded-3xl shadow-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-b from-[#1C1C22] to-[#141417] border-b border-[#27272A] relative">
            <button
              type="button"
              onClick={handleCloseOrContinue}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-stone-950 text-[10px] font-extrabold uppercase tracking-wider">
                Pagamento via Pix
              </span>
              <span className="text-xs text-stone-400">Confirmação Automática</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif-luxury font-bold text-white">
              Renovação do Plano Mensal
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              Loja: <strong className="text-[#D4AF37]">{activeStoreName}</strong>
            </p>
          </div>

          {/* Success State */}
          {isSuccess ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-serif-luxury font-bold text-white">
                Plano Renovado com Sucesso!
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-sm mx-auto leading-relaxed">
                Pagamento via Pix confirmado automaticamente. Sua vitrine virtual está{' '}
                <strong className="text-emerald-400">100% ativa</strong> por mais 30 dias.
              </p>
              <div className="p-4 rounded-2xl bg-[#1C1C22] border border-[#27272A] text-left text-xs space-y-1.5 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-stone-400">Plano:</span>
                  <span className="font-bold text-white">R$ 29,99 / mês</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Status:</span>
                  <span className="text-emerald-400 font-bold">Ativo & Liberado</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Novo Vencimento:</span>
                  <span className="text-[#D4AF37] font-bold">{formattedDueDate}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseOrContinue}
                className="w-full py-3 bg-[#D4AF37] hover:bg-[#E5C378] text-stone-950 font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-md"
              >
                Voltar ao Painel da Loja
              </button>
            </div>
          ) : (
            <div className="p-5 sm:p-6 space-y-5">
              {/* Plan Summary Card */}
              <div className="p-4 rounded-2xl bg-[#1A1A20] border border-[#27272A] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                    Plano Oficial Único
                  </span>
                  <h4 className="font-serif-luxury font-bold text-base text-white">
                    {SINGLE_PLAN_CONFIG.title}
                  </h4>
                  <span className="text-xs text-stone-400">
                    Acesso completo por 30 dias
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-white">R$ 29,99</span>
                  <span className="text-xs text-stone-400 block">/mês</span>
                </div>
              </div>

              {/* Error Message if any */}
              {errorMsg && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-200">
                  {errorMsg}
                </div>
              )}

              {/* Pix Payment Content */}
              <div className="space-y-4">
                {isLoadingPix ? (
                  <div className="py-12 text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
                    <p className="text-xs text-stone-300 font-medium">
                      Gerando QR Code Pix automático...
                    </p>
                  </div>
                ) : timeLeft === 0 ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-white">
                      O tempo limite de 5 minutos expirou.
                    </p>
                    <button
                      type="button"
                      onClick={handleGeneratePix}
                      className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C378] text-stone-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
                    >
                      Gerar Novo QR Code Pix
                    </button>
                  </div>
                ) : pixData?.qrCode ? (
                  <div className="space-y-4">
                    {/* QR Code display */}
                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl w-48 h-48 mx-auto shadow-inner">
                      <QRCodeSVG
                        value={pixData.qrCode}
                        size={160}
                        level="M"
                        includeMargin={false}
                      />
                    </div>

                    {/* Strict 5-Minute Countdown Timer */}
                    <div className="flex items-center justify-between text-xs px-2 text-stone-400 bg-[#1A1A20] p-2.5 rounded-xl border border-[#27272A]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#D4AF37]" />
                        <span>Tempo restante para pagamento:</span>
                      </div>
                      <strong
                        className={`font-mono font-bold text-sm ${
                          timeLeft <= 60 ? 'text-rose-400 animate-pulse' : 'text-[#D4AF37]'
                        }`}
                      >
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </strong>
                    </div>

                    {/* Copy & Paste Code */}
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1 font-medium">
                        Código Pix Copia e Cola:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={pixData.qrCode}
                          className="flex-1 bg-[#1A1A20] border border-[#27272A] rounded-xl px-3 py-2 text-[11px] text-stone-300 font-mono truncate focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                            copied
                              ? 'bg-emerald-500 text-stone-950 font-extrabold'
                              : 'bg-[#D4AF37] hover:bg-[#E5C378] text-stone-950'
                          }`}
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Verification button */}
                    <button
                      type="button"
                      onClick={handleManualCheckPayment}
                      disabled={isCheckingPayment}
                      className="w-full py-3 bg-[#D4AF37] hover:bg-[#E5C378] text-stone-950 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      {isCheckingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                          <span>Verificando Pagamento Pix...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-stone-950 stroke-[3]" />
                          <span>Já realizei o pagamento (Verificar Agora)</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-3">
                    <p className="text-xs text-stone-400">
                      Clique abaixo para gerar o QR Code Pix de renovação.
                    </p>
                    <button
                      type="button"
                      onClick={handleGeneratePix}
                      className="px-4 py-2 bg-[#D4AF37] text-stone-950 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Tentar Gerar QR Code Pix Novamente
                    </button>
                  </div>
                )}
              </div>

              {/* Security info */}
              <div className="pt-2 border-t border-[#222228] flex items-center justify-center text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Pix Seguro com Liberação Automática
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
