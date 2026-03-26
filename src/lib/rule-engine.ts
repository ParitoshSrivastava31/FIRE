import { createClient } from '@/lib/supabase/server'

export type EventSeverity = 'info' | 'warning' | 'critical'
export type EventType =
  | 'stock_significant_drop'
  | 'stock_significant_gain'
  | 'mf_underperforming_benchmark'
  | 'mf_category_rotation_opportunity'
  | 'portfolio_allocation_drift'
  | 'gold_entry_opportunity'
  | 'gold_exit_signal'
  | 'sip_step_up_due'
  | 'tax_loss_harvesting_opportunity'
  | 'large_expense_investment_bridge'
  | 'goal_milestone_at_risk'
  | 'rebalancing_required'

export interface RuleEvent {
  user_id: string
  event_type: EventType
  severity: EventSeverity
  // The structured data that will be injected into the AI prompt
  // Keep this compact — only what Claude/OpenAI actually needs
  context: {
    asset_name: string
    asset_symbol?: string
    current_value: number
    change_percent?: number
    change_inr?: number
    benchmark_value?: number
    benchmark_delta?: number
    user_allocation_current?: number
    user_allocation_target?: number
    user_goal_name?: string
    user_goal_deadline_months?: number
    holding_quantity?: number
    avg_buy_price?: number
    days_observed?: number
    suggested_action?: 'buy' | 'sell' | 'hold' | 'switch' | 'step_up'
    additional_data?: Record<string, string | number>
  }
}

