"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

const STEPS = [
  { number: 1, label: "Profile", path: "/onboarding/step-1" },
  { number: 2, label: "Income & Expenses", path: "/onboarding/step-2" },
  { number: 3, label: "Goals", path: "/onboarding/step-3" },
  { number: 4, label: "Risk Profile", path: "/onboarding/step-4" },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentStepNumber = STEPS.find((s) => pathname.startsWith(s.path))?.number ?? 1;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl text-[var(--gold)]">
            Monetra
          </Link>
          <span className="text-xs font-bold text-[var(--text-muted)] tracking-widest uppercase">
            Step {currentStepNumber} of 4
          </span>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-0">
            {STEPS.map((step, index) => {
              const isDone = currentStepNumber > step.number;
              const isActive = currentStepNumber === step.number;
              return (
                <React.Fragment key={step.number}>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? "bg-[var(--emerald)] text-white"
                          : isActive
                          ? "bg-[var(--gold)] text-white"
                          : "bg-[var(--border)] text-[var(--text-muted)]"
                      }`}
                    >
                      {isDone ? <Check size={13} strokeWidth={2.5} /> : step.number}
                    </div>
                    <span
                      className={`hidden sm:block text-xs font-semibold transition-colors ${
                        isActive
                          ? "text-[var(--text-main)]"
                          : isDone
                          ? "text-[var(--emerald)]"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-[2px] mx-3 transition-colors ${
                        isDone ? "bg-[var(--emerald)]" : "bg-[var(--border)]"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-start py-8 px-4 sm:px-6">
        <div className="w-full max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
