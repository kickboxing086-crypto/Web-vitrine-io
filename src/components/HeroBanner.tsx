import React from 'react';
import { StoreSettings } from '../types';
import { Crown, MapPin, Clock, Truck, Building2, Instagram, Phone, MessageCircle } from 'lucide-react';
import { cleanPhoneForWhatsapp } from '../lib/formatters';

interface HeroBannerProps {
  settings: StoreSettings;
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  tags: string[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  settings,
  selectedTag,
  onSelectTag,
  tags,
}) => {
  const bannerImage =
    settings.bannerUrl ||
    '';

  const whatsappLink = `https://wa.me/${cleanPhoneForWhatsapp(settings.phoneWhatsapp)}`;
  const instagramUrl = settings.instagramHandle
    ? `https://instagram.com/${settings.instagramHandle.replace('@', '')}`
    : null;

  return (
    <div className="relative mb-8">
      {/* Editorial Cover */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white min-h-[340px] sm:min-h-[400px] flex items-end p-6 sm:p-10 shadow-xl border border-[#E3D7CA]">
        {/* Background Image with warm gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={bannerImage}
            alt={settings.storeName}
            className="w-full h-full object-cover object-center opacity-75 scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A18]/95 via-[#1C1A18]/50 to-black/20" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl space-y-3">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-primary/20 border border-brand-primary/40 rounded-full text-[#EADBC8] text-xs font-semibold backdrop-blur-xs">
            <Crown className="w-3.5 h-3.5 text-brand-primary" />
            <span>Seleção Exclusiva & Atendimento Personalizado</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif-luxury font-medium tracking-tight text-white leading-tight">
            {settings.storeName}
          </h1>

          {/* Bio / Description */}
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl font-light">
            {settings.description ||
              'Peças exclusivas, tecidos nobres e alfaiataria atemporal pensados para exaltar sua elegância.'}
          </p>

          {/* Info Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-stone-300">
            {settings.address && (
              <span className="flex items-center space-x-1 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                <span className="truncate">{settings.address}</span>
              </span>
            )}

            {settings.openingHours && (
              <span className="flex items-center space-x-1 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                <Clock className="w-3.5 h-3.5 text-brand-primary" />
                <span>{settings.openingHours}</span>
              </span>
            )}

            <span className="flex items-center space-x-1 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-xs text-[#EADBC8] font-medium">
              {settings.deliveryMode === 'both' ? (
                <>
                  <Truck className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Entrega no Endereço ou Retirada</span>
                </>
              ) : settings.deliveryMode === 'pickup' ? (
                <>
                  <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Apenas Retirada no Local</span>
                </>
              ) : (
                <>
                  <Truck className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Apenas Entrega / Envio</span>
                </>
              )}
            </span>
          </div>

          {/* Social Quick Links on Hero */}
          <div className="pt-2 flex items-center space-x-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Falar no WhatsApp</span>
            </a>

            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-all cursor-pointer"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@{settings.instagramHandle.replace('@', '')}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Quick Tag Pills Filter below Banner */}
      <div className="mt-4 flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider pl-1">
          Destaques:
        </span>
        <button
          onClick={() => onSelectTag('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            selectedTag === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-brand-bg-alt hover:bg-brand-bg-alt text-stone-700'
          }`}
        >
          Todos os Destaques
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelectTag(tag)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedTag === tag
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-brand-bg-alt hover:bg-brand-bg-alt text-stone-700'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
};
