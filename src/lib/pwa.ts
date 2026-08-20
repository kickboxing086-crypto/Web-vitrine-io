import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    deferredPwaPrompt: BeforeInstallPromptEvent | null;
  }
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(canInstall: boolean) => void>();

export function registerPWA() {
  if (typeof window === 'undefined') return;

  // Check if already captured in index.html
  if (window.deferredPwaPrompt) {
    deferredPrompt = window.deferredPwaPrompt;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('PWA Service Worker registered');
        reg.update().catch(() => {});
      });
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    window.deferredPwaPrompt = deferredPrompt;
    listeners.forEach(l => l(true));
  });

  window.addEventListener('pwa-prompt-captured', () => {
    if (window.deferredPwaPrompt) {
      deferredPrompt = window.deferredPwaPrompt;
      listeners.forEach(l => l(true));
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.deferredPwaPrompt = null;
    listeners.forEach(l => l(false));
  });
}

export async function triggerNativeInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const activePrompt = deferredPrompt || window.deferredPwaPrompt;
  
  if (!activePrompt) {
    // If not ready, wait a bit for it
    return new Promise((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve('unavailable');
        }
      }, 1500);

      const check = () => {
        const p = deferredPrompt || window.deferredPwaPrompt;
        if (p && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          p.prompt().then(() => p.userChoice).then(choice => {
            if (choice.outcome === 'accepted') {
              deferredPrompt = null;
              window.deferredPwaPrompt = null;
              listeners.forEach(l => l(false));
              resolve('accepted');
            } else {
              resolve('dismissed');
            }
          }).catch(() => resolve('unavailable'));
        }
      };

      if (deferredPrompt || window.deferredPwaPrompt) {
        check();
      } else {
        const listener = () => {
          check();
          window.removeEventListener('pwa-prompt-captured', listener);
        };
        window.addEventListener('pwa-prompt-captured', listener);
      }
    });
  }
  
  try {
    await activePrompt.prompt();
    const { outcome } = await activePrompt.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt = null;
      window.deferredPwaPrompt = null;
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
  const [canInstall, setCanInstall] = useState(!!(deferredPrompt || (typeof window !== 'undefined' && window.deferredPwaPrompt)));
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

    // Initial check in case it was captured before hook mount
    if (window.deferredPwaPrompt || deferredPrompt) {
      setCanInstall(true);
    }

    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  return { canInstall, isStandalone, triggerNativeInstall };
}
