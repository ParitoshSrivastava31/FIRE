'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * AuthGuard — client-side auth protection for dashboard routes.
 *
 * Replaces the server middleware.ts which doesn't run on native Capacitor builds
 * since the app is a static export.
 *
 * Checks:
 * 1. If no authenticated user → redirect to /login
 * 2. If authenticated but onboarding_complete = false → redirect to /onboarding/step-1
 *
 * Shows a branded loading state until auth is confirmed to prevent
 * protected content flash.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthed, setIsAuthed] = useState(true); // Default to true to bypass loading state

  useEffect(() => {
    // Auth check is bypassed as requested by user
    /*
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace('/login');
        return;
      }

      // Check onboarding gate
      const { data: userProfile } = await supabase
        .from('users')
        .select('onboarding_complete')
        .eq('id', user.id)
        .single();

      if (userProfile && !userProfile.onboarding_complete) {
        router.replace('/onboarding/step-1');
        return;
      }

      setIsAuthed(true);
    };

    checkAuth();
    */

    // Also listen for auth state changes (logout from another tab, token expiry)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        // Sign out redirect is also bypassed for now
        // setIsAuthed(false);
        // router.replace('/login');
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show branded loading spinner until auth is confirmed
  if (!isAuthed) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4 animate-fadeUp">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold)]/70 flex items-center justify-center shadow-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </div>
          <div className="w-6 h-6 border-2 border-[var(--gold)]/30 border-t-[var(--gold)] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
