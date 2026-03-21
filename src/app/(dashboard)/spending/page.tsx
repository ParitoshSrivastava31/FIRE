"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
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
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [showModal, setShowModal] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [auditContent, setAuditContent] = useState(AI_AUDIT);

  // DB Fetching
  const { data: dbExpenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return MOCK_EXPENSES;
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) {
        console.error("Supabase error (falling back to mock):", error);
        return MOCK_EXPENSES;
      }
      
      if (!data || data.length === 0) return [];
      
      return data.map((d: any) => ({
        id: d.id,
        name: d.description || d.name || 'Expense',
        category: d.category as Category,
        amount: Number(d.amount),
        date: d.date,
        isRecurring: d.is_recurring || d.isRecurring
      }));
    }
  });

  const expenses = dbExpenses || MOCK_EXPENSES;

  const addMutation = useMutation({
    mutationFn: async (expense: Omit<Expense, 'id'>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { ...expense, id: Date.now().toString() } as Expense;
      }
      
      const { data, error } = await supabase.from('expenses').insert({
        user_id: session.user.id,
        description: expense.name,
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
        is_recurring: expense.isRecurring
      }).select().single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newExp) => {
      if (dbExpenses?.length && dbExpenses === MOCK_EXPENSES) {
        // If we are operating purely in mock mode without DB, simulate an optimistic cache update
        queryClient.setQueryData(['expenses'], (old: Expense[] | undefined) => {
           return [newExp, ...(old || [])];
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
      }
      setShowModal(false);
      setNewExp({ name: "", category: "food", amount: "", date: new Date().toISOString().split("T")[0], isRecurring: false });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return id; // Mock delete
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
       if (dbExpenses?.length && dbExpenses === MOCK_EXPENSES) {
          queryClient.setQueryData(['expenses'], (old: Expense[] | undefined) => {
            return old?.filter(e => e.id !== deletedId) || [];
          });
       } else {
          queryClient.invalidateQueries({ queryKey: ['expenses'] });
       }
    }
  });

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
    addMutation.mutate({
      name: newExp.name,
      category: newExp.category,
      amount: parseFloat(newExp.amount),
      date: newExp.date,
      isRecurring: newExp.isRecurring,
    });
  };

  const handleGenAudit = async () => {
    setIsGenerating(true);
    setShowAudit(false);
    // Build expenses object for the API
    const expensesByCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    try {
      const res = await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses: expensesByCategory, income: monthlyIncome }),
      });

      setIsGenerating(false);
      setShowAudit(true);

      if (!res.ok || !res.body) return;

      // Stream the response into audit content state
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let auditText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        auditText += decoder.decode(value, { stream: true });
        setAuditContent(auditText);
      }
    } catch {
      setIsGenerating(false);
      setShowAudit(true);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-10 animate-fadeUp">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="w-48 h-8 rounded-lg bg-[var(--surface-raised)] animate-pulse" />
            <div className="w-64 h-4 rounded-md bg-[var(--surface)] animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="w-32 h-9 rounded-lg bg-[var(--surface)] animate-pulse" />
            <div className="w-32 h-9 rounded-lg bg-[var(--surface-raised)] animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-3.5 space-y-3">
              <div className="w-24 h-4 rounded-md bg-[var(--surface)] animate-pulse" />
              <div className="w-32 h-7 rounded-md bg-[var(--surface-raised)] animate-pulse" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 glass-card p-5 h-[320px] flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-8 border-[var(--surface)] bg-transparent animate-pulse" />
          </div>
          <div className="lg:col-span-3 glass-card p-5 h-[320px] space-y-4">
             <div className="w-32 h-5 rounded-md bg-[var(--surface)] animate-pulse" />
             <div className="w-full h-[220px] rounded-xl bg-[var(--surface-raised)]/50 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-[var(--text-main)]">Spending Tracker</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">March 2025 · {formatINR(totalSpent)} spent of {formatINR(monthlyIncome)} income</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenAudit}
            disabled={isGenerating}
            className="btn-ghost flex items-center gap-2 text-[12px] disabled:opacity-60"
          >
            <Sparkles size={14} className="text-[var(--blue)]" />
            {isGenerating ? "Analysing..." : "Audit My Spending"}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 text-[12px]"
          >
            <Plus size={14} />
            Add Expense
          </button>
        </div>
      </div>

      {/* AI Audit Output */}
      {showAudit && (
        <div className="glass-card p-5 relative overflow-hidden border-[var(--blue)]/20">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--blue-dim)] to-transparent opacity-40 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                  <Sparkles size={13} className="text-[var(--blue)]" />
                </div>
                <span className="section-label text-[var(--blue)]">AI Spending Audit</span>
              </div>
              <button onClick={() => setShowAudit(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors duration-300 p-1 rounded-lg hover:bg-[var(--surface)]">
                <X size={16} />
              </button>
            </div>
            <div className="text-[13px] text-[var(--text-sec)] leading-relaxed whitespace-pre-line">
              {auditContent.split("\n").map((line, i) => {
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
          { label: "Total Spent", value: formatINR(totalSpent), icon: <TrendingDown size={14} />, color: "text-[var(--red)]" },
          { label: "% of Income", value: `${Math.round((totalSpent / monthlyIncome) * 100)}%`, icon: <Wallet size={14} />, color: totalSpent / monthlyIncome > 0.75 ? "text-[var(--red)]" : "text-[var(--gold)]" },
          { label: "Biggest Category", value: "Housing", icon: <Home size={14} />, color: "text-[var(--blue)]" },
          { label: "Transactions", value: `${expenses.length}`, icon: <MoreHorizontal size={14} />, color: "text-[var(--text-muted)]" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3.5">
            <div className={`flex items-center gap-1.5 ${s.color} mb-2`}>{s.icon}<span className="section-label">{s.label}</span></div>
            <p className="font-mono text-lg font-medium text-[var(--text-main)]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Donut Chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <h2 className="text-sm font-semibold text-[var(--text-main)] mb-5">By Category</h2>
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
        <div className="lg:col-span-3 glass-card p-5">
          <h2 className="text-sm font-semibold text-[var(--text-main)] mb-5">6-Month Trend</h2>
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
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-main)]">Transactions</h2>
          <span className="text-[11px] text-[var(--text-muted)]">{expenses.length} entries this month</span>
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
                  onClick={() => deleteMutation.mutate(expense.id)}
                  disabled={deleteMutation.isPending}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-[var(--red)] disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ animation: 'reveal-up 0.3s ease both' }}>
          <div className="glass-card shadow-2xl w-full max-w-md border-[var(--border-light)]" style={{ backdropFilter: 'blur(40px)' }}>
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-[var(--text-main)]">Add Expense</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors duration-300 p-1 rounded-lg hover:bg-[var(--surface)]">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="section-label">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Zomato order"
                  className="input-premium text-[13px]"
                  value={newExp.name}
                  onChange={(e) => setNewExp({ ...newExp, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="section-label">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="input-premium text-[13px]"
                    value={newExp.amount}
                    onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="section-label">Date</label>
                  <input
                    type="date"
                    className="input-premium text-[13px]"
                    value={newExp.date}
                    onChange={(e) => setNewExp({ ...newExp, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="section-label">Category</label>
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
                disabled={!newExp.name || !newExp.amount || addMutation.isPending}
                className="w-full btn-primary text-[13px] text-center disabled:opacity-40 disabled:pointer-events-none"
              >
                {addMutation.isPending ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
