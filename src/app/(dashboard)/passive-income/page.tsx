'use client'

import React, { useState } from "react"
import { Coins, Building, LineChart, Briefcase, Sparkles, TrendingUp, ChevronRight, ArrowUpRight } from "lucide-react"
import { haptic } from '@/lib/native/haptics'

type RiskLevel = 'Low' | 'Moderate' | 'Moderately High' | 'High'

interface Opportunity {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  color: string
  bg: string
  risk: RiskLevel
  yield: string
  minInvestment: string
}

const RISK_COLORS: Record<RiskLevel, string> = {
  'Low': 'text-[var(--emerald)] bg-[var(--emerald-dim)]',
  'Moderate': 'text-[var(--gold)] bg-[var(--gold-dim)]',
  'Moderately High': 'text-[var(--blue)] bg-[var(--blue-dim)]',
  'High': 'text-[var(--red)] bg-[var(--red)]/10',
}

const opportunities: Opportunity[] = [
  {
    id: 1,
    title: "Dividend Stocks",
    description: "NTPC & ITC current average dividend yield is 4.2%. At your ₹2L portfolio size, this generates ~₹700/month.",
    icon: <Coins size={18} />,
    color: "text-[var(--gold)]",
    bg: "bg-[var(--gold-dim)]",
    risk: "Moderate",
    yield: "4.2%",
    minInvestment: "₹10,000",
  },
  {
    id: 2,
    title: "Debt MF / FD Laddering",
    description: "Split ₹1L across 3/6/12-month FDs to maintain liquidity while earning higher returns than savings.",
    icon: <LineChart size={18} />,
    color: "text-[var(--blue)]",
    bg: "bg-[var(--blue-dim)]",
    risk: "Low",
    yield: "7.1%",
    minInvestment: "₹5,000",
  },
  {
    id: 3,
    title: "Commercial REITs",
    description: "Embassy Office Parks REIT offers stable rental income from premium IT parks, without owning physical property.",
    icon: <Building size={18} />,
    color: "text-[var(--blue)]",
    bg: "bg-[var(--blue-dim)]",
    risk: "Moderate",
    yield: "6.8%",
    minInvestment: "₹15,000",
  },
  {
    id: 4,
    title: "P2P Lending",
    description: "Lend via RBI-regulated platforms for stable yield. Recommended allocation: < 5% of debt portfolio.",
    icon: <Briefcase size={18} />,
    color: "text-[var(--emerald)]",
    bg: "bg-[var(--emerald-dim)]",
    risk: "Moderately High",
    yield: "9-11%",
    minInvestment: "₹10,000",
  }
]


