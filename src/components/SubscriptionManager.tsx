import React, { useState, useEffect } from 'react';
import { StoreSettings } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Check, AlertCircle, Clock, Copy, ArrowRight, ShieldCheck } from 'lucide-react';
import { generatePixPayload } from '../lib/pixUtils';

interface SubscriptionManagerProps {
  settings: StoreSettings;
}

const PLANS = [
  { id: 'test', title: 'Plano de Teste', price: 0.80, period: '1 dia', popular: false },
  { id: 'monthly', title: 'Plano Mensal', price: 29.99, period: '1 mês', popular: false },
  { id: 'quarterly', title: 'Plano Trimestral', price: 49.99, period: '3 meses', popular: true, saveAmount: 'R$ 39,98' },
  { id: 'semiannual', title: 'Plano Semestral', price: 119.99, period: '6 meses', popular: false, saveAmount: 'R$ 59,95' },
];

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ settings }) => {
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [step, setStep] = useState<'plans' | 'confirm' | 'payment'>('plans');
  const [pixString, setPixString] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Mock days remaining for demonstration
  const daysRemaining = 5; 

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
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
    setStep('payment');
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Crown className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-serif-luxury font-bold flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-400" />
              Assinatura Premium
            </h2>
            <p className="text-amber-100/80 text-sm max-w-md">
              Sua vitrine está operando com todos os recursos liberados. Renove seu plano para garantir vendas contínuas e acesso ininterrupto.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4 min-w-[200px] shadow-lg">
            <div className={`p-3 rounded-full ${daysRemaining <= 5 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {daysRemaining <= 5 ? <AlertCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-200/60">Expira em</p>
              <p className="text-2xl font-bold">{daysRemaining} dias</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'plans' && (
          <motion.div
            key="plans"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold text-stone-800 mb-4">Escolha seu plano de renovação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex flex-col p-5 bg-white rounded-2xl border-2 transition-all hover:shadow-lg ${
                    plan.popular ? 'border-amber-400 shadow-md scale-[1.02]' : 'border-brand-border-dark'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 inset-x-0 flex justify-center">
                      <span className="bg-amber-400 text-amber-950 text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                        Mais Vantajoso
                      </span>
                    </div>
                  )}
                  <h4 className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-2">{plan.title}</h4>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-sm text-stone-500 font-bold">R$</span>
                    <span className="text-3xl font-black text-stone-900">{plan.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <p className="text-xs text-stone-500 font-medium mb-4">Acesso por {plan.period}</p>
                  
                  {plan.saveAmount ? (
                    <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1.5 rounded-lg mb-4 text-center">
                      Economize {plan.saveAmount}
                    </div>
                  ) : (
                    <div className="h-7 mb-4"></div>
                  )}

                  <div className="mt-auto pt-4 border-t border-brand-border/50">
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        plan.popular 
                          ? 'bg-amber-400 hover:bg-amber-500 text-amber-950' 
                          : 'bg-stone-900 hover:bg-stone-800 text-white'
                      }`}
                    >
                      Renovar {plan.period}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'confirm' && selectedPlan && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-brand-border-dark rounded-2xl p-6 shadow-xl max-w-md mx-auto text-center"
          >
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">Confirmar Renovação</h3>
            <p className="text-sm text-stone-600 mb-6">
              Você selecionou o <strong>{selectedPlan.title}</strong>. Seu acesso será estendido por mais <strong>{selectedPlan.period}</strong> após a confirmação do pagamento de <strong>R$ {selectedPlan.price.toFixed(2).replace('.', ',')}</strong>.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setStep('plans')}
                className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-bold transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmPayment}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Pagar
              </button>
            </div>
          </motion.div>
        )}

        {step === 'payment' && selectedPlan && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-brand-border-dark rounded-2xl p-6 shadow-xl max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-between border-b border-brand-border-dark pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Gateway de Pagamento Seguro
                </h3>
                <p className="text-xs text-stone-500">Transação processada via Banco Central do Brasil (Pix)</p>
              </div>
              <img src="https://logospng.org/download/pix/logo-pix-icone-1024.png" alt="Pix" className="h-6" />
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="bg-stone-50 p-4 rounded-2xl border border-brand-border-dark shrink-0">
                <QRCodeSVG value={pixString} size={200} level="M" includeMargin={true} className="rounded-xl" />
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-500">Valor do Plano ({selectedPlan.period})</span>
                    <span className="font-bold text-stone-900">R$ {selectedPlan.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Favorecido</span>
                    <span className="font-bold text-stone-900">Mercado Pago</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border-dark">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Código Pix Copia e Cola (BR Code)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={pixString}
                      className="flex-1 px-3 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-500 font-mono focus:outline-none"
                    />
                    <button
                      onClick={handleCopyPix}
                      className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-xl border border-amber-200/60 mt-4">
                  <p className="font-bold mb-1">Pagamento Automático</p>
                  <p>O seu acesso será liberado automaticamente em até 1 minuto após a confirmação do Pix.</p>
                </div>
                
                <button
                  onClick={() => setStep('plans')}
                  className="w-full mt-2 py-2 text-xs font-bold text-stone-500 hover:text-stone-700 transition-colors"
                >
                  Voltar para os planos
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
