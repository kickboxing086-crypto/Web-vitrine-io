import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Send,
  Mail,
  Sparkles,
  Crown,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { copyToClipboardSafe } from '../lib/formatters';

interface ShareSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareSystemModal: React.FC<ShareSystemModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const systemUrl = origin ? `${origin}/?sistema=1` : '/';

  let shareDomain = 'web-vitrine';
  try {
    if (origin) shareDomain = new URL(origin).host;
  } catch {
    shareDomain = 'web-vitrine';
  }

  const previewTitle =
    'Web Vitrine — Catálogo Digital Profissional e Vendas pelo WhatsApp';
  const previewDescription =
    'Plataforma profissional para lojistas: cadastre produtos em minutos, receba pedidos organizados no WhatsApp e teste grátis por 5 dias sem comissões.';

  const shareMessage =
    `👑 *Web Vitrine — Catálogo Digital Profissional*\n\n` +
    `Transforme suas vendas pelo WhatsApp com uma vitrine online elegante e prática!\n\n` +
    `✅ Cadastre peças com fotos, cores e tamanhos em minutos\n` +
    `✅ Pedidos chegam prontos e calculados no seu WhatsApp\n` +
    `✅ Zero comissão sobre suas vendas\n` +
    `🎁 Teste grátis por 5 dias\n\n` +
    `👉 Conheça e crie sua loja agora:\n${systemUrl}`;

  const handleCopyLink = async () => {
    const ok = await copyToClipboardSafe(systemUrl);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyMessage = async () => {
    const ok = await copyToClipboardSafe(shareMessage);
    if (ok) {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: previewTitle,
          text: 'Conheça a Web Vitrine — o catálogo digital profissional para vender pelo WhatsApp (5 dias grátis)!',
          url: systemUrl,
        });
      } catch {
        // user cancelled share
      }
    } else {
      await handleCopyLink();
    }
  };

  const channels = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      bgColor: 'bg-[#25D366] hover:bg-[#20bd5a]',
      textColor: 'text-white',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`,
      isInstagram: false,
    },
    {
      name: 'Telegram',
      icon: Send,
      bgColor: 'bg-[#0088cc] hover:bg-[#0077b5]',
      textColor: 'text-white',
      href: `https://t.me/share/url?url=${encodeURIComponent(systemUrl)}&text=${encodeURIComponent(
        'Conheça a Web Vitrine — Catálogo Digital Profissional para vender no WhatsApp (5 dias grátis)!'
      )}`,
      isInstagram: false,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      bgColor: 'bg-[#1877F2] hover:bg-[#166fe5]',
      textColor: 'text-white',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(systemUrl)}`,
      isInstagram: false,
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      bgColor: 'bg-black hover:bg-stone-900 border border-stone-800',
      textColor: 'text-white',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        'Conheça a Web Vitrine — Catálogo Digital Profissional para vender pelo WhatsApp!'
      )}&url=${encodeURIComponent(systemUrl)}`,
      isInstagram: false,
    },
    {
      name: 'Instagram Direct',
      icon: Instagram,
      bgColor: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]',
      textColor: 'text-white',
      href: 'https://instagram.com',
      isInstagram: true,
    },
    {
      name: 'E-mail',
      icon: Mail,
      bgColor: 'bg-stone-800 hover:bg-stone-700',
      textColor: 'text-white',
      href: `mailto:?subject=${encodeURIComponent(previewTitle)}&body=${encodeURIComponent(shareMessage)}`,
      isInstagram: false,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#121215] text-stone-100 rounded-3xl border border-[#27272A] shadow-2xl overflow-hidden my-auto p-6"
          id="share-system-modal-container"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
            id="btn-close-share-system-modal"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-4 pr-8">
            <div className="p-2.5 bg-[#1C1C22] text-[#D4AF37] border border-[#2B2B33] rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury font-bold text-lg text-white">
                Compartilhar o Sistema
              </h3>
              <p className="text-xs text-stone-400">
                Convide outros lojistas e empreendedores para a Web Vitrine
              </p>
            </div>
          </div>

          {/* WhatsApp Rich Link Preview Card */}
          <div className="mb-5 rounded-2xl overflow-hidden bg-[#18181E] border border-[#27272A] shadow-inner">
            <div className="relative h-32 w-full bg-[#09090B] overflow-hidden flex items-center justify-center">
              <img
                src="/logo-master.jpg"
                alt="Web Vitrine"
                className="w-full h-full object-cover object-center opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18181E] via-transparent to-black/40" />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs border border-white/10 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>Prévia no WhatsApp</span>
              </div>
              <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-stone-950 text-[10px] font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" />
                <span>5 Dias Grátis</span>
              </div>
            </div>
            <div className="p-3.5 space-y-1 border-t border-[#27272A]">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[#D4AF37] flex items-center justify-between">
                <span className="truncate">Web Vitrine • Plataforma Profissional</span>
                <ExternalLink className="w-3 h-3 shrink-0 text-stone-500" />
              </p>
              <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">
                {previewTitle}
              </h4>
              <p className="text-[11px] text-stone-400 leading-relaxed line-clamp-2">
                {previewDescription}
              </p>
              <p className="text-[10px] text-stone-500 font-mono truncate pt-0.5">
                {shareDomain}
              </p>
            </div>
          </div>

          {/* Quick Copy Link */}
          <div className="mb-5 space-y-2">
            <label className="text-xs font-medium text-stone-300 block">
              Link Oficial do Sistema:
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-[#18181E] border border-[#27272A] rounded-xl px-3 py-2.5 text-xs text-stone-300 truncate font-mono select-all">
                {systemUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#D4AF37] hover:bg-[#C5A059] text-stone-950'
                }`}
                id="btn-copy-system-link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Channels */}
          <div className="space-y-2.5">
            <label className="text-xs font-medium text-stone-300 block">
              Enviar por:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {channels.map((channel) => (
                <a
                  key={channel.name}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (channel.isInstagram) {
                      handleCopyMessage();
                    }
                  }}
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl ${channel.bgColor} ${channel.textColor} font-semibold text-xs transition-transform cursor-pointer hover:scale-[1.02]`}
                  id={`btn-share-system-${channel.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                >
                  <channel.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{channel.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Native System Share & Full Message Copy */}
          <div className="mt-5 pt-4 border-t border-[#27272A] flex flex-col sm:flex-row gap-2">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex-1 py-2.5 px-3 bg-[#18181E] hover:bg-[#22222A] text-stone-200 font-semibold text-xs rounded-xl border border-[#27272A] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                id="btn-native-share-system"
              >
                <Share2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Mais Opções</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyMessage}
              className="flex-1 py-2.5 px-3 bg-[#18181E] hover:bg-[#22222A] text-stone-200 font-semibold text-xs rounded-xl border border-[#27272A] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              id="btn-copy-full-system-message"
            >
              {copiedMessage ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Mensagem Copiada!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Copiar Mensagem</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
