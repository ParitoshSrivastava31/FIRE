'use client';

import { useOnboardingStore } from '@/store/useOnboardingStore';

export function OnboardingProgress() {
  const { step, totalSteps } = useOnboardingStore();
  const pct = Math.min((step / totalSteps) * 100, 100);

  return (
    <div className="w-full px-5 pt-3">
      <div className="w-full h-1 bg-[var(--border-light)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--gold)] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
