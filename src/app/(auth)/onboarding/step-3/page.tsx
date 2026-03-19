"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, X } from "lucide-react";

const GOAL_CARDS = [
  { id: "home", emoji: "🏠", label: "Buy a Home", defaultAmount: 5000000, defaultYear: new Date().getFullYear() + 7 },
  { id: "education", emoji: "🎓", label: "Children's Education", defaultAmount: 2000000, defaultYear: new Date().getFullYear() + 12 },
  { id: "vacation", emoji: "✈️", label: "Dream Vacation", defaultAmount: 300000, defaultYear: new Date().getFullYear() + 2 },
  { id: "business", emoji: "🚀", label: "Start a Business", defaultAmount: 1000000, defaultYear: new Date().getFullYear() + 5 },
  { id: "retirement", emoji: "🌴", label: "Early Retirement", defaultAmount: 30000000, defaultYear: new Date().getFullYear() + 20 },
  { id: "emergency", emoji: "🛡️", label: "Emergency Fund (6 months)", defaultAmount: 600000, defaultYear: new Date().getFullYear() + 1 },
  { id: "corpus", emoji: "👴", label: "Retirement Corpus", defaultAmount: 50000000, defaultYear: new Date().getFullYear() + 30 },
  { id: "wealth", emoji: "📈", label: "Wealth Creation", defaultAmount: 10000000, defaultYear: new Date().getFullYear() + 10 },
];

type GoalDetail = {
  id: string;
  amount: number;
  targetYear: number;
  progress: number;
};

function formatINR(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${val.toLocaleString("en-IN")}`;
}

export default function OnboardingStep3() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [goalDetails, setGoalDetails] = useState<Record<string, GoalDetail>>({});
  const [editingGoal, setEditingGoal] = useState<string | null>(null);

  const toggleGoal = (id: string) => {
    const card = GOAL_CARDS.find((g) => g.id === id)!;
    if (selectedGoals.includes(id)) {
      setSelectedGoals((prev) => prev.filter((g) => g !== id));
      const { [id]: _, ...rest } = goalDetails;
      setGoalDetails(rest);
      if (editingGoal === id) setEditingGoal(null);
    } else {
      setSelectedGoals((prev) => [...prev, id]);
      setGoalDetails((prev) => ({
        ...prev,
        [id]: { id, amount: card.defaultAmount, targetYear: card.defaultYear, progress: 0 },
      }));
      setEditingGoal(id);
    }
  };

  const updateGoalDetail = (id: string, field: keyof GoalDetail, value: number) => {
    setGoalDetails((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleNext = () => {
    sessionStorage.setItem(
      "onboarding_step3",
      JSON.stringify({ selectedGoals, goalDetails })
    );
    router.push("/onboarding/step-4");
  };

  return (
    <div className="space-y-8 animate-fadeUp">
      <div>
        <p className="text-[var(--gold)] text-xs font-bold tracking-widest uppercase mb-2">Step 3 — Financial Goals</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text-main)] leading-tight">
          What are you building towards?
        </h1>
        <p className="text-[var(--text-sec)] mt-2 text-sm">
          Select all that apply. These become the milestones in your AI investment thesis.
        </p>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {GOAL_CARDS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                isSelected
                  ? "border-[var(--gold)] bg-[var(--gold-glow)] shadow-sm ring-1 ring-[var(--gold)]/20"
                  : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-light)]"
              }`}
            >
              <span className="text-2xl">{goal.emoji}</span>
              <span className={`text-xs font-semibold leading-tight ${isSelected ? "text-[var(--gold)]" : "text-[var(--text-sec)]"}`}>
                {goal.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Goal Details for selected goals */}
      {selectedGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-sm text-[var(--text-muted)] uppercase tracking-widest">
            Goal Details ({selectedGoals.length} selected)
          </h2>
          {selectedGoals.map((goalId) => {
            const card = GOAL_CARDS.find((g) => g.id === goalId)!;
            const detail = goalDetails[goalId];
            const isOpen = editingGoal === goalId;
            return (
              <div key={goalId} className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--card-hover)] transition-colors"
                  onClick={() => setEditingGoal(isOpen ? null : goalId)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{card.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm text-[var(--text-main)]">{card.label}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {detail ? `${formatINR(detail.amount)} by ${detail.targetYear}` : "Set details"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <X
                      size={14}
                      className="text-[var(--text-muted)] hover:text-[var(--red)] transition-colors"
                      onClick={(e) => { e.stopPropagation(); toggleGoal(goalId); }}
                    />
                  </div>
                </button>
                {isOpen && detail && (
                  <div className="px-4 pb-4 pt-1 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Target Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs font-mono">₹</span>
                        <input
                          type="number"
                          className="w-full h-10 pl-6 pr-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)] transition-all"
                          value={detail.amount}
                          onChange={(e) => updateGoalDetail(goalId, "amount", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Target Year</label>
                      <input
                        type="number"
                        min={new Date().getFullYear() + 1}
                        max={2070}
                        className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)] transition-all"
                        value={detail.targetYear}
                        onChange={(e) => updateGoalDetail(goalId, "targetYear", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Current Progress</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs font-mono">₹</span>
                        <input
                          type="number"
                          className="w-full h-10 pl-6 pr-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)] transition-all"
                          value={detail.progress}
                          onChange={(e) => updateGoalDetail(goalId, "progress", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
          disabled={selectedGoals.length === 0}
          className="flex-1 h-12 bg-[var(--gold)] text-white font-bold text-sm rounded-xl hover:opacity-90 hover:shadow-lg hover:-translate-y-[1px] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          Continue to Risk Profile
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
