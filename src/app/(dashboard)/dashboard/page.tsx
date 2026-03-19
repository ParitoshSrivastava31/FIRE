"use client";
import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Sparkles, FileText } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


export default function DashboardPage() {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Mini wealth chart data — last 12 months
  const wealthData = useMemo(() => {
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    let base = 7200000;
    return months.map((m) => {
      base = Math.round(base * (1 + (Math.random() * 0.03 + 0.005)));
      return { month: m, netWorth: base };
    });
  }, []);

  return (
    <div className="space-y-8 animate-fadeUp pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl md:text-[40px] leading-tight text-text-main">
          {greeting}, User.
        </h1>
        <p className="text-sm font-medium text-text-muted tracking-tight">{formattedDate} • Market is Open</p>
      </div>

      {/* AI Insight Bar */}
      <div className="relative overflow-hidden bg-white border border-border shadow-sm rounded-[16px] p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-5 group hover:border-gold-dim hover:shadow-md transition-all">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-dim to-emerald-dim opacity-50 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-white to-transparent pointer-events-none z-0"></div>
        
        <div className="relative z-10 w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-border/80 group-hover:scale-105 group-hover:border-blue/20 transition-all duration-500">
          <Sparkles className="text-blue w-5 h-5" />
        </div>
        <div className="relative z-10 flex-1">
          <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase text-blue mb-1.5 flex items-center gap-2">
            AI Insight
            <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse"></span>
          </h3>
          <p className="text-[14px] text-text-sec leading-relaxed max-w-[800px]">
            Your dining spend is 22% above your 3-month average. Redirecting <strong className="text-text-main font-semibold">₹3,000</strong> to your Home Goal SIP this month would add <strong className="text-emerald font-semibold">₹8.4L</strong> to your corpus in 12 years.
          </p>
        </div>
        <button className="relative z-10 shrink-0 text-xs font-bold text-white bg-blue px-5 py-3 rounded-lg hover:shadow-lg hover:bg-blue/90 hover:-translate-y-[2px] transition-all">
          Apply Strategy
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        <KpiCard title="Net Worth" value="₹1.24Cr" change="+2.4%" isPositive={true} />
        <KpiCard title="Total Assets" value="₹1.48Cr" change="+1.8%" isPositive={true} />
        <KpiCard title="Total Liabs" value="₹24.0L" change="-0.5%" isPositive={false} />
        <KpiCard title="Cashflow" value="₹1.8L" change="+12.0%" isPositive={true} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-[16px] p-6 shadow-sm flex flex-col h-[380px] hover:border-border-light transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-base">Net Worth</h2>
              <p className="text-[var(--text-muted)] text-xs mt-0.5">12-month progression</p>
            </div>
            <div className="bg-background border border-border rounded-lg p-1 flex">
              <button className="px-3 py-1 text-xs font-bold rounded-md bg-card shadow-sm text-text-main">1Y</button>
              <button className="px-3 py-1 text-xs font-bold rounded-md text-text-muted hover:text-text-main transition-colors">5Y</button>
              <button className="px-3 py-1 text-xs font-bold rounded-md text-text-muted hover:text-text-main transition-colors">Max</button>
            </div>
          </div>
          <div className="flex-1 min-h-0 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wealthData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--emerald)" stopOpacity={0.2} />
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
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="netWorth" stroke="var(--emerald)" strokeWidth={2.5} fill="url(#wealthGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-[16px] p-6 shadow-sm flex flex-col h-[380px] hover:border-border-light transition-colors">
          <h2 className="font-semibold text-base mb-6 border-b border-border pb-4">Asset Allocation</h2>
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            {/* Donut Chart Placeholder */}
            <div className="relative w-40 h-40 rounded-full aspect-square shadow-sm" style={{ background: "conic-gradient(var(--blue) 0deg 160deg, var(--emerald) 160deg 260deg, var(--gold) 260deg 310deg, #8B5CF6 310deg 360deg)" }}>
              <div className="absolute inset-3 bg-card rounded-full flex flex-col items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                 <span className="text-[10px] font-bold text-text-muted tracking-[0.1em] uppercase mb-0.5">Total</span>
                 <span className="font-mono text-xl font-medium tracking-tight">100%</span>
              </div>
            </div>
            
            <div className="w-full space-y-3.5 px-2">
              <AllocationRow color="bg-blue" label="Equity" value="45%" amount="₹66.6L" />
              <AllocationRow color="bg-emerald" label="Real Estate" value="30%" amount="₹44.4L" />
              <AllocationRow color="bg-gold" label="Debt" value="15%" amount="₹22.2L" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-[16px] shadow-sm overflow-hidden hover:border-border-light transition-colors">
        <div className="p-6 border-b border-border flex items-center justify-between bg-card">
          <h2 className="font-semibold text-base">Recent Transactions</h2>
          <button className="text-[11px] font-bold tracking-widest uppercase text-text-sec hover:text-text-main transition-colors flex items-center gap-1">
            View All
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-background/80 text-[10px] uppercase tracking-[0.1em] text-text-muted font-bold border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold">Transaction</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <TransactionRow icon={<FileText size={16}/>} name="Salary Deposit" category="Income" date="Oct 24, 2024" amount="+₹1,50,000" isPositive={true}/>
              <TransactionRow icon={<FileText size={16}/>} name="Nifty 50 Index Fund" category="Investment" date="Oct 22, 2024" amount="-₹25,000" isPositive={false}/>
              <TransactionRow icon={<FileText size={16}/>} name="HDFC Credit Card Bill" category="Expenses" date="Oct 20, 2024" amount="-₹42,300" isPositive={false}/>
              <TransactionRow icon={<FileText size={16}/>} name="Quarterly Dividend" category="Passive Income" date="Oct 15, 2024" amount="+₹8,500" isPositive={true}/>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function KpiCard({ title, value, change, isPositive }: { title: string, value: string, change: string, isPositive: boolean }) {
  return (
    <div className="bg-card border border-border rounded-[16px] p-3 md:p-5 shadow-sm hover:shadow-md hover:border-border-light transition-all hover:-translate-y-[2px] cursor-default flex flex-col justify-between h-[100px] md:h-[130px] group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-[3px] md:h-1 ${isPositive ? 'bg-emerald-dim group-hover:bg-emerald/20' : 'bg-red/5 group-hover:bg-red/10'} transition-colors`}></div>
      <h3 className="text-[9px] md:text-[10px] font-bold tracking-[0.1em] text-text-muted uppercase mb-1 md:mb-2 mt-1 truncate">{title}</h3>
      <div>
        <div className="font-mono text-[18px] md:text-[28px] font-medium text-text-main tracking-tight leading-none mb-1.5 md:mb-3 truncate">{value}</div>
        <div className="flex items-center gap-1 md:gap-1.5 font-medium text-[10px] md:text-xs">
          <div className={`w-3.5 h-3.5 md:w-5 md:h-5 rounded-full flex items-center justify-center ${isPositive ? 'bg-emerald-dim text-emerald' : 'bg-red/10 text-red'}`}>
            {isPositive ? <TrendingUp size={10} strokeWidth={3} className="md:w-3 md:h-3" /> : <TrendingDown size={10} strokeWidth={3} className="md:w-3 md:h-3" />}
          </div>
          <span className={isPositive ? "text-emerald font-bold" : "text-red font-bold"}>{change}</span>
          <span className="text-text-muted font-medium ml-0.5 md:ml-1 hidden md:inline">vs last month</span>
        </div>
      </div>
    </div>
  )
}

function AllocationRow({ color, label, value, amount }: { color: string, label: string, value: string, amount: string }) {
  return (
    <div className="flex items-center justify-between text-[13px] group cursor-default">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color} shadow-sm group-hover:scale-110 transition-transform`}></div>
        <span className="text-text-sec font-medium group-hover:text-text-main transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-text-muted group-hover:text-text-sec transition-colors">{value}</span>
        <span className="font-mono text-text-main font-medium w-16 text-right leading-none group-hover:text-gold transition-colors">{amount}</span>
      </div>
    </div>
  )
}

function TransactionRow({ icon, name, category, date, amount, isPositive }: { icon: React.ReactNode, name: string, category: string, date: string, amount: string, isPositive: boolean }) {
  return (
    <tr className="hover:bg-card-hover/50 transition-colors group cursor-default">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-text-muted group-hover:bg-card shadow-sm transition-all duration-300">
            {icon}
          </div>
          <span className="font-semibold text-text-main group-hover:text-gold transition-colors">{name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-text-sec font-medium text-[13px]">
        {category}
      </td>
      <td className="px-6 py-4 text-text-muted text-xs font-medium">
        {date}
      </td>
      <td className={`px-6 py-4 text-right font-mono font-medium ${isPositive ? 'text-emerald' : 'text-text-main'}`}>
        {amount}
      </td>
    </tr>
  )
}
