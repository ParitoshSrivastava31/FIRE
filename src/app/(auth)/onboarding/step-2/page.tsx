"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Plus, Minus, TrendingUp } from "lucide-react";

const EXPENSE_CATEGORIES = [
  { key: "food", emoji: "🍽️", label: "Food & Dining", default: 8000 },
  { key: "housing", emoji: "🏠", label: "Housing / Rent / EMI", default: 15000 },
  { key: "transport", emoji: "🚗", label: "Transport", default: 4000 },
  { key: "entertainment", emoji: "🎬", label: "Entertainment / OTT", default: 2500 },
  { key: "healthcare", emoji: "🏥", label: "Healthcare & Insurance", default: 2000 },
  { key: "shopping", emoji: "👗", label: "Shopping", default: 3500 },
  { key: "loans", emoji: "💳", label: "Loans / EMIs", default: 0 },
  { key: "education", emoji: "📚", label: "Education", default: 1500 },
  { key: "savings", emoji: "💰", label: "Existing Savings / SIPs", default: 5000 },
];

function formatINR(val: number) {
  return `₹${val.toLocaleString("en-IN")}`;
}

function getSavingsRateColor(rate: number) {
  if (rate < 10) return "bg-[var(--red)]";
  if (rate < 25) return "bg-[var(--gold)]";
  return "bg-[var(--emerald)]";
}

function getSavingsRateLabel(rate: number) {
  if (rate < 10) return "Critical — Too low";
  if (rate < 25) return "Fair — Room to improve";
  return "Healthy — Great work!";
}

