import React, { useState, useEffect } from 'react';
import { StoreSettings } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Check,
  AlertCircle,
  Clock,
  Copy,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  QrCode,
  Receipt,
  Building2,
  Wallet,
  CreditCard,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { generatePixPayload } from '../lib/pixUtils';
import { saveClient } from '../lib/firestoreService';

interface SubscriptionManagerProps {
  settings: StoreSettings;
  currentClient?: any;
}

interface PlanOption {
  id: string;
  title: string;
  period: string;
  monthsCount: number;
  price: number;
  monthlyEquivalent?: string;
  saveAmount?: string;
  popular?: boolean;
  badge?: string;
  description: string;
  features: string[];
}

const SHARED_SYSTEM_FEATURES = [
  'Vitrine virtual online 24h por dia',
  'Pedidos ilimitados direto no WhatsApp oficial',
  'Gestão completa de catálogo, fotos e estoque',
  'Painel financeiro, fluxo de caixa e relatórios',
  '0% de taxas ou comissões sobre suas vendas',
  'Suporte técnico e atualizações automáticas',
];

const COMMERCIAL_PLANS: PlanOption[] = [
  {
    id: 'monthly',
    title: 'Plano Mensal',
    period: '1 mês',
    monthsCount: 1,
    price: 29.99,
    monthlyEquivalent: 'R$ 29,99/mês',
    description: 'Renovação flexível mês a mês com acesso completo a todos os recursos da vitrine.',
    features: SHARED_SYSTEM_FEATURES,
  },
  {
    id: 'quarterly',
    title: 'Plano Trimestral',
    period: '3 meses',
    monthsCount: 3,
    price: 49.99,
    monthlyEquivalent: 'R$ 16,66/mês',
    saveAmount: 'Economia de R$ 39,98 no período',
    popular: true,
    badge: 'Mais Escolhido',
    description: 'Excelente custo-benefício para garantir 90 dias de operação contínua com economia.',
    features: SHARED_SYSTEM_FEATURES,
  },
  {
    id: 'semiannual',
    title: 'Plano Semestral',
    period: '6 meses',
    monthsCount: 6,
    price: 119.99,
    monthlyEquivalent: 'R$ 19,99/mês',
    saveAmount: 'Economia de R$ 59,95 no período',
    badge: 'Alta Economia',
    description: 'Tranquilidade semestral de 180 dias com o mesmo acesso integral ao sistema.',
    features: SHARED_SYSTEM_FEATURES,
  },
];

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ settings, currentClient }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanOption>(COMMERCIAL_PLANS[1]);
  const [step, setStep] = useState<'plans' | 'confirm' | 'payment' | 'expired' | 'success'>('plans');
  const [pixString, setPixString] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  
  // Calculate days remaining from client or default
  const daysRemaining = (() => {
    if (!currentClient?.dueDate) return 30;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(currentClient.dueDate + 'T00:00:00');
      if (isNaN(due.getTime())) return 30;
      const diffTime = due.getTime() - today.getTime();
      return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } catch {
      return 30;
    }
  })();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'payment' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (step === 'payment' && timeLeft === 0) {
      setStep('expired');
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleSelectPlan = (plan: PlanOption) => {
    setSelectedPlan(plan);
    setStep('confirm');
  };

  const handleConfirmPayment = () => {
    if (!selectedPlan) return;
    const payload = generatePixPayload(
      'a8d6dde8-33ae-45c8-b88a-5023cc204a55',
      selectedPlan.price,
      'Web Vitrine',
      'Natal',
      `RENOVAR${selectedPlan.id.toUpperCase()}`
    );
    setPixString(payload);
    setTimeLeft(300); // Reset timer to 5 minutes
    
    // Save pending session in case user navigates away to bank app
    localStorage.setItem(
      'store_pending_pix_payment',
      JSON.stringify({
        planId: selectedPlan.id,
        planTitle: selectedPlan.title,
        period: selectedPlan.period,
        price: selectedPlan.price,
        storeName: currentClient?.storeName || settings.storeName,
        createdAt: Date.now(),
      })
    );

    setStep('payment');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSimulatePayment = async () => {
    setIsSimulatingPayment(true);

    let daysToAdd = 30;
    if (selectedPlan.id === 'monthly') daysToAdd = 30;
    else if (selectedPlan.id === 'quarterly') daysToAdd = 90;
    else if (selectedPlan.id === 'semiannual') daysToAdd = 180;
    else if (selectedPlan.id === 'annual') daysToAdd = 365;

    if (currentClient) {
      try {
        const currentDue = currentClient.dueDate ? new Date(currentClient.dueDate + 'T00:00:00') : new Date();
        const today = new Date();
        const baseDate = isNaN(currentDue.getTime()) || currentDue < today ? today : currentDue;
        const nextDue = new Date(baseDate);
        nextDue.setDate(nextDue.getDate() + daysToAdd);
        const nextDueDateStr = nextDue.toISOString().split('T')[0];

        const updatedClient = {
          ...currentClient,
          dueDate: nextDueDateStr,
          status: 'active',
          lastRenewedAt: new Date().toISOString(),
        };
        await saveClient(updatedClient);
        localStorage.setItem('store_current_client', JSON.stringify(updatedClient));
      } catch (err) {
        console.error('Error renewing client on payment:', err);
      }
    }

    // Save payment success state so returning to the account displays the centered popup message
    const paymentData = {
      planTitle: selectedPlan.title,
      period: selectedPlan.period,
      storeName: currentClient?.storeName || settings.storeName || 'Sua Vitrine',
      timestamp: Date.now(),
    };
    localStorage.setItem('store_payment_success_data', JSON.stringify(paymentData));
    localStorage.removeItem('store_pending_pix_payment');

    setTimeout(() => {
      setIsSimulatingPayment(false);
      setStep('success');
    }, 1500);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="subscription-manager-container">
      {/* Top Status Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-stone-800"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-stone-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Gestão de Assinatura & Planos
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white">
              Status da sua Vitrine Virtual
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Mantenha seu catálogo online e ativo para receber pedidos sem interrupções diretamente no seu WhatsApp oficial.
            </p>
          </div>
          
          <div className="bg-stone-800/90 border border-stone-700 rounded-2xl p-4 sm:p-5 flex items-center gap-4 min-w-[220px] shadow-lg">
            <div className={`p-3 rounded-2xl ${daysRemaining <= 5 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
              {daysRemaining <= 5 ? <AlertCircle className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Tempo Restante</p>
              <p className="text-2xl sm:text-3xl font-black text-white">{daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}</p>
              {currentClient?.dueDate && (
                <p className="text-[10px] text-stone-400 mt-0.5 font-medium">
                  Vence: {new Date(currentClient.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 'plans' && (
          <motion.div
            key="plans"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border pb-3">
              <div>
                <h3 className="text-xl font-serif-luxury font-bold text-stone-900">
                  Selecione o Período de Renovação
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Escolha a duração desejada para estender a operação e visibilidade da sua loja virtual.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-stone-700 font-semibold bg-white px-3.5 py-1.5 rounded-xl border border-brand-border shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Liberação instantânea via Pix</span>
              </div>
            </div>

            {/* Commercial Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {COMMERCIAL_PLANS.map((plan, index) => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                    whileHover={{ y: -6, transition: { duration: 0.18 } }}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative flex flex-col p-5 sm:p-6 bg-white rounded-3xl border-2 cursor-pointer transition-shadow shadow-xs hover:shadow-xl ${
                      isSelected
                        ? 'border-stone-900 ring-2 ring-stone-900/10 shadow-lg bg-gradient-to-b from-stone-50/80 to-white'
                        : plan.popular
                        ? 'border-amber-600 hover:border-amber-700'
                        : 'border-brand-border hover:border-stone-400'
                    }`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                        <span className="bg-stone-900 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md border border-stone-700">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold tracking-wider uppercase text-stone-500">
                        {plan.period}
                      </span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                    </div>

                    <h4 className="text-lg font-serif-luxury font-bold text-stone-900 mb-1">
                      {plan.title}
                    </h4>

                    <div className="flex items-baseline gap-1 my-2">
                      <span className="text-sm text-stone-500 font-bold">R$</span>
                      <span className="text-3xl font-black text-stone-900 tracking-tight">
                        {plan.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {plan.monthlyEquivalent && (
                      <span className="text-[11px] font-semibold text-stone-600 mb-2">
                        Equivalente a <strong className="text-stone-900">{plan.monthlyEquivalent}</strong>
                      </span>
                    )}

                    {plan.saveAmount ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-xl mb-4 text-center">
                        {plan.saveAmount}
                      </div>
                    ) : (
                      <div className="h-6 mb-4"></div>
                    )}

                    <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                      {plan.description}
                    </p>

                    {/* Features list */}
                    <ul className="space-y-2 mb-6 pt-3 border-t border-stone-100 text-[11px] text-stone-700">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <div className="mt-auto pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPlan(plan);
                        }}
                        className={`w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                          isSelected
                            ? 'bg-stone-900 hover:bg-stone-800 text-white'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-900'
                        }`}
                      >
                        <span>Contratar {plan.period}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 'confirm' && selectedPlan && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="bg-white border border-brand-border-dark rounded-3xl p-6 sm:p-8 shadow-xl max-w-lg mx-auto text-center"
          >
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Receipt className="w-8 h-8" />
            </div>
            
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Resumo da Contratação
            </span>
            <h3 className="text-2xl font-serif-luxury font-bold text-stone-900 mb-2">
              {selectedPlan.title}
            </h3>
            
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 my-5 text-left space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Período de Acesso:</span>
                <strong className="text-stone-900 font-bold">{selectedPlan.period} ({selectedPlan.monthsCount * 30} dias)</strong>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Loja Beneficiada:</span>
                <strong className="text-stone-900 font-bold">{currentClient?.storeName || settings.storeName}</strong>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Método de Pagamento:</span>
                <strong className="text-stone-900 font-bold flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                  Pix Instantâneo
                </strong>
              </div>
              <div className="flex justify-between text-stone-600 border-t border-stone-200 pt-2.5 text-sm">
                <span className="font-bold text-stone-800">Total a Pagar:</span>
                <span className="font-black text-emerald-700 text-base">
                  R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('plans')}
                className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                Voltar aos Planos
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="flex-1 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Prosseguir para o Pix</span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 'payment' && selectedPlan && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border border-brand-border-dark rounded-3xl p-6 sm:p-8 shadow-xl max-w-3xl mx-auto space-y-6"
          >
            {/* Header with Title and Countdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Ambiente Seguro de Pagamento Pix
                </div>
                <h3 className="text-xl font-serif-luxury font-bold text-stone-900">
                  Efetue o Pagamento para Concluir a Renovação
                </h3>
                <p className="text-xs text-stone-500">
                  Liberação automática e imediata assim que a transferência for confirmada.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 flex items-center gap-2.5 text-amber-900 shrink-0 self-start sm:self-auto">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">Tempo Restante:</span>
                  <span className="text-sm font-mono font-black text-amber-950">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>

            {/* QR Code and Copy Block */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 bg-stone-50 p-5 rounded-2xl border border-stone-200 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-stone-700 mb-3 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-stone-800" />
                  QR Code Oficial
                </span>
                <div className="bg-white p-3 rounded-xl border border-stone-300 shadow-2xs">
                  <QRCodeSVG value={pixString} size={180} level="M" includeMargin={true} />
                </div>
                <p className="text-[10px] text-stone-500 mt-2.5">
                  Aponte a câmera no aplicativo do seu banco para ler o QR Code.
                </p>
              </div>
              
              <div className="md:col-span-7 space-y-4">
                {/* Pix String Field with 1-Click Copy */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Código Pix Copia e Cola
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={pixString}
                      className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-700 font-mono focus:outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-900 hover:bg-stone-800 text-white'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Chave Copiada!' : 'Copiar Código'}</span>
                    </button>
                  </div>
                </div>

                {/* Detailed Invoice Breakdown */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-2">
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Plano Contratado:</span>
                    <strong className="text-stone-900">{selectedPlan.title} ({selectedPlan.period})</strong>
                  </div>
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Loja / Titular:</span>
                    <strong className="text-stone-900">{currentClient?.storeName || settings.storeName}</strong>
                  </div>
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Dias Adicionados:</span>
                    <strong className="text-emerald-700 font-bold">+{selectedPlan.monthsCount * 30} dias de operação</strong>
                  </div>
                  <div className="flex justify-between items-center text-stone-600 border-t border-stone-200 pt-2 text-sm">
                    <span className="font-bold text-stone-900">Valor Total:</span>
                    <strong className="text-emerald-700 font-black text-base">
                      R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isSimulatingPayment}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  {isSimulatingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Identificando pagamento...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Já realizei o pagamento</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step-by-Step Payment Instructions */}
            <div className="pt-4 border-t border-brand-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
                Como efetuar o pagamento pelo seu banco:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-[10px]">1</span>
                  <p className="font-bold text-stone-800">Copie o Código</p>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    Clique no botão &quot;Copiar Código&quot; acima ou aponte a câmera para o QR Code.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-[10px]">2</span>
                  <p className="font-bold text-stone-800">Abra o App do seu Banco</p>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    Selecione a opção <strong>Pix Copia e Cola</strong>, cole o código e confirme os dados.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-[10px]">3</span>
                  <p className="font-bold text-stone-800">Ativação Imediata</p>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    Após transferir, clique em &quot;Já realizei o pagamento&quot; para atualizar sua loja.
                  </p>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep('plans')}
                disabled={isSimulatingPayment}
                className="text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Trocar de plano ou cancelar
              </button>
            </div>
          </motion.div>
        )}

        {step === 'expired' && (
          <motion.div
            key="expired"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-brand-border-dark rounded-3xl p-6 sm:p-8 shadow-xl max-w-md mx-auto text-center"
          >
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">Tempo Limite Expirado</h3>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              O tempo limite de 5 minutos para conclusão deste código Pix expirou. Gere um novo código para renovar com segurança.
            </p>
            <button
              type="button"
              onClick={() => setStep('plans')}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer"
            >
              Escolher Plano Novamente
            </button>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-emerald-200 rounded-3xl p-8 shadow-xl max-w-md mx-auto text-center relative overflow-hidden"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xs"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-serif-luxury font-bold text-stone-900 mb-2"
            >
              Pagamento Confirmado!
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-stone-600 mb-8 leading-relaxed"
            >
              Sua vitrine virtual foi renovada com sucesso por <strong>{selectedPlan.period}</strong> e seu acesso segue 100% ativo.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-colors shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                Concluir e Atualizar Painel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
