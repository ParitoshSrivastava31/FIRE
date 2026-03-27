/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities */
import { EventType } from '@/lib/rule-engine'

export function buildEventPrompt(event: any, user: any): string {
  const ctx = event.context
  const riskLabel = user.risk_profile === 'aggressive' ? 'aggressive risk profile'
    : user.risk_profile === 'conservative' ? 'conservative risk profile'
    : 'moderate risk profile'

  switch (event.event_type as EventType) {

    case 'stock_significant_drop':
      return `ALERT: Stock drop requiring analysis.

Stock: ${ctx.asset_name} ${ctx.asset_symbol ? `(${ctx.asset_symbol})` : ''}
Day change: ${ctx.change_percent?.toFixed(1)}% (₹${Math.abs(ctx.change_inr || 0).toLocaleString('en-IN')} loss on holding)
User's holding value: ₹${ctx.current_value?.toLocaleString('en-IN')}
Avg buy price: ₹${ctx.avg_buy_price?.toLocaleString('en-IN')} | Quantity: ${ctx.holding_quantity}
User allocation to this stock: ${ctx.user_allocation_current?.toFixed(1)}%
User profile: ${riskLabel}, income ₹${user.monthly_income?.toLocaleString('en-IN')}/mo

In 3 sentences: should this user hold, buy more, or partially exit? Name the exact action and give one concrete reason based on their risk profile.`

    case 'mf_underperforming_benchmark':
      return `ALERT: Mutual fund underperformance detected.

Fund: ${ctx.asset_name}
Underperformance vs Nifty 50 over ${ctx.days_observed} days: ${Math.abs(ctx.benchmark_delta || 0).toFixed(1)}%
Fund 90-day return: ${(ctx.benchmark_delta || 0) + (ctx.benchmark_value || 0)}% | Nifty 90-day: ${ctx.benchmark_value?.toFixed(1)}%
User invested: ₹${ctx.current_value?.toLocaleString('en-IN')}
User profile: ${riskLabel}

In 3 sentences: should user switch funds? If yes, suggest one specific alternative fund by name from the same AMFI category.`

    case 'rebalancing_required':
      return `ALERT: Portfolio allocation has drifted from target.

Asset class: ${ctx.asset_name}
Current allocation: ${ctx.user_allocation_current}% | Target allocation: ${ctx.user_allocation_target}%
Value in this asset class: ₹${ctx.current_value?.toLocaleString('en-IN')}
User profile: ${riskLabel}

In 3 sentences: what specific action should restore the target allocation? Give ₹ amount to move and suggest where to redirect it.`

    case 'goal_milestone_at_risk':
      return `ALERT: Investment goal is falling behind schedule.

Goal: "${ctx.user_goal_name}"
Months remaining: ${ctx.user_goal_deadline_months}
Current corpus: ₹${ctx.current_value?.toLocaleString('en-IN')} | Target: ₹${ctx.benchmark_value?.toLocaleString('en-IN')}
Behind schedule by: ${Math.abs(ctx.benchmark_delta || 0).toFixed(0)}%
User monthly income: ₹${user.monthly_income?.toLocaleString('en-IN')}

In 3 sentences: what specific monthly action (SIP increase, lump sum, asset switch) would put this goal back on track?`

    case 'tax_loss_harvesting_opportunity':
      return `OPPORTUNITY: Tax loss harvesting possible.

Stock: ${ctx.asset_name} ${ctx.asset_symbol ? `(${ctx.asset_symbol})` : ''}
Unrealised loss: ${ctx.change_percent?.toFixed(1)}% (₹${Math.abs(ctx.change_inr || 0).toLocaleString('en-IN')})
Holding period: ${ctx.days_observed} days (qualifies for LTCG treatment)
User income: ₹${user.monthly_income?.toLocaleString('en-IN')}/mo, ${user.risk_profile} risk

In 3 sentences: explain the tax saving this harvest would generate and what they should do with the proceeds after the mandatory 31-day wash-sale period.`

    case 'sip_step_up_due':
      return `REMINDER: Annual SIP step-up due.

SIP: ${ctx.asset_name}
Current monthly amount: ₹${ctx.current_value?.toLocaleString('en-IN')}
Suggested new amount: ₹${(ctx.additional_data as any)?.suggested_new_amount?.toLocaleString('en-IN')} (10% step-up)
Months since last step-up: ${Math.floor((ctx.days_observed || 0) / 30)}
User income: ₹${user.monthly_income?.toLocaleString('en-IN')}/mo

In 2 sentences: motivate the step-up with a specific long-term wealth projection at 12% CAGR. Give the exact rupee difference at 10 years.`

    default:
      return `Financial alert for ${user.full_name}: ${JSON.stringify(ctx)}. Provide a 3-sentence actionable insight.`
  }
}

