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
  Sparkles,
  Save,
  X,
  Share2,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Trash2,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fileToBase64 } from '../lib/imageUtils';

interface StoreSetupModalProps {
  currentClient?: any;
  isOpen: boolean;
  isFirstSetup?: boolean;
  settings: StoreSettings;
  onSave: (newSettings: StoreSettings) => void;
  onClose?: () => void;
}

export const StoreSetupModal: React.FC<StoreSetupModalProps> = ({
  currentClient,
  isOpen,
  isFirstSetup = false,
  settings,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...settings });
    }
  }, [isOpen, settings]);

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
    if (onClose) onClose();
  };

  const copyInviteLink = () => {
    let inviteUrl = '';
    if (currentClient?.username) {
      // Prioritize the standard reliable query param URL that works 100% on Vercel
      inviteUrl = `${window.location.origin}/?loja=${currentClient.username}`;
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
                <Sparkles className="w-4 h-4 text-brand-primary-dark" />
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
                      <Sparkles className="w-3.5 h-3.5 text-brand-primary-dark" />
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
                      icon: Sparkles,
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
                      <button
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
                      </button>
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
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryFeeType: 'flat' })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          formData.deliveryFeeType !== 'custom'
                            ? 'bg-stone-900 text-white shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Taxa Única
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryFeeType: 'custom' })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          formData.deliveryFeeType === 'custom'
                            ? 'bg-stone-900 text-white shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Por Bairro / Cidade
                      </button>
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
                            key={rate.id || idx}
                            className="flex items-center justify-between p-2 bg-brand-bg border border-stone-200 rounded-xl text-xs"
                          >
                            <span className="font-semibold text-stone-800">
                              {rate.neighborhood} ({rate.city})
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-stone-100">
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
                              const cityInput = (document.getElementById('input-rate-city') as HTMLInputElement)?.value;
                              const neighInput = (document.getElementById('input-rate-neighborhood') as HTMLInputElement)?.value;
                              const feeInput = parseFloat((document.getElementById('input-rate-fee') as HTMLInputElement)?.value || '0');
                              if (neighInput && feeInput >= 0) {
                                const newRate = {
                                  id: 'rate-' + Date.now(),
                                  city: cityInput || formData.cityState || 'Sua Cidade',
                                  neighborhood: neighInput,
                                  fee: feeInput,
                                };
                                setFormData({
                                  ...formData,
                                  customDeliveryRates: [...(formData.customDeliveryRates || []), newRate],
                                });
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

            {/* Section 4: Parcelamento no Cartão */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-stone-900 border-b border-brand-border pb-2">
                <CreditCard className="w-4 h-4 text-brand-primary-dark" />
                <h3 className="font-semibold text-sm tracking-wide uppercase text-stone-800">
                  4. Opções de Parcelamento no Cartão
                </h3>
              </div>

              <div className="p-4 bg-white border border-brand-border-dark rounded-2xl space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableInstallments !== false}
                    onChange={(e) =>
                      setFormData({ ...formData, enableInstallments: e.target.checked })
                    }
                    className="w-4 h-4 text-stone-900 rounded focus:ring-stone-900"
                  />
                  <span className="text-xs font-bold text-stone-800">
                    Exibir opções de parcelamento sem juros nos produtos
                  </span>
                </label>

                {formData.enableInstallments !== false && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Máximo de Parcelas
                      </label>
                      <select
                        value={formData.maxInstallments || 6}
                        onChange={(e) =>
                          setFormData({ ...formData, maxInstallments: parseInt(e.target.value) || 6 })
                        }
                        className="w-full px-3 py-2 bg-brand-bg border border-stone-300 rounded-xl text-xs"
                      >
                        <option value={2}>Até 2x sem juros</option>
                        <option value={3}>Até 3x sem juros</option>
                        <option value={4}>Até 4x sem juros</option>
                        <option value={5}>Até 5x sem juros</option>
                        <option value={6}>Até 6x sem juros</option>
                        <option value={10}>Até 10x sem juros</option>
                        <option value={12}>Até 12x sem juros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Valor Mínimo da Parcela (R$)
                      </label>
                      <input
                        type="number"
                        min="5"
                        value={formData.minInstallmentAmount || 30}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minInstallmentAmount: parseFloat(e.target.value) || 10,
                          })
                        }
                        className="w-full px-3 py-2 bg-brand-bg border border-stone-300 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Valor Mínimo da Compra (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.minOrderValueForInstallments || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minOrderValueForInstallments: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 bg-brand-bg border border-stone-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                )}
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
              <p className="text-xs text-stone-600 mb-2">
                Ao clicar em "Copiar Link", o link da sua vitrine será copiado contendo o seu nome de usuário. Opcionalmente, você pode definir um código de convite interno abaixo:
              </p>
              <p className="text-xs text-stone-600">
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
