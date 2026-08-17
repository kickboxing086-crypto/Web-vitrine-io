const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const originalGrid = `<div className={activeStoreType === 'natural' 
                ? "grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4" 
                : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"}>
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    settings={settings}
                    onOpenDetails={handleOpenProductDetails}
                    onQuickAddToCart={handleQuickAddToCart}
                    isList={activeStoreType === 'natural'}
                  />
                ))}
              </div>`;

const newGrid = `<div className={activeStoreType === 'natural' 
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3" 
                : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"}>
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    settings={settings}
                    onOpenDetails={handleOpenProductDetails}
                    onQuickAddToCart={handleQuickAddToCart}
                    isShopee={activeStoreType === 'natural'}
                  />
                ))}
              </div>`;

code = code.replace(originalGrid, newGrid);
fs.writeFileSync('src/App.tsx', code);
