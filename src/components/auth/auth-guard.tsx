'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * AuthGuard — client-side auth protection for dashboard routes.
 *
 * Replaces the server middleware.ts which doesn't run on native Capacitor builds
 * since the app is a static export.
 *
 * Checks:
 * 1. If no session → redirect to /login
 * 2. If session but onboarding_complete = false → redirect to /onboarding/step-1
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login');
        return;
      }

      // Check onboarding gate
      const { data: userProfile } = await supabase
        .from('users')
        .select('onboarding_complete')
        .eq('id', session.user.id)
        .single();

      if (userProfile && !userProfile.onboarding_complete) {
        router.replace('/onboarding/step-1');
        return;
      }
    };

    checkAuth();

    // Also listen for auth state changes (logout from another tab, token expiry)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
