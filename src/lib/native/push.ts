/**
 * Push Notification Registration — Capacitor
 *
 * Skeleton implementation for push notification registration.
 * Install the plugin: npm install @capacitor/push-notifications
 *
 * NOTE: @capacitor/push-notifications is NOT installed yet.
 * All functions are safe no-ops until then.
 */

import { Capacitor } from '@capacitor/core';

export interface PushNotificationToken {
  value: string;
}

/**
 * Register for push notifications on native platforms.
 * No-op on web or when push plugin is not installed.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function registerPushNotifications(userId: string): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Push] Skipping — not a native platform');
    return null;
  }

  try {
    const pushModule = await import('@capacitor/push-notifications' as string);
    const PushNotifications = pushModule.PushNotifications;

    if (!PushNotifications) {
      console.warn('[Push] PushNotifications plugin not available');
      return null;
    }

    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.warn('[Push] Permission not granted');
      return null;
    }

    await PushNotifications.register();

    return new Promise((resolve) => {
      PushNotifications.addListener('registration', async (token: PushNotificationToken) => {
        console.log('[Push] Token received:', token.value);
        // TODO: Save token to Supabase when ready
        resolve(token.value);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('[Push] Registration error:', error);
        resolve(null);
      });
    });
  } catch {
    console.log('[Push] Plugin not installed. Run: npm install @capacitor/push-notifications');
    return null;
  }
}

/**
 * Set up push notification event handlers.
 * Call once in the app's root/layout component.
 */
export async function setupPushListeners(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const pushModule = await import('@capacitor/push-notifications' as string);
    const PushNotifications = pushModule.PushNotifications;

    if (!PushNotifications) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
      console.log('[Push] Foreground notification:', notification);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
      console.log('[Push] Notification tapped:', action);
    });
  } catch {
    // Plugin not installed — safe to ignore
  }
}
