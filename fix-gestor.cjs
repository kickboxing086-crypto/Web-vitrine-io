const fs = require('fs');
let code = fs.readFileSync('src/components/SuperAdminPanel.tsx', 'utf-8');

// 1. Change grid cols to fit 4 plans
code = code.replace(/<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">/g, '<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">');

// 2. Add Vitalício plan to the array
const plansMapRegex = /\{price: 119\.99,\s*title: 'Semestral',\s*period: '180 dias',\s*days: 180,\s*badge: 'Alta Economia',\s*\},\s*\]\.map/g;

code = code.replace(plansMapRegex, `{
                          price: 119.99,
                          title: 'Semestral',
                          period: '180 dias',
                          days: 180,
                          badge: 'Alta Economia',
                        },
                        {
                          price: 250.00,
                          title: 'Vitalício',
                          period: 'Permanente',
                          days: 12000,
                          badge: 'Único',
                        },
                      ].map`);

// 3. Fix the styling of the selected plan to use dark background for better visibility
code = code.replace(
  /isSelected\n\s*\? 'bg-stone-50 border-stone-900 shadow-lg shadow-stone-200 ring-1 ring-stone-400'\n\s*: 'bg-white hover:bg-stone-100 border-stone-200\/80 hover:border-stone-300'/g,
  `isSelected
                                ? 'bg-stone-900 border-stone-900 shadow-xl'
                                : 'bg-white hover:bg-stone-100 border-stone-200/80 hover:border-stone-300'`
);

// 4. Also fix the Animated Background Indicator if it's there
code = code.replace(
  /<motion\.div\n\s*layoutId="activeAdminPlanGlow"\n\s*className="absolute inset-0 bg-stone-100/g,
  `<motion.div
                                layoutId="activeAdminPlanGlow"
                                className="absolute inset-0 bg-stone-900`
);

// 5. Fix text colors inside the selected plan
code = code.replace(
  /span className="self-start px-1\.5 py-0\.5 rounded-md text-\[8px\] font-black uppercase tracking-wider bg-stone-900 text-white mb-1 shadow-2xs"/g,
  `span className={\`self-start px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider mb-1 shadow-2xs \${isSelected ? 'bg-white text-stone-900' : 'bg-stone-900 text-white'}\`}`
);

code = code.replace(
  /span className=\{`text-xs font-bold \$\{isSelected \? 'text-stone-900' : 'text-stone-900'\}`\}/g,
  `span className={\`text-xs font-bold \${isSelected ? 'text-white' : 'text-stone-900'}\`}`
);

code = code.replace(
  /className=\{`w-4 h-4 rounded-full flex items-center justify-center border transition-all \$\{\n\s*isSelected\n\s*\? 'bg-stone-900 text-white border-stone-900 text-white scale-110'\n\s*: 'border-stone-300 bg-transparent'\n\s*\}`\}/g,
  `className={\`w-4 h-4 rounded-full flex items-center justify-center border transition-all \${
                                  isSelected
                                    ? 'bg-white text-stone-900 border-white scale-110'
                                    : 'border-stone-300 bg-transparent'
                                }\`}`
);

code = code.replace(
  /span className=\{`text-sm sm:text-base font-black tracking-tight \$\{isSelected \? 'text-stone-900' : 'text-stone-900'\}`\}/g,
  `span className={\`text-sm sm:text-base font-black tracking-tight \${isSelected ? 'text-white' : 'text-stone-900'}\`}`
);

code = code.replace(
  /span className="text-\[10px\] text-stone-500 font-medium"/g,
  `span className={\`text-[10px] font-medium \${isSelected ? 'text-stone-300' : 'text-stone-500'}\`}`
);

fs.writeFileSync('src/components/SuperAdminPanel.tsx', code);
console.log("Fixed Gestor");
