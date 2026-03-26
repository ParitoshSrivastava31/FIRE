'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { haptic } from '@/lib/native/haptics';
import { ArrowRight, IndianRupee } from 'lucide-react';

const GOAL_OPTIONS = [
  { id: 'home', label: 'Buy a Home', emoji: '🏠', desc: 'Own your dream property' },
  { id: 'car', label: 'Buy a Car', emoji: '🚗', desc: 'Upgrade your ride' },
  { id: 'retirement', label: 'Retire Early', emoji: '🌴', desc: 'Financial freedom at 45-50' },
  { id: 'education', label: 'Children\'s Education', emoji: '🎓', desc: 'College fund for your kids' },
  { id: 'wedding', label: 'Wedding', emoji: '💒', desc: 'Plan the big day' },
  { id: 'travel', label: 'World Travel', emoji: '🌍', desc: 'Experience the world' },
  { id: 'startup', label: 'Start a Business', emoji: '🚀', desc: 'Launch your own venture' },
  { id: 'emergency', label: 'Emergency Fund', emoji: '🛡️', desc: '6 months of expenses, saved' },
];

// Step-3 covers micro-screens 7–8: Goal selection + Goal targets
export default function OnboardingStep3() {
  const router = useRouter();
  const {
    step, selectedGoalTypes, goals, monthlyIncome, setField, nextStep, setStep
  } = useOnboardingStore();

  const [localGoals, setLocalGoals] = useState(goals);
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);

  useEffect(() => {
    if (step < 7) setStep(7);
    if (step > 8) router.push('/onboarding/step-4');
  }, []);

  const toggleGoal = async (goalId: string) => {
    await haptic.light();
    const current = [...selectedGoalTypes];
    const idx = current.indexOf(goalId);
    let updated: string[];
    if (idx >= 0) {
      updated = current.filter(g => g !== goalId);
    } else {
      updated = [...current, goalId];
    }
    setField('selectedGoalTypes', updated);
  };

  const advance = async () => {
    await haptic.medium();
    nextStep();
    if (step === 8) router.push('/onboarding/step-4');
  };

  // ── Screen 7: Goal Selection (multi-select) ─────────────────────────────────
  if (step === 7) {
    return (
      <div className="flex flex-col min-h-full px-6 pt-8 pb-8 animate-slideInRight">
        <div className="space-y-2 mb-6">
          <p className="text-5xl mb-2">🎯</p>
          <h2 className="font-serif text-3xl text-[var(--text-main)] leading-tight">What are you saving for?</h2>
          <p className="text-sm text-[var(--text-muted)]">Select all that apply — we&apos;ll build a plan for each</p>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-2.5 content-start overflow-y-auto hide-scrollbar pb-4">
          {GOAL_OPTIONS.map((goal) => {
            const isSelected = selectedGoalTypes.includes(goal.id);
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all duration-200 active:scale-95 text-left ${
                  isSelected
                    ? 'border-[var(--gold)] bg-[var(--gold-dim)]'
                    : 'border-[var(--border)] bg-[var(--surface)]'
                }`}
              >
                <span className="text-3xl mb-2">{goal.emoji}</span>
                <span className={`text-xs font-bold block ${isSelected ? 'text-[var(--gold)]' : 'text-[var(--text-main)]'}`}>
                  {goal.label}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{goal.desc}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={advance}
          disabled={selectedGoalTypes.length === 0}
          className="w-full btn-primary !py-4 flex items-center justify-center gap-2 text-base mt-4 disabled:opacity-40 disabled:pointer-events-none"
        >
          Set My Goals ({selectedGoalTypes.length}) <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // ── Screen 8: Goal Targets ──────────────────────────────────────────────────
  if (step === 8) {
    const selectedGoalData = GOAL_OPTIONS.filter(g => selectedGoalTypes.includes(g.id));
    const currentGoal = selectedGoalData[currentGoalIndex];
    const storedGoal = localGoals.find(g => g.id === currentGoal?.id) || {
      id: currentGoal?.id || '',
      name: currentGoal?.label || '',
      targetAmount: '',
      targetYear: '',
    };

    if (!currentGoal) {
      advance();
      return null;
    }

    const updateCurrentGoal = (field: 'targetAmount' | 'targetYear', value: string) => {
      const updated = [...localGoals];
      const idx = updated.findIndex(g => g.id === currentGoal.id);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], [field]: value };
      } else {
        updated.push({ id: currentGoal.id, name: currentGoal.label, targetAmount: '', targetYear: '', [field]: value } as any);
      }
      setLocalGoals(updated);
      setField('goals', updated);
    };

    const advanceGoal = async () => {
      await haptic.light();
      if (currentGoalIndex < selectedGoalData.length - 1) {
        setCurrentGoalIndex(currentGoalIndex + 1);
      } else {
        advance();
      }
    };

    return (
      <div className="flex flex-col min-h-full px-6 pt-8 pb-8 animate-slideInRight">
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{currentGoal.emoji}</span>
            <div>
              <p className="text-xs text-[var(--text-muted)] font-medium">{currentGoalIndex + 1} of {selectedGoalData.length}</p>
              <h2 className="font-serif text-2xl text-[var(--text-main)]">{currentGoal.label}</h2>
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)]">How much do you need, and by when?</p>
        </div>

        <div className="flex-1 space-y-5 pt-4">
          <div className="space-y-1.5">
            <label className="section-label">Target Amount</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--gold)] font-semibold">
                <IndianRupee size={16} />
              </div>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                className="input-premium !py-4 !pl-9 !text-xl !font-mono font-bold"
                value={storedGoal.targetAmount}
                onChange={(e) => updateCurrentGoal('targetAmount', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="section-label">Target Year</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder={String(new Date().getFullYear() + 5)}
              min={new Date().getFullYear() + 1}
              max={new Date().getFullYear() + 50}
              className="input-premium !py-4 !text-xl font-mono"
              value={storedGoal.targetYear}
              onChange={(e) => updateCurrentGoal('targetYear', e.target.value)}
            />
          </div>

          {storedGoal.targetAmount && storedGoal.targetYear && (
            <div className="glass-card p-4 animate-fadeUp space-y-1">
              <p className="text-xs text-[var(--text-muted)]">Monthly SIP needed (est. 12% CAGR)</p>
              <p className="font-mono text-lg font-bold text-[var(--emerald)]">
                ₹{Math.round(
                  (parseInt(storedGoal.targetAmount) * 0.01) /
                  (Math.pow(1.01, (parseInt(storedGoal.targetYear) - new Date().getFullYear()) * 12) - 1)
                ).toLocaleString('en-IN')}/mo
              </p>
            </div>
          )}
        </div>

        <button
          onClick={advanceGoal}
          className="w-full btn-primary !py-4 flex items-center justify-center gap-2 text-base mt-6"
        >
          {currentGoalIndex < selectedGoalData.length - 1 ? 'Next Goal' : 'Continue'}
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return null;
}
