import React from "react"
import { Zap, Coins, Building, LineChart, Briefcase, Plus, TrendingUp, Sparkles } from "lucide-react"

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
      icon: <Coins className="text-amber-500" size={24} />,
      bg: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
      risk: "Moderate",
      yield: "4.2% p.a.",
    },
    {
      id: 2,
      title: "Debt MF / FD Laddering",
      description: "Split ₹1L across 3/6/12-month FDs to maintain liquidity while earning higher returns than your savings account.",
      icon: <LineChart className="text-blue-500" size={24} />,
      bg: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
      risk: "Low",
      yield: "7.1% p.a.",
    },
    {
      id: 3,
      title: "Commercial REITs",
      description: "Embassy Office Parks REIT currently offers stable rental income from premium IT parks, without owning physical property.",
      icon: <Building className="text-indigo-500" size={24} />,
      bg: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
      risk: "Moderate",
      yield: "6.8% p.a.",
    },
    {
      id: 4,
      title: "P2P Lending",
      description: "Lend via RBI-regulated platforms like Liquiloans for stable yield. Recommended allocation: < 5% of debt portfolio.",
      icon: <Briefcase className="text-green-500" size={24} />,
      bg: "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400",
      risk: "Moderately High",
      yield: "9-11% p.a.",
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Passive Income Hub</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">AI-curated opportunities tailored to your ₹15,000 monthly surplus and moderate risk profile.</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md shadow-indigo-500/20">
          <Sparkles size={18} />
          <span>Build My Income Plan</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border rounded-xl p-5 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">Current Passive Income</p>
          <div className="text-3xl font-bold font-mono text-primary flex items-center justify-center gap-2">
            ₹1,240 <span className="text-lg text-muted-foreground font-normal">/ mo</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded w-fit mx-auto">
            +12% from last month
          </p>
        </div>
        
        <div className="bg-card border rounded-xl p-5 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">Projected at Year 5</p>
          <div className="text-3xl font-bold font-mono flex items-center justify-center gap-2">
            ₹8,500 <span className="text-lg text-muted-foreground font-normal">/ mo</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 px-2">Assumes 15k SIP continuation</p>
        </div>
        
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-5 relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full justify-center">
            <h3 className="font-semibold text-lg text-indigo-900 dark:text-indigo-200 mb-2">Want to reach ₹25,000 / month?</h3>
            <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed mb-4">
              Your AI Financial Advisor can generate a complete 3-tiered (Short/Medium/Long term) passive income strategy based on your unique data.
            </p>
            <div className="mt-auto">
              <span className="text-xs font-semibold px-2 py-1 bg-white/60 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded uppercase tracking-wider">
                Pro Feature
              </span>
            </div>
          </div>
          <Sparkles className="absolute -bottom-4 -right-4 text-indigo-500/10 dark:text-indigo-400/5" size={120} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Curated For You</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <div key={opp.id} className="bg-card border rounded-xl p-6 group hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={"p-3 rounded-xl " + opp.bg}>
                  {opp.icon}
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-muted-foreground block mb-1">Expected Yield</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{opp.yield}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{opp.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {opp.description}
              </p>
              
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <span className="text-xs font-medium px-2.5 py-1 bg-muted rounded-full">
                  Risk: {opp.risk}
                </span>
                <button className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                  Learn more &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
