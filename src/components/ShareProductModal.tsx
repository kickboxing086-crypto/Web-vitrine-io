import React, { useState } from 'react';
import { Product, StoreSettings } from '../types';
import { formatCurrency, getStoreShareUrl } from '../lib/formatters';
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
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShareProductModalProps {
  product: Product | null;
  settings: StoreSettings;
  currentClient?: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareProductModal: React.FC<ShareProductModalProps> = ({
  product,
  settings,
  currentClient,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen || !product) return null;

  const basePrice = Number(product.price) || 0;
  const hasPromo =
    Boolean(product.isOnSale) &&
    Boolean(product.promotionalPrice) &&
    Number(product.promotionalPrice) > 0 &&
    Number(product.promotionalPrice) < basePrice;

  const currentPrice = hasPromo ? Number(product.promotionalPrice) : basePrice;
  const discountPct = hasPromo
    ? Math.round(((basePrice - currentPrice) / basePrice) * 100)
    : 0;

  const rawStoreName = (settings.storeName || currentClient?.storeName || '').trim();
  const storeDisplayName =
    !rawStoreName || rawStoreName.toLowerCase() === 'web vitrine'
      ? 'Vitrine Digital Oficial'
      : rawStoreName;

  let storeBaseUrl = getStoreShareUrl(settings, currentClient);
  if (typeof window !== 'undefined' && !storeBaseUrl.includes('?loja=')) {
    const urlParams = new URLSearchParams(window.location.search);
    const lojaFromUrl = urlParams.get('loja') || urlParams.get('u') || urlParams.get('store') || urlParams.get('slug');
    if (lojaFromUrl) {
      storeBaseUrl = `${window.location.origin}/?loja=${encodeURIComponent(lojaFromUrl.trim().toLowerCase())}`;
    }
  }

  const shareUrl = storeBaseUrl.includes('?loja=')
    ? `${storeBaseUrl}&produto=${encodeURIComponent(product.id)}`
    : `${storeBaseUrl}?produto=${encodeURIComponent(product.id)}`;

  const previewImage =
    Array.isArray(product.images)
      ? product.images.find((img) => typeof img === 'string' && img.trim().length > 0)?.trim() || ''
      : '';

  const previewTitle = hasPromo
    ? `${product.name} • ${formatCurrency(currentPrice)} (${discountPct}% OFF) | ${storeDisplayName}`
    : `${product.name} • ${formatCurrency(currentPrice)} | ${storeDisplayName}`;

  const previewDescription = hasPromo
    ? `Oferta na ${storeDisplayName}: de ${formatCurrency(basePrice)} por ${formatCurrency(currentPrice)}. Veja fotos, tamanhos disponíveis e peça pelo WhatsApp!`
    : `Confira na ${storeDisplayName} por ${formatCurrency(currentPrice)}. Veja fotos em alta definição e peça pelo WhatsApp!`;

  let shareDomain = '';
  try {
    shareDomain = new URL(shareUrl).host;
  } catch {
    shareDomain = 'vitrine-oficial';
  }

  const promoLine = hasPromo
    ? `~De ${formatCurrency(basePrice)}~\n🔥 *Por apenas ${formatCurrency(currentPrice)}* (${discountPct}% OFF)\n`
    : `🏷️ *Por apenas ${formatCurrency(currentPrice)}*\n`;

  const shareMessage = `🛍️ *${storeDisplayName}*\n\n*${product.name}*\n${promoLine}\n👉 Veja as fotos e peça direto pelo catálogo:\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error copying link:', err);
    }
  };

  const handleCopyCompleteMessage = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareMessage);
      }
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error('Error copying text:', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: previewTitle,
          text: `Confira ${product.name} por ${formatCurrency(currentPrice)} na ${storeDisplayName}`,
          url: shareUrl,
        });
      } catch {
        // user cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const socialChannels = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      bgColor: 'bg-[#25D366] hover:bg-[#20bd5a]',
      textColor: 'text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`,
      action: 'open',
    },
    {
      name: 'Telegram',
      icon: Send,
      bgColor: 'bg-[#0088cc] hover:bg-[#0077b5]',
      textColor: 'text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`${product.name} por ${formatCurrency(currentPrice)} • ${storeDisplayName}`)}`,
      action: 'open',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      bgColor: 'bg-[#1877F2] hover:bg-[#166fe5]',
      textColor: 'text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      action: 'open',
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      bgColor: 'bg-black hover:bg-stone-900 border border-stone-800',
      textColor: 'text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Confira ${product.name} por ${formatCurrency(currentPrice)} na ${storeDisplayName}`)}&url=${encodeURIComponent(shareUrl)}`,
      action: 'open',
    },
    {
      name: 'Instagram Stories/Direct',
      icon: Instagram,
      bgColor: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]',
      textColor: 'text-white',
      url: 'https://instagram.com',
      action: 'instagram',
    },
    {
      name: 'E-mail',
      icon: Mail,
      bgColor: 'bg-stone-800 hover:bg-stone-700',
      textColor: 'text-white',
      url: `mailto:?subject=${encodeURIComponent(`${product.name} • ${formatCurrency(currentPrice)} | ${storeDisplayName}`)}&body=${encodeURIComponent(shareMessage)}`,
      action: 'open',
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
          id="share-product-modal-container"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
            id="btn-close-share-modal"
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
                Compartilhar Produto
              </h3>
              <p className="text-xs text-stone-400">
                Link com foto e cartão profissional no WhatsApp
              </p>
            </div>
          </div>

          {/* WhatsApp Rich Link Preview Card (Shopee / Mercado Livre style) */}
          <div className="mb-5 rounded-2xl overflow-hidden bg-[#18181E] border border-[#27272A] shadow-inner">
            <div className="relative h-36 w-full bg-black overflow-hidden flex items-center justify-center">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-stone-500 gap-1.5">
                  <ShoppingBag className="w-8 h-8 text-[#D4AF37]/60" />
                  <span className="text-[11px]">{product.name}</span>
                </div>
              )}
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs border border-white/10 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>Prévia no WhatsApp</span>
              </div>
              {hasPromo && (
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                  -{discountPct}% OFF
                </div>
              )}
            </div>
            <div className="p-3.5 space-y-1 border-t border-[#27272A]">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[#D4AF37] flex items-center justify-between">
                <span className="truncate">{storeDisplayName} • Catálogo Oficial</span>
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

          {/* Quick Copy Link Box */}
          <div className="mb-5 space-y-2">
            <label className="text-xs font-medium text-stone-300 block">
              Link Direto do Produto:
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-[#18181E] border border-[#27272A] rounded-xl px-3 py-2.5 text-xs text-stone-300 truncate font-mono select-all">
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#D4AF37] hover:bg-[#C5A059] text-stone-950'
                }`}
                id="btn-copy-product-link"
              >
                {copied ? (
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

          {/* Social Media Channels Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-medium text-stone-300 block">
              Compartilhar nas Redes:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {socialChannels.map((channel, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (channel.action === 'instagram') {
                      handleCopyCompleteMessage();
                      window.open('https://instagram.com', '_blank');
                    } else {
                      window.open(channel.url, '_blank');
                    }
                  }}
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl ${channel.bgColor} ${channel.textColor} font-semibold text-xs transition-transform cursor-pointer hover:scale-[1.02]`}
                  id={`btn-share-${channel.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                >
                  <channel.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{channel.name}</span>
                </button>
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
                id="btn-native-system-share"
              >
                <Share2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Mais Opções</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyCompleteMessage}
              className="flex-1 py-2.5 px-3 bg-[#18181E] hover:bg-[#22222A] text-stone-200 font-semibold text-xs rounded-xl border border-[#27272A] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              id="btn-copy-full-share-message"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Mensagem Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#D4AF37]" />
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
