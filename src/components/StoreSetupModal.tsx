import React, { useState, useRef, useEffect } from 'react';
import { StoreSettings, DeliveryMode } from '../types';
import {
  Store,
  Phone,
  Instagram,
  MapPin,
  Clock,
  CreditCard,
  Truck,
  Building2,
  Save,
  X,
  Share2,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Trash2,
  Info,
  Palette,
  Type,
  Coffee,
  Check,
  Crown,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fileToBase64 } from '../lib/imageUtils';
import { STORE_FONTS, STORE_COLOR_PALETTES, WEEK_DAYS, formatBusinessDaysLabel } from '../lib/themeUtils';

interface StoreSetupModalProps {
  currentClient?: any;
  isOpen: boolean;
  isFirstSetup?: boolean;
  settings: StoreSettings;
  onSave: (newSettings: StoreSettings) => void;
  onUpdateClientSlug?: (newSlug: string) => void;
  onClose?: () => void;
}

export const StoreSetupModal: React.FC<StoreSetupModalProps> = ({
  currentClient,
  isOpen,
  isFirstSetup = false,
  settings,
  onSave,
  onUpdateClientSlug,
  onClose,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [storeSlug, setStoreSlug] = useState(currentClient?.storeSlug || currentClient?.username || '');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...settings });
      setStoreSlug(currentClient?.storeSlug || currentClient?.username || '');
    }
  }, [isOpen, settings, currentClient]);

  if (!isOpen) return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingLogo(true);
      const base64 = await fileToBase64(file, 600, 600, 0.9);
      setFormData((prev) => ({ ...prev, logoUrl: base64 }));
    } catch (err) {
      console.error('Erro ao converter logo para base64:', err);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingBanner(true);
      const base64 = await fileToBase64(file, 1600, 900, 0.85);
      setFormData((prev) => ({ ...prev, bannerUrl: base64 }));
    } catch (err) {
      console.error('Erro ao converter banner para base64:', err);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      isFirstSetupDone: true,
    });
    if (onUpdateClientSlug && storeSlug.trim()) {
      onUpdateClientSlug(storeSlug.trim().replace(/\s+/g, '').toLowerCase());
    }
    if (onClose) onClose();
  };

  const copyInviteLink = () => {
    let inviteUrl = '';
    const activeSlug = storeSlug.trim().replace(/\s+/g, '').toLowerCase() || currentClient?.storeSlug || currentClient?.username;
    
    if (activeSlug) {
      // Prioritize the standard reliable query param URL that works 100% on Vercel
      inviteUrl = `${window.location.origin}/?loja=${activeSlug}`;
    } else {
      inviteUrl = `${window.location.origin}?invite=${formData.inviteCode || 'VIP'}`;
    }

    navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-3xl bg-brand-bg rounded-3xl border border-[#E3D7CA] shadow-2xl overflow-hidden my-auto"
          id="store-setup-modal-card"
        >
          {/* Header */}
          <div className="relative px-6 sm:px-8 pt-8 pb-6 bg-gradient-to-r from-brand-secondary to-[#342D26] text-white">
            {!isFirstSetup && onClose && (
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                id="btn-close-setup-modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 bg-brand-primary-dark/20 text-brand-primary border border-brand-primary-dark/40 rounded-xl">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold tracking-widest text-brand-primary uppercase">
                  {isFirstSetup ? 'Boas-vindas ao seu Espaço' : 'Configurações Gerais'}
                </span>
                <h2 className="text-2xl font-serif-luxury font-medium text-white">
                  {isFirstSetup ? 'Configure os Dados da sua Loja' : 'Dados & Atendimento da Loja'}
                </h2>
              </div>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl">
              {isFirstSetup
                ? 'Preencha as informações essenciais para personalizar sua vitrine e começar a receber pedidos diretamente no seu WhatsApp.'
                : 'Atualize os dados de contato, redes sociais e políticas de entrega e retirada.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Section 1: Identidade da Loja */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-stone-900 border-b border-brand-border pb-2">
                <Crown className="w-4 h-4 text-brand-primary-dark" />
                <h3 className="font-semibold text-sm tracking-wide uppercase text-stone-800">
                  1. Identidade & Apresentação
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nome da Loja / Boutique *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder="Ex: Web Vitrine"
                    className="w-full px-3.5 py-2.5 bg-white border border-brand-border-dark rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-dark/30 focus:border-brand-primary-dark"
                    id="input-store-name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Slogan / Subtítulo da Vitrine
                  </label>
                  <input
                    type="text"
                    value={formData.slogan}
                    onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                    placeholder="Ex: Alta Costura & Alfaiataria Exclusiva"
                    className="w-full px-3.5 py-2.5 bg-white border border-brand-border-dark rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-dark/30 focus:border-brand-primary-dark"
                    id="input-store-slogan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Bio / Apresentação da Loja
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Conte um pouco sobre suas coleções, tecidos e proposta de valor..."
                  className="w-full px-3.5 py-2.5 bg-white border border-brand-border-dark rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-dark/30 focus:border-brand-primary-dark"
                  id="input-store-desc"
                />
              </div>

              {/* Logo e Banner com suporte a Base64 e preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Logo / Perfil Base64 */}
                <div className="p-3.5 bg-white border border-brand-border-dark rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-brand-primary-dark" />
                      <span>Logo / Foto de Perfil</span>
                    </label>
                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: '' })}
                        className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" /> Remover
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl border border-[#E3D7CA] overflow-hidden bg-brand-bg flex-shrink-0 flex items-center justify-center relative">
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-6 h-6 text-stone-300" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        ref={logoInputRef}
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="file-input-logo"
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-brand-bg-alt hover:bg-brand-bg-alt text-stone-800 rounded-xl text-xs font-semibold border border-brand-border-dark transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-brand-primary-dark" />
                        <span>{isUploadingLogo ? 'Processando...' : 'Carregar Foto (Base64)'}</span>
                      </button>
                      <input
                        type="text"
                        value={formData.logoUrl.startsWith('data:') ? '' : formData.logoUrl}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        placeholder="ou cole o link da foto..."
                        className="w-full px-2.5 py-1 text-[11px] bg-brand-bg border border-stone-200 rounded-lg text-stone-700 placeholder:text-stone-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Banner / Capa Base64 */}
                <div className="p-3.5 bg-white border border-brand-border-dark rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-brand-primary-dark" />
                      <span>Capa Principal / Banner</span>
                    </label>
                    {formData.bannerUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, bannerUrl: '' })}
                        className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" /> Remover
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-20 h-16 rounded-xl border border-[#E3D7CA] overflow-hidden bg-brand-bg flex-shrink-0 flex items-center justify-center relative">
                      {formData.bannerUrl ? (
                        <img
                          src={formData.bannerUrl}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-stone-300" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        ref={bannerInputRef}
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                        id="file-input-banner"
                      />
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={isUploadingBanner}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-brand-bg-alt hover:bg-brand-bg-alt text-stone-800 rounded-xl text-xs font-semibold border border-brand-border-dark transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-brand-primary-dark" />
                        <span>{isUploadingBanner ? 'Processando...' : 'Carregar Capa (Base64)'}</span>
                      </button>
                      <input
                        type="text"
                        value={formData.bannerUrl.startsWith('data:') ? '' : formData.bannerUrl}
                        onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                        placeholder="ou cole o link do banner..."
                        className="w-full px-2.5 py-1 text-[11px] bg-brand-bg border border-stone-200 rounded-lg text-stone-700 placeholder:text-stone-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Contato & Redes Sociais */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-stone-900 border-b border-brand-border pb-2">
                <Phone className="w-4 h-4 text-brand-primary-dark" />
                <h3 className="font-semibold text-sm tracking-wide uppercase text-stone-800">
                  2. Contato & Redes Sociais
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    WhatsApp de Vendas (com DDD) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.phoneWhatsapp}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneWhatsapp: e.target.value.replace(/\D/g, ''),
                        })
                      }
                      placeholder="Ex: 11987654321"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-brand-border-dark rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-dark/30 focus:border-brand-primary-dark"
                      id="input-store-whatsapp"
                    />
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Os clientes enviarão os pedidos montados diretamente para este número.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Instagram da Loja (@)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.instagramHandle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instagramHandle: e.target.value.replace(/^@/, ''),
                        })
                      }
                      placeholder="sualoja.oficial"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-brand-border-dark rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-dark/30 focus:border-brand-primary-dark"
                      id="input-store-instagram"
                    />
                    <Instagram className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Modalidade de Atendimento & Entrega */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-stone-900 border-b border-brand-border pb-2">
                <Truck className="w-4 h-4 text-brand-primary-dark" />
                <h3 className="font-semibold text-sm tracking-wide uppercase text-stone-800">
                  3. Modalidade de Pedidos (Entrega vs Retirada)
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Como sua loja aceitará os pedidos dos clientes?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'both' as DeliveryMode,
                      title: 'Ambos (Recomendado)',
                      desc: 'Cliente escolhe entre Entrega ou Retirar na Loja',
                      icon: Crown,
                    },
                    {
                      id: 'pickup' as DeliveryMode,
                      title: 'Somente Retirada',
                      desc: 'Cliente retira presencialmente no endereço físico',
                      icon: Building2,
                    },
                    {
                      id: 'delivery' as DeliveryMode,
                      title: 'Somente Entrega',
                      desc: 'Loja envia os pedidos até a casa do cliente',
                      icon: Truck,
                    },
                  ].map((opt) => {
                    const isSelected = formData.deliveryMode === opt.id;
                    const IconComp = opt.icon;
                    return (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryMode: opt.id })}
                        className={`p-3.5 text-left rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-brand-bg-alt border-brand-primary-dark text-stone-900 shadow-sm ring-1 ring-brand-primary-dark'
                            : 'bg-white border-brand-border text-stone-600 hover:border-stone-400'
                        }`}
                        id={`btn-mode-${opt.id}`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <IconComp
                            className={`w-4 h-4 ${
                              isSelected ? 'text-brand-primary-dark' : 'text-stone-400'
                            }`}
                          />
                          <span className="text-xs font-bold text-stone-900">
                            {opt.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 leading-tight">
                          {opt.desc}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {formData.deliveryMode !== 'pickup' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-800">
                      Tipo de Taxa de Entrega:
                    </label>
                    <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-brand-border-dark">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryFeeType: 'flat' })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          formData.deliveryFeeType !== 'custom'
                            ? 'bg-stone-900 text-white shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Taxa Única
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryFeeType: 'custom' })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          formData.deliveryFeeType === 'custom'
                            ? 'bg-stone-900 text-white shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Por Bairro / Cidade
                      </motion.button>
                    </div>
                  </div>

                  {formData.deliveryFeeType === 'custom' ? (
                    <div className="p-3.5 bg-white border border-brand-border-dark rounded-2xl space-y-3">
                      <span className="text-xs font-bold text-stone-900 block">
                        Tabela de Taxas Customizadas por Bairro e Cidade
                      </span>

                      {/* List of custom rates */}
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {(formData.customDeliveryRates || []).map((rate, idx) => (
                          <div
                            key={`rate-setup-${idx}`}
                            className="flex items-center justify-between p-2 bg-brand-bg border border-stone-200 rounded-xl text-xs"
                          >
                            <span className="font-semibold text-stone-800">
                              {rate.neighborhood} ({rate.city} - {rate.state || 'SP'})
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-brand-primary-darker">
                                R$ {rate.fee.toFixed(2)}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (formData.customDeliveryRates || []).filter(
                                    (_, i) => i !== idx
                                  );
                                  setFormData({ ...formData, customDeliveryRates: updated });
                                }}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {(!formData.customDeliveryRates || formData.customDeliveryRates.length === 0) && (
                          <p className="text-xs text-stone-400 italic">Nenhum bairro cadastrado. O valor padrão será usado.</p>
                        )}
                      </div>

                      {/* Form to add rate */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-100">
                        <input
                          type="text"
                          placeholder="UF (ex: SP)"
                          id="input-rate-state"
                          maxLength={2}
                          className="px-2.5 py-1.5 bg-brand-bg border border-stone-300 rounded-lg text-xs uppercase"
                        />
                        <input
                          type="text"
                          placeholder="Cidade (ex: São Paulo)"
                          id="input-rate-city"
                          className="px-2.5 py-1.5 bg-brand-bg border border-stone-300 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Bairro (ex: Jardins)"
                          id="input-rate-neighborhood"
                          className="px-2.5 py-1.5 bg-brand-bg border border-stone-300 rounded-lg text-xs"
                        />
                        <div className="flex gap-1">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Valor R$"
                            id="input-rate-fee"
                            className="w-full px-2.5 py-1.5 bg-brand-bg border border-stone-300 rounded-lg text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const stateInput = (document.getElementById('input-rate-state') as HTMLInputElement)?.value.toUpperCase();
                              const cityInput = (document.getElementById('input-rate-city') as HTMLInputElement)?.value;
                              const neighInput = (document.getElementById('input-rate-neighborhood') as HTMLInputElement)?.value;
                              const feeInput = parseFloat((document.getElementById('input-rate-fee') as HTMLInputElement)?.value || '0');
                              if (neighInput && feeInput >= 0) {
                                const newRate = {
                                  id: 'rate-' + Date.now(),
                                  state: stateInput || formData.cityState || 'SP',
                                  city: cityInput || 'Sua Cidade',
                                  neighborhood: neighInput,
                                  fee: feeInput,
                                };
                                setFormData({
                                  ...formData,
                                  customDeliveryRates: [...(formData.customDeliveryRates || []), newRate],
                                });
                                if (document.getElementById('input-rate-state')) {
                                  (document.getElementById('input-rate-state') as HTMLInputElement).value = '';
                                }
                                (document.getElementById('input-rate-city') as HTMLInputElement).value = '';
                                (document.getElementById('input-rate-neighborhood') as HTMLInputElement).value = '';
                                (document.getElementById('input-rate-fee') as HTMLInputElement).value = '';
                              }
                            }}
                            className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold cursor-pointer flex-shrink-0"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Taxa de Entrega Padrão (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.deliveryFee}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deliveryFee: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-brand-border-dark rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-dark/30 focus:border-brand-primary-dark"
                        id="input-delivery-fee"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Frete Grátis a partir de (R$)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={formData.freeDeliveryThreshold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            freeDeliveryThreshold: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-brand-border-dark rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-dark/30 focus:border-brand-primary-dark"
                        id="input-free-delivery-threshold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Identidade Visual (Cores & Tipografia de Luxo) */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-stone-900 border-b border-brand-border pb-2">
                <Palette className="w-4 h-4 text-brand-primary-dark" />
                <h3 className="font-semibold text-sm tracking-wide uppercase text-stone-800">
                  2. Identidade Visual (Cores & Fontes de Luxo)
                </h3>
              </div>

              {/* 10 Luxury Color Palettes */}
              <div className="p-4 bg-white border border-brand-border-dark rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Paleta de Cor Primária da Vitrine
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Escolha a tonalidade nobre que definirá os detalhes, botões e destaques da loja.
                    </span>
                  </div>
                  {formData.primaryColor && (
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-stone-100 rounded-lg text-xs font-mono">
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: formData.primaryColor }}
                      />
                      <span>{formData.primaryColor}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                  {STORE_COLOR_PALETTES.map((pal) => {
                    const isSelected =
                      (formData.primaryColor || '#B8860B').toLowerCase() === pal.hex.toLowerCase();
                    return (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            primaryColor: pal.hex,
                          })
                        }
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between space-y-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-stone-900 border-stone-900 bg-stone-50 shadow-sm'
                            : 'border-stone-200 hover:border-stone-400 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="w-5 h-5 rounded-full border border-black/10 shadow-xs flex items-center justify-center"
                            style={{ backgroundColor: pal.hex }}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {pal.hex}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-stone-900 block leading-tight">
                            {pal.name}
                          </span>
                          <span className="text-[9px] text-stone-500 line-clamp-1">
                            {pal.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center space-x-3 pt-2 border-t border-stone-100 text-xs">
                  <span className="text-stone-600 font-medium">Ou personalize a cor Hex:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.primaryColor || '#B8860B'}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-7 h-7 rounded-lg border border-stone-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor || '#B8860B'}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      placeholder="#B8860B"
                      className="w-24 px-2 py-1 bg-brand-bg border border-stone-300 rounded-lg font-mono text-xs text-stone-800 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* 10 Luxury Google Fonts */}
              <div className="p-4 bg-white border border-brand-border-dark rounded-2xl space-y-3">
                <div>
                  <span className="text-xs font-bold text-stone-900 block">
                    Tipografia da Loja (10 Fontes Exclusivas)
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Defina a fonte que compõe os títulos, menus e detalhes do seu catálogo.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {STORE_FONTS.map((font) => {
                    const isSelected = (formData.fontFamily || 'playfair') === font.id;
                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            fontFamily: font.id,
                          })
                        }
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                          isSelected
                            ? 'ring-2 ring-stone-900 border-stone-900 bg-stone-50 shadow-sm'
                            : 'border-stone-200 hover:border-stone-400 bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-stone-900">
                              {font.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded font-medium">
                              {font.category}
                            </span>
                          </div>
                          <p
                            className="text-sm text-stone-800 font-semibold"
                            style={{ fontFamily: font.fontFamily }}
                          >
                            {font.previewText}
                          </p>
                          <p className="text-[10px] text-stone-500">
                            {font.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 3: Horários de Funcionamento & Intervalo */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-stone-900 border-b border-brand-border pb-2">
                <Clock className="w-4 h-4 text-brand-primary-dark" />
                <h3 className="font-semibold text-sm tracking-wide uppercase text-stone-800">
                  3. Horários de Atendimento & Dias de Abertura
                </h3>
              </div>

              <div className="p-4 bg-white border border-brand-border-dark rounded-2xl space-y-4">
                {/* Weekly Operating Days Selection (Caixas para marcar todos os dias da semana) */}
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-900">
                        Dias da Semana de Funcionamento
                      </label>
                      <span className="text-[11px] text-stone-500">
                        Marque as caixas dos dias em que sua loja física ou atendimento online está aberto.
                      </span>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const newDays = [1, 2, 3, 4, 5, 6];
                          setFormData({
                            ...formData,
                            businessDays: newDays,
                            businessDaysLabel: formatBusinessDaysLabel(newDays),
                          });
                        }}
                        className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-[10px] font-semibold text-stone-700 rounded-md transition-colors cursor-pointer"
                      >
                        Seg a Sáb
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newDays = [1, 2, 3, 4, 5];
                          setFormData({
                            ...formData,
                            businessDays: newDays,
                            businessDaysLabel: formatBusinessDaysLabel(newDays),
                          });
                        }}
                        className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-[10px] font-semibold text-stone-700 rounded-md transition-colors cursor-pointer"
                      >
                        Seg a Sex
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newDays = [1, 2, 3, 4, 5, 6, 0];
                          setFormData({
                            ...formData,
                            businessDays: newDays,
                            businessDaysLabel: formatBusinessDaysLabel(newDays),
                          });
                        }}
                        className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-[10px] font-semibold text-stone-700 rounded-md transition-colors cursor-pointer"
                      >
                        Todos os dias
                      </button>
                    </div>
                  </div>

                  {/* 7 Interactive Week Day Checkboxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
                    {WEEK_DAYS.map((day) => {
                      const currentDays =
                        formData.businessDays && formData.businessDays.length > 0
                          ? formData.businessDays
                          : [1, 2, 3, 4, 5, 6];
                      const isChecked = currentDays.includes(day.dayIndex);

                      const handleToggle = () => {
                        let newDays: number[];
                        if (isChecked) {
                          newDays = currentDays.filter((d) => d !== day.dayIndex);
                          if (newDays.length === 0) newDays = [day.dayIndex]; // Mantém pelo menos um dia ativo
                        } else {
                          newDays = [...currentDays, day.dayIndex];
                        }
                        setFormData({
                          ...formData,
                          businessDays: newDays,
                          businessDaysLabel: formatBusinessDaysLabel(newDays),
                        });
                      };

                      return (
                        <div
                          key={day.dayIndex}
                          onClick={handleToggle}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1.5 cursor-pointer select-none transition-all ${
                            isChecked
                              ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                              : 'bg-brand-bg hover:bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // Controlled by click handler
                              className="w-3.5 h-3.5 rounded accent-stone-900 cursor-pointer pointer-events-none"
                            />
                            <span className="font-bold text-xs">{day.shortName}</span>
                          </div>
                          <span
                            className={`text-[9px] truncate max-w-full ${
                              isChecked ? 'text-stone-300' : 'text-stone-500'
                            }`}
                          >
                            {day.fullName.replace('-feira', '')}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Formatted Days Badge */}
                  <div className="flex items-center space-x-2 text-xs pt-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-primary-dark shrink-0" />
                    <span className="text-stone-600">
                      Resumo da Abertura:{' '}
                      <strong className="text-stone-900">
                        {formData.businessDaysLabel ||
                          formatBusinessDaysLabel(formData.businessDays || [1, 2, 3, 4, 5, 6])}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Operating Hours (Abertura e Fechamento) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Horário de Abertura
                    </label>
                    <input
                      type="time"
                      value={formData.openingTime || '08:00'}
                      onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-bg border border-stone-300 rounded-xl text-xs text-stone-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Horário de Fechamento
                    </label>
                    <input
                      type="time"
                      value={formData.closingTime || '18:00'}
                      onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-bg border border-stone-300 rounded-xl text-xs text-stone-900 font-semibold"
                    />
                  </div>
                </div>

                {/* CRITICAL: Pergunta sobre Receber Pedidos Fora dos Dias / Horários de Funcionamento */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">
                        Deseja também receber pedidos fora dos dias ou horários de funcionamento?
                      </span>
                      <span className="text-[11px] text-stone-600 leading-tight block mt-1">
                        {formData.acceptOrdersOutsideHours ?? true
                          ? '✅ SIM (Recomendado): O cliente pode montar a sacola e enviar o pedido no WhatsApp a qualquer momento. A vitrine avisa que o pedido foi recebido e será preparado no retorno do expediente.'
                          : '⏸️ NÃO (Pausar pedidos): A sacola avisa que o atendimento está fechado e os pedidos ficam bloqueados até a reabertura.'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, acceptOrdersOutsideHours: true })}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          formData.acceptOrdersOutsideHours ?? true
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        Sim (Receber)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, acceptOrdersOutsideHours: false })}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          formData.acceptOrdersOutsideHours === false
                            ? 'bg-stone-900 text-white shadow-xs'
                            : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        Não (Bloquear)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interval / Break Toggle & Configuration */}
                <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <Coffee className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-bold text-stone-900">
                        A loja possui Intervalo / Pausa de Almoço?
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.hasBreakInterval ?? true}
                      onChange={(e) =>
                        setFormData({ ...formData, hasBreakInterval: e.target.checked })
                      }
                      className="w-4 h-4 text-amber-700 rounded focus:ring-amber-600 accent-stone-900"
                    />
                  </label>

                  {(formData.hasBreakInterval ?? true) && (
                    <div className="space-y-3 pt-2 border-t border-amber-200/60">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Início do Intervalo
                          </label>
                          <input
                            type="time"
                            value={formData.breakStartTime || '12:00'}
                            onChange={(e) =>
                              setFormData({ ...formData, breakStartTime: e.target.value })
                            }
                            className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Fim do Intervalo (Retorno)
                          </label>
                          <input
                            type="time"
                            value={formData.breakEndTime || '13:30'}
                            onChange={(e) =>
                              setFormData({ ...formData, breakEndTime: e.target.value })
                            }
                            className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900"
                          />
                        </div>
                      </div>

                      {/* CRITICAL: Highlighted question whether to receive orders during break */}
                      <div className="p-3 bg-white border border-amber-300 rounded-xl space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-amber-950 block">
                              Deseja receber pedidos durante o intervalo de almoço?
                            </span>
                            <span className="text-[11px] text-stone-600 leading-tight block mt-0.5">
                              {formData.acceptOrdersDuringBreak ?? true
                                ? 'SIM: Os clientes podem enviar pedidos normalmente. Será avisado que o preparo inicia no retorno.'
                                : 'NÃO: O cliente verá aviso de pausa no atendimento e envio será processado após o intervalo.'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0 ml-3">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, acceptOrdersDuringBreak: true })
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                formData.acceptOrdersDuringBreak ?? true
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                              }`}
                            >
                              Sim (Receber)
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, acceptOrdersDuringBreak: false })
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                formData.acceptOrdersDuringBreak === false
                                  ? 'bg-stone-900 text-white shadow-xs'
                                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                              }`}
                            >
                              Não (Pausa)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Áreas de Entrega & Políticas de Cobertura */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-stone-900 border-b border-brand-border pb-2">
                <Truck className="w-4 h-4 text-brand-primary-dark" />
                <h3 className="font-semibold text-sm tracking-wide uppercase text-stone-800">
                  4. Áreas de Entrega & Políticas de Cobertura
                </h3>
              </div>

              <div className="p-4 bg-white border border-brand-border-dark rounded-2xl space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Bairros e Regiões Atendidas com Entrega Direta
                  </label>
                  <textarea
                    rows={2}
                    value={
                      formData.deliveryAreasList ||
                      'Centro, Zona Sul, Jardins, Ponta Negra, Tianguá e Região Metropolitana'
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryAreasList: e.target.value })
                    }
                    placeholder="Ex: Centro, Zona Sul, Jardins, Bairro Alto, Região Metropolitana..."
                    className="w-full px-3 py-2 bg-brand-bg border border-stone-300 rounded-xl text-xs text-stone-900 leading-relaxed"
                  />
                  <span className="text-[10px] text-stone-500">
                    Estes bairros aparecerão de forma transparente para o cliente ao calcular frete e finalizar o pedido.
                  </span>
                </div>

                {/* Toggle: Allow or restrict out of area orders */}
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Permitir pedidos de regiões fora das áreas cadastradas?
                    </span>
                    <span className="text-[11px] text-stone-600 block mt-0.5">
                      {formData.allowOutOfAreaOrders ?? true
                        ? 'Sim: Clientes de outras regiões podem pedir com consulta de frete via WhatsApp.'
                        : 'Não: Entrega estritamente restrita aos bairros e regiões especificadas.'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, allowOutOfAreaOrders: true })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        formData.allowOutOfAreaOrders ?? true
                          ? 'bg-stone-900 text-white'
                          : 'bg-white border border-stone-300 text-stone-600'
                      }`}
                    >
                      Permitir
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, allowOutOfAreaOrders: false })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        formData.allowOutOfAreaOrders === false
                          ? 'bg-stone-900 text-white'
                          : 'bg-white border border-stone-300 text-stone-600'
                      }`}
                    >
                      Restringir
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Endereço & Pagamento */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-stone-900 border-b border-brand-border pb-2">
                <MapPin className="w-4 h-4 text-brand-primary-dark" />
                <h3 className="font-semibold text-sm tracking-wide uppercase text-stone-800">
                  4. Localização Física & Pagamento
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Endereço Completo da Loja
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ex: Rua Oscar Freire, 1420 - Jardins"
                    className="w-full px-3.5 py-2.5 bg-white border border-brand-border-dark rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-dark/30 focus:border-brand-primary-dark"
                    id="input-store-address"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Cidade / Estado
                  </label>
                  <input
                    type="text"
                    value={formData.cityState}
                    onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                    placeholder="Ex: São Paulo - SP"
                    className="w-full px-3.5 py-2.5 bg-white border border-brand-border-dark rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-dark/30 focus:border-brand-primary-dark"
                    id="input-store-city-state"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Horários de Atendimento
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.openingHours}
                      onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                      placeholder="Ex: Seg a Sáb: 10h às 20h"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-brand-border-dark rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-dark/30 focus:border-brand-primary-dark"
                      id="input-store-hours"
                    />
                    <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Link da Loja para Clientes */}
            <div className="p-4 bg-brand-bg-alt border border-brand-border-dark rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-brand-primary-dark" />
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                    Link da Loja (Para Clientes)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="flex items-center space-x-1 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors"
                  id="btn-copy-invite-link"
                >
                  {copiedInvite ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>
              </div>
              <div className="mb-4">
                <p className="text-xs text-stone-600 mb-2">
                  Personalize o final do link que será enviado para os seus clientes. Use um nome curto, sem espaços ou caracteres especiais.
                </p>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-stone-100 border border-r-0 border-brand-border-dark rounded-l-xl text-stone-500 text-sm font-mono">
                    vitrine.com/?loja=
                  </span>
                  <input
                    type="text"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="nomedasuamarca"
                    className="flex-1 px-3 py-2 bg-white border border-brand-border-dark rounded-r-xl text-stone-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary-dark/30 focus:border-brand-primary-dark"
                  />
                </div>
              </div>
              
              <p className="text-xs text-stone-600 mt-4">
                Código VIP de Convite (Interno):{' '}
                <input
                  type="text"
                  value={formData.inviteCode}
                  onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() })}
                  className="inline-block px-2 py-0.5 bg-white border border-brand-border-dark rounded font-mono text-xs font-bold text-stone-900 ml-1"
                />
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-border">
              {!isFirstSetup && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-sm font-medium transition-colors"
                  id="btn-cancel-store-setup"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2.5 bg-stone-900 hover:bg-[#2C2723] text-white rounded-xl text-sm font-semibold shadow-md shadow-stone-900/10 transition-all cursor-pointer"
                id="btn-save-store-setup"
              >
                <Save className="w-4 h-4 text-brand-primary" />
                <span>{isFirstSetup ? 'Confirmar Alterações e Abrir Vitrine' : 'Confirmar Alterações'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
