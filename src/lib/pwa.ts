/**
 * PWA Service Worker Registration and Install Prompt Helper
 */

import { useState, useEffect } from 'react';

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('PWA Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('PWA Service Worker registration skipped or failed:', err);
        });
    });
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
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((listener) => listener(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((listener) => listener(false));
    console.log('PWA was installed successfully.');
  });
}

export async function promptInstallPWA(): Promise<boolean> {
  if (!deferredPrompt) {
    // If not directly triggerable via beforeinstallprompt, provide instructions
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  listeners.forEach((listener) => listener(false));
  return outcome === 'accepted';
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
