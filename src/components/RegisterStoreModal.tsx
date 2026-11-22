import React, { useState, useRef } from 'react';
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
  Upload,
  Camera,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  CredentialChecklist,
  validateUsernameSecurity,
  validatePasswordSecurity,
} from './CredentialChecklist';
import { saveClient, getClientByUsername } from '../lib/firestoreService';
import { getDefaultTrialDueDate } from '../lib/mercadoPagoService';
import { slugifyStoreName } from '../lib/formatters';
import { fileToBase64 } from '../lib/imageUtils';

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
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [cityState, setCityState] = useState('');
  const [segment, setSegment] = useState('Moda Feminina');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdClient, setCreatedClient] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingLogo(true);
      setErrorMsg(null);
      const base64 = await fileToBase64(file, 450, 450, 0.85);
      setLogoUrl(base64);
    } catch (err) {
      console.error('Erro ao processar foto de perfil:', err);
      setErrorMsg('Não foi possível carregar a imagem. Tente outra foto.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Validation rules
  const rawUsername = username.trim().slice(0, 8);
  const usernameCheck = validateUsernameSecurity(rawUsername);
  const cleanUsername = rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');

  const cleanPass = password.trim().slice(0, 8);
  const passwordCheck = validatePasswordSecurity(cleanPass);
  const isPasswordValid = passwordCheck.isValid;

  const isFormValid =
    Boolean(logoUrl.trim()) &&
    storeName.trim().length >= 2 &&
    ownerName.trim().length >= 2 &&
    usernameCheck.isValid &&
    isPasswordValid &&
    phoneWhatsapp.replace(/\D/g, '').length >= 10 &&
    address.trim().length >= 3 &&
    neighborhood.trim().length >= 2 &&
    cityState.trim().length >= 2;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!logoUrl.trim()) {
      setErrorMsg('Adicione a foto de perfil / logo da sua loja antes de criar a conta.');
      return;
    }

    if (storeName.trim().length < 2) {
      setErrorMsg('Por favor, informe o nome da sua loja.');
      return;
    }

    if (ownerName.trim().length < 2) {
      setErrorMsg('Por favor, informe seu nome completo (responsável pela loja).');
      return;
    }

    if (!usernameCheck.isValid) {
      setErrorMsg('O usuário precisa cumprir todos os critérios de segurança (4 a 8 caracteres, letra, número, sem espaços/acentos e sem nomes genéricos).');
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg('A senha precisa cumprir todos os critérios de segurança (6 a 8 caracteres, maiúscula, minúscula, número e sem acento).');
      return;
    }

    const rawDigits = phoneWhatsapp.replace(/\D/g, '');
    if (rawDigits.length < 10) {
      setErrorMsg('Informe um número de WhatsApp válido com DDD para receber seus pedidos.');
      return;
    }

    if (address.trim().length < 3) {
      setErrorMsg('Informe o endereço da loja (Rua e Número).');
      return;
    }

    if (neighborhood.trim().length < 2) {
      setErrorMsg('Informe o bairro onde a loja está localizada.');
      return;
    }

    if (cityState.trim().length < 2) {
      setErrorMsg('Informe a cidade e o estado (UF) da sua loja.');
      return;
    }

    setIsLoading(true);

    try {
      // Check if username is already taken
      const existing = await getClientByUsername(cleanUsername);
      if (existing && existing.username === cleanUsername) {
        setErrorMsg(`O usuário "${cleanUsername}" já está em uso por outra loja. Escolha outro.`);
        setIsLoading(false);
        return;
      }

      const clientId = `client-${Date.now()}`;
      const trialDueDate = getDefaultTrialDueDate(); // 5 free days
      const storeSlugFromName = slugifyStoreName(storeName) || cleanUsername;
      const fullAddress = `${address.trim()} - ${neighborhood.trim()}`;

      const newClient = {
        id: clientId,
        username: cleanUsername,
        storeSlug: storeSlugFromName,
        password: cleanPass,
        storeName: storeName.trim(),
        name: ownerName.trim() || storeName.trim(),
        logoUrl: logoUrl.trim(),
        phoneWhatsapp: phoneWhatsapp.trim(),
        email: email.trim() || undefined,
        address: fullAddress,
        neighborhood: neighborhood.trim(),
        cityState: cityState.trim(),
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
      setErrorMsg('Ocorreu um erro ao cadastrar a sua loja. Tente novamente.');
      setIsLoading(false);
    }
  };

  const storeOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://seusite.com';
  const storeSlugFromName = slugifyStoreName(storeName);
  const liveStoreUrl = createdClient
    ? `${storeOrigin}/?loja=${encodeURIComponent(createdClient.storeSlug || slugifyStoreName(createdClient.storeName) || createdClient.username)}`
    : `${storeOrigin}/?loja=${storeSlugFromName || 'nome-da-sua-loja'}`;

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
              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Required Store Profile Photo Upload */}
              <div className="p-4 bg-[#18181E] border border-[#2B2B33] rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <div className={`w-20 h-20 rounded-full overflow-hidden border-2 flex items-center justify-center bg-[#121215] ${logoUrl ? 'border-[#D4AF37]' : 'border-dashed border-stone-600'}`}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="Foto da Loja" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-7 h-7 text-stone-500" />
                    )}
                  </div>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="absolute -top-1 -right-1 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md cursor-pointer"
                      title="Remover foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                      <span>Foto de Perfil / Logo da Loja *</span>
                      {!logoUrl && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
                          Obrigatório
                        </span>
                      )}
                    </span>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Escolha a foto oficial da sua loja para exibir na vitrine e evitar que a loja fique sem identidade.
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="register-logo-file-input"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/50 text-[#D4AF37] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {isUploadingLogo
                        ? 'Carregando foto...'
                        : logoUrl
                        ? 'Trocar Foto da Loja'
                        : 'Selecionar Foto da Loja'}
                    </span>
                  </button>
                </div>
              </div>

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
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Ex: Bella Donna Boutique"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1.5">
                    Link de compartilhamento da loja:{' '}
                    <span className="text-[#D4AF37] font-mono font-semibold">
                      {storeOrigin}/?loja={storeSlugFromName || 'nome-da-sua-loja'}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Seu Nome Completo (CEO) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
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

              {/* Username Box (Login Only) */}
              <div className="p-3.5 bg-[#18181E] rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">
                    Usuário de Login (Acesso ao Painel) *
                  </label>
                  <span className="text-[11px] font-mono text-[#D4AF37]">
                    {rawUsername.length}/8 caracteres
                  </span>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ex: bella_01"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#121215] border border-[#2B2B33] rounded-xl text-xs text-white font-mono placeholder:text-stone-600 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <CredentialChecklist
                  value={rawUsername}
                  mode="username"
                  variant="dark"
                  label="Critérios do Usuário (Segurança)"
                />
                <p className="text-[11px] text-stone-400">
                  Usado apenas para você entrar no seu painel. O link público enviado aos clientes usa o <strong className="text-stone-200">Nome da Loja</strong>.
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
                    placeholder="Senha de 6 a 8 dígitos"
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
                <CredentialChecklist
                  value={cleanPass}
                  mode="password"
                  variant="dark"
                  label="Critérios da Senha (Segurança)"
                />
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

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Endereço (Rua e Número) *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex: Av. Paulista, 1000"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Bairro *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex: Centro / Jardins"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Cidade / Estado *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={cityState}
                      onChange={(e) => setCityState(e.target.value)}
                      placeholder="Ex: São Paulo - SP"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Essential Requirements Summary Checklist */}
              <div className="p-3 bg-[#18181E] border border-stone-800 rounded-2xl space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] block">
                  Configurações Obrigatórias da Loja
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                  {[
                    { label: 'Foto de Perfil', ok: Boolean(logoUrl.trim()) },
                    { label: 'Nome da Loja', ok: storeName.trim().length >= 2 },
                    { label: 'Nome do CEO', ok: ownerName.trim().length >= 2 },
                    { label: 'WhatsApp', ok: phoneWhatsapp.replace(/\D/g, '').length >= 10 },
                    { label: 'Endereço e Bairro', ok: address.trim().length >= 3 && neighborhood.trim().length >= 2 },
                    { label: 'Cidade / UF', ok: cityState.trim().length >= 2 },
                  ].map((req) => (
                    <div
                      key={req.label}
                      className={`flex items-center gap-1.5 ${req.ok ? 'text-emerald-400' : 'text-stone-400'}`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${req.ok ? 'text-emerald-400' : 'text-stone-600'}`} />
                      <span>{req.label}</span>
                    </div>
                  ))}
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
                      <span>Criando sua loja...</span>
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
