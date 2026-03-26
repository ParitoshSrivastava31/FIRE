import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Centralized haptic feedback utility.
 * All methods are safe to call on web — they no-op if not native.
 *
 * Usage guide:
 *   light   → tab bar nav, toggles, selection changes
 *   medium  → form submits, button confirms
 *   success → goal hit, SIP activated, payment success
 *   error   → OTP wrong, form validation fail, API error
 *   warning → budget 80% spent, portfolio drifted
 */
export const haptic = {
  light: async () => {
    if (!Capacitor.isNativePlatform()) return;
    await Haptics.impact({ style: ImpactStyle.Light });
  },

  medium: async () => {
    if (!Capacitor.isNativePlatform()) return;
    await Haptics.impact({ style: ImpactStyle.Medium });
  },

  heavy: async () => {
    if (!Capacitor.isNativePlatform()) return;
    await Haptics.impact({ style: ImpactStyle.Heavy });
  },

  success: async () => {
    if (!Capacitor.isNativePlatform()) return;
    await Haptics.notification({ type: NotificationType.Success });
  },

  error: async () => {
    if (!Capacitor.isNativePlatform()) return;
    await Haptics.notification({ type: NotificationType.Error });
  },

  warning: async () => {
    if (!Capacitor.isNativePlatform()) return;
    await Haptics.notification({ type: NotificationType.Warning });
  },

  selection: async () => {
    if (!Capacitor.isNativePlatform()) return;
    await Haptics.selectionStart();
  },
};
