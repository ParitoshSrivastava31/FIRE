'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { haptic } from '@/lib/native/haptics';
import { ArrowRight, IndianRupee } from 'lucide-react';

function formatCurrency(val: string): string {
  const n = parseInt(val.replace(/,/g, ''), 10);
  if (isNaN(n)) return '';
  return n.toLocaleString('en-IN');
}

// Step-2 handles micro-screens 5–6: Income & Expenses
export default function OnboardingStep2() {
  const router = useRouter();
  const { step, monthlyIncome, expenses, setField, nextStep, setStep } = useOnboardingStore();

  // All hooks must be called unconditionally at the top level
  const [rawInput, setRawInput] = useState(monthlyIncome.replace(/,/g, ''));
  const [localExpenses, setLocalExpenses] = useState(
    expenses.map(e => ({ ...e, amount: e.amount || '' }))
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (step < 5) setStep(5);
    if (step > 6) router.push('/onboarding/step-3');
  }, []);

  // Sync rawInput when monthlyIncome changes externally
  useEffect(() => {
    setRawInput(monthlyIncome.replace(/,/g, ''));
  }, [monthlyIncome]);

  // Sync localExpenses when expenses change externally
  useEffect(() => {
    setLocalExpenses(expenses.map(e => ({ ...e, amount: e.amount || '' })));
  }, [expenses]);

  const advance = async () => {
    await haptic.medium();
    nextStep();
    if (step === 6) router.push('/onboarding/step-3');
  };

  // ── Screen 5: Monthly Income ────────────────────────────────────────────────
  if (step === 5) {
    const handleChange = (val: string) => {
      const digits = val.replace(/\D/g, '');
      setRawInput(digits);
      setField('monthlyIncome', digits);
    };

    return (
      <div className="flex flex-col min-h-full px-6 pt-8 pb-8 animate-slideInRight">
        <div className="flex-1 space-y-3">
          <p className="text-5xl mb-2">💰</p>
          <h2 className="font-serif text-3xl text-[var(--text-main)] leading-tight">
            What&apos;s your take-home salary?
          </h2>
          <p className="text-sm text-[var(--text-muted)]">Monthly, after taxes. This stays private and secure.</p>
        </div>
        <div className="space-y-6 pt-8">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[var(--gold)] font-semibold">
              <IndianRupee size={18} />
            </div>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              className="input-premium !py-5 !pl-10 !text-2xl !font-mono font-bold"
              value={rawInput}
              onChange={(e) => handleChange(e.target.value)}
              autoFocus
            />
          </div>
          {rawInput && parseInt(rawInput) > 0 && (
            <div className="glass-card p-4 text-center animate-fadeUp">
              <p className="text-xs text-[var(--text-muted)] mb-1">Annual CTC (est.)</p>
              <p className="font-mono text-xl font-bold text-[var(--emerald)]">
                ₹{formatCurrency(String(parseInt(rawInput) * 12))}
              </p>
            </div>
          )}
          <button
            onClick={advance}
            disabled={!monthlyIncome || parseInt(monthlyIncome) < 1000}
            className="w-full btn-primary !py-4 flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:pointer-events-none"
          >
            Continue <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ── Screen 6: Expenses ──────────────────────────────────────────────────────
  if (step === 6) {
    const income = parseInt(monthlyIncome) || 50000;
    const totalExpenses = localExpenses.reduce((sum, e) => sum + (parseInt(e.amount) || 0), 0);
    const surplus = income - totalExpenses;

    const updateExpense = async (id: string, amount: string) => {
      const updated = localExpenses.map(e => e.id === id ? { ...e, amount } : e);
      setLocalExpenses(updated);
      setField('expenses', updated);
    };

    return (
      <div className="flex flex-col min-h-full px-6 pt-8 pb-8 animate-slideInRight">
        <div className="space-y-2 mb-6">
          <p className="text-5xl mb-2">📊</p>
          <h2 className="font-serif text-3xl text-[var(--text-main)] leading-tight">Monthly expenses?</h2>
          <p className="text-sm text-[var(--text-muted)]">Rough estimates are fine — adjust anytime later</p>
        </div>

        {/* Live surplus tracker */}
        <div className={`glass-card p-4 mb-5 flex items-center justify-between ${surplus > 0 ? 'border-[var(--emerald)]/30' : 'border-[var(--red)]/30'}`}>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Monthly Investable Surplus</p>
            <p className={`font-mono text-2xl font-bold ${surplus > 0 ? 'text-[var(--emerald)]' : 'text-red-500'}`}>
              ₹{Math.abs(surplus).toLocaleString('en-IN')}
            </p>
          </div>
          <p className="text-xs text-[var(--text-muted)] text-right">
            ₹{income.toLocaleString('en-IN')}<br/>
            <span className="text-[var(--text-sec)]">income</span>
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto hide-scrollbar">
          {localExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center gap-3 glass-card p-3.5">
              <span className="text-sm font-medium text-[var(--text-main)] flex-1 min-w-0 truncate">{expense.category}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-muted)] font-mono">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  className="w-24 text-right py-1.5 px-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm font-mono focus:outline-none focus:border-[var(--gold)] transition-colors"
                  value={expense.amount}
                  onChange={(e) => updateExpense(expense.id, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={advance}
          className="w-full btn-primary !py-4 flex items-center justify-center gap-2 text-base mt-5"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return null;
}
