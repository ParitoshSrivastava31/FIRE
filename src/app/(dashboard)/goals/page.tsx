'use client'

import React, { useState } from "react"
import { Target, Plus, Edit2, PlayCircle, ChevronRight, Sparkles } from "lucide-react"
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { haptic } from '@/lib/native/haptics'

const GOAL_EMOJIS: Record<string, string> = {
  home: '🏠', car: '🚗', retirement: '🌴', education: '🎓',
  wedding: '💒', travel: '🌍', startup: '🚀', emergency: '🛡️',
}

function formatINR(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
  return `₹${val.toLocaleString('en-IN')}`
}

export default function GoalsPage() {
  const supabase = createClient()
  const [extraInvestment, setExtraInvestment] = useState(10000)
  const [showSimulator, setShowSimulator] = useState(false)

  const { data: dbGoals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return []
      const { data, error } = await supabase.from('goals').select('*')
      if (error) throw error
      return data || []
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const goals = dbGoals.map((g: any) => ({
    id: g.id,
    name: g.name,
    type: g.goal_type || 'other',
    targetAmount: Number(g.target_amount) || 1,
    currentAmount: Number(g.current_amount) || 0,
    monthlySip: Number(g.monthly_sip) || 0,
    targetYear: g.target_date ? new Date(g.target_date).getFullYear() : new Date().getFullYear() + 5,
  }))

  const totalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount), 0) / goals.length * 100)
    : 0

  const getProgressColor = (pct: number) => {
    if (pct >= 75) return 'bg-[var(--emerald)]'
    if (pct >= 40) return 'bg-[var(--gold)]'
    return 'bg-[var(--blue)]'
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 pb-10 animate-fadeUp">
        <div className="h-8 w-36 bg-[var(--surface-raised)] rounded-lg animate-pulse" />
        <div className="h-4 w-56 bg-[var(--surface)] rounded-md animate-pulse" />
        <div className="grid gap-3 mt-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card p-5 h-[140px] animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] mb-4" />
              <div className="h-4 w-32 bg-[var(--surface)] rounded mb-2" />
              <div className="h-2 w-full bg-[var(--surface)] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-[var(--text-main)]">Goals</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
            {goals.length > 0 ? `${goals.length} active · ${totalProgress}% avg progress` : 'Set your first financial goal'}
          </p>
        </div>
        <button
          onClick={() => haptic.light()}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--gold)] text-white shadow-lg shadow-[var(--gold)]/20 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Goal Cards — mobile-optimized stacked list */}
      {goals.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center gap-3 animate-fadeUp">
          <div className="w-16 h-16 rounded-2xl bg-[var(--gold-dim)] flex items-center justify-center">
            <Target size={28} className="text-[var(--gold)]" />
          </div>
          <p className="text-base font-semibold text-[var(--text-main)]">No goals yet</p>
          <p className="text-sm text-[var(--text-muted)] max-w-[240px]">
            Tap the + button to create your first financial goal. We&apos;ll help you build a plan to reach it.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal, idx) => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
            const emoji = GOAL_EMOJIS[goal.type] || '🎯'
            const yearsLeft = goal.targetYear - new Date().getFullYear()

            return (
              <div
                key={goal.id}
                className="glass-card overflow-hidden active:scale-[0.99] transition-all duration-200"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="p-4">
                  {/* Top row: icon + name + edit */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xl shrink-0">
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-semibold text-[var(--text-main)] truncate">{goal.name}</h3>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {yearsLeft > 0 ? `${yearsLeft}Y left` : 'Target reached'} · Target {goal.targetYear}
                      </p>
                    </div>
                    <button
                      onClick={() => haptic.light()}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface)] transition-all active:scale-90"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-sm font-medium text-[var(--text-main)]">
                        {formatINR(goal.currentAmount)}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">
                        {formatINR(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[var(--surface)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-premium ${getProgressColor(progress)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] font-semibold text-[var(--gold)]">{progress}% done</span>
                      {goal.monthlySip > 0 && (
                        <span className="text-[10px] text-[var(--text-muted)]">
                          SIP: {formatINR(goal.monthlySip)}/mo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA */}
                <button
                  onClick={() => haptic.light()}
                  className="w-full py-2.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[var(--blue)] bg-[var(--blue-dim)]/40 border-t border-[var(--border)] active:bg-[var(--blue-dim)] transition-colors"
                >
                  <Sparkles size={12} />
                  Accelerate this goal
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Goal Simulator */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => { haptic.light(); setShowSimulator(!showSimulator) }}
          className="w-full p-4 flex items-center gap-3 active:bg-[var(--surface-hover)] transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--blue-dim)] flex items-center justify-center text-[var(--blue)] shrink-0">
            <PlayCircle size={20} />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-[13px] font-semibold text-[var(--text-main)]">Goal Simulator</h3>
            <p className="text-[11px] text-[var(--text-muted)]">See how extra investments pull goals closer</p>
          </div>
          <ChevronRight
            size={16}
            className={`text-[var(--text-muted)] transition-transform duration-200 ${showSimulator ? 'rotate-90' : ''}`}
          />
        </button>

        {showSimulator && (
          <div className="px-4 pb-5 space-y-5 animate-fadeUp border-t border-[var(--border)]">
            <div className="pt-4">
              <div className="flex justify-between mb-2">
                <label className="text-[12px] font-medium text-[var(--text-sec)]">Extra Monthly Investment</label>
                <span className="font-mono text-[12px] font-bold text-[var(--gold)]">
                  {formatINR(extraInvestment)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50000}
                step={1000}
                value={extraInvestment}
                onChange={(e) => setExtraInvestment(parseInt(e.target.value))}
                className="w-full accent-[var(--gold)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
                <span>₹0</span>
                <span>₹50,000</span>
              </div>
            </div>

            {/* AI Suggestion */}
            <div className="glass-card p-4 border-[var(--blue)]/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={12} className="text-[var(--blue)]" />
                <h4 className="section-label text-[var(--blue)]">AI Suggestion</h4>
              </div>
              <p className="text-[12px] text-[var(--text-sec)] leading-relaxed">
                Based on your spending, you can add <strong className="text-[var(--emerald)] font-mono">₹8,500</strong> to investments by reducing Dining Out by 15%.
              </p>
            </div>

            {/* Impact Preview */}
            <div className="glass-card p-4 text-center">
              <p className="text-[11px] text-[var(--text-muted)] mb-3">Impact on Primary Goal</p>
              <div className="flex items-center justify-center gap-6">
                <div>
                  <p className="section-label mb-1">Current</p>
                  <p className="text-2xl font-serif font-bold text-[var(--text-main)]">2030</p>
                </div>
                <div className="text-[var(--gold)] font-bold text-xl">→</div>
                <div>
                  <p className="section-label mb-1">With {formatINR(extraInvestment)}/mo</p>
                  <p className="text-3xl font-serif font-bold text-[var(--emerald)]">
                    {2030 - Math.floor(extraInvestment / 5000)}
                  </p>
                  {extraInvestment > 0 && (
                    <p className="text-[10px] text-[var(--emerald)] font-semibold mt-1">
                      {Math.floor(extraInvestment / 5000)} years earlier!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
