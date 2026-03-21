"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Sparkles, RefreshCw, Bookmark, ChevronDown, ChevronUp } from "lucide-react";

// -------------------- Projection Math --------------------
function buildProjectionData(monthlyInvestment: number, years: number) {
  const data = [];
  for (let y = 0; y <= years; y++) {
    const n = y * 12;
    const conservative = monthlyInvestment * ((Math.pow(1 + 0.07 / 12, n) - 1) / (0.07 / 12));
    const moderate = monthlyInvestment * ((Math.pow(1 + 0.11 / 12, n) - 1) / (0.11 / 12));
    const aggressive = monthlyInvestment * ((Math.pow(1 + 0.15 / 12, n) - 1) / (0.15 / 12));
    const inflation = monthlyInvestment * ((Math.pow(1 + 0.04 / 12, n) - 1) / (0.04 / 12));
    data.push({
      year: y === 0 ? "Start" : `${y}Y`,
      conservative: Math.round(conservative),
      moderate: Math.round(moderate),
      aggressive: Math.round(aggressive),
      inflation: Math.round(inflation),
    });
  }
  return data;
}

function formatCr(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${val.toLocaleString("en-IN")}`;
}

// -------------------- Mock AI Thesis --------------------
const THESIS_CONTENT = `## Executive Summary

Based on your ₹46,000 monthly surplus, **Moderate** risk profile, and primary goal of buying a home in 7 years, here is your personalised Monetra investment thesis for March 2025.

---

## Investable Surplus Analysis

| Source | Amount |
|---|---|
| Monthly Take-Home | ₹1,20,000 |
| Other Income | ₹0 |
| Total Monthly Expenses | ₹74,000 |
| **Investable Surplus** | **₹46,000/month** |

---

## Asset Allocation Plan

**Recommended Allocation (Moderate Profile):**
- 🔵 **Equity Mutual Funds** — 55% (₹25,300/month)
- 🟡 **Debt / Hybrid Funds** — 20% (₹9,200/month)
- 🥇 **Gold ETF / SGB** — 10% (₹4,600/month)
- 🏛️ **PPF / NPS** — 10% (₹4,600/month)
- 💵 **Liquid Fund (Emergency)** — 5% (₹2,300/month)

---

## Specific Instrument Recommendations

**Equity (₹25,300/month):**
1. **Parag Parikh Flexi Cap Fund** — ₹10,000/month *(AMFI: 122639)*
   Consistent 15Y+ track record, global diversification, low churn
2. **HDFC Midcap Opportunities Fund** — ₹8,000/month *(AMFI: 113177)*
   Excellent mid-cycle growth exposure for 7Y+ horizon
3. **Axis ELSS Tax Saver** — ₹7,300/month *(AMFI: 120503)*
   Saves ₹46,800 tax under 80C annually + equity upside

**Debt (₹9,200/month):**
4. **HDFC Short Duration Fund** — ₹9,200/month

**Gold (₹4,600/month):**
5. **SBI Gold ETF** *(NSE: GOLDBEES)* — Monthly SIP via broker

---

## Goal Achievement Timeline

| Goal | Target | At Current Pace | At Recommended |
|---|---|---|---|
| 🏠 Home Down Payment (₹20L) | 7 years | 8.2 years | **5.8 years** |
| 🌴 Early Retirement Corpus | 20 years | 24 years | **18.5 years** |

---

## Risk Scenario Table

| Scenario | Impact | Your Plan |
|---|---|---|
| Market drops 20% | Portfolio −₹16.8L | Continue SIPs — MF accumulates more units at lower NAV |
| Market drops 40% | Portfolio −₹33.6L | Increase SIP by ₹5,000 if cash allows. Don't exit. |
| Flat market (5Y) | ₹27.6L at 7% | Debt + Gold allocation provides floor. Equity caught up historically at 7Y+ |

---

## Tax Optimisation

- **ELSS SIP ₹7,300/month** → ₹87,600/year saved under 80C (saves ₹27,216 in 30% bracket)
- **NPS ₹4,600/month** → Additional ₹55,200 under 80CCD(1B) (saves ₹17,164)
- **Total tax saved: ~₹44,380/year** → Invest this back for compounding effect

---

## Income Growth Actions

1. **Negotiate a 15% raise** at your 1-year anniversary — at your profile, this is the single highest-impact action. A ₹15,000 salary increase adds ₹1.35L/year to surplus.
2. **Start a skill-based side project** on weekends — Freelance in your area → target ₹10,000–20,000/month incremental income by Month 6.
3. **Corporate NPS from employer** — If available, employer NPS contribution is tax-free in your hands AND reduces employer's tax. Ask HR this week.

---

*⚠️ This is AI-generated financial information for educational purposes only. Not personalised investment advice. Consult a SEBI Registered Investment Advisor before making investment decisions.*`;

// -------------------- Component --------------------
export default function PlannerPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  const [monthlyInvestment, setMonthlyInvestment] = useState(46000);
  const [projectionYears, setProjectionYears] = useState(20);
  const [showWithStepUp, setShowWithStepUp] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [thesisVisible, setThesisVisible] = useState(false);
  const [displayedThesis, setDisplayedThesis] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch the latest generated thesis
  const { data: latestThesis, isLoading } = useQuery({
    queryKey: ['ai_theses', 'investment_plan'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      const { data, error } = await supabase
        .from('ai_theses')
        .select('*')
        .eq('thesis_type', 'investment_plan')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        if (error.code !== 'PGRST116') { // not found error
          console.error("Error fetching latest thesis:", error);
        }
        return null; // fallback gracefully
      }
      return data;
    }
  });

  // Seed state when latest thesis is loaded
  useEffect(() => {
    if (latestThesis && !isGenerating && !thesisVisible) {
      setDisplayedThesis(latestThesis.thesis_content);
      setIsBookmarked(latestThesis.is_bookmarked);
      setThesisVisible(true);
      
      // Also sync the inputs if they were stored
      if (latestThesis.input_snapshot) {
        if (latestThesis.input_snapshot.monthlyInvestment) setMonthlyInvestment(latestThesis.input_snapshot.monthlyInvestment);
        if (latestThesis.input_snapshot.projectionYears) setProjectionYears(latestThesis.input_snapshot.projectionYears);
      }
    }
  }, [latestThesis, isGenerating, thesisVisible]);

  const toggleBookmark = useMutation({
    mutationFn: async (bookmarkState: boolean) => {
      if (!latestThesis?.id) return bookmarkState; // Mock behaviour if no thesis saved
      const { error } = await supabase.from('ai_theses').update({ is_bookmarked: bookmarkState }).eq('id', latestThesis.id);
      if (error) throw error;
      return bookmarkState;
    },
    onMutate: (newState) => {
      setIsBookmarked(newState);
    }
  });

  const projectionData = buildProjectionData(monthlyInvestment, projectionYears);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setThesisVisible(false);
    setDisplayedThesis("");
    // Clear any previous stream timers
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      const res = await fetch('/api/ai/thesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyInvestment, projectionYears }),
      });

      if (!res.ok || !res.body) {
        // Fallback to mock content if API fails
        setIsGenerating(false);
        setThesisVisible(true);
        setDisplayedThesis(THESIS_CONTENT);
        return;
      }

      setIsGenerating(false);
      setThesisVisible(true);

      // Real streaming read
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setDisplayedThesis((prev) => prev + chunk);
      }
      // After streaming is done, invalidate the query so it fetches the newly saved thesis ID
      queryClient.invalidateQueries({ queryKey: ['ai_theses', 'investment_plan'] });
    } catch {
      // On network error, show mock content
      setIsGenerating(false);
      setThesisVisible(true);
      setDisplayedThesis(THESIS_CONTENT);
    }
  };

  const inputFields = [
    { label: "Monthly Surplus", value: `₹${monthlyInvestment.toLocaleString("en-IN")}`, badge: "Investable" },
    { label: "Risk Profile", value: "Moderate ⚖️", badge: "" },
    { label: "Primary Goal", value: "Buy Home in 7Y 🏠", badge: "Priority 1" },
    { label: "Occupation", value: "Salaried 💼", badge: "" },
    { label: "City", value: "Bangalore 📍", badge: "" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 pb-10 animate-fadeUp">
        <div className="space-y-2">
          <div className="w-64 h-8 rounded-lg bg-[var(--surface-raised)] animate-pulse" />
          <div className="w-80 h-4 rounded-md bg-[var(--surface)] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 space-y-4">
            <div className="glass-card p-5 h-[280px] space-y-4">
               <div className="w-32 h-4 rounded-md bg-[var(--surface)] animate-pulse mb-6" />
               {[1,2,3,4,5].map(i => <div key={i} className="w-full h-6 rounded-md bg-[var(--surface-raised)] animate-pulse" />)}
            </div>
            <div className="glass-card p-5 h-[180px] space-y-4">
               <div className="w-40 h-4 rounded-md bg-[var(--surface)] animate-pulse mb-6" />
               <div className="w-full h-8 rounded-md bg-[var(--surface-raised)] animate-pulse" />
               <div className="w-full h-8 rounded-md bg-[var(--surface-raised)] animate-pulse" />
            </div>
          </div>
          <div className="xl:col-span-2 space-y-5">
            <div className="glass-card p-5 h-[340px]">
               <div className="w-48 h-5 rounded-md bg-[var(--surface)] animate-pulse mb-6" />
               <div className="w-full h-[240px] rounded-xl bg-[var(--surface-raised)]/50 animate-pulse" />
            </div>
            <div className="glass-card p-5 h-[300px]">
               <div className="w-48 h-5 rounded-md bg-[var(--surface)] animate-pulse mb-6" />
               <div className="w-full h-full rounded-xl bg-[var(--surface-raised)]/30 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-[var(--text-main)]">AI Investment Planner</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-1">Personalised wealth strategy powered by AI · India-native instruments</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel — Inputs */}
        <div className="xl:col-span-1 space-y-4">
          {/* Profile Summary */}
          <div className="glass-card p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text-main)]">Your Profile</h2>
            {inputFields.map((f) => (
              <div key={f.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-xs text-[var(--text-muted)]">{f.label}</span>
                <div className="flex items-center gap-2">
                  {f.badge && <span className="text-[10px] font-bold bg-[var(--gold-dim)] text-[var(--gold)] px-1.5 py-0.5 rounded-md">{f.badge}</span>}
                  <span className="font-mono text-xs font-medium text-[var(--text-main)]">{f.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Projection Controls */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--text-main)]">Projection Settings</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">Monthly Investment</span>
                <span className="font-mono font-bold text-[var(--gold)]">₹{monthlyInvestment.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min={5000}
                max={200000}
                step={1000}
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(parseInt(e.target.value))}
                className="w-full accent-[var(--gold)]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">Time Horizon</span>
                <span className="font-mono font-bold text-[var(--gold)]">{projectionYears} Years</span>
              </div>
              <input
                type="range"
                min={3}
                max={30}
                step={1}
                value={projectionYears}
                onChange={(e) => setProjectionYears(parseInt(e.target.value))}
                className="w-full accent-[var(--gold)]"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setShowWithStepUp(!showWithStepUp)}
                className={`w-9 h-5 rounded-full transition-colors relative ${showWithStepUp ? "bg-[var(--gold)]" : "bg-[var(--border)]"}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showWithStepUp ? "left-[18px]" : "left-0.5"}`} />
              </div>
              <span className="text-xs text-[var(--text-sec)]">Include 10% annual step-up</span>
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full btn-primary flex items-center justify-center gap-2 text-[13px] !py-3 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating thesis...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Generate Investment Thesis
              </>
            )}
          </button>
        </div>

        {/* Right Panel — Thesis + Chart */}
        <div className="xl:col-span-2 space-y-5">
          {/* Wealth Projection Chart */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-sm text-[var(--text-main)]">Wealth Projection</h2>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[var(--blue)]" /><span className="text-[var(--text-muted)]">Conservative 7%</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[var(--gold)]" /><span className="text-[var(--text-muted)]">Moderate 11%</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[var(--emerald)]" /><span className="text-[var(--text-muted)]">Aggressive 15%</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="conservative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--blue)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="moderate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="aggressive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--emerald)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--emerald)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} interval={Math.floor(projectionYears / 5)} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCr(v)} />
                <Tooltip
                  formatter={(value: unknown, name: unknown) => [formatCr(value as number), (name as string).charAt(0).toUpperCase() + (name as string).slice(1)]}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="conservative" stroke="var(--blue)" fill="url(#conservative)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="moderate" stroke="var(--gold)" fill="url(#moderate)" strokeWidth={2.5} dot={false} />
                <Area type="monotone" dataKey="aggressive" stroke="var(--emerald)" fill="url(#aggressive)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            {/* Projection Summary */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Conservative (7%)", val: projectionData[projectionYears]?.conservative, color: "text-[var(--blue)]" },
                { label: "Moderate (11%)", val: projectionData[projectionYears]?.moderate, color: "text-[var(--gold)]" },
                { label: "Aggressive (15%)", val: projectionData[projectionYears]?.aggressive, color: "text-[var(--emerald)]" },
              ].map((row) => (
                <div key={row.label} className="text-center">
                  <p className="text-[10px] text-[var(--text-muted)] mb-1">{row.label}</p>
                  <p className={`font-mono text-base font-bold ${row.color}`}>{formatCr(row.val || 0)}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">in {projectionYears}Y</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Thesis Output */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--blue-dim)] to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
                  <Sparkles size={13} className="text-[var(--blue)]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--blue)] block">AI Investment Thesis</span>
                  {thesisVisible && <span className="text-[10px] text-[var(--text-muted)]">Generated · March 2025</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {thesisVisible && (
                  <>
                    <button
                      onClick={() => toggleBookmark.mutate(!isBookmarked)}
                      className={`p-1.5 rounded-lg transition-colors ${isBookmarked ? "text-[var(--gold)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"}`}
                    >
                      <Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} />
                    </button>
                    <button onClick={handleGenerate} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors rounded-lg">
                      <RefreshCw size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="p-6 min-h-[300px]">
              {!thesisVisible && !isGenerating && (
                <div className="flex flex-col items-center justify-center h-full min-h-[240px] gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-[var(--blue-dim)] border border-[var(--blue)]/10 flex items-center justify-center">
                    <Sparkles size={22} className="text-[var(--blue)]" />
                  </div>
                  <p className="font-semibold text-[var(--text-main)]">Your personalised thesis awaits</p>
                  <p className="text-sm text-[var(--text-muted)] max-w-xs">Click &quot;Generate Investment Thesis&quot; to build your complete, AI-powered wealth strategy.</p>
                </div>
              )}
              {isGenerating && !thesisVisible && (
                <div className="flex flex-col items-center justify-center h-full min-h-[240px] gap-4">
                  <div className="w-12 h-12 rounded-full border-3 border-[var(--border)] border-t-[var(--gold)] animate-spin" />
                  <p className="text-sm font-medium text-[var(--text-muted)]">Analysing your profile...</p>
                  <div className="flex gap-2">
                    {["Calculating surplus", "Mapping goals", "Selecting instruments", "Building thesis"].map((step, idx) => (
                      <div key={step} className="flex items-center gap-1.5 bg-[var(--background)] border border-[var(--border)] rounded-full px-2.5 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" style={{ animationDelay: `${idx * 0.3}s` }} />
                        <span className="text-[10px] text-[var(--text-muted)]">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {thesisVisible && (
                <div className="prose prose-sm max-w-none text-[var(--text-sec)] leading-relaxed text-sm">
                  {displayedThesis.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) return <h2 key={i} className="font-bold text-base text-[var(--text-main)] mt-5 mb-2 first:mt-0">{line.replace("## ", "")}</h2>;
                    if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-bold text-[var(--text-main)]">{line.replace(/\*\*/g, "")}</p>;
                    if (line.startsWith("- ")) return <p key={i} className="ml-3">• {line.slice(2).replace(/\*\*(.*?)\*\*/g, (_, t) => t)}</p>;
                    if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ")) return <p key={i} className="ml-3 text-[var(--text-main)]">{line}</p>;
                    if (line.startsWith("|") && !line.includes("---")) {
                      const cells = line.split("|").filter(Boolean).map(c => c.trim());
                      return <p key={i} className="flex gap-4 border-b border-[var(--border)] py-1.5 text-xs">{cells.map((c, ci) => <span key={ci} className="flex-1">{c}</span>)}</p>;
                    }
                    if (line.startsWith("---")) return <hr key={i} className="border-[var(--border)] my-3" />;
                    if (line.startsWith("*⚠️")) return <p key={i} className="text-[11px] text-[var(--text-muted)] italic mt-4 border-t border-[var(--border)] pt-3">{line.replace(/\*/g, "")}</p>;
                    if (!line.trim()) return null;
                    return <p key={i}>{line.replace(/\*\*(.*?)\*\*/g, (_, t) => t)}</p>;
                  })}
                  {displayedThesis.length < THESIS_CONTENT.length && (
                    <span className="inline-block w-0.5 h-4 bg-[var(--gold)] animate-pulse ml-0.5 align-middle" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
