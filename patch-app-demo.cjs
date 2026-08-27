const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const handleEnterStoreRegex = /const handleEnterStore = async \(\s*slug\?: string \| any\s*\) => \{[\s\S]*?setActiveView\('store'\);\s*window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\s*\};/;

const newHandleEnterStore = `const handleEnterStore = async (slug?: string | any) => {
    if (slug && typeof slug === 'string') {
      const cleanSlug = slug.trim().toLowerCase();
      if (cleanSlug === 'teste@123') {
        const testClient = {
          id: 'client-test-natural',
          storeName: 'Elite Fashion Vitrine',
          username: 'teste@123',
          password: '01020304',
          storeType: 'clothing',
          isOfficial: false,
          status: 'active'
        };
        setCurrentClient(testClient);
        localStorage.setItem('store_current_client', JSON.stringify(testClient));
      } else {
        const module = await import('./lib/firestoreService');
        const client = await module.getClientByUsername(cleanSlug);
        if (client) {
          const isOfficial = client.username !== 'teste@123' && client.id !== 'client-test-natural';
          const enriched = { ...client, isOfficial };
          setCurrentClient(enriched);
          localStorage.setItem('store_current_client', JSON.stringify(enriched));
        }
      }
    }
    setActiveView('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };`;

if (handleEnterStoreRegex.test(code)) {
    code = code.replace(handleEnterStoreRegex, newHandleEnterStore);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched App.tsx");
} else {
    console.log("Could not patch App.tsx");
}
