const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf-8');

code = code.replace(/export const LandingPage: React\.FC<LandingPageProps> = \(\{\n  onAdminLogin,\n\}\) => \{/g, `export const LandingPage: React.FC<LandingPageProps> = ({
  settings,
  onEnterStore,
  onAdminLogin,
}) => {`);

fs.writeFileSync('src/components/LandingPage.tsx', code);
console.log("Fixed LandingPage props");
