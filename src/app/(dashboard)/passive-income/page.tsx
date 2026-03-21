import React from "react"
import { Zap, Coins, Building, LineChart, Briefcase, Sparkles, TrendingUp } from "lucide-react"

export const metadata = {
  title: "Passive Income Hub | Monetra",
  description: "AI-curated passive income opportunities based on your surplus.",
}

export default function PassiveIncomePage() {
  const opportunities = [
    {
      id: 1,
      title: "Dividend Stocks",
      description: "NTPC & ITC current average dividend yield is 4.2%. At your ₹2L portfolio size, this generates ~₹700/month.",
      icon: <Coins size={18} />,
      color: "text-[var(--gold)]",
      bg: "bg-[var(--gold-dim)]",
      risk: "Moderate",
      yield: "4.2% p.a.",
    },
    {
      id: 2,
      title: "Debt MF / FD Laddering",
      description: "Split ₹1L across 3/6/12-month FDs to maintain liquidity while earning higher returns than your savings account.",
      icon: <LineChart size={18} />,
      color: "text-[var(--blue)]",
      bg: "bg-[var(--blue-dim)]",
      risk: "Low",
      yield: "7.1% p.a.",
    },
    {
      id: 3,
      title: "Commercial REITs",
      description: "Embassy Office Parks REIT currently offers stable rental income from premium IT parks, without owning physical property.",
      icon: <Building size={18} />,
      color: "text-[var(--blue)]",
      bg: "bg-[var(--blue-dim)]",
      risk: "Moderate",
      yield: "6.8% p.a.",
    },
    {
      id: 4,
      title: "P2P Lending",
      description: "Lend via RBI-regulated platforms like Liquiloans for stable yield. Recommended allocation: < 5% of debt portfolio.",
      icon: <Briefcase size={18} />,
      color: "text-[var(--emerald)]",
      bg: "bg-[var(--emerald-dim)]",
      risk: "Moderately High",
      yield: "9-11% p.a.",
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-[var(--text-main)]">Passive Income Hub</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">AI-curated opportunities tailored to your ₹15,000 monthly surplus.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-[12px]">
          <Sparkles size={14} />
          Build My Income Plan
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="section-label mb-2">Current Passive Income</p>
          <div className="font-mono text-2xl font-bold text-[var(--text-main)] flex items-center justify-center gap-1.5">
            ₹1,240 <span className="text-sm text-[var(--text-muted)] font-normal font-sans">/ mo</span>
          </div>
          <p className="text-[10px] text-[var(--emerald)] font-semibold mt-2 bg-[var(--emerald-dim)] px-2 py-0.5 rounded-full w-fit mx-auto">
            +12% from last month
          </p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <p className="section-label mb-2">Projected at Year 5</p>
          <div className="font-mono text-2xl font-bold text-[var(--text-main)] flex items-center justify-center gap-1.5">
            ₹8,500 <span className="text-sm text-[var(--text-muted)] font-normal font-sans">/ mo</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-2">Assumes 15k SIP continuation</p>
        </div>
        
        <div className="md:col-span-2 glass-card p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--blue-dim)] to-[var(--gold-dim)] opacity-30 pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full justify-center">
            <h3 className="text-[15px] font-semibold text-[var(--text-main)] mb-2">Want to reach ₹25,000 / month?</h3>
            <p className="text-[12px] text-[var(--text-sec)] leading-relaxed mb-4">
              Your AI Financial Advisor can generate a complete 3-tiered (Short/Medium/Long term) passive income strategy based on your unique data.
            </p>
            <div className="mt-auto">
              <span className="section-label text-[var(--gold)] bg-[var(--gold-dim)] px-2 py-1 rounded-lg">
                Pro Feature
              </span>
            </div>
          </div>
          <Sparkles className="absolute -bottom-4 -right-4 text-[var(--gold)] opacity-5" size={100} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-serif text-xl text-[var(--text-main)]">Curated For You</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <div key={opp.id} className="glass-card glass-panel-hover p-5 flex flex-col group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--glow-gold)] rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${opp.bg} ${opp.color} group-hover:scale-110 transition-transform duration-300`}>
                  {opp.icon}
                </div>
                <div className="text-right">
                  <span className="section-label block mb-0.5">Expected Yield</span>
                  <span className="text-[13px] font-semibold text-[var(--emerald)]">{opp.yield}</span>
                </div>
              </div>
              
              <h3 className="text-[14px] font-semibold text-[var(--text-main)] mb-1.5 group-hover:text-[var(--gold)] transition-colors duration-300">{opp.title}</h3>
              <p className="text-[12px] text-[var(--text-sec)] leading-relaxed flex-1">
                {opp.description}
              </p>
              
              <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-[10px] font-semibold px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-muted)]">
                  Risk: {opp.risk}
                </span>
                <button className="text-[11px] font-semibold text-[var(--gold)] hover:underline flex items-center gap-1">
                  Learn more →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
