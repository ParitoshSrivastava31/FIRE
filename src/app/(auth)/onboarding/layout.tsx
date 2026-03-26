'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { OnboardingProgress } from '@/components/onboarding/progress-bar';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { haptic } from '@/lib/native/haptics';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { step, prevStep } = useOnboardingStore();

  const handleBack = async () => {
    await haptic.light();
    if (step <= 1) {
      router.push('/login');
    } else {
      prevStep();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[var(--background)]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Top bar: back button + progress */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 shrink-0">
        <button
          onClick={handleBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-main)] transition-all duration-200 active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <OnboardingProgress />
        </div>
      </div>

      {/* Main content area */}
      <div
        className="flex-1 overflow-y-auto hide-scrollbar"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
      >
        {children}
      </div>
    </div>
  );
}
