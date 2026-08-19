import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingBag,
  MessageCircle,
  Crown,
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingUp,
  Layers,
  ArrowRight,
  Palette,
  Clock,
  Lock,
  Tag,
} from 'lucide-react';

interface LandingHeroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const LandingHeroModal: React.FC<LandingHeroModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  if (!isOpen) return null;

  const handleAcquireWhatsapp = () => {
    const phone = '5511999999999';
    const message = encodeURIComponent('Olá! Gostaria de adquirir o sistema da Web Vitrine por R$ 29,99/mês.');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#121110] text-stone-100 rounded-3xl border border-[#3D3328] shadow-2xl overflow-hidden my-auto"
          id="landing-hero-modal-container"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white rounded-full border border-stone-700/60 transition-colors cursor-pointer"
            id="btn-close-landing-modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            {/* Left Column: Visual Luxury Fashion Showcase Photo */}
            <div className="lg:col-span-5 relative bg-stone-900 overflow-hidden flex flex-col justify-between p-6 sm:p-8 min-h-[280px] lg:min-h-full">
              {/* Background Luxury Vitrine Image with dark luxury gradient overlay */}
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80"
                alt="Web Vitrine de Roupas de Luxo"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-45 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121110] via-[#121110]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#121110]/90 lg:block hidden" />

              {/* Top Luxury Badge */}
              <div className="relative z-10">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-full text-[#E5C378] text-[11px] font-bold tracking-widest uppercase backdrop-blur-md">
                  <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Tecnologia para Lojistas</span>
                </div>
              </div>

              {/* Bottom Showcase Highlight */}
              <div className="relative z-10 space-y-3 pt-12">
                <span className="text-xs font-semibold text-[#D4AF37] tracking-wider uppercase">
                  Catálogo Digital Interativo
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white leading-tight">
                  A Vitrine que Transforma Visitantes em Clientes
                </h2>
                <p className="text-xs text-stone-300 leading-relaxed max-w-sm">
                  Organize cores dinâmicas, fotos de alta qualidade, tamanhos, pedidos diretos no WhatsApp e gestão de entrega em um único link.
                </p>

                {/* Pricing Tag Highlight */}
                <div className="pt-2">
                  <div className="inline-flex items-baseline space-x-2 px-4 py-2 bg-black/60 border border-[#D4AF37]/40 rounded-2xl backdrop-blur-md">
                    <span className="text-[11px] text-stone-400 font-medium">Investimento:</span>
                    <span className="text-xl font-bold text-[#E5C378]">R$ 29,99</span>
                    <span className="text-xs text-stone-400">/mês</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Persuasive Benefits, Clarification & Actions */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 bg-[#161514]">
              {/* Headline */}
              <div>
                <div className="flex items-center space-x-2 text-[#D4AF37] mb-1.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Plataforma Oficial Web Vitrine
                  </span>
                </div>
                <h3 className="text-2xl font-serif-luxury font-bold text-white">
                  Potencialize suas Vendas com Alta Elegância
                </h3>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  Tenha seu próprio espaço digital com identidade visual customizada, troca automática de fotos por cor, controle de horário e cálculo de frete.
                </p>
              </div>

              {/* Critical Clarity Notice: "Não fazemos tráfego pago" */}
              <div className="p-4 bg-[#231F1A] border border-[#524433] rounded-2xl space-y-1.5 shadow-sm">
                <div className="flex items-center space-x-2 text-[#E5C378]">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#D4AF37]" />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Aviso Importante & Transparência
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  <strong className="text-white">Não realizamos tráfego pago.</strong> A <span className="text-[#E5C378] font-semibold">Web Vitrine</span> é a plataforma tecnológica completa onde você organiza todos os seus produtos, variações de cores e tamanhos, recebe pedidos organizados no WhatsApp e gerencia suas vendas com total controle.
                </p>
              </div>

              {/* Key Features Scannable Bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start space-x-2.5 p-2.5 bg-stone-900/60 rounded-xl border border-stone-800">
                  <Palette className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">Cores & Fotos Dinâmicas</span>
                    <span className="text-[11px] text-stone-400">Troca imediata de foto ao clicar na cor</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 p-2.5 bg-stone-900/60 rounded-xl border border-stone-800">
                  <Clock className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">Horários & Intervalo</span>
                    <span className="text-[11px] text-stone-400">Aviso destacado de atendimento</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 p-2.5 bg-stone-900/60 rounded-xl border border-stone-800">
                  <Layers className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">10 Fontes & Cores de Loja</span>
                    <span className="text-[11px] text-stone-400">Personalização de identidade visual</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 p-2.5 bg-stone-900/60 rounded-xl border border-stone-800">
                  <MessageCircle className="w-4 h-4 text-[#25D366] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">Checkout via WhatsApp</span>
                    <span className="text-[11px] text-stone-400">Pedido pronto com itens, frete e Pix</span>
                  </div>
                </div>
              </div>

              {/* Direct CTAs */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleAcquireWhatsapp}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:from-[#20bd5a] hover:to-[#19a750] text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center space-x-2.5 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  id="btn-adquira-aqui-landing"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Adquira Aqui • R$ 29,99/mês no WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-stone-400">
                    Já é lojista cadastrado?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLogin();
                    }}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
                    id="btn-login-from-landing"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Acessar Painel (Login & Senha)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
