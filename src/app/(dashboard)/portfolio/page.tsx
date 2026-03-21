"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Sparkles, Plus, BarChart2 } from "lucide-react";

// --------- Types & Mock Data ---------
type Holding = {
  id: string;
  name: string;
  type: "stock" | "mutual_fund" | "gold" | "fd" | "nps";
  symbol: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  prevClose: number;
};

const HOLDINGS: Holding[] = [
  { id: "1", name: "Parag Parikh Flexi Cap Fund", type: "mutual_fund", symbol: "PPFCF", quantity: 234.5, avgBuyPrice: 55.2, currentPrice: 72.8, prevClose: 71.9 },
  { id: "2", name: "HDFC Bank Ltd", type: "stock", symbol: "HDFCBANK", quantity: 25, avgBuyPrice: 1420, currentPrice: 1598, prevClose: 1579 },
  { id: "3", name: "Reliance Industries", type: "stock", symbol: "RELIANCE", quantity: 12, avgBuyPrice: 2600, currentPrice: 2854, prevClose: 2830 },
  { id: "4", name: "AXIS Bluechip Fund", type: "mutual_fund", symbol: "AXBLUECHIP", quantity: 1850, avgBuyPrice: 42.1, currentPrice: 58.6, prevClose: 58.1 },
  { id: "5", name: "SBI Gold ETF", type: "gold", symbol: "GOLDBEES", quantity: 100, avgBuyPrice: 60.4, currentPrice: 74.2, prevClose: 74.0 },
  { id: "6", name: "HDFC Midcap Opportunities", type: "mutual_fund", symbol: "HDFCMID", quantity: 420, avgBuyPrice: 96.8, currentPrice: 128.4, prevClose: 127.2 },
  { id: "7", name: "NPS Tier-1 (Equity)", type: "nps", symbol: "NPS_EQ", quantity: 1, avgBuyPrice: 180000, currentPrice: 248000, prevClose: 247200 },
  { id: "8", name: "HDFC Fixed Deposit", type: "fd", symbol: "FD_HDFC", quantity: 1, avgBuyPrice: 500000, currentPrice: 543000, prevClose: 543000 },
];

const PERF_DATA = [
  { date: "Oct", portfolio: 8.4, nifty: 5.8 },
  { date: "Nov", portfolio: 11.2, nifty: 7.2 },
  { date: "Dec", portfolio: 9.8, nifty: 6.4 },
  { date: "Jan", portfolio: 13.6, nifty: 8.9 },
  { date: "Feb", portfolio: 16.2, nifty: 11.4 },
  { date: "Mar", portfolio: 18.4, nifty: 12.8 },
];

const TYPE_META: Record<string, { label: string; color: string }> = {
  stock:       { label: "Stock",       color: "#2563EB" },
  mutual_fund: { label: "Mutual Fund", color: "#7C3AED" },
  gold:        { label: "Gold ETF",    color: "#F59E0B" },
  fd:          { label: "Fixed Dep.",  color: "#10B981" },
  nps:         { label: "NPS",         color: "#6B7280" },
};

