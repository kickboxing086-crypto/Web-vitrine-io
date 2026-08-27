const fs = require('fs');
let code = fs.readFileSync('src/components/SuperAdminPanel.tsx', 'utf-8');

// Replace selection styling
code = code.replace(/selection:bg-amber-500\/30 selection:text-amber-200/g, 'selection:bg-stone-900 selection:text-white');

// Replace random bg colors in root
code = code.replace(/bg-\[#0A0D14\]/g, 'bg-stone-50');

// Replace amber gradients and text
code = code.replace(/bg-gradient-[^" ]*amber[^" ]*/g, 'bg-stone-900');
code = code.replace(/text-amber-[0-9]+/g, 'text-stone-900');
code = code.replace(/bg-amber-[0-9]+\/[0-9]+/g, 'bg-stone-200');
code = code.replace(/bg-amber-[0-9]+/g, 'bg-stone-900 text-white');
code = code.replace(/border-amber-[0-9]+/g, 'border-stone-900');
code = code.replace(/shadow-amber-[0-9]+\/[0-9]+/g, 'shadow-stone-200');
code = code.replace(/from-amber-[0-9]+/g, '');
code = code.replace(/to-amber-[0-9]+/g, '');
code = code.replace(/via-amber-[0-9]+/g, '');
code = code.replace(/hover:from-amber-[0-9]+/g, 'hover:bg-stone-800');
code = code.replace(/hover:to-amber-[0-9]+/g, '');
code = code.replace(/hover:bg-amber-[0-9]+\/[0-9]+/g, 'hover:bg-stone-200');
code = code.replace(/hover:bg-amber-[0-9]+/g, 'hover:bg-stone-800');
code = code.replace(/focus:border-amber-[0-9]+/g, 'focus:border-stone-400');
code = code.replace(/ring-amber-[0-9]+\/[0-9]+/g, 'ring-stone-400');
code = code.replace(/text-stone-950/g, 'text-white');
code = code.replace(/text-slate-100/g, 'text-stone-900');
code = code.replace(/text-slate-200/g, 'text-stone-900');

// AI Vibes
code = code.replace(/bg-\[#161C2A\]/g, 'bg-white');
code = code.replace(/bg-gradient-to-r from-amber-950\/40 via-\[\#161C2A\] to-rose-950\/30/g, 'bg-white');
code = code.replace(/from-rose-500\/20 to-amber-500\/10/g, 'bg-white');

fs.writeFileSync('src/components/SuperAdminPanel.tsx', code);
console.log("Aesthetic fixed");
