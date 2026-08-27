const fs = require('fs');
let code = fs.readFileSync('src/components/SuperAdminPanel.tsx', 'utf-8');

// 1. Remove storeType from formData initialization
code = code.replace(/storeType:\s*'clothing'\s*\|\s*'natural';/g, '');
code = code.replace(/storeType:\s*'clothing',/g, '');
code = code.replace(/storeType:\s*client\.storeType\s*\|\|\s*'clothing',/g, '');
code = code.replace(/storeType:\s*formData\.storeType,/g, '');

// 2. Remove the storeType dropdown UI block entirely.
// I will just look for the block starting with "{/* Store Type Selection */}" and remove it up to the next field.
// Actually, it's easier to remove it with regex or by just doing a manual edit, but let's try regex for colors first.

// Colors
const repl = [
  [/bg-\[#0F1420\]/g, 'bg-stone-50'],
  [/bg-\[#0A0A0B\]/g, 'bg-stone-50'],
  [/bg-\[#0B0F19\]/g, 'bg-white'],
  [/bg-slate-900/g, 'bg-stone-50'],
  [/bg-slate-800\/60/g, 'bg-white'],
  [/bg-slate-800\/40/g, 'bg-white'],
  [/bg-slate-800/g, 'bg-white'],
  [/bg-slate-950/g, 'bg-stone-50'],
  [/border-slate-700\/50/g, 'border-stone-200'],
  [/border-slate-700/g, 'border-stone-200'],
  [/border-slate-800/g, 'border-stone-200'],
  [/text-slate-400/g, 'text-stone-500'],
  [/text-slate-300/g, 'text-stone-600'],
  [/text-slate-500/g, 'text-stone-400'],
  [/text-white/g, 'text-stone-900'],
  [/bg-amber-500\/10/g, 'bg-stone-100'],
  [/bg-amber-500\/15/g, 'bg-stone-100'],
  [/bg-amber-500\/20/g, 'bg-stone-100'],
  [/border-amber-500\/30/g, 'border-stone-300'],
  [/border-amber-500\/20/g, 'border-stone-200'],
  [/text-amber-300/g, 'text-stone-900'],
  [/text-amber-400/g, 'text-stone-900'],
  [/text-amber-500/g, 'text-stone-900'],
  [/text-indigo-300/g, 'text-stone-900'],
  [/text-indigo-400/g, 'text-stone-900'],
  [/bg-indigo-500\/20/g, 'bg-stone-100'],
  [/border-indigo-500\/30/g, 'border-stone-300'],
  [/text-emerald-300/g, 'text-emerald-700'],
  [/text-emerald-400/g, 'text-emerald-600'],
  [/bg-emerald-500\/20/g, 'bg-emerald-100'],
  [/border-emerald-500\/30/g, 'border-emerald-200'],
  [/bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900/g, 'bg-stone-900 text-white'],
  [/bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600/g, 'bg-stone-900'],
  [/shadow-amber-950\/40/g, 'shadow-stone-200'],
  [/shadow-indigo-500\/20/g, 'shadow-stone-200'],
];

for (const [r, s] of repl) {
  code = code.replace(r, s);
}

// Special case: the header has text-white but we want it black. Since we replaced text-white with text-stone-900, it's fine.
// The button with bg-gradient... now has bg-stone-900, we need to ensure text is white inside it.
code = code.replace(/className="[^"]*bg-gradient-[^"]*"/g, (match) => {
    return match.replace(/bg-gradient-to-[a-z]+ from-[a-z]+-[0-9]+ via-[a-z]+-[0-9]+ to-[a-z]+-[0-9]+/, 'bg-stone-900 text-white').replace(/text-stone-900/, 'text-white');
});

fs.writeFileSync('src/components/SuperAdminPanel.tsx', code);
console.log("Done");
