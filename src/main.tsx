import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker immediately for PWA installation capability
registerSW({
  immediate: true,
  onRegistered(r) {
    console.log('PWA Service Worker registrado com sucesso:', r?.scope);
  },
  onRegisterError(error) {
    console.warn('Erro no registro do Service Worker:', error);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
