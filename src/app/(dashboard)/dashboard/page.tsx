"use client";
import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Sparkles, FileText } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


export default function DashboardPage() {
  const [mounted, setMounted] = React.useState(false);
  const [formattedDate, setFormattedDate] = React.useState<string>("");
  const [greeting, setGreeting] = React.useState<string>("Hello");

  React.useEffect(() => {
    const now = new Date();
    setFormattedDate(now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    
    const hour = now.getHours();
    setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');
    setMounted(true);
  }, []);

  const wealthData = useMemo(() => {
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    let base = 7200000;
    return months.map((m) => {
      base = Math.round(base * (1 + (Math.random() * 0.03 + 0.005)));
      return { month: m, netWorth: base };
    });
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-0.5 min-h-[64px]">
        {mounted ? (
          <>
            <h1 className="font-serif text-2xl md:text-[32px] leading-tight text-[var(--text-main)]">
              {greeting}, User.
            </h1>
            <p className="text-[13px] text-[var(--text-muted)]">{formattedDate}</p>
          </>
        ) : (
          <div className="animate-pulse space-y-2">
            <div className="h-8 w-48 bg-[var(--surface-raised)] rounded-md" />
            <div className="h-4 w-32 bg-[var(--surface)] rounded-md" />
          </div>
        )}
      </div>

      {/* AI Insight Bar */}
      <div className="glass-card relative overflow-hidden p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 group">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--blue-dim)] to-[var(--emerald-dim)] opacity-40 pointer-events-none" />
        <div className="relative z-10 w-10 h-10 rounded-xl bg-[var(--surface)] flex items-center justify-center shrink-0 border border-[var(--border)] group-hover:border-[var(--blue)]/20 transition-all duration-500">
          <Sparkles className="text-[var(--blue)] w-4 h-4" />
        </div>
        <div className="relative z-10 flex-1">
          <h3 className="section-label text-[var(--blue)] mb-1 flex items-center gap-2">
            AI Insight
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)] animate-pulse" />
          </h3>
          <p className="text-[13px] text-[var(--text-sec)] leading-relaxed max-w-[700px]">
            Your dining spend is 22% above your 3-month average. Redirecting <strong className="text-[var(--text-main)]">₹3,000</strong> to your Home Goal SIP this month would add <strong className="text-[var(--emerald)]">₹8.4L</strong> to your corpus in 12 years.
          </p>
        </div>
        <button className="relative z-10 shrink-0 btn-ghost text-[11px] !px-4 !py-2 flex items-center gap-1.5 text-[var(--blue)] border-[var(--blue)]/20 hover:bg-[var(--blue-dim)]">
          Apply Strategy
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Net Worth" value="₹1.24Cr" change="+2.4%" isPositive={true} />
        <KpiCard title="Total Assets" value="₹1.48Cr" change="+1.8%" isPositive={true} />
        <KpiCard title="Total Liabs" value="₹24.0L" change="-0.5%" isPositive={false} />
        <KpiCard title="Cashflow" value="₹1.8L" change="+12.0%" isPositive={true} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5 flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-main)]">Net Worth</h2>
              <p className="text-[var(--text-muted)] text-[11px] mt-0.5">12-month progression</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-0.5 flex">
              <button className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[var(--surface-raised)] shadow-sm text-[var(--text-main)]">1Y</button>
              <button className="px-2.5 py-1 text-[11px] font-semibold rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">5Y</button>
              <button className="px-2.5 py-1 text-[11px] font-semibold rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">Max</button>
            </div>
          </div>
          <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center">
            {!mounted ? (
              <div className="w-full h-full bg-[var(--surface)] animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={wealthData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                 <defs>
                   <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="var(--emerald)" stopOpacity={0.15} />
                     <stop offset="95%" stopColor="var(--emerald)" stopOpacity={0} />
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                 <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                 <YAxis
                   tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                   axisLine={false}
                   tickLine={false}
                   tickFormatter={(v: number) => `₹${(v / 10000000).toFixed(2)}Cr`}
                   width={60}
                 />
                 <Tooltip
                   formatter={(v: unknown) => [`₹${((v as number) / 100000).toFixed(1)}L`, "Net Worth"]}
                   contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "11px", backdropFilter: "blur(12px)" }}
                 />
                 <Area type="monotone" dataKey="netWorth" stroke="var(--emerald)" strokeWidth={2} fill="url(#wealthGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-card p-5 flex flex-col h-[360px]">
          <h2 className="text-sm font-semibold text-[var(--text-main)] mb-5 pb-4 border-b border-[var(--border)]">Asset Allocation</h2>
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="relative w-36 h-36 rounded-full aspect-square" style={{ background: "conic-gradient(var(--blue) 0deg 160deg, var(--emerald) 160deg 260deg, var(--gold) 260deg 310deg, #8B5CF6 310deg 360deg)" }}>
              <div className="absolute inset-3 bg-[var(--surface-raised)] rounded-full flex flex-col items-center justify-center">
                <span className="section-label mb-0.5">Total</span>
                <span className="font-mono text-lg font-medium tracking-tight">100%</span>
              </div>
            </div>

            <div className="w-full space-y-3 px-1">
              <AllocationRow color="bg-[var(--blue)]" label="Equity" value="45%" amount="₹66.6L" />
              <AllocationRow color="bg-[var(--emerald)]" label="Real Estate" value="30%" amount="₹44.4L" />
              <AllocationRow color="bg-[var(--gold)]" label="Debt" value="15%" amount="₹22.2L" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-main)]">Recent Transactions</h2>
          <button className="section-label hover:text-[var(--text-main)] transition-colors cursor-pointer">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--surface)] text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)] font-bold border-b border-[var(--border)]">
              <tr>
                <th className="px-5 py-3 font-bold">Transaction</th>
                <th className="px-5 py-3 font-bold">Category</th>
                <th className="px-5 py-3 font-bold">Date</th>
                <th className="px-5 py-3 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <TransactionRow icon={<FileText size={14}/>} name="Salary Deposit" category="Income" date="Oct 24, 2024" amount="+₹1,50,000" isPositive={true}/>
              <TransactionRow icon={<FileText size={14}/>} name="Nifty 50 Index Fund" category="Investment" date="Oct 22, 2024" amount="-₹25,000" isPositive={false}/>
              <TransactionRow icon={<FileText size={14}/>} name="HDFC Credit Card Bill" category="Expenses" date="Oct 20, 2024" amount="-₹42,300" isPositive={false}/>
              <TransactionRow icon={<FileText size={14}/>} name="Quarterly Dividend" category="Passive Income" date="Oct 15, 2024" amount="+₹8,500" isPositive={true}/>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, change, isPositive }: { title: string, value: string, change: string, isPositive: boolean }) {
  return (
    <div className="glass-card p-3 md:p-4 flex flex-col justify-between h-[90px] md:h-[110px] group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-[2px] ${isPositive ? 'bg-[var(--emerald)]' : 'bg-[var(--red)]'} opacity-30 group-hover:opacity-60 transition-opacity duration-500`} />
      <h3 className="section-label mt-0.5">{title}</h3>
      <div>
        <div className="font-mono text-[17px] md:text-[24px] font-medium text-[var(--text-main)] tracking-tight leading-none mb-1.5">{value}</div>
        <div className="flex items-center gap-1 text-[10px] md:text-[11px] font-semibold">
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${isPositive ? 'bg-[var(--emerald-dim)] text-[var(--emerald)]' : 'bg-[var(--red)]/10 text-[var(--red)]'}`}>
            {isPositive ? <TrendingUp size={8} strokeWidth={3} /> : <TrendingDown size={8} strokeWidth={3} />}
          </div>
          <span className={isPositive ? "text-[var(--emerald)]" : "text-[var(--red)]"}>{change}</span>
          <span className="text-[var(--text-muted)] hidden md:inline ml-0.5">vs last month</span>
        </div>
      </div>
    </div>
  )
}

function AllocationRow({ color, label, value, amount }: { color: string, label: string, value: string, amount: string }) {
  return (
    <div className="flex items-center justify-between text-[12px] group cursor-default">
      <div className="flex items-center gap-2.5">
        <div className={`w-2.5 h-2.5 rounded-full ${color} group-hover:scale-125 transition-transform duration-300`} />
        <span className="text-[var(--text-sec)] group-hover:text-[var(--text-main)] transition-colors duration-300">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[var(--text-muted)]">{value}</span>
        <span className="font-mono text-[var(--text-main)] font-medium w-14 text-right">{amount}</span>
      </div>
    </div>
  )
}

function TransactionRow({ icon, name, category, date, amount, isPositive }: { icon: React.ReactNode, name: string, category: string, date: string, amount: string, isPositive: boolean }) {
  return (
    <tr className="hover:bg-[var(--surface)] transition-colors duration-300 group cursor-default">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] group-hover:border-[var(--border-light)] transition-all duration-300">
            {icon}
          </div>
          <span className="text-[13px] font-medium text-[var(--text-main)] group-hover:text-[var(--gold)] transition-colors duration-300">{name}</span>
        </div>
      </td>
      <td className="px-5 py-3.5 text-[var(--text-sec)] text-[12px]">{category}</td>
      <td className="px-5 py-3.5 text-[var(--text-muted)] text-[11px]">{date}</td>
      <td className={`px-5 py-3.5 text-right font-mono text-[12px] font-medium ${isPositive ? 'text-[var(--emerald)]' : 'text-[var(--text-main)]'}`}>{amount}</td>
    </tr>
  )
}
