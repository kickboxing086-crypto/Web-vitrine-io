const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const naturalTheme = `.theme-natural {
  /* Luxurious Herbal Menu Theme */
  --brand-primary: #2B4C3B;
  --brand-primary-dark: #1F382B;
  --brand-primary-darker: #14251C;
  --brand-secondary: #C5A880;
  --brand-bg: #F7F9F7;
  --brand-bg-alt: #ECF0ED;
  --brand-border: #DDE4DF;
  --brand-border-dark: #C2CCC5;
}`;

code = code.replace(/\.theme-natural\s*{[^}]*}/, naturalTheme);
fs.writeFileSync('src/index.css', code);
