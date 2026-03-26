'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Keyboard visibility + height hook.
 * Apply `paddingBottom: keyboardHeight` to any scrollable form container
 * to prevent the keyboard from covering inputs.
 *
 * Usage:
 *   const { keyboardHeight, keyboardVisible } = useKeyboard();
 */
export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    import('@capacitor/keyboard').then(({ Keyboard }) => {
      const showPromise = Keyboard.addListener('keyboardWillShow', (info) => {
        setKeyboardHeight(info.keyboardHeight);
        setKeyboardVisible(true);
      });

      const hidePromise = Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardHeight(0);
        setKeyboardVisible(false);
      });

      return () => {
        showPromise.then((l) => l.remove());
        hidePromise.then((l) => l.remove());
      };
    });
  }, []);

  return { keyboardHeight, keyboardVisible };
}
