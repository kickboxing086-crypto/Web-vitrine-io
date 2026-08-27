import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  MessageCircle, 
  CheckCircle2,
  Store,
  ArrowRight,
  ShieldCheck,
  Star,
  ChevronDown
} from 'lucide-react';
import { StoreSettings } from '../types';

interface LandingPageProps {
  settings?: StoreSettings;
  onEnterStore: (slug?: string) => void;
  onAdminLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
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
      a: 'Uma plataforma digital onde você organiza seu catálogo de produtos com fotos, cores, tamanhos e valores. O cliente escolhe as peças, monta a sacola e envia o pedido pronto diretamente no seu WhatsApp.',
    },
    {
      q: 'Preciso pagar comissão sobre as vendas?',
      a: 'Nenhuma comissão. Você paga apenas a assinatura da plataforma e todo o lucro das suas vendas é 100% seu.',
    },
    {
      q: 'Como recebo o pagamento dos clientes?',
      a: 'O cliente envia o pedido para o seu WhatsApp. Você recebe o pagamento diretamente na sua conta bancária via Pix, cartão de crédito ou na entrega.',
    },
    {
      q: 'Consigo gerenciar tudo pelo celular?',
      a: 'Sim. O painel administrativo é 100% otimizado para celulares. Você pode cadastrar peças, alterar preços e acompanhar pedidos de qualquer lugar.',
    },
    {
      q: 'Existe contrato de fidelidade?',
      a: 'Nenhum contrato. Você pode cancelar sua assinatura a qualquer momento com total liberdade.',
    }
  ];

  const plans = [
    { name: 'Mensal', price: 'R$ 29,99', period: '/mês', highlight: false },
    { name: 'Trimestral', price: 'R$ 49,99', period: '/trimestre', highlight: false },
    { name: 'Semestral', price: 'R$ 119,99', period: '/semestre', highlight: false },
        { name: 'Vitalício', price: 'R$ 250,00', period: ' Pagamento Único', highlight: true },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-900 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Store className="w-6 h-6 text-stone-900" />
            <span className="font-bold text-lg tracking-tight uppercase">Web Vitrine</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onAdminLogin}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Área do Lojista</span>
            </button>
            <a
              href={buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Assinar Agora</span>
              <span className="sm:hidden">Assinar</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-8">
        <h1 className="text-4xl sm:text-6xl font-black text-stone-900 leading-[1.1] tracking-tight">
          Sua loja com um catálogo online elegante.
        </h1>
        <p className="text-stone-600 text-base sm:text-lg max-w-2xl mx-auto">
          Organize seus produtos e receba os pedidos diretamente no seu WhatsApp. 
          Sem comissões, sem intermediários.
        </p>
        
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-bold transition-colors w-full sm:w-auto"
          >
            <span>Criar Minha Vitrine</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Features - Minimalist */}
      <section className="py-20 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto bg-stone-100 rounded-full flex items-center justify-center text-stone-900">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Catálogo Profissional</h3>
              <p className="text-stone-600 text-sm">Exiba fotos, cores e tamanhos em uma interface premium e intuitiva.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto bg-stone-100 rounded-full flex items-center justify-center text-stone-900">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Pedidos no WhatsApp</h3>
              <p className="text-stone-600 text-sm">O cliente monta a sacola e envia o pedido formatado direto no seu WhatsApp.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto bg-stone-100 rounded-full flex items-center justify-center text-stone-900">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Zero Taxas</h3>
              <p className="text-stone-600 text-sm">Sem comissões por venda. Você paga apenas o plano escolhido e lucra 100%.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-black tracking-tight">Planos Simples e Claros</h2>
          <p className="text-stone-600">Escolha o melhor plano para o seu negócio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`p-6 rounded-2xl flex flex-col justify-between border ${plan.highlight ? 'bg-stone-900 text-white border-stone-900 shadow-xl lg:-translate-y-4' : 'bg-white border-stone-200 text-stone-900'}`}
            >
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${plan.highlight ? 'text-stone-300' : 'text-stone-500'}`}>{plan.name}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className={`text-xs pb-1 font-medium ${plan.highlight ? 'text-stone-400' : 'text-stone-500'}`}>{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 ${plan.highlight ? 'text-stone-300' : 'text-stone-900'}`} />
                    <span>Catálogo Ilimitado</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 ${plan.highlight ? 'text-stone-300' : 'text-stone-900'}`} />
                    <span>Pedidos via WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 ${plan.highlight ? 'text-stone-300' : 'text-stone-900'}`} />
                    <span>Painel de Gestão</span>
                  </li>
                </ul>
              </div>
              
              <a
                href={buyLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 rounded-xl text-xs font-bold text-center transition-colors ${plan.highlight ? 'bg-white text-stone-900 hover:bg-stone-100' : 'bg-stone-100 text-stone-900 hover:bg-stone-200'}`}
              >
                Escolher Plano
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white border-t border-stone-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight text-center mb-12">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none"
                >
                  <span className="font-bold text-stone-900">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-stone-500 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 pt-0 text-stone-600 text-sm">
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

      {/* Footer */}
      <footer className="bg-stone-950 py-12 text-center text-stone-400">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Store className="w-5 h-5 text-stone-500" />
            <span className="font-bold text-lg tracking-tight uppercase text-stone-300">Web Vitrine</span>
          </div>
          <p className="text-xs">&copy; {new Date().getFullYear()} Web Vitrine. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
