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
const listeners = new Set<(canInstall: boolean) => void>();

export function registerPWA() {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('SW registered');
        reg.update();
      });
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach(l => l(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach(l => l(false));
  });
}

export async function triggerNativeInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  
  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt = null;
      listeners.forEach(l => l(false));
      return 'accepted';
    }
    return 'dismissed';
  } catch (err) {
    console.error('PWA install error:', err);
    return 'unavailable';
  }
}

export function usePwa() {
  const [canInstall, setCanInstall] = useState(!!deferredPrompt);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
        || (navigator as any).standalone 
        || document.referrer.includes('android-app://');
      setIsStandalone(!!isStandaloneMode);
    };

    checkStandalone();

    const handleChange = (state: boolean) => setCanInstall(state);
    listeners.add(handleChange);

    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  return { canInstall, isStandalone, triggerNativeInstall };
}
