"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";

const QUESTIONS = [
  {
    id: "q1",
    question: "If your investment dropped 20% in a month, what would you do?",
    options: [
      { label: "Sell everything — I can't handle losses", value: "conservative" },
      { label: "Worry, but wait and watch for a quarter", value: "moderate" },
      { label: "Buy more — it's a discount!", value: "aggressive" },
    ],
  },
  {
    id: "q2",
    question: "What is your primary investment horizon?",
    options: [
      { label: "Less than 3 years", value: "conservative" },
      { label: "3–7 years", value: "moderate" },
      { label: "7+ years", value: "aggressive" },
    ],
  },
  {
    id: "q3",
    question: "What % of your surplus can you lock away for 5+ years?",
    options: [
      { label: "Less than 20%", value: "conservative" },
      { label: "20–50%", value: "moderate" },
      { label: "50%+", value: "aggressive" },
    ],
  },
  {
    id: "q4",
    question: "Have you invested in equities/mutual funds before?",
    options: [
      { label: "No, I'm a complete beginner", value: "conservative" },
      { label: "Yes, a little — SIP or a few stocks", value: "moderate" },
      { label: "Yes, actively — I track markets regularly", value: "aggressive" },
    ],
  },
  {
    id: "q5",
    question: "Do you prefer guaranteed returns or higher potential returns?",
    options: [
      { label: "Guaranteed — FD/RD safety first", value: "conservative" },
      { label: "Mix — some guaranteed, some growth", value: "moderate" },
      { label: "Higher potential — I understand volatility", value: "aggressive" },
    ],
  },
];

const INSTRUMENTS = [
  { id: "mf", emoji: "📊", label: "Mutual Funds / SIPs" },
  { id: "stocks", emoji: "📈", label: "Direct Stocks (NSE/BSE)" },
  { id: "gold", emoji: "🥇", label: "Gold (SGB / Gold ETF)" },
  { id: "fd", emoji: "🏦", label: "Fixed Deposits / RDs" },
  { id: "ppf", emoji: "🏛️", label: "PPF / NPS" },
  { id: "realestate", emoji: "🏘️", label: "Real Estate" },
  { id: "us", emoji: "🇺🇸", label: "US Stocks (via INDmoney/Vested)" },
  { id: "crypto", emoji: "₿", label: "Crypto (High risk)" },
];

function computeRiskProfile(answers: Record<string, string>): "conservative" | "moderate" | "aggressive" {
  const counts = { conservative: 0, moderate: 0, aggressive: 0 };
  Object.values(answers).forEach((v) => {
    counts[v as keyof typeof counts]++;
  });
  if (counts.aggressive >= 3) return "aggressive";
  if (counts.conservative >= 3) return "conservative";
  return "moderate";
}

const PROFILE_META = {
  conservative: {
    emoji: "🛡️",
    color: "text-[var(--blue)]",
    bg: "bg-[var(--blue-dim)] border-[var(--blue)]/20",
    label: "Conservative",
    desc: "Capital preservation first. FDs, debt MFs, and PPF dominate your portfolio with limited equity exposure.",
  },
  moderate: {
    emoji: "⚖️",
    color: "text-[var(--gold)]",
    bg: "bg-[var(--gold-glow)] border-[var(--gold)]/20",
    label: "Moderate",
    desc: "Balanced approach. 60% equity, 30% debt, 10% gold. Long-term wealth creation with controlled risk.",
  },
  aggressive: {
    emoji: "🚀",
    color: "text-[var(--emerald)]",
    bg: "bg-[var(--emerald-dim)] border-[var(--emerald)]/20",
    label: "Aggressive",
    desc: "Growth-first. 80%+ equity across small-cap, mid-cap, and international funds. Requires long horizon.",
  },
};