export default function OnboardingStep2() {
  const router = useRouter();
  const [income, setIncome] = useState(120000);
  const [otherIncome, setOtherIncome] = useState(0);
  const [isIrregular, setIsIrregular] = useState(false);

  const [expenses, setExpenses] = useState<Record<string, number>>(
    Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.key, c.default]))
  );

  const totalExpenses = useMemo(() => Object.values(expenses).reduce((s, v) => s + v, 0), [expenses]);
  const totalIncome = income + otherIncome;
  const surplus = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((surplus / totalIncome) * 100) : 0;

  const handleExpenseChange = (key: string, delta: number) => {
    setExpenses((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) + delta) }));
  };

  const handleExpenseInput = (key: string, value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, "")) || 0;
    setExpenses((prev) => ({ ...prev, [key]: num }));
  };

  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (totalIncome <= 0) {
      setError("Please enter a valid monthly income greater than ₹0.");
      return false;
    }
    
    // Check reasonable maximum bounds (e.g. max 10 Crore / mo) to avoid schema overflow
    const maxBound = 100000000;
    if (income > maxBound || otherIncome > maxBound) {
      setError("Income amount exceeds maximum allowed limit.");
      return false;
    }

    const hasExcessiveExpense = Object.values(expenses).some(v => v > maxBound);
    if (hasExcessiveExpense) {
      setError("One or more expenses exceed the maximum allowed limit.");
      return false;
    }

    if (totalExpenses > totalIncome * 5) {
       setError("Expenses are highly disproportionate to income. Please review them.");
       return false;
    }

    setError(null);
    return true;
  };

  const handleNext = () => {
    if (!validateForm()) return;
    sessionStorage.setItem(
      "onboarding_step2",
      JSON.stringify({ income, otherIncome, isIrregular, expenses })
    );
    router.push("/onboarding/step-3");
  };

  return (
    <div className="space-y-8 animate-fadeUp">
      <div>
        <p className="text-[var(--gold)] text-xs font-bold tracking-widest uppercase mb-2">Step 2 — Income & Expenses</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text-main)] leading-tight">
          What does your money look like?
        </h1>
        <p className="text-[var(--text-sec)] mt-2 text-sm">
          Your investable surplus is calculated live as you fill this in.
        </p>
      </div>

      {/* Income Section */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
        <h2 className="font-bold text-[var(--text-main)] text-sm uppercase tracking-widest">Income</h2>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[var(--text-main)]">Monthly Take-Home (post-tax)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-mono">₹</span>
            <input
              type="number"
              className="w-full h-12 pl-8 pr-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-mono text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all"
              value={income}
              onChange={(e) => setIncome(parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[var(--text-main)]">Other Income (rent, freelance, dividends)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-mono">₹</span>
            <input
              type="number"
              className="w-full h-12 pl-8 pr-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-mono text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all"
              value={otherIncome}
              onChange={(e) => setOtherIncome(parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setIsIrregular(!isIrregular)}
            className={`w-10 h-6 rounded-full transition-colors relative ${isIrregular ? "bg-[var(--gold)]" : "bg-[var(--border)]"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${isIrregular ? "left-5" : "left-1"}`} />
          </div>
          <span className="text-sm text-[var(--text-sec)] group-hover:text-[var(--text-main)] transition-colors">
            My income is irregular (freelance / business)
          </span>
        </label>
      </div>

      {/* Expenses Section */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[var(--text-main)] text-sm uppercase tracking-widest">Monthly Expenses</h2>
          <span className="text-xs text-[var(--text-muted)]">Adjust to your actual spend</span>
        </div>

        <div className="space-y-3">
          {EXPENSE_CATEGORIES.map((cat) => (
            <div key={cat.key} className="flex items-center gap-3">
              <span className="text-xl w-8 shrink-0">{cat.emoji}</span>
              <span className="text-sm text-[var(--text-sec)] flex-1 min-w-0 truncate">{cat.label}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExpenseChange(cat.key, -1000)}
                  className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--text-main)] transition-all"
                >
                  <Minus size={12} />
                </button>
                <input
                  type="text"
                  className="w-24 h-8 text-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)] transition-all"
                  value={`₹${(expenses[cat.key] || 0).toLocaleString("en-IN")}`}
                  onChange={(e) => handleExpenseInput(cat.key, e.target.value)}
                />
                <button
                  onClick={() => handleExpenseChange(cat.key, 1000)}
                  className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--text-main)] transition-all"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Summary */}
      <div className={`rounded-2xl border-2 p-6 space-y-4 ${surplus >= 0 ? "border-[var(--emerald)]/30 bg-[var(--emerald-dim)]" : "border-[var(--red)]/30 bg-[var(--red)]/8"}`}>
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className={surplus >= 0 ? "text-[var(--emerald)]" : "text-[var(--red)]"} />
          <span className="font-bold text-sm text-[var(--text-main)]">Live Surplus Calculation</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)] mb-1">Total Income</p>
            <p className="font-mono text-lg font-bold text-[var(--text-main)]">{formatINR(totalIncome)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)] mb-1">Total Expenses</p>
            <p className="font-mono text-lg font-bold text-[var(--text-main)]">{formatINR(totalExpenses)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)] mb-1">Monthly Surplus</p>
            <p className={`font-mono text-lg font-bold ${surplus >= 0 ? "text-[var(--emerald)]" : "text-[var(--red)]"}`}>
              {surplus >= 0 ? "+" : ""}{formatINR(surplus)}
            </p>
          </div>
        </div>
        {/* Savings Rate Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] font-medium">Savings Rate</span>
            <span className={`font-bold ${savingsRate >= 25 ? "text-[var(--emerald)]" : savingsRate >= 10 ? "text-[var(--gold)]" : "text-[var(--red)]"}`}>
              {savingsRate}% — {getSavingsRateLabel(savingsRate)}
            </span>
          </div>
          <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getSavingsRateColor(savingsRate)}`}
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
        </div>
      </div>
      
      {error && <div className="p-4 bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-xl text-[var(--red)] text-sm font-medium animate-shake">{error}</div>}

      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="h-12 px-6 border border-[var(--border)] bg-[var(--card)] text-[var(--text-main)] font-semibold text-sm rounded-xl hover:border-[var(--border-light)] transition-all flex items-center gap-2"
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 h-12 bg-[var(--gold)] text-white font-bold text-sm rounded-xl hover:opacity-90 hover:shadow-lg hover:-translate-y-[1px] transition-all flex items-center justify-center gap-2"
        >
          Continue to Goals
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
