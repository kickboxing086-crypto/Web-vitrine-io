/**
 * PWA Service Worker Registration and Install Prompt Helper
 */

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    deferredPwaPrompt: BeforeInstallPromptEvent | null;
  }
}

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const register = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('PWA Service Worker registered:', reg.scope);
          reg.update().catch(() => {});
        })
        .catch((err) => {
          console.warn('PWA Service Worker registration:', err);
        });
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      register();
    } else {
      window.addEventListener('load', register);
    }
  }
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(canInstall: boolean) => void>();

if (typeof window !== 'undefined') {
  // Sync if already captured in index.html head
  if (window.deferredPwaPrompt) {
    deferredPrompt = window.deferredPwaPrompt;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    window.deferredPwaPrompt = deferredPrompt;
    listeners.forEach((listener) => listener(true));
  });

  window.addEventListener('pwa-prompt-captured', () => {
    if (window.deferredPwaPrompt) {
      deferredPrompt = window.deferredPwaPrompt;
      listeners.forEach((listener) => listener(true));
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.deferredPwaPrompt = null;
    listeners.forEach((listener) => listener(false));
  });

  window.addEventListener('pwa-installed', () => {
    deferredPrompt = null;
    window.deferredPwaPrompt = null;
    listeners.forEach((listener) => listener(false));
  });
}

export async function promptInstallPWA(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const promptEvent = window.deferredPwaPrompt || deferredPrompt;

  if (promptEvent) {
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      deferredPrompt = null;
      window.deferredPwaPrompt = null;
      listeners.forEach((listener) => listener(false));
      return choice?.outcome === 'accepted' ? 'accepted' : 'dismissed';
    } catch (err) {
      console.warn('Error invoking install prompt:', err);
      return 'unavailable';
    }
  }

  // If prompt not yet available, wait up to 1 second for Chrome to dispatch
  return new Promise((resolve) => {
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve('unavailable');
      }
    }, 1000);

    const checkListener = (canInstall: boolean) => {
      const activePrompt = window.deferredPwaPrompt || deferredPrompt;
      if (canInstall && activePrompt && !resolved) {
        resolved = true;
        clearTimeout(timeout);
        listeners.delete(checkListener);
        activePrompt
          .prompt()
          .then(() => activePrompt.userChoice)
          .then((choice) => {
            deferredPrompt = null;
            window.deferredPwaPrompt = null;
            listeners.forEach((l) => l(false));
            resolve(choice?.outcome === 'accepted' ? 'accepted' : 'dismissed');
          })
          .catch(() => resolve('unavailable'));
      }
    };

    listeners.add(checkListener);
  });
}

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState<boolean>(
    Boolean(typeof window !== 'undefined' && (window.deferredPwaPrompt || deferredPrompt))
  );
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // @ts-ignore
      const isIOSStandalone = window.navigator.standalone === true;
      setIsStandalone(isDisplayStandalone || isIOSStandalone);
    };

    checkStandalone();

    const handlePrompt = (state: boolean) => {
      setCanInstall(state);
    };

    listeners.add(handlePrompt);
    return () => {
      listeners.delete(handlePrompt);
    };
  }, []);

  return {
    canInstall,
    isStandalone,
    installApp: promptInstallPWA,
  };
}
