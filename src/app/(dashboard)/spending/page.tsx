"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Plus,
  X,
  Sparkles,
  TrendingDown,
  ShoppingBag,
  Utensils,
  Home,
  Car,
  Film,
  Heart,
  BookOpen,
  Wallet,
  MoreHorizontal,
} from "lucide-react";

// ---------- Types & Mock Data ----------
type Category = "food" | "housing" | "transport" | "entertainment" | "healthcare" | "shopping" | "education" | "savings" | "other";

const CATEGORY_META: Record<Category, { label: string; color: string; icon: React.ReactNode }> = {
  food:          { label: "Food & Dining",    color: "#F59E0B", icon: <Utensils size={14} /> },
  housing:       { label: "Housing",           color: "#2563EB", icon: <Home size={14} /> },
  transport:     { label: "Transport",         color: "#7C3AED", icon: <Car size={14} /> },
  entertainment: { label: "Entertainment",     color: "#EC4899", icon: <Film size={14} /> },
  healthcare:    { label: "Healthcare",        color: "#10B981", icon: <Heart size={14} /> },
  shopping:      { label: "Shopping",          color: "#F97316", icon: <ShoppingBag size={14} /> },
  education:     { label: "Education",         color: "#06B6D4", icon: <BookOpen size={14} /> },
  savings:       { label: "Savings/SIP",       color: "#059669", icon: <Wallet size={14} /> },
  other:         { label: "Other",             color: "#6B7280", icon: <MoreHorizontal size={14} /> },
};

type Expense = {
  id: string;
  name: string;
  category: Category;
  amount: number;
  date: string;
  isRecurring: boolean;
};

const MOCK_EXPENSES: Expense[] = [
  { id: "1", name: "Zomato / Swiggy", category: "food", amount: 6200, date: "2025-03-18", isRecurring: false },
  { id: "2", name: "Rent", category: "housing", amount: 18000, date: "2025-03-01", isRecurring: true },
  { id: "3", name: "Ola / Uber", category: "transport", amount: 3200, date: "2025-03-15", isRecurring: false },
  { id: "4", name: "Netflix + Prime + Spotify", category: "entertainment", amount: 1100, date: "2025-03-05", isRecurring: true },
  { id: "5", name: "Gym Membership", category: "healthcare", amount: 2500, date: "2025-03-01", isRecurring: true },
  { id: "6", name: "Amazon Shopping", category: "shopping", amount: 4800, date: "2025-03-12", isRecurring: false },
  { id: "7", name: "Axis Bluechip SIP", category: "savings", amount: 10000, date: "2025-03-05", isRecurring: true },
  { id: "8", name: "Groceries", category: "food", amount: 8500, date: "2025-03-20", isRecurring: false },
  { id: "9", name: "Electricity + Internet", category: "housing", amount: 3200, date: "2025-03-08", isRecurring: true },
  { id: "10", name: "Petrol", category: "transport", amount: 2400, date: "2025-03-17", isRecurring: false },
];

const TREND_DATA = [
  { month: "Oct", food: 14200, housing: 21200, transport: 5800, entertainment: 1100, other: 9400 },
  { month: "Nov", food: 12800, housing: 21200, transport: 6200, entertainment: 2300, other: 7200 },
  { month: "Dec", food: 18400, housing: 21200, transport: 4400, entertainment: 3800, other: 12100 },
  { month: "Jan", food: 15600, housing: 21200, transport: 5600, entertainment: 2100, other: 8700 },
  { month: "Feb", food: 13400, housing: 21200, transport: 5100, entertainment: 1100, other: 9600 },
  { month: "Mar", food: 14700, housing: 21200, transport: 5600, entertainment: 1100, other: 17300 },
];

