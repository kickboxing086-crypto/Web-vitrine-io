const fs = require('fs');
let code = fs.readFileSync('src/components/SuperAdminPanel.tsx', 'utf-8');

code = code.replace(/bg-\[\#121724\]/g, 'bg-white');
code = code.replace(/bg-\[\#182030\]\/60/g, 'bg-stone-50');
code = code.replace(/bg-\[\#182030\]/g, 'bg-stone-100');
code = code.replace(/bg-\[\#20293D\]/g, 'bg-stone-200');
code = code.replace(/bg-\[\#101624\]/g, 'bg-stone-100');
code = code.replace(/bg-\[\#141B2D\]/g, 'bg-white');
code = code.replace(/bg-gradient-to-b \/20 \/10 to-transparent/g, 'bg-stone-50');
code = code.replace(/border-slate-600/g, 'border-stone-300');
code = code.replace(/text-white text-white/g, 'text-white');

fs.writeFileSync('src/components/SuperAdminPanel.tsx', code);
console.log("Colors fixed");
