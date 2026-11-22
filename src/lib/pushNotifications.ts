export type PushPermissionState = NotificationPermission | 'unsupported';

export function getNotificationPermission(): PushPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestPushNotificationPermission(): Promise<PushPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    const result = await Notification.requestPermission();
    if (result === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    return result;
  } catch {
    return getNotificationPermission();
  }
}

export function playNotificationChime(kind: 'order' | 'system' = 'system') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = kind === 'order' ? [587.33, 880, 1174.66] : [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.11);

      gain.gain.setValueAtTime(0.001, now + idx * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.09, now + idx * 0.11 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.11);
      osc.stop(now + idx * 0.11 + 0.38);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1000);
  } catch {
    // Browser autoplay policy may block audio before interaction
  }
}

export interface BrowserPushOptions {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  requireInteraction?: boolean;
  kind?: 'order' | 'system';
  playSound?: boolean;
}

export async function sendBrowserPushNotification({
  title,
  body,
  tag,
  url = '/?page=admin',
  requireInteraction = false,
  kind = 'system',
  playSound = true,
}: BrowserPushOptions): Promise<boolean> {
  if (playSound) {
    playNotificationChime(kind);
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const notifOptions: NotificationOptions & { vibrate?: number[] } = {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: tag || `notif-${Date.now()}`,
    requireInteraction,
    data: { url },
    vibrate: [200, 100, 200],
  };

  try {
    if ('serviceWorker' in navigator) {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200)),
      ]);
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, notifOptions);
        return true;
      }
    }
  } catch {
    // Fallback to Notification constructor below
  }

  try {
    const n = new Notification(title, notifOptions);
    n.onclick = () => {
      window.focus();
      n.close();
    };
    return true;
  } catch {
    return false;
  }
}
