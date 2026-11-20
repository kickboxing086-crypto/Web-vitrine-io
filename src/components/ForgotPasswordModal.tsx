import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, KeyRound, User, Store, Phone, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { decryptClientData, encryptClientData, hashPassword } from '../lib/cryptoUtils';
import { CredentialChecklist } from './CredentialChecklist';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [matchedClient, setMatchedClient] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUser = username.trim().toLowerCase().replace(/^@+/, '');
    const cleanStore = storeName.trim().toLowerCase();
    const cleanPhone = phoneWhatsapp.trim().replace(/\D/g, '');

    if (!cleanUser || !cleanStore || !cleanPhone) {
      setErrorMessage('Por favor, preencha todos os campos de verificação.');
      return;
    }

    setIsLoading(true);

    try {
      const clientsCol = collection(db, 'clients');
      const snapshot = await getDocs(clientsCol);

      let found = null;
      for (const docSnap of snapshot.docs) {
        const raw = docSnap.data();
        const decrypted = await decryptClientData(raw);

        const u = (decrypted.username || '').toString().trim().toLowerCase().replace(/^@+/, '');
        const s = (decrypted.storeName || decrypted.name || '').toString().trim().toLowerCase();
        const p = (decrypted.phoneWhatsapp || '').toString().replace(/\D/g, '');

        if (u === cleanUser && s.includes(cleanStore) && p.includes(cleanPhone)) {
          found = {
            id: docSnap.id,
            ...raw,
            ...decrypted,
          };
          break;
        }
      }

      if (found) {
        setMatchedClient(found);
        setStep(2);
      } else {
        setErrorMessage('Não encontramos nenhum cadastro com essas informações. Verifique os dados informados.');
      }
    } catch (err) {
      console.error('Error verifying identity for password reset:', err);
      setErrorMessage('Erro ao consultar o banco de dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Digite e confirme a nova senha.');
      return;
    }
    if (newPassword.length > 8) {
      setErrorMessage('A senha deve ter no máximo 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      const updatedClient = {
        ...matchedClient,
        password: newPassword,
        passwordHash: await hashPassword(newPassword),
      };

      const encrypted = await encryptClientData(updatedClient);
      const docRef = doc(db, 'clients', matchedClient.id);
      await setDoc(docRef, encrypted, { merge: true });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setStep(1);
        setUsername('');
        setStoreName('');
        setPhoneWhatsapp('');
        setNewPassword('');
        setConfirmPassword('');
        setMatchedClient(null);
        onClose();
        onOpenLogin();
      }, 1500);
    } catch (err) {
      console.error('Error resetting password:', err);
      setErrorMessage('Erro ao atualizar a senha no banco de dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-[#121110] text-stone-100 rounded-3xl border border-[#3D3328] shadow-2xl overflow-hidden my-auto"
          id="forgot-password-modal"
        >
          {/* Header */}
          <div className="relative p-6 pb-5 bg-stone-900 border-b border-[#3D3328]">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider text-[#D4AF37] uppercase">
                  Recuperação de Acesso
                </span>
                <h2 className="text-xl font-serif-luxury font-bold text-white">
                  {step === 1 ? 'Identificar sua Loja' : 'Criar Nova Senha'}
                </h2>
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              {step === 1
                ? 'Informe os dados cadastrados da sua loja para confirmar sua identidade.'
                : 'Defina sua nova senha de acesso (máximo 8 caracteres).'}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 text-red-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isSuccess && (
              <div className="p-3.5 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Senha redefinida com sucesso! Redirecionando para o login...</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleVerifyIdentity} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Nome de Usuário da Loja *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ex: minha_loja"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Nome da Loja *
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Ex: Bella Donna Boutique"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    WhatsApp / Telefone Cadastrado *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={phoneWhatsapp}
                      onChange={(e) => setPhoneWhatsapp(e.target.value)}
                      placeholder="Ex: (11) 99999-9999"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#E5C378] text-stone-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
                      <span>Verificando dados...</span>
                    </>
                  ) : (
                    <>
                      <span>Continuar Recuperação</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="p-3 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-stone-300">
                  Loja confirmada: <strong className="text-white">{matchedClient?.storeName}</strong> (@{matchedClient?.username})
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-300">
                      Nova Senha *
                    </label>
                    <span className="text-[11px] text-stone-400">
                      {newPassword.length}/8 caracteres
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      maxLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nova senha (máx 8 caracteres)"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <CredentialChecklist value={newPassword} label="Requisitos da Senha" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Confirmar Nova Senha *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      maxLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme a nova senha"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#1C1C22] border border-[#2B2B33] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#E5C378] text-stone-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
                      <span>Atualizando senha...</span>
                    </>
                  ) : (
                    <>
                      <span>Salvar Nova Senha</span>
                      <CheckCircle2 className="w-4 h-4 text-stone-950" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
