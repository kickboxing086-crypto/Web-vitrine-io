const fs = require('fs');
let code = fs.readFileSync('src/components/SuperAdminPanel.tsx', 'utf-8');

// The block starts at "{/* Tipo de Vitrine */}" and ends before "{/* WhatsApp do Cliente */}"
const startIndex = code.indexOf('{/* Tipo de Vitrine */}');
const endIndex = code.indexOf('{/* WhatsApp do Cliente */}');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + code.substring(endIndex);
}

// Also remove `storeType` from the clients table rendering
// Search for `// Store Info` and the `client.storeType === 'clothing'` part
code = code.replace(/\{client\.storeType === 'clothing' \? \([\s\S]*?\) \: \([\s\S]*?\)\}/, '');
code = code.replace(/👗 Roupas/, '');
code = code.replace(/🌿 Natural/, '');

// Fix any leftover amber colors in form inputs
code = code.replace(/border-amber-500\/40/g, 'border-stone-200');
code = code.replace(/focus:border-amber-400/g, 'focus:border-stone-400');

fs.writeFileSync('src/components/SuperAdminPanel.tsx', code);
console.log("Removed");
