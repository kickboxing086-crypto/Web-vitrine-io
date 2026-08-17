const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const naturalTheme = `.theme-natural {
  /* Vibrant Shopee-style Green Theme */
  --brand-primary: #00b14f;
  --brand-primary-dark: #008a3d;
  --brand-primary-darker: #00662d;
  --brand-secondary: #00b14f;
  --brand-bg: #f5f5f5;
  --brand-bg-alt: #ffffff;
  --brand-border: #e5e5e5;
  --brand-border-dark: #d5d5d5;
}`;

code = code.replace(/\.theme-natural\s*{[^}]*}/, naturalTheme);
fs.writeFileSync('src/index.css', code);
