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
  Zap,
  ShoppingBag,
  Layers,
  Check,
  X,
  Smartphone,
  Tag,
  Clock,
  Share2
} from 'lucide-react';
import { StoreSettings } from '../types';

interface LandingPageProps {
  settings?: StoreSettings;
  onEnterStore: (slug?: string) => void;
  onAdminLogin: () => void;
  onOpenRegister?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  settings,
  onEnterStore,
  onAdminLogin,
  onOpenRegister,
}) => {
  const officialPhone = '5511999999999';
  
  const whatsappBuyMessage = encodeURIComponent(
    'Olá! Quero tirar dúvidas sobre a plataforma Web Vitrine.'
  );
  
  const buyLink = `https://wa.me/${officialPhone}?text=${whatsappBuyMessage}`;

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const steps = [
    {
      step: '01',
      title: 'Cadastre suas peças no celular',
      description: 'Adicione fotos direto da sua câmera ou galeria, informe preços, cores e tamanhos em menos de 1 minuto.',
      icon: Smartphone,
    },
    {
      step: '02',
      title: 'Coloque o link na sua bio',
      description: 'Envie o link para suas clientes no Instagram e WhatsApp. Elas navegam de forma leve e rápida, sem precisar baixar aplicativos pesados.',
      icon: Share2,
    },
    {
      step: '03',
      title: 'Receba o pedido pronto no WhatsApp',
      description: 'Sua cliente monta a sacola e envia a lista com endereço, peças e total calculado. Você só confere e agenda o envio.',
      icon: MessageCircle,
    },
  ];

  const comparisons = [
    {
      before: 'Enviar dezenas de fotos soltas entupindo o chat da cliente',
      after: 'Link único e elegante com seu catálogo sempre atualizado',
    },
    {
      before: 'Responder "qual o valor?" 50 vezes ao dia nos directs',
      after: 'Preços, tamanhos e cores disponíveis de forma clara 24h por dia',
    },
    {
      before: 'Anotar pedidos à mão em blocos de papel e esquecer detalhes',
      after: 'Pedido formatado no WhatsApp com nome, endereço e total exato',
    },
    {
      before: 'Cliente desistir da compra pela demora no atendimento',
      after: 'Cliente escolhe e finaliza a compra com a agilidade de um cardápio digital',
    },
    {
      before: 'Taxas altas e comissões abusivas por cada venda realizada',
      after: 'Zero comissão. 100% do lucro das suas vendas é seu',
    },
  ];

  const niches = [
    { name: 'Moda Feminina & Masculina', example: 'Vestidos, conjuntos, camisas, alfaiataria' },
    { name: 'Semijoias & Pratas', example: 'Colares, brincos, anéis e pulseiras com fotos nítidas' },
    { name: 'Calçados & Bolsas', example: 'Numeração organizada e controle de estoque por tamanho' },
    { name: 'Moda Praia & Lingerie', example: 'Variações de estampas, tamanhos P, M, G e GG' },
    { name: 'Cosméticos & Perfumaria', example: 'Kits para presente, maquiagem e cuidados pessoais' },
  ];

  const singlePlan = {
    name: 'Plano Mensal Web Vitrine',
    price: 'R$ 29,99',
    period: '/mês',
    trial: '5 Dias Grátis para Testar',
    badge: 'Plano Oficial Único',
  };

  const faqs = [
    {
      q: 'O que é a Web Vitrine na prática?',
      a: 'É um catálogo digital moderno e intuitivo criado especialmente para lojistas venderem no WhatsApp. Suas clientes navegam pelas peças, selecionam tamanho e cor, e enviam a sacola finalizada diretamente no seu WhatsApp.',
    },
    {
      q: 'Existe cobrança de porcentagem sobre as vendas?',
      a: 'Não. Zero taxa sobre as vendas. Todo o dinheiro das suas vendas vai direto para sua conta (via Pix, cartão ou transferência combinada). Você só paga a assinatura fixa do sistema.',
    },
    {
      q: 'Minha cliente precisa baixar algum aplicativo no celular?',
      a: 'Não! O link abre instantaneamente no navegador do celular de qualquer cliente (iPhone ou Android). É rápido, leve e não ocupa espaço na memória do telefone.',
    },
    {
      q: 'Consigo gerenciar meus produtos direto pelo celular?',
      a: 'Sim. Você acessa o painel de lojista pelo seu próprio smartphone, tira fotos na hora, altera preços, atualiza estoque e cria cupons de desconto em poucos toques.',
    },
    {
      q: 'Como recebo os pagamentos dos pedidos?',
      a: 'O cliente envia o pedido pronto para você no WhatsApp já com a forma de pagamento selecionada (Pix, cartão ou dinheiro). Você envia sua chave Pix ou link de pagamento da sua maquininha preferida.',
    },
    {
      q: 'Tem fidelidade ou contrato de permanência?',
      a: 'Nenhuma fidelidade. Você usa pelo período contratado e pode renovar ou cancelar quando desejar, com total liberdade.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-stone-100 font-sans selection:bg-[#D4AF37] selection:text-stone-950 overflow-x-hidden">
      {/* Top Bar Announcement */}
      <div className="relative z-50 bg-[#16161A] border-b border-[#D4AF37]/30 py-2.5 px-4 text-center text-xs text-[#F3E5AB]">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span>
            Tenha seu catálogo virtual funcionando hoje por apenas <strong className="text-white font-bold">R$ 29,99/mês</strong>. Sem comissões por venda.
          </span>
          <a
            href={buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] hover:underline ml-2"
          >
            Ativar Agora <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Header Navbar */}
      <header className="sticky top-0 z-40 bg-[#0D0D0F]/95 backdrop-blur-md border-b border-[#27272A]">
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
              className="inline-flex items-center px-4 py-2 bg-[#16161A] hover:bg-stone-800 border border-[#27272A] hover:border-[#D4AF37]/50 text-stone-200 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              id="btn-landing-login"
            >
              <span>Acessar</span>
            </button>

            <button
              type="button"
              onClick={onOpenRegister}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#C5A059] text-stone-950 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              id="btn-landing-cta-header"
            >
              <span className="font-bold">Cadastre sua Loja (5 Dias Grátis)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-14 pb-20 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16161A] border border-[#D4AF37]/30 text-[#F3E5AB] text-xs font-medium">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Para Lojistas, Boutiques & Empreendedores</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif-luxury font-bold text-white leading-tight tracking-tight">
              Pare de perder vendas no WhatsApp. <br />
              <span className="text-[#D4AF37]">
                Seu catálogo digital
              </span>{' '}
              prático e profissional.
            </h1>

            <p className="text-stone-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Sua cliente navega como em um cardápio digital, escolhe as peças com tamanhos e cores, e envia o pedido 100% pronto e calculado para você no WhatsApp.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <button
                type="button"
                onClick={onOpenRegister}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 bg-[#D4AF37] hover:bg-[#C5A059] text-stone-950 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
                id="btn-hero-create-store"
              >
                <span>Criar Minha Loja Grátis (5 Dias de Teste)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onEnterStore('teste@123')}
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#16161A] hover:bg-stone-800 border border-[#27272A] text-stone-100 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                id="btn-hero-demo-store"
              >
                <Store className="w-4 h-4 text-[#D4AF37]" />
                <span>Ver Vitrine de Demonstração</span>
              </button>
            </div>

            {/* Quick Human Guarantees */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-400 border-t border-[#27272A]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>100% do lucro é seu</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                <span>Sem limite de produtos</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                <span>Fácil de mexer pelo celular</span>
              </div>
            </div>
          </div>

          {/* Right Live Visual Simulation */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-3xl bg-[#141417] border border-[#27272A] p-3 shadow-2xl overflow-hidden">
                <div className="relative h-[380px] rounded-2xl overflow-hidden group bg-stone-900">
                  <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80"
                    alt="Exemplo de Vitrine Virtual de Luxo"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                  {/* Simulated WhatsApp Order Bubble */}
                  <div className="absolute top-4 left-4 right-4 bg-stone-950/95 border border-[#27272A] p-3 rounded-2xl text-xs backdrop-blur-md shadow-2xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
                      <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">
                        Novo Pedido Recebido no WhatsApp
                      </span>
                    </div>
                    <p className="text-white font-semibold text-xs leading-snug">
                      &quot;Olá! Quero fechar meu pedido: 1x Vestido Seda Gold (Tamanho M) + 1x Conjunto Alfaiataria (Preto)&quot;
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-stone-800 text-stone-400">
                      <span>Total: <strong className="text-white font-bold">R$ 560,00</strong></span>
                      <span className="text-emerald-400 font-semibold">Pronto para entrega</span>
                    </div>
                  </div>

                  {/* Bottom Store Brand Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-stone-950/90 border border-[#D4AF37]/40 p-2.5 rounded-xl text-xs backdrop-blur-md shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#D4AF37] text-stone-950 flex items-center justify-center font-bold text-xs">
                        V
                      </div>
                      <div>
                        <span className="font-bold text-white block leading-tight">Sua Marca & Catálogo</span>
                        <span className="text-[10px] text-stone-400">visual limpo em preto e dourado</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onEnterStore('teste@123')}
                      className="px-2.5 py-1 bg-[#D4AF37] text-stone-950 font-bold text-[11px] rounded-lg hover:bg-[#E5C378] transition-colors cursor-pointer"
                    >
                      Testar Loja
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works in Practice (3 Steps) */}
      <section className="py-20 relative z-10 bg-[#141417] border-y border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Simples de usar
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white tracking-tight">
              Como funciona na prática para o seu dia a dia
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              Você não precisa entender de tecnologia. Em 3 passos rápidos sua loja já está pronta para receber pedidos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, idx) => {
              const IconComp = s.icon;
              return (
                <div
                  key={idx}
                  className="relative p-6 sm:p-7 rounded-2xl bg-[#16161A] border border-[#27272A] hover:border-[#D4AF37]/50 transition-all duration-200 flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-2xl font-serif-luxury font-bold text-[#D4AF37]">
                        {s.step}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-[#0D0D0F] border border-[#27272A] flex items-center justify-center text-[#D4AF37]">
                        <IconComp className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-lg font-serif-luxury font-bold text-white mb-2">
                      {s.title}
                    </h3>
                    <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Before vs After Comparison */}
      <section className="py-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
            Comparação Real
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white tracking-tight">
            Veja a diferença na sua rotina de vendas
          </h2>
          <p className="text-stone-400 text-sm">
            Menos tempo respondendo mensagens repetidas e muito mais pedidos fechados.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-[#141417] border border-[#27272A] rounded-3xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#27272A]">
            {/* Antes */}
            <div className="p-6 sm:p-8 bg-[#111114]">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#27272A]">
                <div className="w-6 h-6 rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400">
                  <X className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-serif-luxury font-bold text-sm text-stone-300 uppercase tracking-wider">
                  Antes (Sem o Web Vitrine)
                </h3>
              </div>
              <ul className="space-y-4">
                {comparisons.map((c, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-stone-400">
                    <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                    <span>{c.before}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Depois */}
            <div className="p-6 sm:p-8 bg-[#16161A]">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#27272A]">
                <div className="w-6 h-6 rounded-full bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-serif-luxury font-bold text-sm text-[#D4AF37] uppercase tracking-wider">
                  Depois (Com o Web Vitrine)
                </h3>
              </div>
              <ul className="space-y-4">
                {comparisons.map((c, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-stone-200">
                    <span className="text-[#D4AF37] font-bold shrink-0 mt-0.5">✓</span>
                    <span>{c.after}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ideal for your niche */}
      <section className="py-20 relative z-10 bg-[#121215] border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Segmentos
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white">
              Feito sob medida para o seu tipo de produto
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {niches.map((n, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#16161A] border border-[#27272A] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Tag className="w-4 h-4 text-[#D4AF37]" />
                    <h3 className="font-serif-luxury font-bold text-sm text-white">{n.name}</h3>
                  </div>
                  <p className="text-xs text-stone-400">{n.example}</p>
                </div>
              </div>
            ))}
            <div className="p-5 rounded-2xl bg-[#16161A] border border-[#D4AF37]/30 flex flex-col justify-center text-center">
              <span className="text-xs font-semibold text-[#D4AF37]">Qualquer outro produto físico</span>
              <span className="text-[11px] text-stone-400 mt-0.5">Adapta-se ao catálogo da sua loja</span>
            </div>
          </div>
        </div>
      </section>

      {/* Single Transparent Pricing Plan */}
      <section className="py-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
            Plano Único Oficial
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white">
            Simples, Transparente e Sem Pegadinhas
          </h2>
          <p className="text-stone-400 text-sm">
            Acesso completo com <strong>5 dias totalmente grátis</strong> para você testar e aprovar. Renovação automática e segura via Mercado Pago.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#16161A] border-2 border-[#D4AF37] shadow-2xl relative overflow-hidden">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#D4AF37] text-stone-950 shadow-md whitespace-nowrap">
              {singlePlan.trial}
            </div>

            <div className="text-center mb-6 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] block mb-1">
                Assinatura Mensal
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white">
                {singlePlan.name}
              </h3>

              <div className="mt-4 flex items-baseline justify-center gap-1.5">
                <span className="text-4xl sm:text-5xl font-black text-white">
                  {singlePlan.price}
                </span>
                <span className="text-sm text-stone-400 font-semibold">
                  {singlePlan.period}
                </span>
              </div>
              <p className="text-xs text-emerald-400 mt-2 font-semibold">
                Primeiros 5 dias 100% gratuitos • Cancele quando quiser
              </p>
            </div>

            <ul className="space-y-3 mb-8 text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span><strong>5 dias de teste grátis</strong> sem compromisso</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Catálogo de produtos e fotos ilimitados</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Sacola formatada e somada direto no WhatsApp</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Painel de controle ágil no celular</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Zero comissão por venda (100% do lucro é seu)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Renovação descomplicada e instantânea via Pix</span>
              </li>
            </ul>

            <div className="space-y-3">
              <button
                type="button"
                onClick={onOpenRegister}
                className="w-full py-4 bg-[#D4AF37] hover:bg-[#E5C378] text-stone-950 font-extrabold rounded-2xl text-sm transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] text-center"
              >
                <span>Criar Minha Loja com 5 Dias Grátis</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onEnterStore('teste@123')}
                className="w-full py-3 bg-[#1C1C22] hover:bg-[#25252E] text-stone-300 hover:text-white rounded-xl text-xs font-semibold border border-[#27272A] transition-colors cursor-pointer"
              >
                Testar Vitrine Demonstrativa Ao Vivo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 relative z-10 bg-[#121215] border-t border-[#27272A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Dúvidas Frequentes
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white">
              Tudo o que você precisa saber
            </h2>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-[#27272A] rounded-xl overflow-hidden bg-[#16161A] transition-colors"
              >
                <button
                  type="button"
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
                      <div className="px-5 pb-4 text-stone-400 text-xs leading-relaxed border-t border-[#222228] pt-3">
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

      {/* Footer with Mandatory Attribution */}
      <footer className="relative z-10 bg-[#09090A] border-t border-[#222228] py-14 text-center text-stone-400">
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

          {/* Credits & Mandatory SF TECNOLOGIA attribution */}
          <div className="pt-6 border-t border-[#222228] flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
            <p>
              &copy; {new Date().getFullYear()} Web Vitrine. Todos os direitos reservados.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#16161A] border border-[#27272A] text-[11px] text-stone-300">
              <span className="text-stone-400">desenvolvido por:</span>
              <strong className="text-[#D4AF37] font-bold tracking-wide">SF TECNOLOGIA</strong>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
