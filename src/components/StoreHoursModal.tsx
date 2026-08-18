import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Calendar,
  Truck,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { StoreSettings } from '../types';
import { checkStoreHoursStatus } from '../lib/themeUtils';
import { cleanPhoneForWhatsapp } from '../lib/formatters';

interface StoreHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
}

export const StoreHoursModal: React.FC<StoreHoursModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  if (!isOpen) return null;

  const status = checkStoreHoursStatus(settings);
  const openTime = settings.openingTime || '08:00';
  const closeTime = settings.closingTime || '18:00';
  const hasBreak = settings.hasBreakInterval ?? true;
  const breakStart = settings.breakStartTime || '12:00';
  const breakEnd = settings.breakEndTime || '13:30';
  const acceptsBreakOrders = settings.acceptOrdersDuringBreak ?? true;
  const businessDays = settings.businessDaysLabel || 'Segunda a Sábado';

  const handleWhatsappContact = () => {
    const phone = cleanPhoneForWhatsapp(settings.phoneWhatsapp);
    const msg = encodeURIComponent(`Olá, ${settings.storeName}! Gostaria de tirar uma dúvida sobre o atendimento e pedidos.`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-brand-bg rounded-3xl border border-brand-border-dark shadow-2xl overflow-hidden my-auto"
          id="modal-store-hours-container"
        >
          {/* Header */}
          <div className="relative p-6 bg-stone-900 text-white flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-brand-primary-dark/20 text-brand-primary rounded-2xl border border-brand-primary/30">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-widest text-brand-primary uppercase">
                  Atendimento & Expediente
                </span>
                <h3 className="text-xl font-serif-luxury font-bold text-white">
                  Horários de Funcionamento
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Fechar"
              id="btn-close-hours-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Real-time Status Card */}
            <div className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${status.statusColor}`}>
              <div className="mt-0.5">
                {status.isBreakNow ? (
                  <Coffee className="w-5 h-5 text-amber-600" />
                ) : status.isOpenNow ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Clock className="w-5 h-5 text-stone-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">
                    Status Atual: {status.statusLabel}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {status.noticeText}
                </p>
              </div>
            </div>

            {/* Hours Details Grid */}
            <div className="bg-white rounded-2xl p-4 border border-brand-border space-y-3.5 shadow-2xs">
              {/* Regular Operating Hours */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-4 h-4 text-brand-primary-dark" />
                  <span className="text-xs font-semibold text-stone-800">
                    Dias de Funcionamento
                  </span>
                </div>
                <span className="text-xs font-bold text-stone-900 bg-brand-bg-alt px-2.5 py-1 rounded-lg">
                  {businessDays}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-4 h-4 text-brand-primary-dark" />
                  <span className="text-xs font-semibold text-stone-800">
                    Horário Comercial
                  </span>
                </div>
                <span className="text-xs font-bold text-stone-900">
                  {openTime} às {closeTime}
                </span>
              </div>

              {/* Interval / Break Section */}
              {hasBreak ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Coffee className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-semibold text-stone-800">
                        Intervalo / Pausa de Almoço
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                      {breakStart} às {breakEnd}
                    </span>
                  </div>

                  {/* Highlighted Break Orders policy */}
                  <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                    acceptsBreakOrders
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-stone-50 border-stone-200 text-stone-800'
                  }`}>
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${acceptsBreakOrders ? 'text-emerald-600' : 'text-stone-500'}`} />
                    <div>
                      <span className="font-bold block">
                        {acceptsBreakOrders
                          ? '✅ Recebimento de pedidos ativo no intervalo'
                          : '⏸️ Pausa no atendimento durante o intervalo'}
                      </span>
                      <span className="text-[11px] opacity-85 block mt-0.5">
                        {acceptsBreakOrders
                          ? 'Você pode finalizar seu pedido normalmente! Nossa equipe dará andamento à preparação assim que o expediente retornar.'
                          : 'Pedidos enviados durante a pausa serão visualizados no retorno das atividades.'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-stone-500 flex items-center space-x-2 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Atendimento contínuo sem intervalo durante todo o dia.</span>
                </div>
              )}
              {/* Outside Operating Hours Policy */}
              <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                (settings.acceptOrdersOutsideHours ?? true)
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-stone-50 border-stone-200 text-stone-800'
              }`}>
                <CheckCircle2
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    (settings.acceptOrdersOutsideHours ?? true) ? 'text-emerald-600' : 'text-stone-500'
                  }`}
                />
                <div>
                  <span className="font-bold block">
                    {(settings.acceptOrdersOutsideHours ?? true)
                      ? '📱 Pedidos fora do horário / dias: Permitidos'
                      : '🔒 Pedidos fora do horário / dias: Pausados'}
                  </span>
                  <span className="text-[11px] opacity-85 block mt-0.5">
                    {(settings.acceptOrdersOutsideHours ?? true)
                      ? 'Você pode montar sua sacola e enviar seu pedido a qualquer hora pelo WhatsApp. Responderemos no próximo expediente!'
                      : 'O recebimento de pedidos no WhatsApp funciona exclusivamente nos horários e dias de atendimento informados.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery & Out of area notes */}
            {settings.deliveryAreasList && (
              <div className="p-3.5 bg-white border border-brand-border rounded-2xl flex items-start space-x-3 text-xs">
                <Truck className="w-4 h-4 text-brand-primary-dark mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-stone-800 block mb-0.5">
                    Regiões com Entrega Automática:
                  </span>
                  <p className="text-stone-600 leading-relaxed text-[11px]">
                    {settings.deliveryAreasList}
                  </p>
                  {!settings.allowOutOfAreaOrders && (
                    <span className="inline-block text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1.5 font-medium">
                      📍 Regiões fora da área: consulte disponibilidade via WhatsApp
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleWhatsappContact}
                className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                id="btn-whatsapp-hours-modal"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Falar com Atendimento no WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 border border-brand-border-dark hover:bg-stone-100 text-stone-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
