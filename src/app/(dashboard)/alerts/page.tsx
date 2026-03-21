import React from "react"
import { BellRing, ShieldAlert, TrendingDown, CheckCircle2, Info, Settings, Smartphone, Mail, Sparkles } from "lucide-react"

export const metadata = {
  title: "Alerts & Notifications | Monetra",
  description: "Stay updated on your portfolio, goals, and market movements.",
}

export default function AlertsPage() {
  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "Portfolio Concentration Risk",
      message: "Your small-cap allocation has exceeded 40% of your total equity portfolio. Consider rebalancing into large-cap or flexi-cap funds.",
      time: "2 hours ago",
      icon: <ShieldAlert size={16} />,
      color: "text-[var(--gold)]",
      bg: "bg-[var(--gold-dim)]",
    },
    {
      id: 2,
      type: "stock",
      title: "NTPC Price Target Hit",
      message: "NTPC has dropped below your set threshold of ₹310. It is currently at ₹308.50.",
      time: "5 hours ago",
      icon: <TrendingDown size={16} />,
      color: "text-[var(--red)]",
      bg: "bg-[var(--red)]/10",
    },
    {
      id: 3,
      type: "milestone",
      title: "Goal Milestone Reached!",
      message: "Congratulations! You have reached 50% of your Emergency Fund target.",
      time: "1 day ago",
      icon: <CheckCircle2 size={16} />,
      color: "text-[var(--emerald)]",
      bg: "bg-[var(--emerald-dim)]",
    },
    {
      id: 4,
      type: "info",
      title: "SGB Series 2026-I Open",
      message: "The new Sovereign Gold Bond series is open for subscription. This aligns with your 10% gold allocation target.",
      time: "2 days ago",
      icon: <Info size={16} />,
      color: "text-[var(--blue)]",
      bg: "bg-[var(--blue-dim)]",
    },
    {
      id: 5,
      type: "reminder",
      title: "SIP Deduction Tomorrow",
      message: "Your ₹15,000 SIP for Parag Parikh Flexi Cap Fund will be deducted tomorrow. Ensure sufficient balance in your linked bank account.",
      time: "3 days ago",
      icon: <BellRing size={16} />,
      color: "text-[var(--gold)]",
      bg: "bg-[var(--gold-dim)]",
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-[var(--text-main)]">Alerts & Notifications</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">Review your recent financial updates and alerts.</p>
        </div>
        <button className="btn-ghost flex items-center gap-2 text-[12px]">
          <Settings size={14} />
          Alert Settings
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <h2 className="text-sm font-semibold text-[var(--text-main)]">Recent Alerts</h2>
              <button className="section-label hover:text-[var(--text-main)] transition-colors cursor-pointer">Mark all as read</button>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 flex gap-3.5 hover:bg-[var(--surface)] transition-all duration-300 group cursor-default">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${alert.bg} ${alert.color} group-hover:scale-110 transition-transform duration-300`}>
                    {alert.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h3 className="text-[13px] font-semibold text-[var(--text-main)]">{alert.title}</h3>
                      <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">{alert.time}</span>
                    </div>
                    <p className="text-[12px] text-[var(--text-sec)] leading-relaxed">{alert.message}</p>
                    
                    {alert.type === 'warning' && (
                      <button className={`mt-2 text-[11px] font-semibold ${alert.color} hover:underline`}>Review Portfolio</button>
                    )}
                    {alert.type === 'stock' && (
                      <div className="mt-2 flex gap-4">
                        <button className="text-[11px] font-semibold text-[var(--emerald)] hover:underline">Buy Now</button>
                        <button className="text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:underline">Dismiss</button>
                      </div>
                    )}
                    {alert.type === 'info' && (
                      <button className={`mt-2 text-[11px] font-semibold ${alert.color} hover:underline`}>Apply for SGB</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[var(--border)] text-center">
              <button className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">Load older alerts</button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2 mb-4">
              <Settings size={16} className="text-[var(--gold)]" />
              Delivery Preferences
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg"><Smartphone size={14} className="text-[var(--text-muted)]" /></div>
                  <div>
                    <p className="text-[12px] font-medium text-[var(--text-main)]">Push Notifications</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Enabled for all critical alerts</p>
                  </div>
                </div>
                <div className="w-9 h-5 bg-[var(--gold)] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg"><Mail size={14} className="text-[var(--text-muted)]" /></div>
                  <div>
                    <p className="text-[12px] font-medium text-[var(--text-main)]">Email Digest</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Weekly summary on Sunday</p>
                  </div>
                </div>
                <div className="w-9 h-5 bg-[var(--gold)] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-5 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--blue-dim)] to-[var(--gold-dim)] opacity-30 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mx-auto mb-3">
                <span className="text-sm font-bold text-[var(--emerald)]">W</span>
              </div>
              <h3 className="text-[13px] font-semibold text-[var(--text-main)] mb-1.5">WhatsApp Alerts</h3>
              <p className="text-[11px] text-[var(--text-muted)] mb-4 leading-relaxed">Get instant price drops, rebalancing signals, and SIP reminders on WhatsApp.</p>
              <button className="w-full btn-primary text-[11px]">
                Connect WhatsApp (Elite)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
