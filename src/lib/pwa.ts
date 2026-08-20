/**
 * PWA Service Worker Registration and Install Prompt Helper
 */

import { useState, useEffect } from 'react';

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
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default mini-infobar and capture event for our custom button
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((listener) => listener(true));
    console.log('PWA beforeinstallprompt event captured.');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((listener) => listener(false));
    console.log('PWA was successfully installed.');
  });
}

export async function promptInstallPWA(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  // If deferredPrompt is available, trigger native prompt immediately
  if (deferredPrompt) {
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      listeners.forEach((listener) => listener(false));
      return choice?.outcome === 'accepted' ? 'accepted' : 'dismissed';
    } catch (err) {
      console.warn('Error invoking install prompt:', err);
      return 'unavailable';
    }
  }

  // If prompt not yet captured, wait up to 2 seconds for event
  return new Promise((resolve) => {
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve('unavailable');
      }
    }, 2000);

    const checkListener = (canInstall: boolean) => {
      if (canInstall && deferredPrompt && !resolved) {
        resolved = true;
        clearTimeout(timeout);
        listeners.delete(checkListener);
        deferredPrompt
          .prompt()
          .then(() => deferredPrompt!.userChoice)
          .then((choice) => {
            deferredPrompt = null;
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
  const [canInstall, setCanInstall] = useState<boolean>(Boolean(deferredPrompt));
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
