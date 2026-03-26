'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { haptic } from '@/lib/native/haptics';
import { ArrowRight } from 'lucide-react';

const OCCUPATIONS = [
  { id: 'salaried', label: 'Salaried', emoji: '🏢', desc: 'Working at a company' },
  { id: 'freelancer', label: 'Freelancer', emoji: '💻', desc: 'Self-employed / consultant' },
  { id: 'business', label: 'Business Owner', emoji: '🏪', desc: 'Running my own business' },
  { id: 'student', label: 'Student', emoji: '🎓', desc: 'Studying / intern' },
];

// ── Screen definitions ────────────────────────────────────────────────────────
// Step-1 page handles screens 1–4 (Personal info)
// Step-2 handles screens 5–6 (Income & Expenses)
// Step-3 handles screens 7–8 (Goals)
// Step-4 handles screens 9–10 (Risk + Celebration)

export default function OnboardingStep1() {
  const router = useRouter();
  const { step, fullName, city, occupation, setField, nextStep, setStep } = useOnboardingStore();
  const [localName, setLocalName] = useState(fullName);
  const [localCity, setLocalCity] = useState(city);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  // On mount, go to the correct sub-screen based on store step
  useEffect(() => {
    if (step < 1) setStep(1);
    if (step > 4) router.push('/onboarding/step-2');
  }, []);

  const advance = async () => {
    await haptic.medium();
    setDirection('forward');
    if (step === 4 && !occupation) return;
    nextStep();
    if (step === 4) router.push('/onboarding/step-2');
  };

  const animClass = direction === 'forward' ? 'animate-slideInRight' : 'animate-slideInLeft';

  // ── Screen 1: Name ──────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className={`flex flex-col min-h-full px-6 pt-8 pb-8 ${animClass}`}>
        <div className="flex-1 space-y-3">
          <p className="text-5xl mb-2">👋</p>
          <h2 className="font-serif text-3xl text-[var(--text-main)] leading-tight">What&apos;s your name?</h2>
          <p className="text-sm text-[var(--text-muted)]">We&apos;ll personalise your experience</p>
        </div>
        <div className="space-y-6 pt-8">
          <input
            type="text"
            placeholder="Your full name"
            className="input-premium !py-4 !text-lg"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={() => setField('fullName', localName)}
            autoFocus
            autoComplete="name"
          />
          <button
            onClick={advance}
            disabled={!localName.trim()}
            className="w-full btn-primary !py-4 flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:pointer-events-none"
          >
            Continue <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ── Screen 2: Date of Birth ─────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className={`flex flex-col min-h-full px-6 pt-8 pb-8 ${animClass}`}>
        <div className="flex-1 space-y-3">
          <p className="text-5xl mb-2">🎂</p>
          <h2 className="font-serif text-3xl text-[var(--text-main)] leading-tight">
            Hi {fullName.split(' ')[0]}!<br />How old are you?
          </h2>
          <p className="text-sm text-[var(--text-muted)]">Helps us tailor your retirement & goal timelines</p>
        </div>
        <div className="space-y-6 pt-8">
          <div className="space-y-1.5">
            <label className="section-label">Date of Birth</label>
            <input
              type="date"
              className="input-premium !py-4"
              defaultValue={useOnboardingStore.getState().dateOfBirth}
              onChange={(e) => setField('dateOfBirth', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button onClick={advance} className="w-full btn-primary !py-4 flex items-center justify-center gap-2 text-base">
            Continue <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ── Screen 3: City ──────────────────────────────────────────────────────────
  if (step === 3) {
    const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Chandigarh', 'Indore', 'Bhopal', 'Nagpur', 'Noida', 'Gurgaon', 'Kochi', 'Coimbatore', 'Other'];
    const [search, setSearch] = useState('');
    const filtered = CITIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

    return (
      <div className={`flex flex-col min-h-full px-6 pt-8 pb-8 ${animClass}`}>
        <div className="space-y-3 mb-6">
          <p className="text-5xl mb-2">🏙️</p>
          <h2 className="font-serif text-3xl text-[var(--text-main)] leading-tight">Which city do you live in?</h2>
          <p className="text-sm text-[var(--text-muted)]">We localise real estate data and cost of living to your city</p>
        </div>
        <input
          type="text"
          placeholder="Search city..."
          className="input-premium !py-3.5 mb-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex-1 overflow-y-auto hide-scrollbar grid grid-cols-2 gap-2 content-start pb-4">
          {filtered.map((c) => (
            <button
              key={c}
              onClick={async () => {
                await haptic.light();
                setField('city', c);
                setLocalCity(c);
              }}
              className={`py-3 px-4 rounded-xl text-sm font-medium text-left transition-all duration-200 active:scale-95 ${
                localCity === c || city === c
                  ? 'bg-[var(--gold)] text-white shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--text-main)] hover:bg-[var(--surface-hover)] border border-[var(--border)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          onClick={advance}
          disabled={!city && !localCity}
          className="w-full btn-primary !py-4 flex items-center justify-center gap-2 text-base mt-4 disabled:opacity-40 disabled:pointer-events-none"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // ── Screen 4: Occupation ────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className={`flex flex-col min-h-full px-6 pt-8 pb-8 ${animClass}`}>
        <div className="space-y-3 mb-8">
          <p className="text-5xl mb-2">💼</p>
          <h2 className="font-serif text-3xl text-[var(--text-main)] leading-tight">What do you do for work?</h2>
          <p className="text-sm text-[var(--text-muted)]">This shapes your tax strategy and income patterns</p>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3">
          {OCCUPATIONS.map((occ) => (
            <button
              key={occ.id}
              onClick={async () => {
                await haptic.light();
                setField('occupation', occ.id);
              }}
              className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all duration-200 active:scale-95 text-left ${
                occupation === occ.id
                  ? 'border-[var(--gold)] bg-[var(--gold-dim)]'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-light)]'
              }`}
            >
              <span className="text-3xl mb-2">{occ.emoji}</span>
              <span className={`text-sm font-semibold block ${occupation === occ.id ? 'text-[var(--gold)]' : 'text-[var(--text-main)]'}`}>
                {occ.label}
              </span>
              <span className="text-xs text-[var(--text-muted)] mt-0.5">{occ.desc}</span>
            </button>
          ))}
        </div>
        <button
          onClick={advance}
          disabled={!occupation}
          className="w-full btn-primary !py-4 flex items-center justify-center gap-2 text-base mt-6 disabled:opacity-40 disabled:pointer-events-none"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return null;
}
