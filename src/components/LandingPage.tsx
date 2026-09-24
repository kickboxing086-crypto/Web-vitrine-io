import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  MessageCircle, 
  CheckCircle2,
  Store,
  ArrowRight,
  ShieldCheck,
  Star,
  ChevronDown,
  Smartphone,
  Crown,
  Sparkles,
  Zap,
  ShoppingBag,
  Layers,
  Award,
  Globe,
  Check,
  X,
  CreditCard
} from 'lucide-react';
import { StoreSettings } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

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
      a: 'É uma plataforma de vitrine virtual de luxo onde você organiza todo o seu catálogo com fotos de alta qualidade, opções de cores, tamanhos e preços. O cliente navega por uma experiência fluida, adiciona peças à sacola e envia o pedido formatado direto no seu WhatsApp.',
    },
    {
      q: 'Preciso pagar comissão sobre minhas vendas?',
      a: 'Zero comissão. Todo o lucro de cada venda é 100% seu. Você paga apenas o valor fixo da sua assinatura.',
    },
    {
      q: 'Como funciona a opção de Aplicativo Instalável?',
      a: 'Sua vitrine já vem pronta para ser adicionada no celular ou computador. Tanto você quanto seus clientes podem instalar o aplicativo com 1 clique direto pelo navegador, como um app nativo, sem necessidade de baixar pelas lojas Google Play ou Apple Store.',
    },
    {
      q: 'Como recebo o pagamento dos pedidos?',
      a: 'Os pedidos chegam prontos no seu WhatsApp com valor total, itens selecionados, endereço e forma de pagamento. Você recebe direto na sua conta bancária via Pix, cartão ou na entrega.',
    },
    {
      q: 'Consigo gerenciar pelo meu celular?',
      a: 'Sim, o painel de gestão é 100% responsivo e otimizado para smartphone. Você cadastra novos produtos, altera preços, ativa cupons e gerencia clientes de qualquer lugar.',
    },
    {
      q: 'Existe contrato de fidelidade ou multa de cancelamento?',
      a: 'Nenhum contrato engessado. Você cancela quando desejar sem taxas nem burocracia.',
    }
  ];

  const plans = [
    { name: 'Mensal', price: 'R$ 29,99', period: '/mês', highlight: false, badge: 'Acesso Imediato' },
    { name: 'Trimestral', price: 'R$ 49,99', period: '/trimestre', highlight: false, badge: 'Economia R$ 40' },
    { name: 'Semestral', price: 'R$ 119,99', period: '/semestre', highlight: false, badge: 'Economia R$ 60' },
    { name: 'Vitalício', price: 'R$ 250,00', period: ' Pagamento Único', highlight: true, badge: 'Mais Popular VIP' },
  ];

  const luxuryFeatures = [
    {
      title: 'Design de Alta Costura',
      description: 'Interface sofisticada projetada para marcas de moda, boutique, joias, cosméticos e alta gastronomia.',
      icon: Crown,
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Pedidos Formatados no WhatsApp',
      description: 'O cliente envia a sacola pronta em um clique com itens, cores, tamanhos, subtotal e endereço.',
      icon: MessageCircle,
      image: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Aplicativo Direto no Celular',
      description: 'Instalação instantânea na tela inicial do seu cliente sem passar por burocracias de App Stores.',
      icon: Smartphone,
      image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Segurança & Criptografia 256-bit',
      description: 'Dados de lojistas e clientes armazenados com criptografia simétrica no Cloud Firestore de alta performance.',
      icon: ShieldCheck,
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-stone-100 font-sans selection:bg-[#D4AF37] selection:text-stone-950 overflow-x-hidden">
      {/* Subtle Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#D4AF37]/15 via-[#B8860B]/5 to-transparent blur-3xl opacity-60" />
        <div className="absolute bottom-1/3 left-0 w-[500px] h-[500px] bg-amber-600/5 blur-3xl opacity-40" />
      </div>

      {/* Top Announcement Bar */}
      <div className="relative z-50 bg-gradient-to-r from-[#1A1813] via-[#2A2312] to-[#1A1813] border-b border-[#D4AF37]/30 py-2 px-4 text-center text-xs text-[#F3E5AB]">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
          <span className="font-semibold">
            Ativação Rápida no WhatsApp por apenas <strong className="text-white font-extrabold">R$ 29,99/mês</strong> — Crie sua vitrine em menos de 2 minutos!
          </span>
          <a
            href={buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] hover:underline ml-2"
          >
            Aproveitar Oferta VIP <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Header Navbar */}
      <header className="sticky top-0 z-40 bg-[#0D0D0F]/90 backdrop-blur-xl border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] p-0.5 shadow-lg shadow-amber-500/10">
              <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <span className="font-serif-luxury font-bold text-xl tracking-tight text-white block">
                WEB VITRINE
              </span>
              <span className="text-[10px] tracking-widest text-[#D4AF37] uppercase font-semibold">
                Plataforma de Luxo
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <PWAInstallButton variant="pill" showText={true} />

            <button
              onClick={onAdminLogin}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-stone-200 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
              id="btn-landing-login"
            >
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Área do Lojista</span>
            </button>

            <a
              href={buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] hover:brightness-110 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20"
              id="btn-landing-cta-header"
            >
              <MessageCircle className="w-4 h-4 fill-stone-950 text-stone-950" />
              <span>Ativar Vitrine</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900/90 border border-[#D4AF37]/30 text-[#F3E5AB] text-xs font-bold shadow-inner">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>A Vitrine Virtual Oficial do Seu Negócio</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif-luxury font-bold text-white leading-[1.08] tracking-tight">
              Sua Loja com o <br />
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#FFF3D1] to-[#B8860B] bg-clip-text text-transparent">
                Visual de Luxo
              </span>{' '}
              que Ela Merece.
            </h1>

            <p className="text-stone-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              Exiba seus produtos em uma vitrine virtual sofisticada com sacola inteligente, cores, tamanhos e envio direto do pedido formatado no seu WhatsApp. <strong>Zero comissões por venda.</strong>
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <a
                href={buyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] hover:brightness-110 text-stone-950 rounded-2xl text-sm font-extrabold shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                id="btn-hero-create-store"
              >
                <MessageCircle className="w-5 h-5 fill-stone-950 text-stone-950" />
                <span>Ativar Minha Vitrine de Luxo</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => onEnterStore('teste@123')}
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-4 bg-stone-900/80 hover:bg-stone-800 border border-stone-700/80 text-stone-100 rounded-2xl text-sm font-bold transition-all shadow-md cursor-pointer"
                id="btn-hero-demo-store"
              >
                <Store className="w-4 h-4 text-[#D4AF37]" />
                <span>Ver Vitrine de Exemplo Ao Vivo</span>
              </button>
            </div>

            {/* Badges / Guarantees */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-400 border-t border-stone-800/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Zero Comissões</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                <span>Aplicativo Instalável</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D4AF37]" />
                <span>Pronto em 2 Minutos</span>
              </div>
            </div>
          </div>

          {/* Right Visual Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Frame */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#D4AF37] via-amber-500/30 to-[#B8860B] rounded-3xl blur-xl opacity-40 animate-pulse" />

              <div className="relative rounded-3xl bg-stone-900/90 border border-[#D4AF37]/30 p-3 shadow-2xl overflow-hidden backdrop-blur-xl">
                {/* Showcase Hero Image */}
                <div className="relative h-[420px] rounded-2xl overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80"
                    alt="Vitrine de Luxo - Moda e Elegância"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                  {/* Floating Overlay Badge 1 */}
                  <div className="absolute top-4 left-4 bg-stone-950/90 border border-[#D4AF37]/40 px-3.5 py-2 rounded-2xl text-xs backdrop-blur-md shadow-xl flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <div>
                      <span className="block text-[10px] text-stone-400 uppercase font-semibold">Novo Pedido WhatsApp</span>
                      <span className="font-bold text-white">Vestido Seda Gold (R$ 380)</span>
                    </div>
                  </div>

                  {/* Floating Overlay Badge 2 */}
                  <div className="absolute bottom-4 right-4 bg-stone-950/90 border border-[#D4AF37]/40 px-4 py-2.5 rounded-2xl text-xs backdrop-blur-md shadow-xl flex items-center gap-3">
                    <Crown className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <span className="block text-xs font-bold text-white">Sua Marca de Sucesso</span>
                      <span className="text-[10px] text-[#F3E5AB]">Visual Elegante & App no Celular</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action under image */}
                <div className="p-3 bg-stone-950/80 rounded-2xl mt-3 flex items-center justify-between border border-stone-800">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs font-semibold text-stone-300">Catálogo Ilimitado & Sacola Direct</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEnterStore('teste@123')}
                    className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-stone-950 font-bold text-xs hover:brightness-110 cursor-pointer"
                  >
                    Testar Agora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Features Grid with Unsplash Images */}
      <section className="py-24 relative z-10 bg-gradient-to-b from-[#0D0D0F] via-stone-950 to-[#0D0D0F] border-y border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              Diferenciais Exclusivos
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif-luxury font-bold text-white tracking-tight">
              Tudo o que sua loja precisa para vender com sofisticação
            </h2>
            <p className="text-stone-400 text-sm sm:text-base">
              Desenvolvido com foco total na conversão de vendas via WhatsApp e experiência de compra inesquecível.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {luxuryFeatures.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  className="group relative rounded-3xl bg-stone-900/60 border border-stone-800 hover:border-[#D4AF37]/50 p-5 transition-all duration-300 hover:-translate-y-1 shadow-xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Card Image Thumbnail */}
                    <div className="relative h-44 rounded-2xl overflow-hidden mb-5">
                      <img
                        src={feat.image}
                        alt={feat.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                      <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-stone-950/80 backdrop-blur-md border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                        <IconComp className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className="text-lg font-serif-luxury font-bold text-white mb-2 group-hover:text-[#F3E5AB] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-stone-400 text-xs leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-bold text-[#D4AF37]">
                    <span>Recurso Incluso</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Native App Showcase Banner */}
      <section className="py-20 relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-[#D4AF37]/40 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                <span>Aplicativo Integrado</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-white">
                Transforme sua loja em um <br />
                <span className="text-[#D4AF37]">Aplicativo no Celular do Cliente</span>
              </h2>

              <p className="text-stone-300 text-sm leading-relaxed max-w-xl">
                Seus clientes podem adicionar o ícone da sua vitrine diretamente na tela inicial do iPhone ou Android sem precisar baixar na Play Store ou App Store. Carregamento ultra-rápido e acesso com 1 toque!
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <PWAInstallButton variant="gold" label="Instalar" showText={true} />
                <button
                  type="button"
                  onClick={() => onEnterStore('teste@123')}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Experimentar no Navegador
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 h-[360px] rounded-[38px] bg-stone-950 border-4 border-stone-800 p-3 shadow-2xl flex flex-col justify-between">
                <div className="w-24 h-4 bg-stone-800 rounded-full mx-auto mb-2" />
                <div className="flex-1 rounded-2xl bg-stone-900 overflow-hidden relative p-3 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-stone-950 shadow-lg font-serif-luxury font-bold text-2xl">
                    W
                  </div>
                  <span className="font-serif-luxury font-bold text-white text-sm">Sua Loja no Celular</span>
                  <p className="text-[10px] text-stone-400">Salva na tela do celular como um App nativo!</p>
                  <div className="w-full py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[11px] font-bold">
                    ✓ Instalável no Celular
                  </div>
                </div>
                <div className="w-12 h-1 bg-stone-700 rounded-full mx-auto mt-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            Planos Sem Comissões
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif-luxury font-bold text-white">
            Escolha o Plano Ideal para a Sua Loja
          </h2>
          <p className="text-stone-400 text-sm max-w-xl mx-auto">
            Lucro 100% seu em todas as vendas. Sem taxas escondidas, sem comissões.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => {
            const planMessage = encodeURIComponent(`Olá! Gostaria de abrir minha vitrine e ativar o Plano ${plan.name} (${plan.price}). Como faço para liberar meu acesso imediato?`);
            const planLink = `https://wa.me/${officialPhone}?text=${planMessage}`;
            return (
              <div
                key={idx}
                className={`p-7 rounded-3xl flex flex-col justify-between border transition-all duration-300 relative ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-[#D4AF37] shadow-2xl shadow-amber-500/10 lg:-translate-y-3'
                    : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 text-stone-100'
                }`}
              >
                {/* Top Badge */}
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    plan.highlight ? 'bg-[#D4AF37] text-stone-950' : 'bg-stone-800 text-[#F3E5AB] border border-stone-700'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-base font-serif-luxury font-bold text-white uppercase tracking-wider mb-3 mt-1">
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">
                      {plan.price}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8 text-xs text-stone-300">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                      <span>Catálogo & Produtos Ilimitados</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                      <span>Sacola Formatada no WhatsApp</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                      <span>Painel de Gestão para Celular</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                      <span>Instalação do Aplicativo</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                      <span>Suporte Rápido VIP</span>
                    </li>
                  </ul>
                </div>

                <a
                  href={planLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-stone-950 hover:brightness-110 shadow-lg shadow-amber-500/20'
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

      {/* FAQ Accordion */}
      <section className="py-24 relative z-10 bg-stone-950 border-t border-stone-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              Tire Suas Dúvidas
            </span>
            <h2 className="text-3xl font-serif-luxury font-bold text-white">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-900/60 transition-colors hover:border-stone-700"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-4.5 flex items-center justify-between focus:outline-none cursor-pointer"
                >
                  <span className="font-bold text-sm text-stone-200">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#D4AF37] transition-transform duration-300 ${
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
                      <div className="px-6 pb-5 pt-0 text-stone-400 text-xs leading-relaxed border-t border-stone-800/50 pt-3">
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

      {/* Final WhatsApp CTA Footer */}
      <footer className="relative z-10 bg-[#09090A] border-t border-stone-800/90 py-16 text-center text-stone-400">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="inline-flex items-center space-x-3 justify-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-stone-950 font-serif-luxury font-bold">
              W
            </div>
            <span className="font-serif-luxury font-bold text-xl text-white tracking-wider uppercase">
              WEB VITRINE
            </span>
          </div>

          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Plataforma de vitrine virtual e catálogo digital interativo. Ative sua loja e venda mais sem pagar comissão.
          </p>

          <div className="pt-2">
            <a
              href={buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-stone-950 font-extrabold text-xs rounded-2xl hover:brightness-110 shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-stone-950" />
              <span>Falar com o Suporte Oficial no WhatsApp</span>
            </a>
          </div>

          <p className="text-[11px] text-stone-600 pt-6">
            &copy; {new Date().getFullYear()} Web Vitrine. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};
