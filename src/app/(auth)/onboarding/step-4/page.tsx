'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { haptic } from '@/lib/native/haptics';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const RISK_QUESTIONS = [
  {
    id: 'q1',
    question: 'Your portfolio drops 20% in a month. What do you do?',
    options: [
      { label: 'Sell everything immediately', value: 0 },
      { label: 'Sell some to reduce risk', value: 1 },
      { label: 'Hold and wait it out', value: 2 },
      { label: 'Buy more — it\'s a discount', value: 3 },
    ],
  },
  {
    id: 'q2',
    question: 'How long can you leave this money invested?',
    options: [
      { label: 'Less than 2 years', value: 0 },
      { label: '2–5 years', value: 1 },
      { label: '5–10 years', value: 2 },
      { label: 'More than 10 years', value: 3 },
    ],
  },
  {
    id: 'q3',
    question: 'You get a ₹2L bonus. You invest it in:',
    options: [
      { label: 'Fixed Deposit (safe, low returns)', value: 0 },
      { label: 'Balance mutual funds (mix)', value: 1 },
      { label: 'Large-cap equity funds', value: 2 },
      { label: 'Small/mid-cap or international funds', value: 3 },
    ],
  },
  {
    id: 'q4',
    question: 'What\'s your primary financial goal right now?',
    options: [
      { label: 'Preserve what I have', value: 0 },
      { label: 'Steady, predictable growth', value: 1 },
      { label: 'Grow wealth over time', value: 2 },
      { label: 'Maximum growth, I can handle swings', value: 3 },
    ],
  },
  {
    id: 'q5',
    question: 'How much of your income can you invest monthly without stress?',
    options: [
      { label: 'Less than 10%', value: 0 },
      { label: '10–20%', value: 1 },
      { label: '20–30%', value: 2 },
      { label: 'More than 30%', value: 3 },
    ],
  },
];

const RISK_LABELS = {
  conservative: { label: 'Conservative', emoji: '🛡️', color: 'var(--blue)', desc: 'You prioritise safety. We\'ll lean on debt funds, FDs, and Sovereign Gold Bonds.' },
  moderate: { label: 'Moderate', emoji: '⚖️', color: 'var(--emerald)', desc: 'Balanced approach. Mix of equity and debt — steady growth with managed risk.' },
  aggressive: { label: 'Aggressive', emoji: '🚀', color: 'var(--gold)', desc: 'Growth-first mindset. Heavy equity, small/mid-caps, and international funds.' },
};

// Step-4 covers micro-screens 9–10: Risk profile + Celebration
export default function OnboardingStep4() {
  const router = useRouter();
  const {
    step, riskProfile, fullName, monthlyIncome, expenses,
    selectedGoalTypes, addRiskAnswer, setStep, nextStep
  } = useOnboardingStore();

  const [currentQ, setCurrentQ] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (step < 9) setStep(9);
  }, []);

  const surplus = (() => {
    const income = parseInt(monthlyIncome) || 0;
    const totalExp = expenses.reduce((s, e) => s + (parseInt(e.amount) || 0), 0);
    return income - totalExp;
  })();

  const handleAnswer = async (value: number) => {
    await haptic.light();
    addRiskAnswer(value);
    if (currentQ < RISK_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // All questions answered — move to celebration screen
      nextStep(); // step becomes 10
      setStep(10);
    }
  };

  const handleComplete = async () => {
    await haptic.success();
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('users').upsert({
          id: user.id,
          onboarding_complete: true,
          full_name: fullName,
          monthly_income: parseInt(monthlyIncome) || 0,
          risk_profile: riskProfile,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to save onboarding:', err);
    }

    setIsSaving(false);
    router.push('/dashboard');
  };

  // ── Screen 9: Risk Questions (one at a time) ────────────────────────────────
  if (step === 9) {
    const question = RISK_QUESTIONS[currentQ];
    const progress = `${currentQ + 1} / ${RISK_QUESTIONS.length}`;

    return (
      <div className="flex flex-col min-h-full px-6 pt-6 pb-8 animate-slideInRight">
        <div className="space-y-2 mb-8">
          <p className="section-label text-[var(--gold)]">{progress} — Risk Profile</p>
          <h2 className="font-serif text-2xl text-[var(--text-main)] leading-tight">{question.question}</h2>
        </div>

        <div className="flex-1 space-y-3">
          {question.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleAnswer(opt.value)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] text-left transition-all duration-200 active:scale-[0.99] hover:border-[var(--gold)]/40 hover:bg-[var(--gold-dim)]"
            >
              <div className="w-6 h-6 rounded-full border-2 border-[var(--border)] flex-shrink-0" />
              <span className="text-sm font-medium text-[var(--text-main)]">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Screen 10: Celebration ──────────────────────────────────────────────────
  if (step === 10 && riskProfile) {
    const profileData = RISK_LABELS[riskProfile];

    return (
      <div className="flex flex-col min-h-full px-6 pt-8 pb-8 animate-slideInRight">
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-[var(--gold-dim)] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-[var(--gold)]" />
            </div>
            <h2 className="font-serif text-3xl text-[var(--text-main)]">
              {fullName.split(' ')[0]}&apos;s<br />Financial Snapshot
            </h2>
            <p className="text-sm text-[var(--text-muted)]">Your personalised wealth plan is ready</p>
          </div>

          {/* Summary cards */}
          <div className="space-y-3">
            {surplus > 0 && (
              <div className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Monthly Investable</p>
                  <p className="font-mono text-xl font-bold text-[var(--emerald)] mt-0.5">
                    ₹{surplus.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="text-3xl">💰</span>
              </div>
            )}

            <div className="glass-card p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Risk Profile</p>
                <p className="text-lg font-bold mt-0.5" style={{ color: profileData.color }}>
                  {profileData.emoji} {profileData.label}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1 max-w-[200px] leading-relaxed">
                  {profileData.desc}
                </p>
              </div>
            </div>

            {selectedGoalTypes.length > 0 && (
              <div className="glass-card p-4">
                <p className="text-xs text-[var(--text-muted)] mb-2">Your Goals</p>
                <div className="flex flex-wrap gap-2">
                  {selectedGoalTypes.map(g => (
                    <span key={g} className="px-3 py-1 rounded-full bg-[var(--gold-dim)] text-[var(--gold)] text-xs font-medium capitalize">
                      {g.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleComplete}
          disabled={isSaving}
          className="w-full btn-primary !py-4 flex items-center justify-center gap-2 text-base mt-6 disabled:opacity-60"
        >
          {isSaving ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : (
            <><Sparkles size={18} /> Generate My Plan</>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
