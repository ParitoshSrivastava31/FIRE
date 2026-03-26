'use client';

import { useNetwork } from '@/hooks/use-network';
import { WifiOff } from 'lucide-react';

/**
 * Offline banner — shows a dismissible banner at the top when device is offline.
 * Use inside any layout that wraps main content.
 *
 * Indian mobile data is spotty — this is not optional UX.
 */
export function OfflineBanner() {
  const { isOnline } = useNetwork();

  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white"
      style={{ background: 'rgba(212, 82, 77, 0.95)', backdropFilter: 'blur(8px)' }}
    >
      <WifiOff size={13} />
      <span>You&apos;re offline — some features may not work</span>
    </div>
  );
}
