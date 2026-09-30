import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  MessageCircle, 
  CheckCircle2,
  Store,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Crown,
  Sparkles,
  Zap,
  ShoppingBag,
  Layers,
  Check,
  Phone
} from 'lucide-react';
import { StoreSettings } from '../types';

interface LandingPageProps {
  settings?: StoreSettings;
  onEnterStore: (slug?: string) => void;
  onAdminLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  settings,
  onEnterStore,
  onAdminLogin,
}) => {
  const officialPhone = '5584986113980';
  
  const whatsappBuyMessage = encodeURIComponent(
    'Olá! Quero ativar minha vitrine de luxo agora mesmo. Como faço para liberar meu acesso imediato?'
  );
  
  const buyLink = `https://wa.me/${officialPhone}?text=${whatsappBuyMessage}`;

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'O que é a Web Vitrine?',
      a: 'É uma vitrine virtual elegante onde sua loja expõe todo o catálogo com fotos nítidas, variações de cor, tamanhos e valores. O cliente escolhe os produtos, adiciona à sacola e o pedido chega pronto e formatado no seu WhatsApp.',
    },
    {
      q: 'Existe cobrança de comissão sobre as minhas vendas?',
      a: 'Não. Zero comissão. Todo o valor das suas vendas fica 100% com você. Você paga apenas o valor fixo da sua assinatura.',
    },
    {
      q: 'Como o cliente faz o pagamento do pedido?',
      a: 'O cliente monta a sacola e envia a lista com endereço e forma de pagamento combinada (Pix, cartão ou dinheiro). Você recebe o valor diretamente na sua conta.',
    },
    {
      q: 'Consigo atualizar produtos pelo celular?',
      a: 'Sim, o painel administrativo foi feito para ser acessado direto do smartphone com muita facilidade. Você adiciona fotos, altera preços e organiza categorias em poucos segundos.',
    },
    {
      q: 'Existe fidelidade ou multa para cancelar?',
      a: 'Nenhuma fidelidade. Você utiliza enquanto fizer sentido para o seu negócio e pode cancelar a qualquer momento sem custos adicionais.',
    }
  ];

  const plans = [
    { name: 'Mensal', price: 'R$ 29,99', period: '/mês', highlight: false, badge: 'Mais Flexível' },
    { name: 'Trimestral', price: 'R$ 49,99', period: '/trimestre', highlight: false, badge: 'Economia R$ 40' },
    { name: 'Semestral', price: 'R$ 119,99', period: '/semestre', highlight: false, badge: 'Economia R$ 60' },
    { name: 'Vitalício', price: 'R$ 250,00', period: ' Pagamento Único', highlight: true, badge: 'Acesso VIP Permanente' },
  ];

  const coreBenefits = [
    {
      title: 'Apresentação Sofisticada',
      description: 'Design refinado em preto e dourado que valoriza cada peça do seu catálogo e transmite credibilidade imediata.',
      icon: Crown,
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Pedidos Prontos no WhatsApp',
      description: 'O cliente envia o pedido formatado com peças, cores, tamanhos, subtotal e endereço de entrega em 1 clique.',
      icon: MessageCircle,
      image: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Catálogo Fácil de Navegar',
      description: 'Organize suas coleções por categorias e tags. Rápido para o cliente encontrar exatamente o que procura.',
      icon: Layers,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Painel Simples no Celular',
      description: 'Cadastre fotos da galeria, atualize estoques e controle pedidos de qualquer lugar, direto pelo seu smartphone.',
      icon: ShieldCheck,
      image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-stone-100 font-sans selection:bg-[#D4AF37] selection:text-stone-950 overflow-x-hidden">
      {/* Top Banner */}
      <div className="relative z-50 bg-[#16161A] border-b border-[#D4AF37]/30 py-2.5 px-4 text-center text-xs text-[#F3E5AB]">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>
            Ative sua vitrine virtual por apenas <strong className="text-white font-bold">R$ 29,99/mês</strong> — Pronta para vender no WhatsApp hoje mesmo.
          </span>
          <a
            href={buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] hover:underline ml-2"
          >
            Falar Conosco <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Header Navbar */}
      <header className="sticky top-0 z-40 bg-[#0D0D0F]/95 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37] p-0.5 shadow-md">
              <div className="w-full h-full bg-[#121115] rounded-[14px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <span className="font-serif-luxury font-bold text-xl tracking-tight text-white block">
                WEB VITRINE
              </span>
              <span className="text-[10px] tracking-widest text-[#D4AF37] uppercase font-semibold">
                Catálogo Digital de Luxo
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onAdminLogin}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              id="btn-landing-login"
            >
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Área do Lojista</span>
            </button>

            <a
              href={buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#C5A059] text-stone-950 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              id="btn-landing-cta-header"
            >
              <MessageCircle className="w-4 h-4 fill-stone-950 text-stone-950" />
              <span>Ativar Vitrine</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900 border border-[#D4AF37]/30 text-[#F3E5AB] text-xs font-medium">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Apresentação Profissional para a Sua Marca</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif-luxury font-bold text-white leading-tight tracking-tight">
              Sua Loja com o <br />
              <span className="text-[#D4AF37]">
                Visual de Luxo
              </span>{' '}
              que Ela Merece.
            </h1>

            <p className="text-stone-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Apresente suas peças em um catálogo digital elegante. O cliente escolhe tamanhos e cores, coloca na sacola e envia o pedido formatado direto no seu WhatsApp. <strong>Sem comissões por venda.</strong>
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <a
                href={buyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 bg-[#D4AF37] hover:bg-[#C5A059] text-stone-950 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
                id="btn-hero-create-store"
              >
                <MessageCircle className="w-5 h-5 fill-stone-950 text-stone-950" />
                <span>Ativar Minha Vitrine</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => onEnterStore('teste@123')}
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-100 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                id="btn-hero-demo-store"
              >
                <Store className="w-4 h-4 text-[#D4AF37]" />
                <span>Ver Demonstração Ao Vivo</span>
              </button>
            </div>

            {/* Natural Highlights */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-400 border-t border-stone-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Lucro 100% Seu</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                <span>Catálogo Ilimitado</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D4AF37]" />
                <span>Ativação Rápida</span>
              </div>
            </div>
          </div>

          {/* Right Showcase Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-3xl bg-stone-900 border border-stone-800 p-3 shadow-2xl overflow-hidden">
                <div className="relative h-[400px] rounded-2xl overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80"
                    alt="Vitrine de Luxo"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />

                  {/* Clean Order Badge */}
                  <div className="absolute top-4 left-4 bg-stone-950/90 border border-stone-800 px-3.5 py-2 rounded-xl text-xs backdrop-blur-md shadow-lg flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div>
                      <span className="block text-[10px] text-stone-400 font-medium">Pedido no WhatsApp</span>
                      <span className="font-bold text-white">Vestido Seda Gold • R$ 380,00</span>
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-stone-950/90 border border-[#D4AF37]/30 px-3.5 py-2 rounded-xl text-xs backdrop-blur-md shadow-lg flex items-center gap-2">
                    <Crown className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-semibold text-[#F3E5AB]">Sua Loja Profissional</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-950 rounded-xl mt-3 flex items-center justify-between border border-stone-800/80">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs font-medium text-stone-300">Catálogo Completo com Sacola</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEnterStore('teste@123')}
                    className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-stone-950 font-bold text-xs hover:bg-[#C5A059] cursor-pointer transition-colors"
                  >
                    Testar Loja
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Benefits */}
      <section className="py-20 relative z-10 bg-[#121215] border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Benefícios para sua Loja
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white tracking-tight">
              Tudo pronto para você vender todos os dias
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              Sem sistemas complicados. Uma experiência prática e direta para você e seus clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreBenefits.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-stone-900 border border-stone-800 hover:border-[#D4AF37]/40 p-5 transition-all duration-200 flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                      <img
                        src={feat.image}
                        alt={feat.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                      <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-lg bg-stone-950/90 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                        <IconComp className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="text-base font-serif-luxury font-bold text-white mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-stone-400 text-xs leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-800 flex items-center justify-between text-xs font-medium text-[#D4AF37]">
                    <span>Incluso</span>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Honest Pricing */}
      <section className="py-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
            Planos Transparentes
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white">
            Escolha o Plano Ideal para seu Negócio
          </h2>
          <p className="text-stone-400 text-sm">
            Sem taxas escondidas. Você não paga porcentagem por venda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => {
            const planMessage = encodeURIComponent(`Olá! Gostaria de abrir minha vitrine e ativar o Plano ${plan.name} (${plan.price}). Como faço para liberar meu acesso?`);
            const planLink = `https://wa.me/${officialPhone}?text=${planMessage}`;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl flex flex-col justify-between border transition-all duration-200 relative ${
                  plan.highlight
                    ? 'bg-stone-900 border-[#D4AF37] shadow-xl'
                    : 'bg-stone-900/70 border-stone-800 text-stone-100'
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    plan.highlight ? 'bg-[#D4AF37] text-stone-950' : 'bg-stone-800 text-[#F3E5AB] border border-stone-700'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-serif-luxury font-bold text-white uppercase tracking-wider mb-2 mt-1">
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-3xl font-extrabold text-white">
                      {plan.price}
                    </span>
                    <span className="text-xs text-stone-400">
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-2.5 mb-6 text-xs text-stone-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>Catálogo & Peças Ilimitadas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>Sacola Formatada no WhatsApp</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>Painel de Gestão no Celular</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>Suporte Humanizado</span>
                    </li>
                  </ul>
                </div>

                <a
                  href={planLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer ${
                    plan.highlight
                      ? 'bg-[#D4AF37] text-stone-950 hover:bg-[#C5A059]'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700'
                  }`}
                >
                  Ativar no WhatsApp
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 relative z-10 bg-[#121215] border-t border-stone-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Tire Suas Dúvidas
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-stone-800 rounded-xl overflow-hidden bg-stone-900/80 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between focus:outline-none cursor-pointer"
                >
                  <span className="font-semibold text-xs sm:text-sm text-stone-200">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#D4AF37] transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 text-stone-400 text-xs leading-relaxed border-t border-stone-800/60 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Natural Footer with SF TECNOLOGIA */}
      <footer className="relative z-10 bg-[#09090A] border-t border-stone-800/80 py-14 text-center text-stone-400">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="inline-flex items-center space-x-2.5 justify-center">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37] flex items-center justify-center text-stone-950 font-serif-luxury font-bold text-sm">
              W
            </div>
            <span className="font-serif-luxury font-bold text-lg text-white tracking-wider uppercase">
              WEB VITRINE
            </span>
          </div>

          <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
            Plataforma de vitrine virtual e catálogo digital para lojistas. Apresente seus produtos com elegância e venda direto no WhatsApp.
          </p>

          <div>
            <a
              href={buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#C5A059] text-stone-950 font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-stone-950" />
              <span>Falar com Atendimento Oficial</span>
            </a>
          </div>

          {/* Credits & SF TECNOLOGIA attribution */}
          <div className="pt-6 border-t border-stone-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
            <p>
              &copy; {new Date().getFullYear()} Web Vitrine. Todos os direitos reservados.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-[11px] text-stone-300">
              <span className="text-stone-400">desenvolvido por:</span>
              <strong className="text-[#D4AF37] font-bold tracking-wide">SF TECNOLOGIA</strong>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