export async function runRuleEngineForUser(userId: string): Promise<RuleEvent[]> {
  const supabase = await createClient()
  const events: RuleEvent[] = []

  // Fetch user's complete profile in one query
  const { data: user } = await supabase
    .from('users')
    .select(`
      id, risk_profile, monthly_income,
      goals (id, name, target_amount, current_amount, deadline_date, priority),
      portfolio_holdings (
        id, asset_type, asset_symbol, asset_name,
        quantity, avg_buy_price, current_price, current_value,
        invested_amount, allocation_percent, target_allocation_percent
      )
    `)
    .eq('id', userId)
    .single()

  if (!user) return []

  const holdings = user.portfolio_holdings || []
  const goals = user.goals || []

  // Fetch latest market data for all held symbols
  const symbols = holdings.map((h: any) => h.asset_symbol).filter(Boolean)
  const { data: marketData } = await supabase
    .from('market_prices')
    .select('symbol, current_price, previous_close, day_change_percent, price_30d_ago, price_90d_ago')
    .in('symbol', symbols)

  const priceMap = Object.fromEntries((marketData || []).map((m: any) => [m.symbol, m]))

  // Fetch Nifty 50 benchmark for comparison
  const { data: nifty } = await supabase
    .from('market_prices')
    .select('day_change_percent, price_30d_ago, price_90d_ago, current_price')
    .eq('symbol', 'NIFTY50')
    .single()

  // ─────────────────────────────────────────────────────────────────
  // RULE 1: Significant single-day stock drop (threshold: -5%)
  // ─────────────────────────────────────────────────────────────────
  for (const holding of holdings.filter((h: any) => h.asset_type === 'stock')) {
    const price = priceMap[holding.asset_symbol]
    if (!price) continue
    if (price.day_change_percent <= -5) {
      const changeINR = (price.day_change_percent / 100) * holding.current_value
      events.push({
        user_id: userId,
        event_type: 'stock_significant_drop',
        severity: price.day_change_percent <= -8 ? 'critical' : 'warning',
        context: {
          asset_name: holding.asset_name,
          asset_symbol: holding.asset_symbol,
          current_value: holding.current_value,
          change_percent: price.day_change_percent,
          change_inr: changeINR,
          holding_quantity: holding.quantity,
          avg_buy_price: holding.avg_buy_price,
          user_allocation_current: holding.allocation_percent,
        }
      })
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // RULE 2: Significant single-day stock gain (threshold: +7%)
  // Prompt user to consider partial profit booking
  // ─────────────────────────────────────────────────────────────────
  for (const holding of holdings.filter((h: any) => h.asset_type === 'stock')) {
    const price = priceMap[holding.asset_symbol]
    if (!price) continue
    if (price.day_change_percent >= 7) {
      events.push({
        user_id: userId,
        event_type: 'stock_significant_gain',
        severity: 'info',
        context: {
          asset_name: holding.asset_name,
          asset_symbol: holding.asset_symbol,
          current_value: holding.current_value,
          change_percent: price.day_change_percent,
          change_inr: (price.day_change_percent / 100) * holding.current_value,
          holding_quantity: holding.quantity,
          avg_buy_price: holding.avg_buy_price,
        }
      })
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // RULE 3: MF underperforming benchmark over 90 days (threshold: -3% vs Nifty)
  // Only fire once per 30 days per fund to avoid alert fatigue
  // ─────────────────────────────────────────────────────────────────
  for (const holding of holdings.filter((h: any) => h.asset_type === 'mutual_fund')) {
    const price = priceMap[holding.asset_symbol]
    if (!price || !price.price_90d_ago || !nifty?.price_90d_ago) continue

    const mfReturn90d = ((price.current_price - price.price_90d_ago) / price.price_90d_ago) * 100
    const niftyReturn90d = ((nifty.current_price - nifty.price_90d_ago) / nifty.price_90d_ago) * 100
    const underperformance = niftyReturn90d - mfReturn90d

    if (underperformance >= 3) {
      // Check if we already fired this alert in last 30 days
      const { count } = await supabase
        .from('pending_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('event_type', 'mf_underperforming_benchmark')
        .contains('context', { asset_symbol: holding.asset_symbol })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (!count || count === 0) {
        events.push({
          user_id: userId,
          event_type: 'mf_underperforming_benchmark',
          severity: underperformance >= 6 ? 'critical' : 'warning',
          context: {
            asset_name: holding.asset_name,
            asset_symbol: holding.asset_symbol,
            current_value: holding.current_value,
            benchmark_delta: -underperformance,
            days_observed: 90,
            benchmark_value: niftyReturn90d,
            suggested_action: 'switch',
          }
        })
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // RULE 4: Portfolio allocation drift
  // Fire when any asset class drifts more than 8% from target
  // ─────────────────────────────────────────────────────────────────
  const totalPortfolioValue = holdings.reduce((sum: number, h: any) => sum + h.current_value, 0)

  // Group by asset type and compute current allocations
  const allocationByType: Record<string, number> = {}
  for (const holding of holdings) {
    allocationByType[holding.asset_type] = (allocationByType[holding.asset_type] || 0) + holding.current_value
  }

  // Fetch user's target allocations from their investment thesis
  const { data: thesis } = await supabase
    .from('investment_theses')
    .select('target_equity_pct, target_debt_pct, target_gold_pct, target_cash_pct')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (thesis && totalPortfolioValue > 0) {
    const targets: Record<string, number> = {
      stock: thesis.target_equity_pct,
      mutual_fund: thesis.target_equity_pct, // combined equity target
      gold: thesis.target_gold_pct,
      debt: thesis.target_debt_pct,
    }

    for (const [assetType, targetPct] of Object.entries(targets)) {
      const currentPct = ((allocationByType[assetType] || 0) / totalPortfolioValue) * 100
      const drift = Math.abs(currentPct - targetPct)

      if (drift >= 8) {
        events.push({
          user_id: userId,
          event_type: 'rebalancing_required',
          severity: drift >= 12 ? 'critical' : 'warning',
          context: {
            asset_name: assetType,
            user_allocation_current: Math.round(currentPct),
            user_allocation_target: targetPct,
            current_value: allocationByType[assetType] || 0,
          }
        })
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // RULE 5: Tax loss harvesting opportunity
  // Stock showing >10% unrealised loss, held > 1 year
  // ─────────────────────────────────────────────────────────────────
  for (const holding of holdings.filter((h: any) => h.asset_type === 'stock')) {
    const unrealisedLossPct = ((holding.current_price - holding.avg_buy_price) / holding.avg_buy_price) * 100
    if (unrealisedLossPct <= -10) {
      const { data: oldestTx } = await supabase
        .from('transactions')
        .select('transaction_date')
        .eq('user_id', userId)
        .eq('asset_symbol', holding.asset_symbol)
        .eq('transaction_type', 'buy')
        .order('transaction_date', { ascending: true })
        .limit(1)
        .single()

      if (oldestTx) {
        const holdingDays = Math.floor(
          (Date.now() - new Date(oldestTx.transaction_date).getTime()) / (1000 * 60 * 60 * 24)
        )
        if (holdingDays >= 365) {
          events.push({
            user_id: userId,
            event_type: 'tax_loss_harvesting_opportunity',
            severity: 'info',
            context: {
              asset_name: holding.asset_name,
              asset_symbol: holding.asset_symbol,
              current_value: holding.current_value,
              change_percent: unrealisedLossPct,
              change_inr: (unrealisedLossPct / 100) * holding.invested_amount,
              days_observed: holdingDays,
            }
          })
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // RULE 6: Goal milestone at risk
  // Check if current corpus growth rate will miss goal deadline
  // ─────────────────────────────────────────────────────────────────
  for (const goal of goals) {
    const monthsRemaining = Math.floor(
      (new Date(goal.deadline_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
    )
    if (monthsRemaining > 0 && monthsRemaining <= 36) {
      const progressPct = (goal.current_amount / goal.target_amount) * 100
      const requiredProgressPct = ((36 - monthsRemaining) / 36) * 100 // linear benchmark
      if (progressPct < requiredProgressPct - 15) {
        events.push({
          user_id: userId,
          event_type: 'goal_milestone_at_risk',
          severity: monthsRemaining <= 12 ? 'critical' : 'warning',
          context: {
            asset_name: goal.name,
            current_value: goal.current_amount,
            benchmark_value: goal.target_amount,
            benchmark_delta: progressPct - requiredProgressPct,
            user_goal_name: goal.name,
            user_goal_deadline_months: monthsRemaining,
          }
        })
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // RULE 7: SIP step-up due (every April, or 12 months after last step-up)
  // ─────────────────────────────────────────────────────────────────
  const { data: sips } = await supabase
    .from('sip_schedules')
    .select('id, fund_name, monthly_amount, last_stepped_up_at, started_at')
    .eq('user_id', userId)
    .eq('is_active', true)

  for (const sip of sips || []) {
    const lastStepUp = sip.last_stepped_up_at || sip.started_at
    const monthsSinceStepUp = Math.floor(
      (Date.now() - new Date(lastStepUp).getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
    if (monthsSinceStepUp >= 12) {
      events.push({
        user_id: userId,
        event_type: 'sip_step_up_due',
        severity: 'info',
        context: {
          asset_name: sip.fund_name,
          current_value: sip.monthly_amount,
          days_observed: monthsSinceStepUp * 30,
          additional_data: {
            suggested_new_amount: Math.round(sip.monthly_amount * 1.1),
            step_up_percent: 10,
          }
        }
      })
    }
  }

  return events
}
