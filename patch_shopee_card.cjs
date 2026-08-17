const fs = require('fs');
let code = fs.readFileSync('src/components/ProductCard.tsx', 'utf8');

// Replace isList with isShopee
code = code.replace(/isList\?: boolean;/g, 'isShopee?: boolean;');
code = code.replace(/isList = false,/g, 'isShopee = false,');

// Replace the main classes
code = code.replace(
  'className={`group relative bg-white rounded-2xl border border-brand-border overflow-hidden shadow-xs hover:shadow-xl hover:border-brand-border-dark transition-all duration-300 flex cursor-pointer ${isList ? "flex-row min-h-[140px] sm:min-h-[160px]" : "flex-col"}`}',
  'className={`group relative bg-white border overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer ${isShopee ? "rounded-none border-transparent hover:border-brand-primary/50 shadow-sm" : "rounded-2xl border-brand-border shadow-xs hover:shadow-xl hover:border-brand-border-dark"}`}'
);

// Replace Image container classes
code = code.replace(
  'className={`relative overflow-hidden bg-brand-bg-alt shrink-0 ${isList ? "w-28 sm:w-36 h-full" : "aspect-[3/4] w-full"}`}',
  'className={`relative w-full overflow-hidden bg-brand-bg-alt shrink-0 ${isShopee ? "aspect-square" : "aspect-[3/4]"}`}'
);

// Replace Product Content container
code = code.replace(
  'className={`flex flex-col flex-1 justify-between bg-white ${isList ? "p-3 sm:p-4" : "p-4 sm:p-5"}`}',
  'className={`flex flex-col flex-1 justify-between bg-white ${isShopee ? "p-2 sm:p-3" : "p-4 sm:p-5"}`}'
);

// Modify the title for Shopee
code = code.replace(
  'className="font-serif-luxury text-base font-semibold text-stone-900 leading-snug line-clamp-2 group-hover:text-brand-primary-dark transition-colors"',
  'className={`${isShopee ? "font-sans text-xs sm:text-sm font-medium leading-tight" : "font-serif-luxury text-base font-semibold leading-snug"} text-stone-900 line-clamp-2 group-hover:text-brand-primary-dark transition-colors`}'
);

// Modify price row for Shopee
code = code.replace(
  'className="mt-4 pt-3 border-t border-[#F0E8DF] flex items-end justify-between"',
  'className={`mt-3 flex items-end justify-between ${isShopee ? "" : "pt-3 border-t border-[#F0E8DF]"}`}'
);

code = code.replace(
  'className="text-lg font-bold text-stone-900"',
  'className={`font-bold ${isShopee ? "text-brand-primary text-base sm:text-lg" : "text-stone-900 text-lg"}`}'
);

fs.writeFileSync('src/components/ProductCard.tsx', code);
