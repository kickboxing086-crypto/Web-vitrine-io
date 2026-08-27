const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf-8');

code = code.replace(/\{ name: 'Anual', price: 'R\$ 280,00', period: '\/ano', highlight: false \},\n?/g, '');

fs.writeFileSync('src/components/LandingPage.tsx', code);
console.log("Fixed landing plans");
