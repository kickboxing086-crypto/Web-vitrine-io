import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Store,
  ShieldCheck,
  CheckCircle2,
  Lock,
  User,
  Phone,
  Mail,
  MapPin,
  Tag,
  ArrowRight,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Crown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CredentialChecklist } from './CredentialChecklist';
import { saveClient, getClientByUsername } from '../lib/firestoreService';
import { getDefaultTrialDueDate } from '../lib/mercadoPagoService';

interface RegisterStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (client: any) => void;
}

export const RegisterStoreModal: React.FC<RegisterStoreModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
}) => {
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [cityState, setCityState] = useState('');
  const [segment, setSegment] = useState('Moda Feminina');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdClient, setCreatedClient] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Validation rules
  const cleanUsername = username
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 8);

  const cleanPass = password.trim().slice(0, 8);
  const cleanPassNoAccents = cleanPass.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const isPasswordValid =
    cleanPass.length > 0 &&
    cleanPass.length <= 8 &&
    cleanPass === cleanPassNoAccents &&
    /[A-Z]/.test(cleanPass) &&
    /[a-z]/.test(cleanPass) &&
    /[0-9]/.test(cleanPass);

  const isFormValid =
    storeName.trim().length >= 2 &&
    cleanUsername.length >= 2 &&
    isPasswordValid &&
    phoneWhatsapp.replace(/\D/g, '').length >= 10;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!storeName.trim()) {
      setErrorMsg('Por favor, informe o nome da sua loja.');
      return;
    }

    if (cleanUsername.length < 2) {
      setErrorMsg('O link/usuário da loja deve ter entre 2 e 8 caracteres alfanuméricos.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg('A senha precisa cumprir todos os requisitos do checklist (máx 8 caracteres, maiúscula, minúscula, número, sem acento).');
      return;
    }

    const rawDigits = phoneWhatsapp.replace(/\D/g, '');
    if (rawDigits.length < 10) {
      setErrorMsg('Informe um número de WhatsApp válido com DDD para receber seus pedidos.');
      return;
    }

    setIsLoading(true);

    try {
      // Check if username is already taken
      const existing = await getClientByUsername(cleanUsername);
      if (existing) {
        setErrorMsg(`O usuário e link "${cleanUsername}" já está em uso por outra loja. Escolha outro.`);
        setIsLoading(false);
        return;
      }

      const clientId = `client-${Date.now()}`;
      const trialDueDate = getDefaultTrialDueDate(); // 5 free days

      const newClient = {
        id: clientId,
        username: cleanUsername,
        storeSlug: cleanUsername,
        password: cleanPass,
        storeName: storeName.trim(),
        name: ownerName.trim() || storeName.trim(),
        phoneWhatsapp: phoneWhatsapp.trim(),
        email: email.trim() || undefined,
        cityState: cityState.trim() || 'Brasil',
        segment: segment,
        storeType: 'clothing',
        dueDate: trialDueDate,
        status: 'active',
        isOfficial: true,
        planPrice: 29.99,
        createdAt: new Date().toISOString(),
        notes: `Cadastro automático autônomo em ${new Date().toLocaleDateString('pt-BR')}`,
      };

      // Save to Firestore with AES encryption of sensitive fields
      await saveClient(newClient);

      // Save to local storage for instant authenticated session
      localStorage.setItem('store_current_client', JSON.stringify(newClient));
      localStorage.setItem('store_admin_authenticated', 'true');

      setCreatedClient(newClient);
      setIsLoading(false);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch (err: any) {
      console.error('Error creating store client:', err);
      setErrorMsg('Ocorreu um erro ao cadastrar a sua loja no banco de dados. Tente novamente.');
      setIsLoading(false);
    }
  };

  const storeOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://seusite.com';
  const liveStoreUrl = createdClient
    ? `${storeOrigin}/?loja=${encodeURIComponent(createdClient.storeSlug || createdClient.username)}`
    : `${storeOrigin}/?loja=${cleanUsername || 'sualoja'}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(liveStoreUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleFinish = () => {
    if (createdClient) {
      onRegisterSuccess(createdClient);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-[#141417] text-white border-2 border-[#D4AF37] rounded-3xl shadow-2xl overflow-hidden my-auto"
          id="modal-register-store-container"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-b from-[#1C1C22] to-[#141417] border-b border-[#27272A] relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-stone-950 text-[10px] font-extrabold uppercase tracking-wider">
                Cadastro Instantâneo
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                5 Dias Totalmente Grátis
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif-luxury font-bold text-white">
              Crie a Sua Loja Online
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              Sem precisar falar no WhatsApp: seu acesso e catálogo digital são liberados na mesma hora!
            </p>
          </div>

          {/* Success Step */}
          {createdClient ? (
            <div className="p-6 sm:p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider block">
                  Parabéns, {createdClient.name}!
                </span>
                <h3 className="text-2xl font-serif-luxury font-bold text-white mt-1">
                  Sua Loja está 100% Criada e Ativa!
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto mt-2 leading-relaxed">
                  Você já tem <strong className="text-emerald-400">5 dias de acesso liberado</strong> para cadastrar produtos, compartilhar no Instagram e receber pedidos no seu WhatsApp.
                </p>
              </div>

              {/* Share URL Box */}
              <div className="p-4 rounded-2xl bg-[#1C1C22] border border-[#27272A] text-left space-y-2">
                <span className="text-xs text-stone-400 font-semibold block">
                  Link Oficial da Sua Vitrine:
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#121215] border border-stone-800 rounded-xl px-3 py-2 text-xs text-[#D4AF37] font-mono truncate select-all">
                    {liveStoreUrl}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#D4AF37] hover:bg-[#E5C378] text-stone-950'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Credentials summary */}
              <div className="p-4 rounded-2xl bg-[#18181E] border border-stone-800 text-xs text-left grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-400 block text-[11px]">Usuário de Acesso:</span>
                  <strong className="text-white font-mono">{createdClient.username}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Vencimento do Teste:</span>
                  <strong className="text-emerald-400">5 Dias Grátis</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#E5C378] text-stone-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                id="btn-enter-new-admin-panel"
              >
                <span>Entrar no Meu Painel da Loja Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Security info banner */}
              <div className="p-3 bg-stone-900/80 border border-[#D4AF37]/30 rounded-2xl flex items-start gap-2.5 text-xs text-stone-300">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">Segurança & Criptografia Ativa</strong>
                  <span>Seus dados são protegidos com hash de segurança e criptografia no banco de dados Firestore.</span>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Basic Store Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Nome da Sua Loja / Boutique *
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => {
                        setStoreName(e.target.value);
                        if (!username) {
                          // Auto-suggest slug
                          const suggested = e.target.value
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/[^a-z0-9]/g, '')
                            .slice(0, 8);
                          setUsername(suggested);
                        }
                      }}
                      placeholder="Ex: Bella Donna Boutique"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Seu Nome Completo (CEO)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Ex: Maria Silva"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Segmento da Loja
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={segment}
                      onChange={(e) => setSegment(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Moda Feminina">Moda Feminina</option>
                      <option value="Moda Masculina">Moda Masculina</option>
                      <option value="Calçados & Bolsas">Calçados & Bolsas</option>
                      <option value="Moda Praia & Fitness">Moda Praia & Fitness</option>
                      <option value="Lingerie & Pijamas">Lingerie & Pijamas</option>
                      <option value="Acessórios & Semijoias">Acessórios & Semijoias</option>
                      <option value="Moda Infantil">Moda Infantil</option>
                      <option value="Variedades">Variedades</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Username & URL Box */}
              <div className="p-3.5 bg-[#18181E] rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">
                    Link da Loja & Usuário de Login *
                  </label>
                  <span className="text-[11px] font-mono text-[#D4AF37]">
                    {cleanUsername.length}/8 caracteres
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ex: bellamod"
                    className="w-full px-3.5 py-2.5 bg-[#121215] border border-[#2B2B33] rounded-xl text-xs text-white font-mono placeholder:text-stone-600 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <p className="text-[11px] text-stone-400">
                  Sua vitrine pública será:{' '}
                  <span className="text-[#D4AF37] font-mono font-semibold">
                    {storeOrigin}/?loja={cleanUsername || 'sua_loja'}
                  </span>
                </p>
              </div>

              {/* Password & Checklist */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-300">
                    Senha de Acesso ao Painel *
                  </label>
                  <span className="text-[11px] text-stone-400">
                    {cleanPass.length}/8 caracteres
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    maxLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha de até 8 dígitos"
                    className="w-full pl-9 pr-10 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password validation checklist */}
                <CredentialChecklist value={cleanPass} label="Critérios da Senha (até 8 dígitos)" />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    WhatsApp para Pedidos *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={phoneWhatsapp}
                      onChange={(e) => setPhoneWhatsapp(e.target.value)}
                      placeholder="Ex: (11) 99999-9999"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    E-mail de Notificações
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Cidade / Estado
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={cityState}
                      onChange={(e) => setCityState(e.target.value)}
                      placeholder="Ex: São Paulo - SP"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#E5C378] disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  id="btn-submit-register-store"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
                      <span>Criando sua loja no banco de dados seguro...</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 text-stone-950" />
                      <span>Criar Minha Loja Grátis (5 Dias de Acesso)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-stone-400 text-center mt-2">
                  Ao criar, você inicia com 5 dias gratuitos. Renovação mensal de apenas R$ 29,99 via Pix quando desejar.
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
