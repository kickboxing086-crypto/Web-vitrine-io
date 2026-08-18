import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  X,
  ShieldCheck,
  Store,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { AdminUser, StoreSettings } from '../types';
import { authenticateClient } from '../lib/firestoreService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (type?: 'super_admin' | 'store_admin', client?: any) => void;
  adminUser: AdminUser;
  settings: StoreSettings;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  adminUser,
  settings,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setErrorMessage('Por favor, digite o nome de usuário.');
      return;
    }
    if (!cleanPass) {
      setErrorMessage('Por favor, digite a sua senha de até 8 dígitos.');
      return;
    }

    if (cleanPass.length > 8) {
      setErrorMessage('A senha deve ter no máximo 8 dígitos.');
      return;
    }

    setIsLoading(true);

    // Master Gestor / Super Admin bypass (Webgestor_vitrine & Ssilva_7)
    if (
      (cleanUser === 'Webgestor_vitrine' && cleanPass === '00112233') ||
      (cleanUser === 'Ssilva_7' && cleanPass === '072131')
    ) {
      setIsSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        onLoginSuccess('super_admin');
        setIsSuccess(false);
        setUsername('');
        setPassword('');
        onClose();
      }, 600);
      return;
    }

    // Authenticate actual client first to ensure custom database configurations are respected
    const client = await authenticateClient(cleanUser, cleanPass);
    
    // Check fallback for original adminUser config if client not found
    const isFallbackAdmin = cleanUser === adminUser.username && cleanPass === adminUser.password;

    if (client || isFallbackAdmin) {
      setIsSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        onLoginSuccess('store_admin', client || {
          id: 'admin-fallback',
          name: settings.storeName || 'Sua Vitrine',
          username: adminUser.username,
          password: adminUser.password,
          storeType: settings.storeType || 'clothing'
        });
        setIsSuccess(false);
        setUsername('');
        setPassword('');
        onClose();
      }, 600);
      return;
    }

    // Fallback Test Client bypass only if no matching client is found in the database
    if (cleanUser === 'teste@123' && cleanPass === '01020304') {
      setIsSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        onLoginSuccess('store_admin', {
          id: 'client-test-natural',
          name: 'Elite Fashion Vitrine',
          username: 'teste@123',
          password: '01020304',
          storeType: 'clothing',
        });
        setIsSuccess(false);
        setUsername('');
        setPassword('');
        onClose();
      }, 600);
      return;
    }

    setIsLoading(false);
    setErrorMessage('Usuário ou senha incorretos. Verifique os dados digitados.');
  };

  const handleFillCredentials = () => {
    setUsername(adminUser.username);
    setPassword(adminUser.password);
    setErrorMessage('');
  };

  const handleFillNaturalCredentials = () => {
    setUsername('teste@123');
    setPassword('01020304');
    setErrorMessage('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-brand-bg rounded-3xl shadow-2xl border border-brand-bg-alt overflow-hidden"
          id="modal-login-container"
        >
          {/* Header Banner */}
          <div className="bg-stone-900 text-white p-6 pb-7 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full transition-colors cursor-pointer"
              title="Fechar"
              id="btn-close-login-modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary-dark flex items-center justify-center text-white shadow-md">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider text-brand-primary uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
                  Sistema Seguro
                </span>
                <h2 className="text-xl font-serif-luxury font-bold text-white">
                  Acesso Administrativo
                </h2>
              </div>
            </div>

            <p className="text-xs text-stone-300 mt-1">
              Painel restrito de gestão da sua vitrine virtual personalizada.
            </p>
          </div>

          {/* Form Container */}
          <div className="p-6 space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2"
                id="login-error-alert"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Success Banner */}
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Autenticado com sucesso! Carregando painel...</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Usuário ou E-mail da Loja
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Ex: minha_loja"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-brand-border-dark rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-primary-dark/30 focus:border-brand-primary-dark shadow-2xs font-medium"
                    id="input-login-username"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    Senha de Acesso
                  </label>
                  <span className="text-[11px] font-medium text-stone-500">
                    {password.length}/8 dígitos
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    maxLength={8}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Digite a senha (máx 8 dígitos)"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-brand-border-dark rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-primary-dark/30 focus:border-brand-primary-dark shadow-2xs font-medium tracking-wide"
                    id="input-login-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                    id="btn-toggle-password-visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  * A senha possui restrição de até 8 dígitos numéricos/alfanuméricos.
                </p>
              </div>

              {/* Remember checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-stone-900 rounded border-stone-300 focus:ring-brand-primary-dark accent-stone-900"
                    id="checkbox-remember-login"
                  />
                  <span>Lembrar login neste navegador</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-2"
                id="btn-submit-login"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Validando acesso...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Acesso Autorizado!</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-brand-primary" />
                    <span>Entrar no Painel da Loja</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Acquisition Banner & Notice */}
            <div className="pt-3 border-t border-brand-border space-y-2">
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-1 text-center">
                <span className="text-[11px] font-bold text-amber-900 block">
                  Ainda não tem o sistema para a sua loja?
                </span>
                <p className="text-[10px] text-stone-600 leading-tight">
                  Organize seus produtos e receba pedidos no WhatsApp por apenas <strong>R$ 29,99/mês</strong>.
                  <br />
                  <span className="text-stone-500 italic">*Não realizamos tráfego pago; fornecemos a plataforma inteligente de vitrine.</span>
                </p>
                <a
                  href="https://wa.me/5584986113980?text=Ol%C3%A1!%20Quero%20ativar%20a%20minha%20vitrine%20de%20luxo%20e%20liberar%20meu%20acesso%20agora%20mesmo!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center justify-center space-x-1.5 w-full py-2 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  id="btn-adquira-aqui-login-modal"
                >
                  <span>Ativação Rápida no WhatsApp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