export default function OnboardingStep4() {
  const router = useRouter();
  const supabase = createClient();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(["mf", "fd"]);
  const [cryptoAcknowledged, setCryptoAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUESTIONS.length;
  const riskProfile = allAnswered ? computeRiskProfile(answers) : null;
  const profileMeta = riskProfile ? PROFILE_META[riskProfile] : null;

  const toggleInstrument = (id: string) => {
    if (id === "crypto" && !cryptoAcknowledged) return;
    setSelectedInstruments((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const step1 = JSON.parse(sessionStorage.getItem("onboarding_step1") || "{}");
      const step2 = JSON.parse(sessionStorage.getItem("onboarding_step2") || "{}");
      const step3 = JSON.parse(sessionStorage.getItem("onboarding_step3") || "{}");

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("users").upsert({
          id: user.id,
          full_name: step1.fullName,
          date_of_birth: step1.dob,
          city: step1.city,
          occupation: step1.occupation,
          monthly_income: step2.income,
          risk_profile: riskProfile,
          onboarding_complete: true,
        });
      }

      sessionStorage.removeItem("onboarding_step1");
      sessionStorage.removeItem("onboarding_step2");
      sessionStorage.removeItem("onboarding_step3");

      router.push("/dashboard");
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeUp">
      <div>
        <p className="text-[var(--gold)] text-xs font-bold tracking-widest uppercase mb-2">Step 4 — Risk Profile</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text-main)] leading-tight">
          How do you think about risk?
        </h1>
        <p className="text-[var(--text-sec)] mt-2 text-sm">
          Answer 5 quick questions — your AI thesis is calibrated to your risk profile.
        </p>
      </div>

      {/* Risk Quiz */}
      <div className="space-y-5">
        {QUESTIONS.map((q, idx) => (
          <div key={q.id} className={`bg-[var(--card)] border rounded-xl p-5 space-y-3 transition-all ${answers[q.id] ? "border-[var(--gold)]/40" : "border-[var(--border)]"}`}>
            <p className="font-semibold text-sm text-[var(--text-main)]">
              <span className="text-[var(--text-muted)] font-mono mr-2">{idx + 1}.</span>
              {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    answers[q.id] === opt.value
                      ? "border-[var(--gold)] bg-[var(--gold-glow)] text-[var(--text-main)] font-medium"
                      : "border-[var(--border)] text-[var(--text-sec)] hover:border-[var(--border-light)] hover:bg-[var(--card-hover)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${answers[q.id] === opt.value ? "border-[var(--gold)] bg-[var(--gold)]" : "border-[var(--border)]"}`}>
                      {answers[q.id] === opt.value && <Check size={9} className="text-white" strokeWidth={3} />}
                    </div>
                    {opt.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Risk Profile Result */}
      {riskProfile && profileMeta && (
        <div className={`border-2 rounded-2xl p-5 flex items-start gap-4 ${profileMeta.bg}`}>
          <span className="text-3xl">{profileMeta.emoji}</span>
          <div>
            <p className={`font-bold text-lg ${profileMeta.color}`}>{profileMeta.label} Investor</p>
            <p className="text-sm text-[var(--text-sec)] mt-1 leading-relaxed">{profileMeta.desc}</p>
          </div>
        </div>
      )}

      {/* Investment Preferences */}
      <div className="space-y-3">
        <div>
          <h2 className="font-bold text-sm text-[var(--text-main)] mb-1">Investment Preferences</h2>
          <p className="text-xs text-[var(--text-muted)]">Which instruments are you comfortable with?</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {INSTRUMENTS.map((inst) => {
            const isSelected = selectedInstruments.includes(inst.id);
            const isCrypto = inst.id === "crypto";
            return (
              <div key={inst.id} className="relative">
                <button
                  onClick={() => toggleInstrument(inst.id)}
                  disabled={isCrypto && !cryptoAcknowledged}
                  className={`w-full flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "border-[var(--gold)] bg-[var(--gold-glow)]"
                      : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-light)]"
                  } ${isCrypto && !cryptoAcknowledged ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <span className="text-xl">{inst.emoji}</span>
                  <span className="text-[11px] font-semibold text-[var(--text-sec)] leading-tight">{inst.label}</span>
                </button>
                {isCrypto && (
                  <div className="mt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cryptoAcknowledged}
                        onChange={(e) => {
                          setCryptoAcknowledged(e.target.checked);
                          if (!e.target.checked) {
                            setSelectedInstruments((prev) => prev.filter((i) => i !== "crypto"));
                          }
                        }}
                        className="w-3 h-3 accent-[var(--gold)]"
                      />
                      <span className="text-[10px] text-[var(--text-muted)]">I understand high risk</span>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="h-12 px-6 border border-[var(--border)] bg-[var(--card)] text-[var(--text-main)] font-semibold text-sm rounded-xl hover:border-[var(--border-light)] transition-all flex items-center gap-2"
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || isSubmitting}
          className="flex-1 h-12 bg-[var(--gold)] text-white font-bold text-sm rounded-xl hover:opacity-90 hover:shadow-lg hover:-translate-y-[1px] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating your thesis...
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Complete Setup & Go to Dashboard
            </>
          )}
        </button>
      </div>
    </div>
  );
}
