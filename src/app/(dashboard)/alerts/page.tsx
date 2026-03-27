'use client'

import React, { useState } from "react"
import { BellRing, ShieldAlert, TrendingDown, CheckCircle2, Info, Settings, Smartphone, Mail, ChevronRight, Bell, BellOff } from "lucide-react"
import { haptic } from '@/lib/native/haptics'

type AlertType = 'warning' | 'stock' | 'milestone' | 'info' | 'reminder'

interface Alert {
  id: number
  type: AlertType
  title: string
  message: string
  time: string
  isRead: boolean
}

const INITIAL_ALERTS: Alert[] = [
  {
    id: 1,
    type: "warning",
    title: "Portfolio Concentration Risk",
    message: "Your small-cap allocation has exceeded 40% of your total equity portfolio. Consider rebalancing into large-cap or flexi-cap funds.",
    time: "2 hours ago",
    isRead: false,
  },
  {
    id: 2,
    type: "stock",
    title: "NTPC Price Target Hit",
    message: "NTPC has dropped below your set threshold of ₹310. It is currently at ₹308.50.",
    time: "5 hours ago",
    isRead: false,
  },
  {
    id: 3,
    type: "milestone",
    title: "Goal Milestone Reached!",
    message: "Congratulations! You have reached 50% of your Emergency Fund target.",
    time: "1 day ago",
    isRead: false,
  },
  {
    id: 4,
    type: "info",
    title: "SGB Series 2026-I Open",
    message: "The new Sovereign Gold Bond series is open for subscription. This aligns with your 10% gold allocation target.",
    time: "2 days ago",
    isRead: true,
  },
  {
    id: 5,
    type: "reminder",
    title: "SIP Deduction Tomorrow",
    message: "Your ₹15,000 SIP for Parag Parikh Flexi Cap Fund will be deducted tomorrow. Ensure sufficient balance in your linked bank account.",
    time: "3 days ago",
    isRead: true,
  }
]

const ALERT_STYLE: Record<AlertType, { icon: React.ReactNode; color: string; bg: string }> = {
  warning:   { icon: <ShieldAlert size={16} />,  color: 'text-[var(--gold)]',    bg: 'bg-[var(--gold-dim)]' },
  stock:     { icon: <TrendingDown size={16} />,  color: 'text-[var(--red)]',     bg: 'bg-[var(--red)]/10' },
  milestone: { icon: <CheckCircle2 size={16} />,  color: 'text-[var(--emerald)]', bg: 'bg-[var(--emerald-dim)]' },
  info:      { icon: <Info size={16} />,          color: 'text-[var(--blue)]',    bg: 'bg-[var(--blue-dim)]' },
  reminder:  { icon: <BellRing size={16} />,      color: 'text-[var(--gold)]',    bg: 'bg-[var(--gold-dim)]' },
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  const unreadCount = alerts.filter(a => !a.isRead).length

  const markAllRead = async () => {
    await haptic.light()
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })))
  }

  const markRead = async (id: number) => {
    await haptic.light()
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a))
  }

  const dismissAlert = async (id: number) => {
    await haptic.medium()
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-[var(--text-main)]">Alerts</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-semibold text-[var(--gold)] px-3 py-1.5 rounded-xl border border-[var(--gold)]/20 bg-[var(--gold-dim)] active:scale-95 transition-all"
            >
              Read all
            </button>
          )}
          <button
            onClick={() => { haptic.light(); setShowSettings(!showSettings) }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface)] transition-all active:scale-95"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Settings Panel — collapsible */}
      {showSettings && (
        <div className="glass-card p-5 space-y-4 animate-fadeUp">
          <h3 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
            <Bell size={16} className="text-[var(--gold)]" />
            Notification Preferences
          </h3>
          <ToggleRow
            icon={<Smartphone size={14} />}
            label="Push Notifications"
            sublabel="Instant alerts on your phone"
            enabled={pushEnabled}
            onToggle={() => { haptic.light(); setPushEnabled(!pushEnabled) }}
          />
          <ToggleRow
            icon={<Mail size={14} />}
            label="Email Digest"
            sublabel="Weekly summary every Sunday"
            enabled={emailEnabled}
            onToggle={() => { haptic.light(); setEmailEnabled(!emailEnabled) }}
          />
        </div>
      )}

      {/* Alert List — mobile-first cards */}
      <div className="space-y-2.5">
        {alerts.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center gap-3 animate-fadeUp">
            <div className="w-14 h-14 rounded-2xl bg-[var(--emerald-dim)] flex items-center justify-center">
              <BellOff size={24} className="text-[var(--emerald)]" />
            </div>
            <p className="text-base font-semibold text-[var(--text-main)]">All clear!</p>
            <p className="text-sm text-[var(--text-muted)] max-w-[220px]">No pending alerts. We&apos;ll notify you when something needs attention.</p>
          </div>
        ) : (
          alerts.map((alert, idx) => {
            const style = ALERT_STYLE[alert.type]
            return (
              <div
                key={alert.id}
                className={`glass-card p-4 transition-all duration-300 active:scale-[0.99] ${
                  !alert.isRead ? 'border-l-2 border-l-[var(--gold)]' : ''
                }`}
                style={{ animationDelay: `${idx * 60}ms` }}
                onClick={() => markRead(alert.id)}
              >
                <div className="flex gap-3.5">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}>
                    {style.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className={`text-[13px] font-semibold ${!alert.isRead ? 'text-[var(--text-main)]' : 'text-[var(--text-sec)]'}`}>
                        {alert.title}
                      </h3>
                      <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap shrink-0 pt-0.5">
                        {alert.time}
                      </span>
                    </div>
                    <p className="text-[12px] text-[var(--text-sec)] leading-relaxed">
                      {alert.message}
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 mt-2.5">
                      {alert.type === 'warning' && (
                        <button className="text-[11px] font-semibold text-[var(--gold)] flex items-center gap-1 active:opacity-70">
                          Review Portfolio <ChevronRight size={12} />
                        </button>
                      )}
                      {alert.type === 'stock' && (
                        <>
                          <button className="text-[11px] font-semibold text-[var(--emerald)] active:opacity-70">Buy Now</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id) }}
                            className="text-[11px] font-semibold text-[var(--text-muted)] active:opacity-70"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                      {alert.type === 'info' && (
                        <button className="text-[11px] font-semibold text-[var(--blue)] flex items-center gap-1 active:opacity-70">
                          Learn More <ChevronRight size={12} />
                        </button>
                      )}
                      {alert.type === 'milestone' && (
                        <button className="text-[11px] font-semibold text-[var(--emerald)] flex items-center gap-1 active:opacity-70">
                          View Goal <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!alert.isRead && (
                    <div className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0 mt-1.5 animate-pulse" />
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* WhatsApp CTA */}
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--emerald-dim)] to-[var(--gold-dim)] opacity-30 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-[var(--emerald)]">W</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-semibold text-[var(--text-main)] mb-0.5">WhatsApp Alerts</h3>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Get price drops & SIP reminders on WhatsApp.</p>
          </div>
          <button className="btn-primary text-[11px] !px-4 !py-2 shrink-0">
            Connect
          </button>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ icon, label, sublabel, enabled, onToggle }: {
  icon: React.ReactNode; label: string; sublabel: string; enabled: boolean; onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-muted)]">
          {icon}
        </div>
        <div>
          <p className="text-[12px] font-medium text-[var(--text-main)]">{label}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{sublabel}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${enabled ? 'bg-[var(--gold)]' : 'bg-[var(--border)]'}`}
        role="switch"
        aria-checked={enabled}
        aria-label={label}
      >
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}
