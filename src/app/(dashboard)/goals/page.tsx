'use client'

import React from "react"
import { Target, TrendingUp, Plus, Edit2, PlayCircle, Trophy, IndianRupee } from "lucide-react"
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals Tracker</h1>
          <p className="text-muted-foreground mt-1">Track your financial goals and get AI suggestions to accelerate them.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
          <Plus size={18} />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
          return (
            <div key={goal.id} className="bg-card border rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-5 border-b bg-muted/20 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={"p-2 rounded-lg " + (
                    goal.type === 'home' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                    goal.type === 'emergency' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  )}>
                    {goal.type === 'home' ? <Target size={20} /> :
                     goal.type === 'emergency' ? <Trophy size={20} /> : <TrendingUp size={20} />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{goal.name}</h3>
                    <p className="text-xs text-muted-foreground">Target: {goal.targetYear}</p>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <Edit2 size={16} />
                </button>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Progress</p>
                    <p className="text-xl font-bold font-mono">
                      ₹{(goal.currentAmount / 100000).toFixed(1)}L <span className="text-sm text-muted-foreground font-normal">/ ₹{(goal.targetAmount / 100000).toFixed(1)}L</span>
                    </p>
                  </div>
                  <div className="text-lg font-bold text-primary">{progress}%</div>
                </div>
                
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: progress + "%" }}
                  ></div>
                </div>
                
                <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Monthly SIP</p>
                    <p className="font-medium font-mono">₹{goal.monthlySip.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Time Left</p>
                    <p className="font-medium">{goal.targetYear - new Date().getFullYear()} Years</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border-t flex justify-center">
                <button className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  <PlayCircle size={16} />
                  Accelerate this goal
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 bg-card border rounded-xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <PlayCircle size={20} className="text-blue-500" />
          Goal Simulator
        </h2>
        <p className="text-sm text-muted-foreground mb-6">See how increasing your investments can pull your goal achievements closer.</p>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Extra Monthly Investment</label>
                <span className="font-mono font-bold text-primary">₹10,000</span>
              </div>
              <input type="range" min="0" max="50000" step="1000" defaultValue="10000" className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>₹0</span>
                <span>₹50,000</span>
              </div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg border">
              <h3 className="text-sm font-semibold mb-3">AI Suggestion</h3>
              <p className="text-sm">Based on your spending analysis, you can comfortably add <strong className="text-green-600 dark:text-green-400 font-mono">₹8,500</strong> to your investments by reducing your Dining Out category by 15%.</p>
            </div>
          </div>
          
          <div className="border bg-background rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-center mb-4 text-muted-foreground">Impact on "Buy a Home" Goal</h3>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Current Expected</p>
                <p className="text-2xl font-bold">2030</p>
              </div>
              <div className="text-blue-500 font-bold">→</div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">New Expected</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">2027</p>
                <p className="text-xs text-green-600/80 dark:text-green-400/80 font-medium mt-1">3 years earlier!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
