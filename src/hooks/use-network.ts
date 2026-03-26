'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Network status hook.
 * On native: uses Capacitor Network plugin for real connectivity events.
 * On web: uses browser's navigator.onLine + window events.
 *
 * Usage:
 *   const { isOnline, connectionType } = useNetwork();
 */
export function useNetwork() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Dynamic import to avoid SSR issues
      import('@capacitor/network').then(({ Network }) => {
        // Get current status
        Network.getStatus().then((status) => {
          setIsOnline(status.connected);
          setConnectionType(status.connectionType);
        });

        // Listen for changes
        const listenerPromise = Network.addListener('networkStatusChange', (status) => {
          setIsOnline(status.connected);
          setConnectionType(status.connectionType);
        });

        return () => {
          listenerPromise.then((l) => l.remove());
        };
      });
    } else {
      // Web fallback
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      setIsOnline(navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return { isOnline, connectionType };
}
