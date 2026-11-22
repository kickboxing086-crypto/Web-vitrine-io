import React from 'react';
import { Check, X } from 'lucide-react';

export const RESERVED_USERNAMES = [
  'admin',
  'administrator',
  'teste',
  'test',
  'root',
  'usuario',
  'user',
  'loja',
  'suporte',
  '1234',
  '12345',
  '123456',
  '1234567',
  '12345678',
];

export const validateUsernameSecurity = (value: string) => {
  const raw = (value || '').trim();
  const cleanVal = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const hasValidLength = raw.length >= 4 && raw.length <= 8;
  const hasLetter = /[a-zA-Z]/.test(raw);
  const hasNumber = /[0-9]/.test(raw);
  const hasOnlySafeChars = raw.length > 0 && cleanVal === raw && /^[a-zA-Z0-9_]+$/.test(raw);
  const isNotReserved = raw.length > 0 && !RESERVED_USERNAMES.includes(raw.toLowerCase());

  return {
    hasValidLength,
    hasLetter,
    hasNumber,
    hasOnlySafeChars,
    isNotReserved,
    isValid: hasValidLength && hasLetter && hasNumber && hasOnlySafeChars && isNotReserved,
  };
};

export const validatePasswordSecurity = (value: string) => {
  const raw = (value || '').trim();
  const cleanVal = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const hasNoAccents = cleanVal === raw && raw.length > 0;
  const hasValidLength = raw.length >= 6 && raw.length <= 8;
  const hasUpper = /[A-Z]/.test(raw);
  const hasLower = /[a-z]/.test(raw);
  const hasNumber = /[0-9]/.test(raw);

  return {
    hasNoAccents,
    hasValidLength,
    hasUpper,
    hasLower,
    hasNumber,
    isValid: hasNoAccents && hasValidLength && hasUpper && hasLower && hasNumber,
  };
};

interface CredentialChecklistProps {
  value: string;
  label?: string;
  mode?: 'password' | 'username';
  variant?: 'light' | 'dark';
}

export const CredentialChecklist: React.FC<CredentialChecklistProps> = ({
  value,
  label = 'Requisitos de Segurança',
  mode = 'password',
  variant = 'light',
}) => {
  const trimmed = (value || '').trim();

  const checks =
    mode === 'username'
      ? (() => {
          const v = validateUsernameSecurity(trimmed);
          return [
            { text: 'Entre 4 e 8 caracteres', met: v.hasValidLength },
            { text: 'Pelo menos 1 letra (a-z)', met: v.hasLetter },
            { text: 'Pelo menos 1 número (0-9)', met: v.hasNumber },
            { text: 'Sem espaços, acentos ou símbolos', met: v.hasOnlySafeChars },
            { text: 'Nome exclusivo (não genérico)', met: v.isNotReserved },
          ];
        })()
      : (() => {
          const v = validatePasswordSecurity(trimmed);
          return [
            { text: 'Entre 6 e 8 caracteres', met: v.hasValidLength },
            { text: 'Letra maiúscula (A-Z)', met: v.hasUpper },
            { text: 'Letra minúscula (a-z)', met: v.hasLower },
            { text: 'Número (0-9)', met: v.hasNumber },
            { text: 'Sem letras acentuadas', met: v.hasNoAccents },
          ];
        })();

  const isDark = variant === 'dark';

  return (
    <div
      className={`mt-2 p-3 rounded-xl border space-y-1.5 ${
        isDark
          ? 'bg-[#121215] border-[#2B2B33]'
          : 'bg-stone-100 border-stone-200'
      }`}
    >
      <span
        className={`text-[11px] font-bold uppercase tracking-wider block ${
          isDark ? 'text-stone-300' : 'text-stone-600'
        }`}
      >
        {label} ({trimmed.length}/8):
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {checks.map((chk, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            {chk.met ? (
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  isDark
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            ) : (
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  isDark
                    ? 'bg-stone-800 text-stone-500'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                <X className="w-3 h-3" />
              </span>
            )}
            <span
              className={
                chk.met
                  ? isDark
                    ? 'text-emerald-400 font-semibold'
                    : 'text-emerald-800 font-semibold'
                  : isDark
                  ? 'text-stone-400'
                  : 'text-stone-500'
              }
            >
              {chk.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