function formatINR(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v.toFixed(0)}`;
}

export default function PortfolioPage() {
  const supabase = createClient();
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"pnl" | "name" | "value">("value");

  // DB Fetching
  const { data: dbHoldings, isLoading } = useQuery({
    queryKey: ['portfolio_holdings'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return HOLDINGS;
      
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*');
        
      if (error) {
        console.error("Supabase error (falling back to mock):", error);
        return HOLDINGS;
      }
      
      if (!data || data.length === 0) return [];
      
      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.asset_type as Holding['type'],
        symbol: d.symbol,
        quantity: Number(d.quantity),
        avgBuyPrice: Number(d.avg_buy_price),
        currentPrice: Number(d.current_price),
        prevClose: Number(d.previous_close),
      }));
    }
  });

  const holdings = dbHoldings || HOLDINGS;

  // Compute derived values
  const enriched = holdings.map((h) => {
    const currentValue = h.currentPrice * h.quantity;
    const investedAmount = h.avgBuyPrice * h.quantity;
    const pnl = currentValue - investedAmount;
    const pnlPct = investedAmount > 0 ? ((pnl / investedAmount) * 100) : 0;
    const dayChange = h.prevClose > 0 ? ((h.currentPrice - h.prevClose) / h.prevClose) * 100 : 0;
    return { ...h, currentValue, investedAmount, pnl, pnlPct, dayChange };
  });

  const filtered = enriched
    .filter((h) => filter === "all" || h.type === filter)
    .sort((a, b) => {
      if (sortBy === "pnl") return b.pnlPct - a.pnlPct;
      if (sortBy === "value") return b.currentValue - a.currentValue;
      return a.name.localeCompare(b.name);
    });

  const totalValue = enriched.reduce((s, h) => s + h.currentValue, 0);
  const totalInvested = enriched.reduce((s, h) => s + h.investedAmount, 0);
  const totalPnl = totalValue - totalInvested;
  const totalPnlPct = (totalPnl / totalInvested) * 100;

  // Donut data by asset type
  const donutData = Object.entries(
    enriched.reduce((acc, h) => {
      acc[h.type] = (acc[h.type] || 0) + h.currentValue;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, value]) => ({
    name: TYPE_META[type]?.label || type,
    value,
    color: TYPE_META[type]?.color || "#6B7280",
  }));

  const FILTERS = [
    { key: "all", label: "All Assets" },
    { key: "stock", label: "Stocks" },
    { key: "mutual_fund", label: "Mutual Funds" },
    { key: "gold", label: "Gold" },
    { key: "fd", label: "FD/Debt" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 pb-10 animate-fadeUp">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="w-40 h-8 rounded-lg bg-[var(--surface-raised)] animate-pulse" />
            <div className="w-56 h-4 rounded-md bg-[var(--surface)] animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="w-36 h-9 rounded-lg bg-[var(--surface)] animate-pulse" />
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
          <div className="lg:col-span-2 glass-card p-5 h-[280px] flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border-8 border-[var(--surface)] bg-transparent animate-pulse" />
          </div>
          <div className="lg:col-span-3 glass-card p-5 h-[280px] space-y-4">
             <div className="w-48 h-5 rounded-md bg-[var(--surface)] animate-pulse" />
             <div className="w-full h-[180px] rounded-xl bg-[var(--surface-raised)]/50 animate-pulse" />
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
          <h1 className="font-serif text-2xl md:text-3xl text-[var(--text-main)]">Portfolio</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">Live holdings · {enriched.length} positions tracked</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost flex items-center gap-2 text-[12px]">
            <Sparkles size={14} className="text-[var(--blue)]" />
            Review Portfolio
          </button>
          <button className="btn-primary flex items-center gap-2 text-[12px]">
            <Plus size={14} />
            Add Holding
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Current Value", value: formatINR(totalValue), color: "text-[var(--text-main)]" },
          { label: "Total Invested", value: formatINR(totalInvested), color: "text-[var(--text-main)]" },
          { label: "Total P&L", value: `${totalPnl > 0 ? "+" : ""}${formatINR(totalPnl)}`, color: totalPnl > 0 ? "text-[var(--emerald)]" : "text-[var(--red)]" },
          { label: "XIRR / Return", value: `+${totalPnlPct.toFixed(1)}%`, color: "text-[var(--emerald)]" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3.5">
            <p className="section-label mb-2">{s.label}</p>
            <p className={`font-mono text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Allocation Donut */}
        <div className="lg:col-span-2 glass-card p-5">
          <h2 className="text-sm font-semibold text-[var(--text-main)] mb-4">Asset Allocation</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: unknown) => [formatINR(v as number), ""]} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {donutData.map((d) => (
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

        {/* Performance vs Nifty */}
        <div className="lg:col-span-3 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-[var(--text-main)]">Performance vs Nifty 50</h2>
            <div className="flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[var(--emerald)]" /><span className="text-[var(--text-muted)]">Portfolio</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[var(--blue)]" /><span className="text-[var(--text-muted)]">Nifty 50</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={PERF_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: unknown, n: unknown) => [`${v}%`, n === "portfolio" ? "Portfolio" : "Nifty 50"]} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="portfolio" stroke="var(--emerald)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="nifty" stroke="var(--blue)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--text-main)]">Holdings</h2>
          <div className="flex items-center gap-2 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f.key ? "bg-[var(--gold)] text-white" : "border border-[var(--border)] text-[var(--text-sec)] hover:border-[var(--border-light)]"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--background)] text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 text-left">Asset</th>
                <th className="px-4 py-3 text-right">Invested</th>
                <th className="px-4 py-3 text-right">Current</th>
                <th className="px-4 py-3 text-right">P&L (₹)</th>
                <th className="px-4 py-3 text-right">P&L %</th>
                <th className="px-4 py-3 text-right">Day Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/60">
              {filtered.map((h) => (
                <tr key={h.id} className="hover:bg-[var(--card-hover)]/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: TYPE_META[h.type]?.color }}>
                        {h.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text-main)] text-xs group-hover:text-[var(--gold)] transition-colors truncate max-w-[160px]">{h.name}</p>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${TYPE_META[h.type]?.color}20`, color: TYPE_META[h.type]?.color }}>{TYPE_META[h.type]?.label}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-xs text-[var(--text-sec)]">{formatINR(h.investedAmount)}</td>
                  <td className="px-4 py-4 text-right font-mono text-xs font-medium text-[var(--text-main)]">{formatINR(h.currentValue)}</td>
                  <td className={`px-4 py-4 text-right font-mono text-xs font-bold ${h.pnl >= 0 ? "text-[var(--emerald)]" : "text-[var(--red)]"}`}>
                    {h.pnl >= 0 ? "+" : ""}{formatINR(h.pnl)}
                  </td>
                  <td className={`px-4 py-4 text-right font-mono text-xs font-bold ${h.pnlPct >= 0 ? "text-[var(--emerald)]" : "text-[var(--red)]"}`}>
                    <div className="flex items-center justify-end gap-1">
                      {h.pnlPct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {h.pnlPct >= 0 ? "+" : ""}{h.pnlPct.toFixed(1)}%
                    </div>
                  </td>
                  <td className={`px-4 py-4 text-right font-mono text-xs ${h.dayChange >= 0 ? "text-[var(--emerald)]" : "text-[var(--red)]"}`}>
                    {h.dayChange >= 0 ? "+" : ""}{h.dayChange.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
