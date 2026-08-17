import React from 'react';
import { StoreSettings } from '../types';
import { Instagram, MapPin, Clock, ShieldCheck, Crown, Building2, Truck, MessageCircle } from 'lucide-react';
import { formatPhone, cleanPhoneForWhatsapp } from '../lib/formatters';

interface FooterProps {
  settings: StoreSettings;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin }) => {
  const whatsappLink = `https://wa.me/${cleanPhoneForWhatsapp(settings.phoneWhatsapp)}`;
  const instagramUrl = settings.instagramHandle
    ? `https://instagram.com/${settings.instagramHandle.replace('@', '')}`
    : null;

  return (
    <footer className="bg-brand-secondary text-brand-border pt-14 pb-10 border-t border-[#342D26] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Guarantee Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-[#3D352D]">
          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="p-3 bg-brand-primary/15 text-brand-primary rounded-xl">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Seleção Exclusiva</h4>
              <p className="text-xs text-stone-400 mt-0.5">Tecidos nobres e alta qualidade em cada detalhe</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="p-3 bg-brand-primary/15 text-brand-primary rounded-xl">
              {settings.deliveryMode === 'pickup' ? (
                <Building2 className="w-5 h-5" />
              ) : (
                <Truck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">
                {settings.deliveryMode === 'pickup'
                  ? 'Retirada Agendada'
                  : settings.deliveryMode === 'delivery'
                  ? 'Envio Rápido & Seguro'
                  : 'Entrega ou Retirada na Loja'}
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">Atendimento personalizado pelo WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="p-3 bg-brand-primary/15 text-brand-primary rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Compra Direta & Segura</h4>
              <p className="text-xs text-stone-400 mt-0.5">Atendimento personalizado sem intermediários</p>
            </div>
          </div>
        </div>

        {/* Middle Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-2xl font-serif-luxury font-bold text-white tracking-tight">
              {settings.storeName}
            </h3>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              {settings.description ||
                'Vitrine virtual exclusiva de moda. Peças atemporais, alta-costura e tecidos nobres para quem valoriza sofisticação.'}
            </p>
            {instagramUrl && (
              <div className="pt-2">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white/10 hover:bg-brand-primary hover:text-stone-950 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  title="Siga no Instagram"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Siga no Instagram</span>
                </a>
              </div>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Atendimento & WhatsApp
            </h4>
            <div className="space-y-2 text-xs text-stone-300">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer mb-1"
                title="WhatsApp Oficial"
              >
                <MessageCircle className="w-4 h-4 fill-white text-white" />
                <span>Conversar no WhatsApp</span>
              </a>
              {settings.openingHours && (
                <p className="flex items-start space-x-1.5 text-stone-400">
                  <Clock className="w-3.5 h-3.5 text-brand-primary flex-shrink-0 mt-0.5" />
                  <span>{settings.openingHours}</span>
                </p>
              )}
              {settings.pixKey && (
                <p className="text-stone-400 text-[11px]">
                  PIX: <span className="font-mono text-stone-200">{settings.pixKey}</span>
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Endereço Físico
            </h4>
            <div className="space-y-1.5 text-xs text-stone-300">
              {settings.address ? (
                <>
                  <p className="flex items-start space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-primary flex-shrink-0 mt-0.5" />
                    <span>{settings.address}</span>
                  </p>
                  <p className="text-stone-400 pl-5">{settings.cityState}</p>
                </>
              ) : (
                <p className="text-stone-400">Atendimento 100% online e sob encomenda</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#342D26] flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <p
            onDoubleClick={onOpenAdmin}
            className="cursor-default select-none"
            title="Dê um duplo clique para acessar o painel"
          >
            © {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
