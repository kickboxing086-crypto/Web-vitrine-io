const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf-8');

code = code.replace(/<div \s*key=\{idx\} \s*key=\{idx\} className/g, '<div key={idx} className');

fs.writeFileSync('src/components/LandingPage.tsx', code);
console.log("Fixed key");
