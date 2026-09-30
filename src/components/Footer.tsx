import React from 'react';
import { StoreSettings } from '../types';
import { Instagram, MapPin, Clock, ShieldCheck, Crown, Building2, Truck, MessageCircle } from 'lucide-react';
import { formatPhone, cleanPhoneForWhatsapp } from '../lib/formatters';

interface FooterProps {
  settings: StoreSettings;
  onOpenAdmin: () => void;
  onOpenLanding?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin, onOpenLanding }) => {
  const whatsappLink = `https://wa.me/${cleanPhoneForWhatsapp(settings.phoneWhatsapp)}`;
  const instagramUrl = settings.instagramHandle
    ? `https://instagram.com/${settings.instagramHandle.replace('@', '')}`
    : null;

  return (
    <footer className="bg-[#09090A] text-stone-300 pt-14 pb-10 border-t border-[#27272A] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Guarantee Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-10 border-b border-[#27272A]">
          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-[#141417] border border-[#27272A]">
            <div className="p-2.5 bg-[#D4AF37]/15 text-[#D4AF37] rounded-xl">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Catálogo Selecionado</h4>
              <p className="text-xs text-stone-400 mt-0.5">Peças exclusivas com atenção aos detalhes</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-[#141417] border border-[#27272A]">
            <div className="p-2.5 bg-[#D4AF37]/15 text-[#D4AF37] rounded-xl">
              {settings.deliveryMode === 'pickup' ? (
                <Building2 className="w-5 h-5" />
              ) : (
                <Truck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">
                {settings.deliveryMode === 'pickup'
                  ? 'Retirada na Loja'
                  : settings.deliveryMode === 'delivery'
                  ? 'Envio Rápido & Seguro'
                  : 'Entrega ou Retirada na Loja'}
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">Atendimento personalizado pelo WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-[#141417] border border-[#27272A]">
            <div className="p-2.5 bg-[#D4AF37]/15 text-[#D4AF37] rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Atendimento Humanizado</h4>
              <p className="text-xs text-stone-400 mt-0.5">Fale diretamente com nossa equipe</p>
            </div>
          </div>
        </div>

        {/* Middle Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-2xl font-serif-luxury font-bold text-white tracking-tight">
              {settings.storeName}
            </h3>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              {settings.description ||
                'Vitrine virtual exclusiva. Peças selecionadas, qualidade e atendimento direto pelo WhatsApp.'}
            </p>
            {instagramUrl && (
              <div className="pt-2">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#16161A] hover:bg-[#D4AF37] hover:text-stone-950 text-stone-200 rounded-xl text-xs font-semibold border border-stone-800 transition-all cursor-pointer"
                  title="Siga no Instagram"
                >
                  <Instagram className="w-4 h-4 text-[#D4AF37]" />
                  <span>Siga no Instagram</span>
                </a>
              </div>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Atendimento & WhatsApp
            </h4>
            <div className="space-y-2 text-xs text-stone-300">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer mb-1"
                title="WhatsApp Oficial"
              >
                <MessageCircle className="w-4 h-4 fill-white text-white" />
                <span>Conversar no WhatsApp</span>
              </a>
              {settings.openingHours && (
                <p className="flex items-start space-x-1.5 text-stone-400">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <span>{settings.openingHours}</span>
                </p>
              )}
              {settings.pixKey && (
                <p className="text-stone-400 text-[11px]">
                  Chave Pix: <span className="font-mono text-stone-200">{settings.pixKey}</span>
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Endereço da Loja
            </h4>
            <div className="space-y-1.5 text-xs text-stone-300">
              {settings.address ? (
                <>
                  <p className="flex items-start space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <span>{settings.address}</span>
                  </p>
                  <p className="text-stone-400 pl-5">{settings.cityState}</p>
                </>
              ) : (
                <p className="text-stone-400">Atendimento online via WhatsApp</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar with SF TECNOLOGIA */}
        <div className="pt-8 border-t border-[#27272A] flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <p
            onDoubleClick={onOpenAdmin}
            className="cursor-default select-none"
            title="Dê um duplo clique para acessar a área administrativa"
          >
            © {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.
          </p>

          <div className="flex items-center space-x-4">
            {onOpenLanding && (
              <button
                type="button"
                onClick={onOpenLanding}
                className="text-stone-400 hover:text-[#D4AF37] transition-colors cursor-pointer text-[11px]"
              >
                Web Vitrine
              </button>
            )}

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#141417] border border-[#27272A] text-[11px] text-stone-300">
              <span className="text-stone-400">desenvolvido por:</span>
              <strong className="text-[#D4AF37] font-bold tracking-wide">SF TECNOLOGIA</strong>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
