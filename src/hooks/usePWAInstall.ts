import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__deferredPWAInstallPrompt) {
      return window.__deferredPWAInstallPrompt;
    }
    return null;
  });

  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });

  useEffect(() => {
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone);
    };

    checkStandalone();

    if (window.__deferredPWAInstallPrompt) {
      setDeferredPrompt(window.__deferredPWAInstallPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__deferredPWAInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);

      // Auto-trigger if arrived via direct install request
      const params = new URLSearchParams(window.location.search);
      if (params.get('install') === '1') {
        promptEvent.prompt().catch(() => {});
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('install');
        window.history.replaceState({}, '', cleanUrl.toString());
      }
    };

    const handleInstallReady = () => {
      if (window.__deferredPWAInstallPrompt) {
        setDeferredPrompt(window.__deferredPWAInstallPrompt);
        const params = new URLSearchParams(window.location.search);
        if (params.get('install') === '1') {
          window.__deferredPWAInstallPrompt.prompt().catch(() => {});
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('install');
          window.history.replaceState({}, '', cleanUrl.toString());
        }
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__deferredPWAInstallPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-install-ready', handleInstallReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if arrived with ?install=1 and prompt was already captured
    const params = new URLSearchParams(window.location.search);
    if (params.get('install') === '1') {
      const existing = deferredPrompt || window.__deferredPWAInstallPrompt;
      if (existing) {
        existing.prompt().catch(() => {});
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('install');
        window.history.replaceState({}, '', cleanUrl.toString());
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-install-ready', handleInstallReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const install = async (): Promise<boolean> => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPWAInstallPrompt : null);

    // 1. Direct native prompt if available
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          if (typeof window !== 'undefined') {
            window.__deferredPWAInstallPrompt = null;
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error('Erro no prompt nativo:', error);
      }
    }

    // 2. If running inside an iframe (e.g. AI Studio preview), open directly in the browser outside the iframe
    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (isIframe) {
      const targetUrl = new URL(window.location.href);
      targetUrl.searchParams.set('install', '1');
      window.open(targetUrl.toString(), '_blank');
      return true;
    }

    // 3. If in standalone browser tab and prompt was not yet intercepted, trigger reload with install intent
    const targetUrl = new URL(window.location.href);
    targetUrl.searchParams.set('install', '1');
    window.location.href = targetUrl.toString();
    return true;
  };

  return {
    isInstallable: Boolean(deferredPrompt || (typeof window !== 'undefined' && window.__deferredPWAInstallPrompt)),
    isInstalled,
    install,
  };
}
