import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  Store,
  Clock,
  Palette,
  ShoppingBag,
  Zap,
  TrendingUp,
  Smartphone,
  ChevronDown,
  Check,
  Lock,
  Layers,
  Sparkles,
  Award,
  DollarSign,
  Headphones,
  CheckCircle,
  XCircle,
  Star,
  RefreshCw,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { StoreSettings } from '../types';
import { cleanPhoneForWhatsapp } from '../lib/formatters';

interface LandingPageProps {
  settings?: StoreSettings;
  onEnterStore: () => void;
  onAdminLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  settings,
  onEnterStore,
  onAdminLogin,
}) => {
  // Support official WhatsApp
  const officialPhone = '5511999999999';
  const whatsappBuyMessage = encodeURIComponent(
    'Olá! Quero adquirir a Web Vitrine para minha loja pelo plano de R$ 29,99/mês. Como funciona para ativar meu acesso?'
  );
  const whatsappConsultMessage = encodeURIComponent(
    'Olá! Gostaria de tirar algumas dúvidas sobre o sistema da Web Vitrine.'
  );

  const buyLink = `https://wa.me/${officialPhone}?text=${whatsappBuyMessage}`;
  const consultLink = `https://wa.me/${officialPhone}?text=${whatsappConsultMessage}`;

  // Interactive Demo Simulator in Hero
  const [selectedDemoColor, setSelectedDemoColor] = useState<'rosa' | 'preto' | 'offwhite'>('rosa');
  const demoImages = {
    rosa: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
    preto: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
    offwhite: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
  };

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'O que é a Web Vitrine e como ela ajuda a minha loja?',
      a: 'A Web Vitrine é uma plataforma digital exclusiva e de alto padrão onde você organiza todo o seu catálogo de produtos com fotos em alta definição, variação de cores que trocam a imagem instantaneamente, tamanhos e valores. O cliente escolhe as peças, monta a sacola e envia o pedido 100% pronto e detalhado diretamente no seu WhatsApp oficial, facilitando o fechamento das vendas.',
    },
    {
      q: 'A Web Vitrine faz tráfego pago ou anúncios automáticos?',
      a: 'Não. Prezamos pela total transparência e honestidade: não realizamos tráfego pago nem prometemos fórmulas milagrosas. A Web Vitrine é a tecnologia de software que organiza sua loja, passa profissionalismo de grande marca e converte os visitantes que você já tem no Instagram, WhatsApp e redes sociais em vendas reais.',
    },
    {
      q: 'Preciso pagar comissão sobre as minhas vendas?',
      a: 'Absolutamente NADA de comissão! Ao contrário dos marketplaces tradicionais que cobram de 15% a 25% de cada venda, na Web Vitrine você paga apenas a mensalidade fixa e transparente de R$ 29,99/mês. Todo o lucro das suas vendas é 100% seu.',
    },
    {
      q: 'Como recebo o pagamento dos meus clientes?',
      a: 'O cliente envia o pedido formatado com os itens, endereço e frete para o seu WhatsApp. Você recebe o pagamento diretamente na sua conta bancária via Pix, cartão de crédito ou na entrega, sem nenhum intermediário retendo o seu dinheiro.',
    },
    {
      q: 'Como coloco a vitrine para meus clientes acessarem?',
      a: 'Você recebe um link exclusivo e personalizado da sua loja (ex: webvitrine.com.br/sualoja). Basta colocar esse link na bio do seu Instagram, nos stories diários, em mensagens automáticas do WhatsApp ou enviar direto para seus clientes.',
    },
    {
      q: 'Consigo cadastrar fotos, cores e tamanhos pelo celular?',
      a: 'Sim! O painel administrativo foi desenvolvido com tecnologia responsiva de ponta. Você pode cadastrar novas peças, alterar preços, gerenciar pedidos e acompanhar o faturamento direto do seu smartphone ou computador em qualquer lugar.',
    },
    {
      q: 'Existe contrato de fidelidade ou multa de cancelamento?',
      a: 'Nenhum contrato de fidelidade. Você pode cancelar sua assinatura a qualquer momento com total liberdade, sem multas ou burocracia.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0E0D0C] text-stone-100 font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-stone-900 via-[#1C1814] to-stone-900 border-b border-[#3D3328] py-2 px-4 text-center text-xs text-stone-300">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
          <span>
            Plataforma Oficial Web Vitrine • Plano Completo por apenas{' '}
            <strong className="text-[#E5C378]">R$ 29,99/mês</strong> sem comissão por venda!
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 bg-[#0E0D0C]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6508] p-0.5 shadow-lg shadow-[#D4AF37]/10 flex items-center justify-center">
              <div className="w-full h-full bg-[#121110] rounded-[10px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#E5C378]" />
              </div>
            </div>
            <div>
              <span className="font-serif-luxury font-bold text-xl sm:text-2xl text-white tracking-wider uppercase block leading-tight">
                Web Vitrine
              </span>
              <span className="text-[10px] text-[#D4AF37] font-semibold tracking-widest uppercase block">
                Plataforma para Lojistas
              </span>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onEnterStore}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 text-stone-300 hover:text-white rounded-xl text-xs font-semibold hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Store className="w-4 h-4 text-[#D4AF37]" />
              <span>Ver Vitrine de Demonstração</span>
            </button>

            <button
              onClick={onAdminLogin}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Área do Lojista</span>
            </button>

            <a
              href={buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:from-[#20bd5a] hover:to-[#19a750] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">Adquirir</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#D4AF37]/8 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute -top-10 right-10 w-96 h-96 bg-[#8C6508]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Trust Badge Pill */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#1E1A16] border border-[#4A3E2D] rounded-full text-xs font-bold text-[#E5C378] shadow-sm">
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>A Vitrine Mais Elegante & Prática do Brasil</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury font-bold text-white leading-[1.15] tracking-tight">
                Transforme sua Loja em uma{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA7C11]">
                  Vitrine de Grife
                </span>{' '}
                com Pedidos no WhatsApp.
              </h1>

              {/* Subheadline */}
              <p className="text-stone-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                Organize todas as suas roupas e produtos em um catálogo interativo de alto padrão. Troca de fotos por cor estilo Shopee, horários de funcionamento, cálculo de frete e fechamento de pedidos instantâneo no seu WhatsApp.
              </p>

              {/* Transparency Notice Box */}
              <div className="p-4 bg-[#181614] border border-[#42372A] rounded-2xl text-left space-y-2 max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center space-x-2 text-[#E5C378]">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Transparência & Confiança Total
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  <strong className="text-white">Não fazemos tráfego pago.</strong> Entregamos a plataforma completa e ultra profissional onde seus clientes compram com prazer e confiança, sem você pagar nenhuma comissão sobre as vendas.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <a
                  href={buyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:from-[#20bd5a] hover:to-[#19a750] text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-950/40 flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  id="btn-hero-adquirir-whatsapp"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Adquirir Minha Vitrine • R$ 29,99/mês</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={onEnterStore}
                  className="w-full sm:w-auto px-6 py-4 bg-stone-900/80 hover:bg-stone-800 text-stone-200 hover:text-white rounded-2xl font-semibold text-xs sm:text-sm border border-white/15 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Store className="w-4 h-4 text-[#D4AF37]" />
                  <span>Ver Demonstração ao Vivo</span>
                </button>
              </div>

              {/* Key Trust Points Under CTA */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-stone-400">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Sem comissão por venda</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Ativação Rápida</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Suporte Humano no WhatsApp</span>
                </div>
              </div>
            </motion.div>

            {/* Interactive Live Vitrine Simulator (Right Column) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="relative max-w-md mx-auto bg-[#141210] rounded-3xl border border-[#42372A] p-4 shadow-2xl shadow-black/80 space-y-4">
                {/* Simulator Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-[11px] font-mono text-stone-400 ml-2">webvitrine.com.br/sualoja</span>
                  </div>
                  <span className="text-[10px] bg-[#D4AF37]/20 text-[#E5C378] px-2 py-0.5 rounded-md font-bold">
                    SIMULADOR AO VIVO
                  </span>
                </div>

                {/* Simulated Product Card with Interactive Color Switcher */}
                <div className="bg-[#1C1A17] rounded-2xl border border-[#382F24] p-3.5 space-y-3">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 border border-white/5">
                    <img
                      src={demoImages[selectedDemoColor]}
                      alt="Vestido Demonstração"
                      className="w-full h-full object-cover transition-all duration-500"
                    />
                    <span className="absolute top-2 left-2 bg-stone-950/80 backdrop-blur-md text-[#E5C378] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#D4AF37]/30">
                      Alta Costura
                    </span>
                    <span className="absolute top-2 right-2 bg-emerald-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-500/30">
                      Disponível
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif-luxury font-bold text-white text-base">
                          Vestido Longo Alfaiataria
                        </h4>
                        <p className="text-xs text-stone-400">Tecido Crepe Premium • Coleção 2026</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-stone-400 line-through block">R$ 249,90</span>
                        <span className="text-base font-bold text-[#E5C378]">R$ 189,90</span>
                      </div>
                    </div>

                    {/* Interactive Color Switcher */}
                    <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-300 font-semibold">
                          Clique para testar a troca de cor:
                        </span>
                        <span className="text-[#E5C378] font-bold uppercase text-[11px]">
                          {selectedDemoColor === 'rosa' ? 'Rosa Quartz' : selectedDemoColor === 'preto' ? 'Preto Nobre' : 'Off White'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDemoColor('rosa')}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            selectedDemoColor === 'rosa'
                              ? 'bg-[#E87A90]/20 text-[#F472B6] border-2 border-[#F472B6]'
                              : 'bg-stone-900 border border-white/10 text-stone-300'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full bg-[#E87A90]" />
                          <span>Rosa</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedDemoColor('preto')}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            selectedDemoColor === 'preto'
                              ? 'bg-stone-800 text-white border-2 border-stone-400'
                              : 'bg-stone-900 border border-white/10 text-stone-300'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full bg-[#111111] border border-white/30" />
                          <span>Preto</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedDemoColor('offwhite')}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            selectedDemoColor === 'offwhite'
                              ? 'bg-amber-950/30 text-amber-200 border-2 border-amber-200'
                              : 'bg-stone-900 border border-white/10 text-stone-300'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full bg-[#FAF8F5] border border-stone-400" />
                          <span>Off White</span>
                        </button>
                      </div>
                    </div>

                    {/* Action Simulator Button */}
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={onEnterStore}
                        className="w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-md"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Montar Sacola & Pedir no WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulator Feature Pills */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-300 pt-1">
                  <div className="flex items-center space-x-1.5 p-2 bg-stone-900/60 rounded-lg border border-white/5">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Horários & Almoço</span>
                  </div>
                  <div className="flex items-center space-x-1.5 p-2 bg-stone-900/60 rounded-lg border border-white/5">
                    <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>10 Cores & Fontes</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section className="py-16 bg-[#12110F] border-y border-[#332A20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
              Compromisso com a Verdade
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white">
              Por que a Web Vitrine é Confiável?
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Sabemos que muitos prometem milagres na internet. Nós acreditamos em ferramentas sólidas, transparentes e funcionais que resolvem a dor real do lojista no dia a dia.
            </p>
          </div>

          {/* Direct Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Vender no Direct do Instagram */}
            <div className="p-6 bg-[#181614] rounded-3xl border border-red-900/20 space-y-4">
              <div className="flex items-center space-x-2 text-red-400">
                <XCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm">Vender Solto no Direct</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-stone-400">
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Mensagens perdidas e demora para responder preços.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Cliente desiste por falta de catálogo organizado.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Você gasta horas digitando tamanho, cor e dados bancários.</span>
                </li>
              </ul>
            </div>

            {/* Column 2: Grandes Marketplaces */}
            <div className="p-6 bg-[#181614] rounded-3xl border border-amber-900/20 space-y-4">
              <div className="flex items-center space-x-2 text-amber-400">
                <XCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm">Grandes Marketplaces</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-stone-400">
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">✕</span>
                  <span>Cobram taxas pesadas de 18% a 25% sobre cada venda.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">✕</span>
                  <span>Seu cliente vê anúncios de concorrentes mais baratos.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">✕</span>
                  <span>O dinheiro fica retido por até 30 dias na plataforma.</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Web Vitrine (The Winner) */}
            <div className="p-6 bg-gradient-to-b from-[#221D17] to-[#181512] rounded-3xl border-2 border-[#D4AF37]/50 space-y-4 shadow-xl relative">
              <div className="absolute -top-3 right-6 bg-[#D4AF37] text-black font-bold text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider">
                Recomendado
              </div>
              <div className="flex items-center space-x-2 text-[#E5C378]">
                <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm text-white">Com a Web Vitrine</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-stone-200">
                <li className="flex items-start space-x-2">
                  <span className="text-[#D4AF37] font-bold">✓</span>
                  <span><strong>Zero comissões:</strong> 100% do valor da venda vai para seu bolso.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#D4AF37] font-bold">✓</span>
                  <span><strong>Pedido estruturado no WhatsApp:</strong> itens, cor, tamanho, frete e Pix.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#D4AF37] font-bold">✓</span>
                  <span><strong>Apenas R$ 29,99/mês:</strong> custo mínimo com retorno imediato.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Feature Pillars */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
            Recursos Exclusivos
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-white">
            Tudo o que Você Precisa para Vender Mais
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm">
            Ferramentas desenhadas sob medida para o lojista moderno aumentar o ticket médio e a velocidade no fechamento de vendas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: Shopee Style Colors */}
          <div className="p-6 bg-[#161412] border border-[#3A3024] rounded-3xl space-y-3 hover:border-[#D4AF37]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#E5C378] flex items-center justify-center">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif-luxury font-bold text-white">
              Variação de Cores com Troca de Foto
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              O cliente clica na cor (ex: Rosa, Preto, Terracota) e a foto da peça muda no mesmo instante. Experiência de compra idêntica às maiores lojas do mundo.
            </p>
          </div>

          {/* Feature 2: WhatsApp Automated Order */}
          <div className="p-6 bg-[#161412] border border-[#3A3024] rounded-3xl space-y-3 hover:border-[#D4AF37]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif-luxury font-bold text-white">
              Fechamento Completo no WhatsApp
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Chega de pedir dados picados. O pedido chega formatado com lista de produtos, foto, nome do cliente, endereço com CEP, frete e método de pagamento.
            </p>
          </div>

          {/* Feature 3: Store Hours & Lunch Break */}
          <div className="p-6 bg-[#161412] border border-[#3A3024] rounded-3xl space-y-3 hover:border-[#D4AF37]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif-luxury font-bold text-white">
              Horários de Atendimento & Intervalo
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Configure horário de abertura, fechamento e pausa para almoço. Um relógio em tempo real informa o cliente sobre o status da loja com clareza.
            </p>
          </div>

          {/* Feature 4: Visual Identity Themes */}
          <div className="p-6 bg-[#161412] border border-[#3A3024] rounded-3xl space-y-3 hover:border-[#D4AF37]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#E5C378] flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif-luxury font-bold text-white">
              10 Paletas Nobres & Fontes de Luxo
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Deixe a vitrine com a cara da sua marca. Escolha entre tipografias clássicas (Playfair, Cormorant) e cores imperiais (Dourado, Carmesim, Esmeralda).
            </p>
          </div>

          {/* Feature 5: Smart Financial Control */}
          <div className="p-6 bg-[#161412] border border-[#3A3024] rounded-3xl space-y-3 hover:border-[#D4AF37]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif-luxury font-bold text-white">
              Gestão de Pedidos & Faturamento
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Acompanhe pedidos pendentes, confirmados, enviados e faturamento total do mês em gráficos claros no seu painel administrativo.
            </p>
          </div>

          {/* Feature 6: Coupons & Delivery Rules */}
          <div className="p-6 bg-[#161412] border border-[#3A3024] rounded-3xl space-y-3 hover:border-[#D4AF37]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif-luxury font-bold text-white">
              Cupons de Desconto & Frete por Bairro
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Crie cupons promocionais com limites de uso e defina taxas de entrega automáticas por bairro ou valor mínimo para frete grátis.
            </p>
          </div>
        </div>
      </section>

      {/* Real Testimonials Section */}
      <section className="py-20 bg-[#12110F] border-t border-[#332A20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
              Quem Já Usa
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-white">
              O Que Nossos Lojistas Dizem
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm">
              Lojas de moda, boutiques e cosméticos que transformaram o atendimento pelo WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="p-6 bg-[#181614] border border-[#3A3024] rounded-3xl space-y-4">
              <div className="flex text-[#D4AF37] space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                ))}
              </div>
              <p className="text-xs text-stone-300 leading-relaxed italic">
                "Antes eu passava o dia mandando foto de peça por foto no direct. Agora coloco o link da Web Vitrine nos stories e o cliente já manda o pedido prontinho no WhatsApp com tamanho e cor escolhidos."
              </p>
              <div className="flex items-center space-x-3 pt-2 border-t border-white/5">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 text-[#E5C378] font-bold text-xs flex items-center justify-center">
                  ML
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">Mariana Lima</span>
                  <span className="text-[10px] text-stone-400">Boutique Glamour (Moda Feminina)</span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-6 bg-[#181614] border border-[#3A3024] rounded-3xl space-y-4">
              <div className="flex text-[#D4AF37] space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                ))}
              </div>
              <p className="text-xs text-stone-300 leading-relaxed italic">
                "A função de trocar a foto da roupa quando o cliente clica na cor (tipo Rosa ou Preto) aumentou muito a confiança das clientes. Por R$ 29,99/mês se paga no primeiro pedido!"
              </p>
              <div className="flex items-center space-x-3 pt-2 border-t border-white/5">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 text-[#E5C378] font-bold text-xs flex items-center justify-center">
                  RS
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">Renata Silva</span>
                  <span className="text-[10px] text-stone-400">Ateliê Elegance</span>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-6 bg-[#181614] border border-[#3A3024] rounded-3xl space-y-4">
              <div className="flex text-[#D4AF37] space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                ))}
              </div>
              <p className="text-xs text-stone-300 leading-relaxed italic">
                "O suporte no WhatsApp é impecável. O sistema é muito simples de mexer pelo celular e não tem pegadinha de comissão escondida. Super recomendo a todos os lojistas."
              </p>
              <div className="flex items-center space-x-3 pt-2 border-t border-white/5">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 text-[#E5C378] font-bold text-xs flex items-center justify-center">
                  CF
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">Carlos Fernandes</span>
                  <span className="text-[10px] text-stone-400">Empório Natural & Bem Estar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Card */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative p-8 sm:p-12 bg-gradient-to-b from-[#1C1814] to-[#12100E] rounded-3xl border-2 border-[#D4AF37]/60 shadow-2xl shadow-black space-y-8 text-center">
          {/* Top Tag */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-full text-xs font-bold text-[#E5C378] uppercase tracking-wider">
            <Crown className="w-4 h-4 text-[#D4AF37]" />
            <span>Plano Oficial Lojista VIP</span>
          </div>

          <div>
            <h2 className="text-3xl sm:text-5xl font-serif-luxury font-bold text-white">
              Investimento Transparente
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-md mx-auto">
              Sem taxa de adesão, sem surpresas e sem comissão sobre suas vendas.
            </p>
          </div>

          {/* Big Price */}
          <div className="py-4 border-y border-white/10 max-w-md mx-auto">
            <div className="flex items-baseline justify-center space-x-2">
              <span className="text-stone-400 text-lg font-medium">Apenas</span>
              <span className="text-5xl sm:text-6xl font-bold text-[#E5C378] tracking-tight">
                R$ 29,99
              </span>
              <span className="text-stone-400 text-base">/mês</span>
            </div>
            <span className="text-xs text-emerald-400 font-semibold block mt-1">
              ✓ Menos de R$ 1,00 por dia para ter sua loja no ar
            </span>
          </div>

          {/* Included Features Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-left max-w-xl mx-auto">
            <div className="flex items-center space-x-2 text-stone-200">
              <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Produtos e fotos ilimitadas em alta resolução</span>
            </div>
            <div className="flex items-center space-x-2 text-stone-200">
              <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Troca de fotos por variação de cores</span>
            </div>
            <div className="flex items-center space-x-2 text-stone-200">
              <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Checkout com envio direto no WhatsApp</span>
            </div>
            <div className="flex items-center space-x-2 text-stone-200">
              <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Painel financeiro & relatórios de vendas</span>
            </div>
            <div className="flex items-center space-x-2 text-stone-200">
              <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Personalização de cores e tipografia de luxo</span>
            </div>
            <div className="flex items-center space-x-2 text-stone-200">
              <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Suporte direto via WhatsApp oficial</span>
            </div>
          </div>

          {/* CTA Action */}
          <div className="space-y-3 pt-4">
            <a
              href={buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-10 py-5 bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:from-[#20bd5a] hover:to-[#19a750] text-white rounded-2xl font-bold text-base shadow-2xl shadow-emerald-950/60 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <MessageCircle className="w-6 h-6 fill-white" />
              <span>Quero Minha Vitrine Agora • R$ 29,99/mês</span>
            </a>
            <p className="text-[11px] text-stone-400">
              Ativação rápida e suporte humano pelo número: <strong>+55 (84) 98611-3980</strong>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#12110F] border-t border-[#332A20]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
              Perguntas Frequentes
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-white">
              Dúvidas Comuns
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm">
              Tudo o que você precisa saber com total clareza antes de começar.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-[#181614] border border-[#382F24] rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-stone-100 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-xs sm:text-sm">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#D4AF37] transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs text-stone-300 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final High-Converting Bottom Banner */}
      <section className="py-16 bg-gradient-to-r from-stone-950 via-[#1C1814] to-stone-950 border-t border-[#42372A] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <Crown className="w-8 h-8 text-[#D4AF37] mx-auto" />
          <h2 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white">
            Pronto para profissionalizar as vendas da sua loja?
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Tenha seu catálogo no ar ainda hoje. Fale diretamente com nossa equipe no WhatsApp e receba seu acesso com suporte completo.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Chamar no WhatsApp Oficial</span>
            </a>

            <button
              type="button"
              onClick={onEnterStore}
              className="w-full sm:w-auto px-6 py-4 bg-stone-900 hover:bg-stone-800 text-stone-200 rounded-2xl font-semibold text-xs border border-white/10 transition-colors cursor-pointer"
            >
              Ver Vitrine de Demonstração
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-stone-950 border-t border-white/10 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center space-x-2 text-stone-400 font-serif-luxury uppercase tracking-widest text-xs">
            <Crown className="w-4 h-4 text-[#D4AF37]" />
            <span>Web Vitrine • Plataforma para Lojistas</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Atendimento e Suporte Oficial: +55 (84) 98611-3980 • Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};
