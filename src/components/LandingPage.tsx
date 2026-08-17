import React from 'react';
import { motion } from 'framer-motion';
import { Diamond, LogIn, ArrowRight, MessageCircle } from 'lucide-react';
import { StoreSettings } from '../types';
import { cleanPhoneForWhatsapp } from '../lib/formatters';

interface LandingPageProps {
  settings: StoreSettings;
  onEnterStore: () => void;
  onAdminLogin: () => void;
}

export function LandingPage({ settings, onEnterStore, onAdminLogin }: LandingPageProps) {
  const whatsappNumber = cleanPhoneForWhatsapp(settings.phoneWhatsapp || '5584986113980');
  const whatsappMessage = encodeURIComponent('Olá! Tenho interesse em montar a minha Vitrine Virtual com vocês. Podem me dar mais informações?');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col font-sans selection:bg-brand-primary selection:text-stone-950">
      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-24 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <Diamond className="w-8 h-8 text-brand-primary" />
              <span className="font-serif-luxury font-bold text-2xl text-white tracking-widest uppercase">
                Web Vitrine
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={onAdminLogin}
                className="flex items-center space-x-2 text-stone-300 hover:text-white transition-colors cursor-pointer group"
              >
                <LogIn className="w-5 h-5 group-hover:text-brand-primary transition-colors" />
                <span className="text-sm font-semibold tracking-wide uppercase">Acessar Conta</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center relative overflow-hidden pt-24 pb-12">
        {/* Luxury Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-stone-950 -z-10" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent opacity-50" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 rounded-full mb-8">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-xs font-semibold tracking-widest uppercase text-brand-primary">Plataforma Premium</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif-luxury font-bold text-white leading-[1.1] mb-8">
                Monte conosco sua <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-border via-brand-primary to-brand-primary-darker">
                  Vitrine Virtual
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-stone-400 leading-relaxed mb-12 font-light">
                A solução definitiva e elegante para expor seus produtos. 
                Seja para moda de alta-costura ou uma linha exclusiva de produtos naturais, 
                entregamos um sistema de alto padrão focado em conversão e gestão de vendas via WhatsApp.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-primary-darker hover:from-brand-border hover:to-brand-primary text-stone-950 rounded-none text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_40px_-10px_rgba(215,181,139,0.5)] cursor-pointer flex items-center justify-center space-x-3 group"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Falar com Consultor</span>
                </a>
                
                <button
                  onClick={onAdminLogin}
                  className="w-full sm:w-auto px-8 py-4 bg-transparent border border-brand-primary/30 hover:border-brand-primary text-white rounded-none text-sm font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-3 group"
                >
                  <LogIn className="w-5 h-5 text-brand-primary group-hover:scale-110 transition-transform" />
                  <span>Entrar no Sistema</span>
                </button>
              </div>
            </motion.div>

            {/* Visual element representing luxury vitrine */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent blur-3xl -z-10 rounded-full" />
              <div className="relative aspect-[4/5] w-full max-w-md mx-auto border border-white/10 bg-stone-900/50 backdrop-blur-sm p-4 overflow-hidden shadow-2xl">
                {/* Simulated UI inside the luxury frame */}
                <div className="w-full h-full border border-white/5 relative bg-stone-950 overflow-hidden flex flex-col">
                  <div className="h-16 border-b border-white/5 flex items-center justify-center">
                    <div className="w-1/2 h-4 bg-white/5 rounded" />
                  </div>
                  <div className="flex-1 p-6 space-y-6">
                    <div className="w-full aspect-[4/3] bg-gradient-to-tr from-white/5 to-transparent rounded-sm" />
                    <div className="space-y-3">
                      <div className="w-3/4 h-5 bg-white/10 rounded" />
                      <div className="w-1/2 h-4 bg-brand-primary/30 rounded" />
                    </div>
                    <div className="w-full h-10 bg-white/5 mt-auto" />
                  </div>
                  {/* Subtle glare effect */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-30" />
                </div>
              </div>
            </motion.div>
            
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 bg-stone-950 relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2 text-white/50">
            <Diamond className="w-4 h-4" />
            <span className="text-xs tracking-widest uppercase font-serif-luxury">
              Web Vitrine
            </span>
          </div>
          <p className="text-xs text-white/30 tracking-wider">
            © {new Date().getFullYear()} Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