export default function PassiveIncomePage() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const currentPassiveIncome = 1240
  const projectedYear5 = 8500
  const monthlyTarget = 25000

  const toggleExpand = async (id: number) => {
    await haptic.light()
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-[var(--text-main)]">Passive Income</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">AI-curated income streams for your surplus</p>
        </div>
        <button
          onClick={() => haptic.medium()}
          className="flex items-center gap-1.5 text-[12px] font-semibold btn-primary !px-4 !py-2"
        >
          <Sparkles size={14} />
          Build Plan
        </button>
      </div>

      {/* KPI Row — 2-column on mobile */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <p className="section-label mb-1.5">Current Income</p>
          <div className="font-mono text-xl font-bold text-[var(--text-main)] flex items-baseline gap-1">
            ₹{currentPassiveIncome.toLocaleString('en-IN')}
            <span className="text-[11px] text-[var(--text-muted)] font-normal font-sans">/mo</span>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-[var(--emerald-dim)] flex items-center justify-center">
              <TrendingUp size={8} className="text-[var(--emerald)]" strokeWidth={3} />
            </div>
            <span className="text-[10px] font-semibold text-[var(--emerald)]">+12% from last month</span>
          </div>
        </div>
        <div className="glass-card p-4">
          <p className="section-label mb-1.5">Projected (5Y)</p>
          <div className="font-mono text-xl font-bold text-[var(--text-main)] flex items-baseline gap-1">
            ₹{projectedYear5.toLocaleString('en-IN')}
            <span className="text-[11px] text-[var(--text-muted)] font-normal font-sans">/mo</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-2">Assumes ₹15K SIP</p>
        </div>
      </div>

      {/* Progress toward target */}
      <div className="glass-card p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--blue-dim)] to-[var(--gold-dim)] opacity-20 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-medium text-[var(--text-sec)]">
              Progress to ₹{monthlyTarget.toLocaleString('en-IN')}/mo
            </p>
            <span className="text-[11px] font-bold text-[var(--gold)]">
              {Math.round((currentPassiveIncome / monthlyTarget) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full bg-[var(--surface)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--blue)] to-[var(--gold)] rounded-full transition-all duration-700"
              style={{ width: `${Math.round((currentPassiveIncome / monthlyTarget) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-[var(--text-muted)]">
            <span>₹{currentPassiveIncome.toLocaleString('en-IN')}</span>
            <span>₹{monthlyTarget.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Opportunities */}
      <div>
        <h2 className="text-[14px] font-semibold text-[var(--text-main)] mb-3 flex items-center gap-2">
          <Sparkles size={14} className="text-[var(--gold)]" />
          Curated For You
        </h2>
        <div className="space-y-2.5">
          {opportunities.map((opp, idx) => (
            <div
              key={opp.id}
              className="glass-card overflow-hidden transition-all duration-200 active:scale-[0.99]"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <button
                onClick={() => toggleExpand(opp.id)}
                className="w-full p-4 flex items-center gap-3.5 text-left"
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${opp.bg} ${opp.color}`}>
                  {opp.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[13px] font-semibold text-[var(--text-main)] truncate">{opp.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${RISK_COLORS[opp.risk]}`}>
                      {opp.risk}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-[var(--emerald)]">{opp.yield} p.a.</span>
                  </div>
                </div>

                {/* Expand indicator */}
                <ChevronRight
                  size={16}
                  className={`text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${expandedId === opp.id ? 'rotate-90' : ''}`}
                />
              </button>

              {/* Expanded content */}
              {expandedId === opp.id && (
                <div className="px-4 pb-4 space-y-3 animate-fadeUp border-t border-[var(--border)]">
                  <p className="text-[12px] text-[var(--text-sec)] leading-relaxed pt-3">
                    {opp.description}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[var(--surface)] rounded-xl p-3">
                      <p className="section-label mb-0.5">Min. Investment</p>
                      <p className="font-mono text-[13px] font-medium text-[var(--text-main)]">{opp.minInvestment}</p>
                    </div>
                    <div className="bg-[var(--surface)] rounded-xl p-3">
                      <p className="section-label mb-0.5">Expected Yield</p>
                      <p className="font-mono text-[13px] font-medium text-[var(--emerald)]">{opp.yield} p.a.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => haptic.medium()}
                    className="w-full btn-primary flex items-center justify-center gap-2 text-[12px] !py-2.5"
                  >
                    Start Investing <ArrowUpRight size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pro Feature Banner */}
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--blue-dim)] to-[var(--gold-dim)] opacity-30 pointer-events-none" />
        <div className="absolute -bottom-6 -right-6 text-[var(--gold)] opacity-[0.04]">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--gold)] bg-[var(--gold-dim)] px-2 py-1 rounded-lg">
              Pro Feature
            </span>
          </div>
          <h3 className="text-[14px] font-semibold text-[var(--text-main)] mb-1">
            3-Tiered Income Strategy
          </h3>
          <p className="text-[12px] text-[var(--text-sec)] leading-relaxed mb-4">
            Your AI advisor can generate a complete short/medium/long-term passive income plan based on your unique financial data.
          </p>
          <button
            onClick={() => haptic.medium()}
            className="btn-primary flex items-center justify-center gap-2 text-[12px] w-full !py-3"
          >
            <Sparkles size={14} />
            Generate My Income Plan
          </button>
        </div>
      </div>
    </div>
  )
}
