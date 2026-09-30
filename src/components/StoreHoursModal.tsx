import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  X,
  CheckCircle2,
  Coffee,
  Calendar,
  Truck,
  MessageCircle,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-lg bg-[#121215] text-stone-100 rounded-3xl border border-[#27272A] shadow-2xl overflow-hidden my-auto"
          id="modal-store-hours-container"
        >
          {/* Header */}
          <div className="relative p-6 bg-[#141417] border-b border-[#27272A] text-white flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-[#1E1E26] text-[#D4AF37] rounded-xl border border-[#2B2B33]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider text-[#D4AF37] uppercase">
                  Atendimento & Expediente
                </span>
                <h3 className="text-lg font-serif-luxury font-bold text-white">
                  Horários de Funcionamento
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
              title="Fechar"
              id="btn-close-hours-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Real-time Status Card */}
            <div className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${
              status.isBreakNow
                ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                : status.isOpenNow
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                : 'bg-[#18181E] border-[#27272A] text-stone-300'
            }`}>
              <div className="mt-0.5">
                {status.isBreakNow ? (
                  <Coffee className="w-5 h-5 text-amber-400" />
                ) : status.isOpenNow ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Clock className="w-5 h-5 text-stone-400" />
                )}
              </div>
              <div className="flex-1">
                <span className="font-bold text-sm block">
                  Status Atual: {status.statusLabel}
                </span>
                <p className="text-xs mt-1 leading-relaxed opacity-85">
                  {status.noticeText}
                </p>
              </div>
            </div>

            {/* Hours Details Grid */}
            <div className="bg-[#18181E] rounded-2xl p-4 border border-[#27272A] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#232328]">
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-medium text-stone-300">
                    Dias de Funcionamento
                  </span>
                </div>
                <span className="text-xs font-bold text-white bg-[#22222A] px-2.5 py-1 rounded-lg border border-[#2B2B33]">
                  {businessDays}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#232328]">
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-medium text-stone-300">
                    Horário Comercial
                  </span>
                </div>
                <span className="text-xs font-bold text-white">
                  {openTime} às {closeTime}
                </span>
              </div>

              {hasBreak ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Coffee className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-medium text-stone-300">
                        Intervalo / Almoço
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2.5 py-0.5 rounded-lg">
                      {breakStart} às {breakEnd}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                    acceptsBreakOrders
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                      : 'bg-[#141417] border-[#27272A] text-stone-300'
                  }`}>
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${acceptsBreakOrders ? 'text-emerald-400' : 'text-stone-400'}`} />
                    <div>
                      <span className="font-bold block">
                        {acceptsBreakOrders
                          ? 'Recebimento de pedidos ativo no intervalo'
                          : 'Pausa no atendimento durante o intervalo'}
                      </span>
                      <span className="text-[11px] opacity-80 block mt-0.5">
                        {acceptsBreakOrders
                          ? 'Você pode finalizar seu pedido normalmente! Nossa equipe preparará assim que retornar.'
                          : 'Pedidos enviados durante a pausa serão atendidos no retorno.'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Outside hours policy */}
              <div className="p-3 rounded-xl border border-[#27272A] bg-[#141417] text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#D4AF37]" />
                <div>
                  <span className="font-bold block text-white">
                    {(settings.acceptOrdersOutsideHours ?? true)
                      ? 'Envio de pedidos fora do expediente: Ativo'
                      : 'Envio de pedidos fora do expediente: Pausado'}
                  </span>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    {(settings.acceptOrdersOutsideHours ?? true)
                      ? 'Você pode enviar seu pedido pelo WhatsApp a qualquer hora. Responderemos no próximo expediente!'
                      : 'O recebimento de pedidos no WhatsApp funciona nos horários informados.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery areas */}
            {settings.deliveryAreasList && (
              <div className="p-3.5 bg-[#18181E] border border-[#27272A] rounded-2xl flex items-start space-x-3 text-xs">
                <Truck className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-white block mb-0.5">
                    Regiões Atendidas:
                  </span>
                  <p className="text-stone-400 leading-relaxed text-[11px]">
                    {settings.deliveryAreasList}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleWhatsappContact}
                className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                id="btn-whatsapp-hours-modal"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chamar no WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 border border-[#27272A] hover:bg-stone-800 text-stone-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
