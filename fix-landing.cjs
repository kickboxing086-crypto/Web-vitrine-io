const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf-8');

// 1. Add getPlanMessage function and replace the href in the plan mapping
const planMapStart = code.indexOf('{plans.map((plan, idx) => (');

if (planMapStart !== -1) {
    code = code.replace(
      /\{plans\.map\(\(plan, idx\) => \(/g, 
      `{plans.map((plan, idx) => {
            const planMessage = encodeURIComponent(\`Olá! Gostaria de abrir minha vitrine e ativar o Plano \${plan.name}. Como faço para liberar meu acesso imediato?\`);
            const planLink = \`https://wa.me/\${officialPhone}?text=\${planMessage}\`;
            return (`
    );

    code = code.replace(
      /className=\{\`p-6 rounded-2xl flex flex-col justify-between border/g,
      `key={idx} className={\`p-6 rounded-2xl flex flex-col justify-between border`
    );

    // Remove old key={idx}
    code = code.replace(/<div \n\s*key=\{idx\}\n\s*className/g, '<div className');
    code = code.replace(/<div\n\s*key=\{idx\}\n\s*className/g, '<div className');

    // Make sure we change the a href inside the map to use planLink
    // The previous href was href={buyLink} inside the plans loop
    // But there are multiple buyLinks. I only want to change the one inside the plans loop.
    // The one in the loop is right before "Escolher Plano". Let's target that.
    code = code.replace(
      /<a\s*href=\{buyLink\}\s*target="_blank"\s*rel="noopener noreferrer"\s*className=\{`w-full py-3/g,
      `<a
                href={planLink}
                target="_blank"
                rel="noopener noreferrer"
                className={\`w-full py-3`
    );
    
    // Close the return (
    code = code.replace(
      /Escolher Plano\n\s*<\/a>\n\s*<\/div>\n\s*\)\)}/g,
      `Escolher Plano\n              </a>\n            </div>\n          );})} `
    );
}

// 2. Add Demo Store button to Hero section
const heroButtonStr = `        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-bold transition-colors w-full sm:w-auto"
          >
            <span>Criar Minha Vitrine</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <button
            onClick={() => onEnterStore('teste@123')}
            className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white hover:bg-stone-100 text-stone-900 border border-stone-200 rounded-xl text-sm font-bold transition-colors w-full sm:w-auto"
          >
            <Store className="w-4 h-4" />
            <span>Ver Vitrine de Exemplo</span>
          </button>
        </div>`;
code = code.replace(/<div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">[\s\S]*?<\/div>/, heroButtonStr);


fs.writeFileSync('src/components/LandingPage.tsx', code);
console.log("Fixed LandingPage");
