'use client'

import React from "react"
import { Target, TrendingUp, Plus, Edit2, PlayCircle, Trophy } from "lucide-react"
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export default function GoalsPage() {
  const supabase = createClient()
  
  const { data: dbGoals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase.from('goals').select('*')
      if (error) throw error
      return data || []
    }
  })

  const goals = dbGoals.map((g: any) => ({
    id: g.id,
    name: g.name,
    type: g.goal_type || 'other',
    targetAmount: Number(g.target_amount) || 1,
    currentAmount: Number(g.current_amount) || 0,
    monthlySip: 0,
    targetYear: g.target_date ? new Date(g.target_date).getFullYear() : new Date().getFullYear(),
  }))

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'home': return { bg: 'bg-[var(--blue-dim)]', text: 'text-[var(--blue)]', icon: <Target size={18} /> }
      case 'emergency': return { bg: 'bg-[var(--gold-dim)]', text: 'text-[var(--gold)]', icon: <Trophy size={18} /> }
      default: return { bg: 'bg-[var(--emerald-dim)]', text: 'text-[var(--emerald)]', icon: <TrendingUp size={18} /> }
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-[var(--text-main)]">Goals Tracker</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1">Track your financial goals and get AI suggestions to accelerate them.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-[12px]">
          <Plus size={14} />
          New Goal
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <div key={i} className="glass-card p-6 h-[260px] animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] mb-4" />
              <div className="h-4 w-32 bg-[var(--surface)] rounded mb-2" />
              <div className="h-3 w-20 bg-[var(--surface)] rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
            const style = getTypeStyle(goal.type)
            return (
              <div key={goal.id} className="glass-card overflow-hidden flex flex-col group">
                <div className="p-5 pb-4 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${style.bg} ${style.text} group-hover:scale-110 transition-transform duration-300`}>
                      {style.icon}
                    </div>
                    <div>
                      <h3 className="text-[14px] font-semibold text-[var(--text-main)]">{goal.name}</h3>
                      <p className="text-[11px] text-[var(--text-muted)]">Target: {goal.targetYear}</p>
                    </div>
                  </div>
                  <button className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg hover:bg-[var(--surface)] transition-all duration-300">
                    <Edit2 size={14} />
                  </button>
                </div>
                
                <div className="px-5 pb-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-[11px] text-[var(--text-muted)] mb-0.5">Progress</p>
                      <p className="text-lg font-mono font-medium text-[var(--text-main)]">
                        ₹{(goal.currentAmount / 100000).toFixed(1)}L <span className="text-[11px] text-[var(--text-muted)] font-sans font-normal">/ ₹{(goal.targetAmount / 100000).toFixed(1)}L</span>
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-[var(--gold)]">{progress}%</div>
                  </div>
                  
                  <div className="h-1.5 w-full bg-[var(--surface)] rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-[var(--gold)] rounded-full transition-all duration-700 ease-premium"
                      style={{ width: progress + "%" }}
                    />
                  </div>
                  
                  <div className="mt-auto grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border)]">
                    <div>
                      <p className="section-label mb-0.5">Monthly SIP</p>
                      <p className="font-mono text-[13px] font-medium text-[var(--text-main)]">₹{goal.monthlySip.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="section-label mb-0.5">Time Left</p>
                      <p className="text-[13px] font-medium text-[var(--text-main)]">{goal.targetYear - new Date().getFullYear()} Years</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--blue-dim)]/30">
                  <button className="flex items-center justify-center gap-2 w-full text-[12px] font-semibold text-[var(--blue)] hover:text-[var(--text-main)] transition-colors duration-300">
                    <PlayCircle size={14} />
                    Accelerate this goal
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Goal Simulator */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-[var(--text-main)] mb-1 flex items-center gap-2">
          <PlayCircle size={18} className="text-[var(--blue)]" />
          Goal Simulator
        </h2>
        <p className="text-[13px] text-[var(--text-muted)] mb-6">See how increasing investments pulls your goals closer.</p>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[12px] font-medium text-[var(--text-sec)]">Extra Monthly Investment</label>
                <span className="font-mono text-[12px] font-bold text-[var(--gold)]">₹10,000</span>
              </div>
              <input type="range" min="0" max="50000" step="1000" defaultValue="10000" />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1.5">
                <span>₹0</span>
                <span>₹50,000</span>
              </div>
            </div>
            
            <div className="glass-card p-4">
              <h3 className="section-label text-[var(--blue)] mb-2">AI Suggestion</h3>
              <p className="text-[13px] text-[var(--text-sec)] leading-relaxed">
                Based on your spending analysis, you can add <strong className="text-[var(--emerald)] font-mono">₹8,500</strong> to investments by reducing Dining Out by 15%.
              </p>
            </div>
          </div>
          
          <div className="glass-card p-5">
            <h3 className="text-[12px] font-medium text-center mb-4 text-[var(--text-muted)]">Impact on &ldquo;Buy a Home&rdquo; Goal</h3>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="section-label mb-1">Current Expected</p>
                <p className="text-2xl font-serif font-bold text-[var(--text-main)]">2030</p>
              </div>
              <div className="text-[var(--gold)] font-bold text-lg">→</div>
              <div className="text-center">
                <p className="section-label mb-1">New Expected</p>
                <p className="text-3xl font-serif font-bold text-[var(--emerald)]">2027</p>
                <p className="text-[10px] text-[var(--emerald)] font-semibold mt-1">3 years earlier!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
