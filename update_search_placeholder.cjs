const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  'placeholder="Pesquisar por modelo, tecido, cor, tamanho..."',
  'placeholder={settings.storeType === "natural" ? "Pesquisar por chás, ervas, suplementos..." : "Pesquisar por modelo, tecido, cor, tamanho..."}'
);

fs.writeFileSync('src/components/Navbar.tsx', code);
