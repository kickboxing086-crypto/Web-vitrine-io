import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  itemDescription?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  itemName,
  itemDescription,
  onConfirm,
  onClose,
}) => {
  const [typedKeyword, setTypedKeyword] = useState('');
  const REQUIRED_WORD = 'apagar';
  const isValid = typedKeyword.trim().toLowerCase() === REQUIRED_WORD;

  useEffect(() => {
    if (isOpen) {
      setTypedKeyword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-brand-bg rounded-2xl border border-brand-border shadow-2xl p-6 overflow-hidden"
          id="delete-modal-container"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            id="btn-close-delete-modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="p-3 bg-red-100 text-red-700 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
                Confirmação de 2 Etapas
              </span>
              <h3 className="text-xl font-serif-luxury font-semibold text-stone-900">
                {title}
              </h3>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-3 mb-6 text-sm text-stone-600 leading-relaxed">
            <p>
              Você está prestes a excluir permanentemente o item:
            </p>
            <div className="p-3 bg-white rounded-xl border border-brand-border font-medium text-stone-900">
              "{itemName}"
              {itemDescription && (
                <span className="block text-xs text-stone-500 mt-1 font-normal">
                  {itemDescription}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              Esta ação é definitiva e não poderá ser desfeita. Por motivos de segurança, digite a palavra <strong className="text-red-700 font-semibold uppercase tracking-wider">apagar</strong> no campo abaixo para habilitar a exclusão.
            </p>
          </div>

          {/* Input field (optional) */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Digite <span className="font-bold text-red-600">apagar</span> para confirmar (ou clique no botão abaixo):
            </label>
            <input
              type="text"
              value={typedKeyword}
              onChange={(e) => setTypedKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
              placeholder='Digite "apagar" (opcional)'
              autoFocus
              className="w-full px-4 py-2.5 bg-white border border-brand-border-dark rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-sm font-medium"
              id="input-confirm-apagar"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-sm font-medium transition-colors cursor-pointer"
              id="btn-cancel-delete"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 cursor-pointer"
              id="btn-execute-delete"
            >
              <Trash2 className="w-4 h-4" />
              <span>Confirmar Alterações</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