const AI_AUDIT = `**📊 Spending Audit — March 2025**

**Top 3 overspending areas:**

1. 🍽️ **Food & Dining — ₹14,700 (12.3% of income)**
   You ordered food delivery 22 times this month (avg ₹280/order = ₹6,160). Cutting to 12 times saves **₹2,800/month**.
   *If redirected → Parag Parikh Flexi Cap SIP = **₹9.2L extra in 10 years***

2. 🏠 **Housing — ₹21,200 (17.7% of income)**
   Your rent is above the 15% income benchmark for your city. Consider negotiation at renewal or co-living to free up **₹3,000–5,000/month**.

3. 🛍️ **Shopping — ₹4,800 (4% of income)**
   3 unplanned Amazon purchases totalling ₹2,200. Try a 48-hour rule before non-essential purchases.

**💡 If you redirected ₹5,000/month:**
At 11% CAGR in a flexi-cap fund → **₹3.4L in 5 years, ₹10.8L in 10 years**

*⚠️ This is AI-generated financial information for educational purposes only. Not personalised investment advice.*`;

function formatINR(val: number) {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${val.toLocaleString("en-IN")}`;
}

// Build donut data from expenses
function buildDonutData(expenses: Expense[]) {
  const totals: Partial<Record<Category, number>> = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  return Object.entries(totals).map(([cat, amt]) => ({
    name: CATEGORY_META[cat as Category].label,
    value: amt,
    color: CATEGORY_META[cat as Category].color,
  }));
}

const CATEGORIES = Object.keys(CATEGORY_META) as Category[];

export default function SpendingPage() {
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [showModal, setShowModal] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // New expense form state
  const [newExp, setNewExp] = useState({
    name: "",
    category: "food" as Category,
    amount: "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
  });

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const monthlyIncome = 120000;
  const donutData = buildDonutData(expenses);

  const handleAddExpense = () => {
    if (!newExp.name || !newExp.amount) return;
    const expense: Expense = {
      id: Date.now().toString(),
      name: newExp.name,
      category: newExp.category,
      amount: parseFloat(newExp.amount),
      date: newExp.date,
      isRecurring: newExp.isRecurring,
    };
    setExpenses((prev) => [expense, ...prev]);
    setNewExp({ name: "", category: "food", amount: "", date: new Date().toISOString().split("T")[0], isRecurring: false });
    setShowModal(false);
  };

  const handleGenAudit = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowAudit(true);
    }, 1800);
  };

  return (
    <div className="space-y-6 animate-fadeUp pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[var(--text-main)]">Spending Tracker</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">March 2025 · {formatINR(totalSpent)} spent of {formatINR(monthlyIncome)} income</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenAudit}
            disabled={isGenerating}
            className="flex items-center gap-2 border border-[var(--border)] bg-[var(--card)] text-[var(--text-main)] text-xs font-bold px-4 py-2.5 rounded-xl hover:border-[var(--border-light)] hover:shadow-sm transition-all disabled:opacity-60"
          >
            <Sparkles size={14} className="text-[var(--blue)]" />
            {isGenerating ? "Analysing..." : "Audit My Spending"}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[var(--gold)] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 hover:shadow-md transition-all"
          >
            <Plus size={14} />
            Add Expense
          </button>
        </div>
      </div>

      {/* AI Audit Output */}
      {showAudit && (
        <div className="bg-[var(--card)] border border-[var(--blue)]/30 rounded-2xl p-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--blue-dim)] to-transparent opacity-50 rounded-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
                  <Sparkles size={13} className="text-[var(--blue)]" />
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--blue)]">AI Spending Audit</span>
              </div>
              <button onClick={() => setShowAudit(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="text-sm text-[var(--text-sec)] leading-relaxed whitespace-pre-line">
              {AI_AUDIT.split("\n").map((line, i) => {
                if (line.startsWith("**") && line.endsWith("**")) {
                  return <p key={i} className="font-bold text-[var(--text-main)] mt-3 mb-1">{line.replace(/\*\*/g, "")}</p>;
                }
                if (line.match(/^\d+\./)) {
                  return <p key={i} className="font-semibold text-[var(--text-main)] mt-3">{line}</p>;
                }
                if (line.startsWith("*")) {
                  return <p key={i} className="text-[11px] text-[var(--text-muted)] mt-1 italic">{line.replace(/\*/g, "")}</p>;
                }
                return <p key={i} className="mt-1">{line}</p>;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Spent", value: formatINR(totalSpent), icon: <TrendingDown size={15} />, color: "text-[var(--red)]" },
          { label: "% of Income", value: `${Math.round((totalSpent / monthlyIncome) * 100)}%`, icon: <Wallet size={15} />, color: totalSpent / monthlyIncome > 0.75 ? "text-[var(--red)]" : "text-[var(--gold)]" },
          { label: "Biggest Category", value: "Housing", icon: <Home size={15} />, color: "text-[var(--blue)]" },
          { label: "Transactions", value: `${expenses.length}`, icon: <MoreHorizontal size={15} />, color: "text-[var(--text-muted)]" },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--border-light)] transition-colors">
            <div className={`flex items-center gap-1.5 ${s.color} mb-2`}>{s.icon}<span className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)]">{s.label}</span></div>
            <p className="font-mono text-xl font-medium text-[var(--text-main)]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Donut Chart */}
        <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--border-light)] transition-colors">
          <h2 className="font-semibold text-sm text-[var(--text-main)] mb-5">By Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: unknown) => [formatINR(value as number), ""]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {donutData.slice(0, 5).map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-[var(--text-sec)]">{d.name}</span>
                </div>
                <span className="font-mono font-medium text-[var(--text-main)]">{formatINR(d.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Chart */}
        <div className="lg:col-span-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--border-light)] transition-colors">
          <h2 className="font-semibold text-sm text-[var(--text-main)] mb-5">6-Month Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={TREND_DATA} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(value: unknown) => [formatINR(value as number), ""]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }}
              />
              <Bar dataKey="food" fill="#F59E0B" radius={[2, 2, 0, 0]} />
              <Bar dataKey="housing" fill="#2563EB" radius={[2, 2, 0, 0]} />
              <Bar dataKey="transport" fill="#7C3AED" radius={[2, 2, 0, 0]} />
              <Bar dataKey="entertainment" fill="#EC4899" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--border-light)] transition-colors">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold text-sm text-[var(--text-main)]">Transactions</h2>
          <span className="text-xs text-[var(--text-muted)]">{expenses.length} entries this month</span>
        </div>
        <div className="divide-y divide-[var(--border)]/60">
          {expenses.map((expense) => {
            const meta = CATEGORY_META[expense.category];
            return (
              <div key={expense.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--card-hover)]/50 transition-colors group">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: meta.color }}>
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--text-main)] truncate group-hover:text-[var(--gold)] transition-colors">{expense.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${meta.color}20`, color: meta.color }}>{meta.label}</span>
                    {expense.isRecurring && <span className="text-[10px] text-[var(--text-muted)]">↻ Recurring</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-sm font-medium text-[var(--text-main)]">-{formatINR(expense.amount)}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{expense.date}</p>
                </div>
                <button
                  onClick={() => setExpenses((prev) => prev.filter((e) => e.id !== expense.id))}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-[var(--red)]"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h2 className="font-semibold text-[var(--text-main)]">Add Expense</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Zomato order"
                  className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all"
                  value={newExp.name}
                  onChange={(e) => setNewExp({ ...newExp, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all"
                    value={newExp.amount}
                    onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Date</label>
                  <input
                    type="date"
                    className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)] transition-all"
                    value={newExp.date}
                    onChange={(e) => setNewExp({ ...newExp, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setNewExp({ ...newExp, category: cat })}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all ${newExp.category === cat ? "border-[var(--gold)] bg-[var(--gold-glow)] text-[var(--gold)]" : "border-[var(--border)] text-[var(--text-sec)] hover:border-[var(--border-light)]"}`}
                      >
                        <span>{meta.icon}</span>
                        <span className="truncate">{meta.label.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setNewExp({ ...newExp, isRecurring: !newExp.isRecurring })}
                  className={`w-9 h-5 rounded-full transition-colors relative ${newExp.isRecurring ? "bg-[var(--gold)]" : "bg-[var(--border)]"}`}
                >
                  <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${newExp.isRecurring ? "left-[18px]" : "left-0.5"}`} />
                </div>
                <span className="text-sm text-[var(--text-sec)]">Recurring monthly expense</span>
              </label>
              <button
                onClick={handleAddExpense}
                disabled={!newExp.name || !newExp.amount}
                className="w-full h-11 bg-[var(--gold)] text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
