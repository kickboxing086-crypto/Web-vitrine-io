import React, { useState } from 'react';
import { Product, StoreSettings } from '../types';
import { formatCurrency, copyToClipboardSafe } from '../lib/formatters';
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
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShareProductModalProps {
  product: Product | null;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareProductModal: React.FC<ShareProductModalProps> = ({
  product,
  settings,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !product) return null;

  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const currentPrice =
    product.isOnSale && product.promotionalPrice
      ? product.promotionalPrice
      : product.price;

  // Build product link
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const loja = searchParams.get('loja') || searchParams.get('store') || searchParams.get('u');
  const shareUrl = loja 
    ? `${origin}${pathname}?loja=${encodeURIComponent(loja)}&produto=${encodeURIComponent(product.id)}`
    : `${origin}${pathname}?produto=${encodeURIComponent(product.id)}`;

  // Default share text message
  const shareMessage = `Olha que peça linda que encontrei na ${settings.storeName} ✨\n\n👗 *${product.name}*\n💰 Por apenas *${formatCurrency(currentPrice)}*\n\n👉 Veja todos os detalhes e fotos aqui:\n${shareUrl}`;

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
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} - ${settings.storeName}`,
          text: `Confira ${product.name} por ${formatCurrency(currentPrice)} na ${settings.storeName}!`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  // Social Links
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
      bgColor: 'bg-[#229ED9] hover:bg-[#1e8cc1]',
      textColor: 'text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`${product.name} - ${formatCurrency(currentPrice)} na ${settings.storeName}`)}`,
      action: 'open',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      bgColor: 'bg-[#1877F2] hover:bg-[#166fe5]',
      textColor: 'text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(`${product.name} por ${formatCurrency(currentPrice)} na ${settings.storeName}`)}`,
      action: 'open',
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      bgColor: 'bg-black hover:bg-stone-800',
      textColor: 'text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Confira ${product.name} por ${formatCurrency(currentPrice)} na ${settings.storeName}`)}&url=${encodeURIComponent(shareUrl)}`,
      action: 'open',
    },
    {
      name: 'Instagram Stories/Direct',
      icon: Instagram,
      bgColor: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95',
      textColor: 'text-white',
      url: 'https://instagram.com',
      action: 'instagram',
    },
    {
      name: 'Pinterest',
      icon: ExternalLink,
      bgColor: 'bg-[#E60023] hover:bg-[#cc001f]',
      textColor: 'text-white',
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(product.images[0] || '')}&description=${encodeURIComponent(`${product.name} - ${settings.storeName}`)}`,
      action: 'open',
    },
    {
      name: 'E-mail',
      icon: Mail,
      bgColor: 'bg-stone-700 hover:bg-stone-800',
      textColor: 'text-white',
      url: `mailto:?subject=${encodeURIComponent(`${product.name} na ${settings.storeName}`)}&body=${encodeURIComponent(shareMessage)}`,
      action: 'open',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl border border-[#E8DACB] shadow-2xl overflow-hidden my-auto p-6 sm:p-7"
          id="share-product-modal-container"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            id="btn-close-share-modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-3 bg-brand-bg text-brand-primary-dark rounded-2xl border border-brand-border">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-stone-900 leading-tight">
                Compartilhar Peça
              </h3>
              <p className="text-xs text-stone-500">
                Divulgue em todas as suas redes sociais
              </p>
            </div>
          </div>

          {/* Product Mini Preview Card */}
          <div className="flex items-center space-x-3.5 p-3.5 bg-brand-bg-alt/70 rounded-2xl border border-brand-border mb-5">
            <div className="w-14 h-16 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-brand-border">
              <img
                src={
                  product.images[0] ||
                  ''
                }
                alt={product.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-brand-primary-dark tracking-wider block">
                {product.category}
              </span>
              <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                {product.name}
              </h4>
              <span className="text-sm font-bold text-stone-900 mt-0.5 block">
                {formatCurrency(currentPrice)}
              </span>
            </div>
          </div>

          {/* Quick Copy Link Box */}
          <div className="mb-5 space-y-2">
            <label className="text-xs font-bold text-stone-700 block">
              Link Direto do Produto:
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-600 truncate font-mono select-all">
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 shadow-2xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
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
            <label className="text-xs font-bold text-stone-700 block">
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
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl ${channel.bgColor} ${channel.textColor} font-semibold text-xs transition-all shadow-2xs cursor-pointer hover:scale-[1.02]`}
                  id={`btn-share-${channel.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                >
                  <channel.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{channel.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Native System Share (if mobile supported) & Full Message Copy */}
          <div className="mt-4 pt-4 border-t border-brand-border flex flex-col sm:flex-row gap-2">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex-1 py-2.5 px-3 bg-brand-bg hover:bg-brand-bg-alt text-brand-primary-dark font-bold text-xs rounded-xl border border-brand-border flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                id="btn-native-system-share"
              >
                <Share2 className="w-4 h-4" />
                <span>Mais Opções do Celular</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyCompleteMessage}
              className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              id="btn-copy-full-share-message"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Texto Pronto Copiado!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-brand-primary-dark" />
                  <span>Copiar Mensagem Pronta</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
