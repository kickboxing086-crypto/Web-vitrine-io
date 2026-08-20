import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function registerPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    // Dispatch custom event to notify React components
    window.dispatchEvent(new Event('can-install-pwa'));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new Event('pwa-installed-successfully'));
  });
}

export async function triggerNativeInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    deferredPrompt = null;
    return true;
  }
  return false;
}

export function usePwa() {
  const [canInstall, setCanInstall] = useState(!!deferredPrompt);

  useEffect(() => {
    const handleCanInstall = () => setCanInstall(true);
    const handleInstalled = () => setCanInstall(false);

    window.addEventListener('can-install-pwa', handleCanInstall);
    window.addEventListener('pwa-installed-successfully', handleInstalled);

    return () => {
      window.removeEventListener('can-install-pwa', handleCanInstall);
      window.removeEventListener('pwa-installed-successfully', handleInstalled);
    };
  }, []);

  return { canInstall, triggerNativeInstall };
}
