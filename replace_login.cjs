const fs = require('fs');
let code = fs.readFileSync('src/components/LoginModal.tsx', 'utf8');

const newSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setErrorMessage('Por favor, digite o nome de usuário.');
      return;
    }
    if (!cleanPass) {
      setErrorMessage('Por favor, digite a sua senha de até 8 dígitos.');
      return;
    }

    if (cleanPass.length > 8) {
      setErrorMessage('A senha deve ter no máximo 8 dígitos.');
      return;
    }

    setIsLoading(true);

    // Super Admin bypass
    if (cleanUser === 'Ssilva_7' && cleanPass === '072131') {
      setIsSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        onLoginSuccess('super_admin');
        setIsSuccess(false);
        setUsername('');
        setPassword('');
        onClose();
      }, 600);
      return;
    }

    // Authenticate actual client
    const client = await authenticateClient(cleanUser, cleanPass);
    
    // Check fallback for original adminUser config if client not found
    const isFallbackAdmin = cleanUser === adminUser.username && cleanPass === adminUser.password;

    if (client || isFallbackAdmin) {
      setIsSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        onLoginSuccess('store_admin', client);
        setIsSuccess(false);
        setUsername('');
        setPassword('');
        onClose();
      }, 600);
    } else {
      setIsLoading(false);
      setErrorMessage('Usuário ou senha incorretos. Verifique os dados digitados.');
    }
  };`;

const regex = /  const handleSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?    \}, 400\);\n  \};/;
code = code.replace(regex, newSubmit);

fs.writeFileSync('src/components/LoginModal.tsx', code);
