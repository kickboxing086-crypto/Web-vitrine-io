import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Lock, FileText } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-[#121110] text-stone-100 rounded-3xl border border-[#3D3328] shadow-2xl overflow-hidden my-auto"
          id="privacy-policy-modal"
        >
          {/* Header */}
          <div className="relative px-6 sm:px-8 py-6 bg-stone-900 border-b border-[#3D3328] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase">
                  Conformidade Legal & Segurança
                </span>
                <h2 className="text-xl font-serif-luxury font-bold text-white">
                  Política de Privacidade
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-5 max-h-[70vh] overflow-y-auto text-xs sm:text-sm text-stone-300 leading-relaxed">
            <div className="p-4 bg-[#181716] border border-[#2A2622] rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#D4AF37] font-bold">
                <Lock className="w-4 h-4" />
                <span>Proteção de Dados & Privacidade</span>
              </div>
              <p className="text-stone-400 text-xs">
                A sua privacidade e a segurança dos dados de sua loja e clientes são prioridades absolutas na Web Vitrine. Em conformidade com a LGPD (Lei Geral de Proteção de Dados), garantimos proteção avançada e isolamento total entre as lojas.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-sm mb-1">1. Informações Coletadas</h3>
                <p>
                  Coletamos apenas os dados necessários para o funcionamento e operação da sua vitrine virtual e painel administrativo, tais como: nome da loja, usuário, senha criptografada, telefone de contato (WhatsApp), e-mail opcional, cidade e estado, além do catálogo de produtos cadastrados por você.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm mb-1">2. Uso das Informações</h3>
                <p>
                  Os dados fornecidos são utilizados exclusivamente para:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-1 text-stone-400">
                  <li>Autenticação e acesso seguro ao seu painel de gestão;</li>
                  <li>Formatação correta dos pedidos enviados pelas suas clientes diretamente para o seu WhatsApp;</li>
                  <li>Controle de vigência de plano e suporte técnico.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm mb-1">3. Compartilhamento de Dados</h3>
                <p>
                  A Web Vitrine **não vende, aluga ou cede** dados de lojistas ou clientes para terceiros. As transações de renovação via Pix ocorrem de forma direta e segura através de infraestrutura criptografada.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm mb-1">4. Segurança do Armazenamento</h3>
                <p>
                  Utilizamos servidores seguros com isolamento por loja e proteção avançada de dados, prevenindo acessos não autorizados ou vazamentos.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm mb-1">5. Seus Direitos</h3>
                <p>
                  O lojista possui controle total sobre suas informações, podendo atualizar dados ou solicitar a exclusão definitiva de sua conta e registros associados a qualquer momento através do suporte ou painel.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2A2622] text-center">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#E5C378] text-stone-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md"
              >
                Entendido e Concordo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
