import React from 'react';
import { Check, X } from 'lucide-react';

interface CredentialChecklistProps {
  value: string;
  label?: string;
}

export const CredentialChecklist: React.FC<CredentialChecklistProps> = ({ value, label = 'Requisitos de Segurança' }) => {
  const cleanVal = (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const hasNoAccents = cleanVal === value;
  const hasMaxLength = value.length > 0 && value.length <= 8;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);

  const checks = [
    { text: 'Máximo de 8 caracteres', met: hasMaxLength },
    { text: 'Letra maiúscula (A-Z)', met: hasUpper },
    { text: 'Letra minúscula (a-z)', met: hasLower },
    { text: 'Número (0-9)', met: hasNumber },
    { text: 'Sem letras acentuadas', met: hasNoAccents && value.length > 0 },
  ];

  return (
    <div className="mt-2 p-3 bg-stone-100 rounded-xl border border-stone-200 space-y-1.5">
      <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
        {label} ({value.length}/8):
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {checks.map((chk, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            {chk.met ? (
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            ) : (
              <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center shrink-0">
                <X className="w-3 h-3" />
              </span>
            )}
            <span className={chk.met ? 'text-emerald-800 font-semibold' : 'text-stone-500'}>
              {chk.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
