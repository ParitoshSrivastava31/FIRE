# Monetra — AI Inference Architecture & Cost Control System

> **Document type:** Engineering specification  
> **Scope:** Complete AI pipeline — rule engine, model routing, prompt caching, Batch API, cost guardrails  
> **Stack:** Next.js 14 App Router · Supabase · Anthropic Claude API · Vercel Cron  
> **Status:** Pre-implementation reference

---

## Table of Contents

1. [Core Philosophy — Rules First, AI Second](#1-core-philosophy)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [The Rule Engine — Zero AI Cost Analysis](#3-the-rule-engine)
4. [Event Types & Trigger Thresholds](#4-event-types--trigger-thresholds)
5. [Model Routing Strategy](#5-model-routing-strategy)
6. [Prompt Caching Implementation](#6-prompt-caching-implementation)
7. [Batch API — Nightly & Weekly Jobs](#7-batch-api)
8. [AI Call Implementations (All Routes)](#8-ai-call-implementations)
9. [Per-User Call Budget & Guardrails](#9-per-user-call-budget--guardrails)
10. [Vercel Cron Configuration](#10-vercel-cron-configuration)
11. [Supabase Schema Additions](#11-supabase-schema-additions)
12. [Cost Monitoring & Alerting](#12-cost-monitoring--alerting)
13. [Monthly Cost Projection by User Tier](#13-monthly-cost-projection)

---

## 1. Core Philosophy

**The rule engine runs every day. Claude runs only when something worth saying has been detected.**

This distinction is the entire foundation of cost-efficient AI at scale. Every fintech insight can be decomposed into two parts:

- **The signal** — a mathematical fact. "HDFC Bank fell 6.2% today." "User's equity allocation drifted to 68% vs target 55%." "This MF has underperformed Nifty 50 by 4.1% over 90 days." This is pure SQL + arithmetic. Zero AI cost. Runs in milliseconds across all users simultaneously.

- **The narrative** — a human-readable interpretation of that signal in the context of this specific user's goals, risk tolerance, and portfolio composition. This is what Claude does, and it should only run when a meaningful signal exists.

**Wrong approach (expensive):**
```
Every day at 3:30 PM → send each user's full portfolio to Claude → ask it to find insights
```

**Right approach (efficient):**
```
Every day at 3:30 PM → rule engine scans all portfolios → flags meaningful events →
  for each flagged event → Claude writes a 3-sentence actionable interpretation
```

On a typical day, 60–70% of users will have zero events fire. Claude is never called for them. The remaining 30–40% may have 1–2 events each. Your average AI spend per user per day on market-hours analysis is under ₹1.

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1 — DATA INGESTION  (Vercel Cron, every 15 min, 9–3:30) │
│                                                                   │
│  /api/cron/market-prices  →  fetch NSE/BSE via yahoo-finance2   │
│  /api/cron/nav-update     →  fetch MF NAV from AMFI             │
│  /api/cron/gold-price     →  fetch MCX/SGB price                │
│  → Store in: market_prices table (Supabase)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │ raw price data
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2 — RULE ENGINE  (Vercel Cron, 4:00 PM daily, weekdays) │
│                                                                   │
│  /api/cron/rule-scan                                             │
│  → Reads: portfolio_holdings + market_prices                    │
│  → Computes: P&L, XIRR, drift, benchmark delta, 90-day trend   │
│  → Checks: ~12 rule conditions per user (pure SQL/math)         │
│  → Writes: pending_events table (only when rule fires)          │
│  → NO AI CALLS HERE. Zero cost.                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │ only if event detected
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3 — AI DISPATCH  (triggered, not scheduled)              │
│                                                                   │
│  /api/cron/ai-dispatch  (runs after rule-scan, 4:05 PM)         │
│  → Reads: pending_events where ai_processed = false             │
│  → Routes each event to correct model (Haiku / Sonnet)          │
│  → Sends focused, minimal prompt with cached system context     │
│  → Writes result to: ai_insights table                          │
│  → Marks event: ai_processed = true                             │
└────────────────────────────┬────────────────────────────────────┘
                             │ insight text
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 4 — DELIVERY                                             │
│                                                                   │
│  Push notification (FCM) + in-app alert card                    │
│  Weekly digest email (Sunday 7 AM via Batch API → Resend)       │
└─────────────────────────────────────────────────────────────────┘

SEPARATE PATH — User-initiated queries:
  User clicks "Analyse" or asks a question →
  /api/ai/advice  →  check user's monthly budget →
  route to Haiku (simple) or Sonnet (complex) →
  stream response → deduct from budget
```

---

## 3. The Rule Engine

### 3.1 File: `src/lib/rule-engine.ts`

This is the heart of the system. It runs for every user on every trading day and produces structured event objects — no AI involvement whatsoever.

```typescript
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
  // Keep this compact — only what Claude actually needs
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
  const supabase = createClient()
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
  const symbols = holdings.map(h => h.asset_symbol).filter(Boolean)
  const { data: marketData } = await supabase
    .from('market_prices')
    .select('symbol, current_price, previous_close, day_change_percent, price_30d_ago, price_90d_ago')
    .in('symbol', symbols)

  const priceMap = Object.fromEntries((marketData || []).map(m => [m.symbol, m]))

  // Fetch Nifty 50 benchmark for comparison
  const { data: nifty } = await supabase
    .from('market_prices')
    .select('day_change_percent, price_30d_ago, price_90d_ago, current_price')
    .eq('symbol', 'NIFTY50')
    .single()

  // ─────────────────────────────────────────────────────────────────
  // RULE 1: Significant single-day stock drop (threshold: -5%)
  // ─────────────────────────────────────────────────────────────────
  for (const holding of holdings.filter(h => h.asset_type === 'stock')) {
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
  for (const holding of holdings.filter(h => h.asset_type === 'stock')) {
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
  for (const holding of holdings.filter(h => h.asset_type === 'mutual_fund')) {
    const price = priceMap[holding.asset_symbol]
    if (!price || !price.price_90d_ago || !nifty?.price_90d_ago) continue

    const mfReturn90d = ((price.current_price - price.price_90d_ago) / price.price_90d_ago) * 100
    const niftyReturn90d = ((nifty.current_price - nifty.price_90d_ago) / nifty.price_90d_ago) * 100
    const underperformance = niftyReturn90d - mfReturn90d

    if (underperformance >= 3) {
      // Check if we already fired this alert in last 30 days
      const { count } = await supabase
        .from('pending_events')
        .select('id', { count: 'exact' })
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
  const totalPortfolioValue = holdings.reduce((sum, h) => sum + h.current_value, 0)

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
  for (const holding of holdings.filter(h => h.asset_type === 'stock')) {
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
```

---

## 4. Event Types & Trigger Thresholds

| Event Type | Trigger Condition | Cooldown | Severity |
|---|---|---|---|
| `stock_significant_drop` | Day change ≤ −5% | None (every occurrence) | warning |
| `stock_significant_drop` | Day change ≤ −8% | None | critical |
| `stock_significant_gain` | Day change ≥ +7% | None | info |
| `mf_underperforming_benchmark` | 90-day return < Nifty by ≥ 3% | 30 days per fund | warning |
| `mf_underperforming_benchmark` | 90-day return < Nifty by ≥ 6% | 30 days per fund | critical |
| `portfolio_allocation_drift` | Any asset class drifts ≥ 8% from target | 14 days | warning |
| `portfolio_allocation_drift` | Any asset class drifts ≥ 12% from target | 7 days | critical |
| `gold_entry_opportunity` | Gold 30-day return < −3% AND user gold < target | 30 days | info |
| `tax_loss_harvesting_opportunity` | Unrealised loss ≥ −10% AND held ≥ 365 days | 60 days | info |
| `goal_milestone_at_risk` | Progress 15% behind linear benchmark | 14 days | warning |
| `goal_milestone_at_risk` | ≤ 12 months to goal, progress behind | 7 days | critical |
| `sip_step_up_due` | 12 months since last step-up | 30 days | info |
| `rebalancing_required` | Drift ≥ 8% from target allocation | 14 days | warning |

---

## 5. Model Routing Strategy

### 5.1 The Decision Matrix

```typescript
// src/lib/ai/model-router.ts

export type ModelChoice = 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6'

export interface RoutingDecision {
  model: ModelChoice
  maxTokens: number
  useCache: boolean
  useBatch: boolean
  rationale: string
}

export function routeToModel(
  eventType: EventType | 'user_query' | 'weekly_digest' | 'investment_thesis',
  userQuery?: string
): RoutingDecision {

  // ── Haiku: short, structured, factual output ──────────────────────
  // Use when: output is ≤ 200 words, no complex reasoning needed,
  // single asset analysis, simple yes/no style insight

  const haikuEvents: EventType[] = [
    'stock_significant_drop',
    'stock_significant_gain',
    'sip_step_up_due',
    'gold_entry_opportunity',
  ]

  if (haikuEvents.includes(eventType as EventType)) {
    return {
      model: 'claude-haiku-4-5-20251001',
      maxTokens: 300,
      useCache: true,
      useBatch: false, // alerts need near-real-time delivery
      rationale: 'Single-asset event with structured output — Haiku sufficient'
    }
  }

  // ── Batch Sonnet: high quality, non-urgent, background jobs ───────
  // Use when: output can wait up to 24 hours, 50% cost saving applies,
  // weekly digests, scheduled analysis, non-time-sensitive reports

  if (eventType === 'weekly_digest') {
    return {
      model: 'claude-sonnet-4-6',
      maxTokens: 1500,
      useCache: true,
      useBatch: true,
      rationale: 'Weekly digest — non-urgent, Batch API gives 50% discount'
    }
  }

  // ── Sonnet (real-time): complex reasoning, multiple assets ────────
  // Use when: cross-asset analysis, portfolio-level reasoning,
  // fund rotation, tax strategy, user-initiated complex queries

  const sonnetEvents: EventType[] = [
    'mf_underperforming_benchmark',
    'mf_category_rotation_opportunity',
    'portfolio_allocation_drift',
    'rebalancing_required',
    'tax_loss_harvesting_opportunity',
    'goal_milestone_at_risk',
  ]

  if (sonnetEvents.includes(eventType as EventType)) {
    return {
      model: 'claude-sonnet-4-6',
      maxTokens: 600,
      useCache: true,
      useBatch: false,
      rationale: 'Multi-asset or strategic event — Sonnet needed for quality'
    }
  }

  if (eventType === 'investment_thesis') {
    return {
      model: 'claude-sonnet-4-6',
      maxTokens: 2000,
      useCache: true,
      useBatch: false,
      rationale: 'Full thesis generation — Sonnet quality required'
    }
  }

  // ── User query routing — classify by complexity ───────────────────
  if (eventType === 'user_query' && userQuery) {
    const isSimpleQuery = isSimpleQuestion(userQuery)
    return {
      model: isSimpleQuery ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-6',
      maxTokens: isSimpleQuery ? 250 : 800,
      useCache: true,
      useBatch: false,
      rationale: isSimpleQuery ? 'Simple factual query — Haiku' : 'Complex analysis query — Sonnet'
    }
  }

  // Default fallback
  return {
    model: 'claude-sonnet-4-6',
    maxTokens: 800,
    useCache: true,
    useBatch: false,
    rationale: 'Default — Sonnet'
  }
}

// Classify user queries without calling AI (pure string heuristics)
function isSimpleQuestion(query: string): boolean {
  const q = query.toLowerCase()

  const simplePatterns = [
    /what is (elss|ppf|nps|sgb|xirr|nav|nifty|sensex)/,
    /when (is|are) (market|nse|bse)/,
    /how (much|many)/,
    /what (is|are) my (sip|balance|portfolio)/,
    /explain (sip|elss|ppf|mutual fund|gold etf)/,
    /difference between/,
    /section 80/,
    /tax (saving|slab)/,
  ]

  const complexPatterns = [
    /should i (buy|sell|exit|switch|invest|hold)/,
    /when (should|to) (i|exit|buy|sell)/,
    /is (it|now|this) (good|right|best|time)/,
    /analyse|analyze|review|evaluate/,
    /rotate|rebalance|reallocate/,
    /versus|vs\.|compare|better than/,
    /portfolio|allocation|strategy/,
  ]

  // If it matches a complex pattern, always use Sonnet
  if (complexPatterns.some(p => p.test(q))) return false

  // If it matches a simple pattern, use Haiku
  if (simplePatterns.some(p => p.test(q))) return true

  // Default: queries under 60 chars are likely simple
  return query.length < 60
}
```

---

## 6. Prompt Caching Implementation

### 6.1 Why Caching Matters for Monetra

Your India-instruments system prompt contains: SEBI compliance disclaimer, knowledge of ELSS/NPS/PPF/SGB/SGBs/Tier-2 real estate, mutual fund category definitions, tax slab logic, AMFI instrument knowledge, and behavioral nudge guidelines. This is approximately 1,200–1,800 tokens and is **identical across every single API call**.

Without caching: every call pays full Sonnet input price for those 1,500 tokens.  
With caching: first call writes to cache (1.25× cost once). Every subsequent call in the cache TTL window pays 0.1× cost on cached tokens — a **90% discount** on your system prompt tokens.

### 6.2 The System Prompt (Cached Block)

```typescript
// src/lib/ai/prompts/system-prompt.ts
// This entire block is sent as a cache_control: { type: "ephemeral" } block
// TTL: 5 minutes. Re-used across all calls in that window.

export const MONETRA_SYSTEM_PROMPT = `You are Monetra's AI financial analyst — an expert in Indian personal finance with deep knowledge of India-specific investment instruments, tax laws, and market behaviour.

## Your Knowledge Domain

**Equity instruments:**
- NSE/BSE listed stocks — you understand P&L, XIRR, sectoral rotation, Nifty 50/500/Midcap benchmarks
- Mutual funds — all AMFI categories: Large Cap, Mid Cap, Small Cap, Flexi Cap, ELSS, Index, Debt, Hybrid, Liquid, Overnight
- You know fund houses: HDFC, ICICI Prudential, SBI, Mirae, Parag Parikh, Axis, Kotak, Nippon, Motilal Oswal, DSP

**Fixed income & alternatives:**
- PPF (Public Provident Fund): 15-year lock-in, Section 80C benefit, current 7.1% p.a.
- NPS (National Pension Scheme): Tier-1 lock-in till 60, additional ₹50K deduction under 80CCD(1B)
- SGBs (Sovereign Gold Bonds): 8-year tenure, 2.5% annual interest, capital gains exempt on maturity
- FDs, RDs, and their tax treatment under income slab
- REITs and InvITs (basic)

**Tax framework:**
- Old regime vs New regime tradeoffs
- Section 80C (₹1.5L limit): ELSS, PPF, NPS Tier-1, ULIP, home loan principal
- Section 80CCD(1B): additional ₹50K for NPS
- Section 80D: health insurance premiums
- LTCG on equity: 12.5% above ₹1.25L (post Budget 2024)
- STCG on equity: 20%
- Debt fund taxation: slab rate (no indexation benefit post April 2023)
- Tax loss harvesting windows

**India-specific context:**
- Nifty 50 historical CAGR: ~12% over 20 years
- Inflation target: 4%, RBI repo rate dynamics
- Tier-2/3 city real estate: price per sqft appreciation patterns
- Festival season effect on gold prices (Dhanteras, Akshaya Tritiya)
- Budget impact on ELSS, SGBs, capital gains

## Response Rules

1. **Be specific, not generic.** Name funds, give ₹ amounts, give percentages. Never say "consider investing in equities."
2. **Be brief.** Maximum 4 sentences per insight unless explicitly generating a full thesis.
3. **Action first.** Start with what the user should do, then why.
4. **India-first language.** Use ₹ not $. Use "lakh" and "crore" not "hundred thousand".
5. **SEBI boundary.** Always end recommendations with: "This is AI-generated analysis for informational purposes only — not SEBI-registered investment advice. Consult an RIA before transacting."
6. **No hallucinated returns.** Never promise or project specific future returns. Use historical averages with explicit caveats.
7. **Tone:** Direct, confident, like a knowledgeable friend — not a formal advisor. Avoid jargon without explanation.`
```

### 6.3 Making the Cached API Call

```typescript
// src/lib/ai/cached-client.ts

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface CachedCallOptions {
  userMessage: string
  model: 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6'
  maxTokens: number
  stream?: boolean
}

export async function callWithCache(options: CachedCallOptions) {
  const { userMessage, model, maxTokens, stream = false } = options

  if (stream) {
    return anthropic.messages.stream({
      model,
      max_tokens: maxTokens,
      system: [
        {
          type: 'text',
          text: MONETRA_SYSTEM_PROMPT,
          // This tells Anthropic: cache this block.
          // If the same prefix appears in the next call within 5 minutes,
          // it serves from cache at 0.1x input cost.
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [
        { role: 'user', content: userMessage }
      ]
    })
  }

  return anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: [
      {
        type: 'text',
        text: MONETRA_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' }
      }
    ],
    messages: [
      { role: 'user', content: userMessage }
    ]
  })
}

// Import the system prompt defined above
import { MONETRA_SYSTEM_PROMPT } from './prompts/system-prompt'
```

---

## 7. Batch API

### 7.1 When to Use Batch API

The Batch API gives a flat **50% discount** on all tokens but processes requests asynchronously (within 24 hours). Use it for any job that can tolerate this delay:

- Weekly portfolio digest (Sunday morning, not time-critical)
- Monthly investment thesis refresh (scheduled, not reactive)
- Nightly spending audit emails (next-morning delivery is fine)
- SIP step-up reminders (low urgency)

### 7.2 Weekly Digest Batch Job

```typescript
// src/app/api/cron/weekly-digest/route.ts
// Runs: Sunday 6:00 AM IST

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { MONETRA_SYSTEM_PROMPT } from '@/lib/ai/prompts/system-prompt'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function GET(request: Request) {
  // Verify this is a legitimate Vercel cron call
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient()

  // Fetch all Pro users who are active (logged in within last 14 days)
  const { data: activeUsers } = await supabase
    .from('users')
    .select(`
      id, full_name, risk_profile, monthly_income, city,
      portfolio_holdings (asset_type, asset_name, current_value, invested_amount, allocation_percent),
      goals (name, target_amount, current_amount, deadline_date),
      transactions (amount, category, transaction_date)
    `)
    .eq('subscription_tier', 'pro')
    .gte('last_active_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())

  if (!activeUsers || activeUsers.length === 0) {
    return Response.json({ message: 'No active Pro users', count: 0 })
  }

  // Build batch requests — one per user
  const batchRequests = activeUsers.map(user => {
    const portfolioSummary = buildPortfolioSummary(user)
    const thisWeekSpend = buildThisWeekSpend(user)

    return {
      custom_id: `weekly-digest-${user.id}-${Date.now()}`,
      params: {
        model: 'claude-sonnet-4-6' as const,
        max_tokens: 1200,
        system: [
          {
            type: 'text' as const,
            text: MONETRA_SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' as const }
          }
        ],
        messages: [
          {
            role: 'user' as const,
            content: `Generate a weekly financial digest for this user.

USER PROFILE:
- Name: ${user.full_name}
- Risk profile: ${user.risk_profile}
- City: ${user.city}
- Monthly income: ₹${user.monthly_income?.toLocaleString('en-IN')}

PORTFOLIO THIS WEEK:
${portfolioSummary}

SPENDING THIS WEEK:
${thisWeekSpend}

Write a concise weekly digest covering:
1. Portfolio performance summary (2–3 sentences, specific ₹ numbers)
2. Top 1–2 action items for this week (very specific)
3. One behavioural nudge — connect a spending category to an investment opportunity

Format as clean markdown. Maximum 300 words. No bullet points for the narrative, use short paragraphs.`
          }
        ]
      }
    }
  })

  // Submit the batch to Anthropic
  const batch = await anthropic.beta.messages.batches.create({
    requests: batchRequests
  })

  // Store the batch ID so we can poll for results
  await supabase.from('batch_jobs').insert({
    batch_id: batch.id,
    job_type: 'weekly_digest',
    user_count: activeUsers.length,
    status: 'processing',
    created_at: new Date().toISOString(),
    user_ids: activeUsers.map(u => u.id),
  })

  return Response.json({
    success: true,
    batch_id: batch.id,
    users_queued: activeUsers.length
  })
}

// Helper: summarise portfolio into compact text (not full JSON)
function buildPortfolioSummary(user: any): string {
  const holdings = user.portfolio_holdings || []
  if (holdings.length === 0) return 'No holdings recorded.'

  const totalValue = holdings.reduce((s: number, h: any) => s + h.current_value, 0)
  const totalInvested = holdings.reduce((s: number, h: any) => s + h.invested_amount, 0)
  const totalPL = totalValue - totalInvested
  const totalPLPct = ((totalPL / totalInvested) * 100).toFixed(1)

  const lines = [
    `Total portfolio: ₹${totalValue.toLocaleString('en-IN')} (invested: ₹${totalInvested.toLocaleString('en-IN')}, P&L: ${totalPL >= 0 ? '+' : ''}₹${totalPL.toLocaleString('en-IN')} / ${totalPLPct}%)`
  ]

  // Top 3 holdings by value only — keep tokens minimal
  const top3 = holdings.sort((a: any, b: any) => b.current_value - a.current_value).slice(0, 3)
  for (const h of top3) {
    const pl = h.current_value - h.invested_amount
    const plPct = ((pl / h.invested_amount) * 100).toFixed(1)
    lines.push(`- ${h.asset_name}: ₹${h.current_value.toLocaleString('en-IN')} (${pl >= 0 ? '+' : ''}${plPct}%)`)
  }

  return lines.join('\n')
}

function buildThisWeekSpend(user: any): string {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recent = (user.transactions || []).filter(
    (t: any) => new Date(t.transaction_date).getTime() >= weekAgo
  )
  if (recent.length === 0) return 'No transactions recorded this week.'

  const byCategory: Record<string, number> = {}
  for (const t of recent) {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
  }

  return Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([cat, amt]) => `- ${cat}: ₹${amt.toLocaleString('en-IN')}`)
    .join('\n')
}
```

### 7.3 Batch Result Poller

```typescript
// src/app/api/cron/batch-results/route.ts
// Runs: Every 2 hours (Vercel Cron)

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { sendDigestEmail } from '@/lib/email/resend'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function GET(request: Request) {
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient()

  // Find all pending batch jobs
  const { data: pendingBatches } = await supabase
    .from('batch_jobs')
    .select('*')
    .eq('status', 'processing')

  for (const job of pendingBatches || []) {
    const batchStatus = await anthropic.beta.messages.batches.retrieve(job.batch_id)

    if (batchStatus.processing_status !== 'ended') continue

    // Collect all results
    const results: Record<string, string> = {}
    for await (const result of await anthropic.beta.messages.batches.results(job.batch_id)) {
      if (result.result.type === 'succeeded') {
        const userId = result.custom_id.split('-')[2]
        const content = result.result.message.content[0]
        if (content.type === 'text') {
          results[userId] = content.text
        }
      }
    }

    // Store insights and trigger delivery
    for (const [userId, digestText] of Object.entries(results)) {
      await supabase.from('ai_insights').insert({
        user_id: userId,
        insight_type: job.job_type,
        content: digestText,
        model_used: 'claude-sonnet-4-6',
        via_batch: true,
        created_at: new Date().toISOString(),
      })

      // Trigger email delivery via Resend
      if (job.job_type === 'weekly_digest') {
        const { data: user } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', userId)
          .single()

        if (user?.email) {
          await sendDigestEmail({
            to: user.email,
            name: user.full_name,
            digest: digestText,
            week: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
          })
        }
      }
    }

    // Mark batch as complete
    await supabase
      .from('batch_jobs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('batch_id', job.batch_id)
  }

  return Response.json({ success: true })
}
```

---

## 8. AI Call Implementations (All Routes)

### 8.1 Event Alert Dispatch — `/api/cron/ai-dispatch/route.ts`

This is the cron that runs at 4:05 PM on trading days, picks up all events flagged by the rule engine, and converts them into user-readable insights.

```typescript
// src/app/api/cron/ai-dispatch/route.ts

import { createClient } from '@/lib/supabase/server'
import { routeToModel } from '@/lib/ai/model-router'
import { callWithCache } from '@/lib/ai/cached-client'
import { buildEventPrompt } from '@/lib/ai/prompts/event-prompts'
import { sendPushNotification } from '@/lib/notifications/fcm'

export async function GET(request: Request) {
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient()

  // Fetch all unprocessed events from today
  const { data: events } = await supabase
    .from('pending_events')
    .select(`
      *,
      users (full_name, risk_profile, monthly_income, city, subscription_tier)
    `)
    .eq('ai_processed', false)
    .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    .order('severity', { ascending: false }) // process critical events first

  if (!events || events.length === 0) {
    return Response.json({ message: 'No events to process', count: 0 })
  }

  let processed = 0
  let skipped = 0

  for (const event of events) {
    // Free users: only get critical alerts
    if (event.users.subscription_tier === 'free' && event.severity !== 'critical') {
      skipped++
      continue
    }

    // Route to correct model
    const routing = routeToModel(event.event_type)

    // Build the compact, focused prompt for this event
    const userMessage = buildEventPrompt(event, event.users)

    try {
      const response = await callWithCache({
        userMessage,
        model: routing.model,
        maxTokens: routing.maxTokens,
        stream: false,
      })

      const insightText = response.content[0].type === 'text'
        ? response.content[0].text
        : ''

      // Store the insight
      await supabase.from('ai_insights').insert({
        user_id: event.user_id,
        event_id: event.id,
        insight_type: event.event_type,
        content: insightText,
        model_used: routing.model,
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_read_tokens: response.usage.cache_read_input_tokens || 0,
        via_batch: false,
        severity: event.severity,
        created_at: new Date().toISOString(),
      })

      // Mark event as processed
      await supabase
        .from('pending_events')
        .update({ ai_processed: true, processed_at: new Date().toISOString() })
        .eq('id', event.id)

      // Push notification for critical and warning events
      if (event.severity !== 'info') {
        await sendPushNotification({
          userId: event.user_id,
          title: getNotificationTitle(event.event_type, event.severity),
          body: insightText.split('.')[0] + '.', // First sentence only
          data: { insight_id: event.id, event_type: event.event_type }
        })
      }

      processed++
    } catch (error) {
      console.error(`Failed to process event ${event.id}:`, error)
      // Don't mark as processed — will retry on next run
    }
  }

  return Response.json({ success: true, processed, skipped })
}

function getNotificationTitle(eventType: EventType, severity: EventSeverity): string {
  const titles: Record<string, string> = {
    stock_significant_drop: severity === 'critical' ? 'Stock crashed — action needed' : 'Portfolio alert',
    stock_significant_gain: 'Profit booking opportunity',
    mf_underperforming_benchmark: 'Fund review needed',
    rebalancing_required: 'Portfolio drifted — rebalance',
    goal_milestone_at_risk: 'Goal at risk',
    tax_loss_harvesting_opportunity: 'Tax saving opportunity',
    sip_step_up_due: 'Time to step up your SIP',
  }
  return titles[eventType] || 'Monetra insight'
}
```

### 8.2 Event Prompt Builder — `src/lib/ai/prompts/event-prompts.ts`

The key to low token usage is a highly structured, compact prompt template per event type. No prose, no fluff — just the facts the model needs.

```typescript
// src/lib/ai/prompts/event-prompts.ts

export function buildEventPrompt(event: any, user: any): string {
  const ctx = event.context
  const riskLabel = user.risk_profile === 'aggressive' ? 'aggressive risk profile'
    : user.risk_profile === 'conservative' ? 'conservative risk profile'
    : 'moderate risk profile'

  switch (event.event_type) {

    case 'stock_significant_drop':
      return `ALERT: Stock drop requiring analysis.

Stock: ${ctx.asset_name} (${ctx.asset_symbol})
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

Stock: ${ctx.asset_name} (${ctx.asset_symbol})
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
```

### 8.3 User-Initiated Query Route — `/api/ai/advice/route.ts`

```typescript
// src/app/api/ai/advice/route.ts

import { createClient } from '@/lib/supabase/server'
import { routeToModel } from '@/lib/ai/model-router'
import { callWithCache } from '@/lib/ai/cached-client'
import { checkAndDeductBudget } from '@/lib/ai/budget-manager'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { query, portfolio_context } = await request.json()
  if (!query?.trim()) return new Response('Query required', { status: 400 })

  // Check and deduct from user's monthly AI budget
  const budgetResult = await checkAndDeductBudget(user.id, 'query')
  if (!budgetResult.allowed) {
    return Response.json({
      error: 'monthly_limit_reached',
      message: `You've used all ${budgetResult.limit} AI queries this month. Resets on ${budgetResult.reset_date}.`,
      upgrade_available: budgetResult.tier === 'free',
    }, { status: 429 })
  }

  const routing = routeToModel('user_query', query)

  // Build contextual user message — compact, not the entire DB
  const userMessage = buildUserQueryPrompt(query, portfolio_context, user.id)

  // Stream the response back to the frontend
  const stream = await callWithCache({
    userMessage,
    model: routing.model,
    maxTokens: routing.maxTokens,
    stream: true,
  })

  // Log the call for cost tracking
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      let totalOutput = ''
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text
          totalOutput += text
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
        }
        if (chunk.type === 'message_stop') {
          // Log usage asynchronously — don't block the stream
          logAiCall(user.id, routing.model, query.length, totalOutput.length, stream)
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      }
    }
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}

function buildUserQueryPrompt(query: string, portfolioContext: any, userId: string): string {
  const portfolioSnippet = portfolioContext
    ? `\nUSER'S PORTFOLIO CONTEXT:\n${JSON.stringify(portfolioContext, null, 0).slice(0, 800)}\n`
    : ''

  return `USER QUERY:${portfolioSnippet}
Question: ${query}

Answer specifically and concisely using India-specific context. Reference the user's actual portfolio data if provided.`
}

async function logAiCall(userId: string, model: string, inputChars: number, outputChars: number, stream: any) {
  // Estimate tokens (rough: 4 chars per token)
  const estInputTokens = Math.ceil(inputChars / 4)
  const estOutputTokens = Math.ceil(outputChars / 4)

  const supabase = createClient()
  await supabase.from('ai_usage_log').insert({
    user_id: userId,
    call_type: 'user_query',
    model_used: model,
    estimated_input_tokens: estInputTokens,
    estimated_output_tokens: estOutputTokens,
    created_at: new Date().toISOString(),
  })
}
```

---

## 9. Per-User Call Budget & Guardrails

### 9.1 Budget Manager — `src/lib/ai/budget-manager.ts`

```typescript
// src/lib/ai/budget-manager.ts

import { createClient } from '@/lib/supabase/server'

// Monthly limits by tier
export const QUERY_LIMITS = {
  free: 3,          // 3 on-demand queries/month
  pro: 15,          // 15 on-demand queries/month
  pro_plus: 999,    // effectively unlimited
} as const

// Alert events are NOT counted against query budget
// They are system-triggered and always delivered (subject to plan tier)

export async function checkAndDeductBudget(
  userId: string,
  callType: 'query' | 'thesis_refresh'
): Promise<{
  allowed: boolean
  remaining: number
  limit: number
  tier: string
  reset_date: string
}> {
  const supabase = createClient()

  const { data: user } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  const tier = (user?.subscription_tier || 'free') as keyof typeof QUERY_LIMITS
  const limit = QUERY_LIMITS[tier] ?? QUERY_LIMITS.free

  // Count calls this calendar month
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const { count } = await supabase
    .from('ai_usage_log')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .eq('call_type', callType)
    .gte('created_at', monthStart)

  const usedCount = count || 0
  const remaining = Math.max(0, limit - usedCount)

  // Calculate next reset date (1st of next month)
  const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  const reset_date = nextMonth.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })

  if (usedCount >= limit) {
    return { allowed: false, remaining: 0, limit, tier, reset_date }
  }

  // Deduct 1 call proactively (will be rolled back if the AI call fails)
  await supabase.from('ai_usage_log').insert({
    user_id: userId,
    call_type: callType,
    model_used: 'pending', // updated after call completes
    estimated_input_tokens: 0,
    estimated_output_tokens: 0,
    created_at: new Date().toISOString(),
  })

  return { allowed: true, remaining: remaining - 1, limit, tier, reset_date }
}
```

### 9.2 Budget Display Component (Frontend hint)

Expose the user's remaining budget in the UI at all times — in the `/planner` and `/portfolio` pages. This makes the limit feel like a feature (scarcity = value), not a bug.

```tsx
// src/components/ai/ai-budget-indicator.tsx

export function AiBudgetIndicator({ used, limit }: { used: number; limit: number }) {
  const remaining = limit - used
  const pct = (used / limit) * 100

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct > 80 ? 'bg-destructive' : pct > 50 ? 'bg-warning' : 'bg-primary'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span>{remaining} AI queries left this month</span>
    </div>
  )
}
```

---

## 10. Vercel Cron Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/market-prices",
      "schedule": "*/15 3-10 * * 1-5"
    },
    {
      "path": "/api/cron/nav-update",
      "schedule": "0 11 * * 1-5"
    },
    {
      "path": "/api/cron/rule-scan",
      "schedule": "30 10 * * 1-5"
    },
    {
      "path": "/api/cron/ai-dispatch",
      "schedule": "35 10 * * 1-5"
    },
    {
      "path": "/api/cron/weekly-digest",
      "schedule": "0 1 * * 0"
    },
    {
      "path": "/api/cron/batch-results",
      "schedule": "0 */2 * * *"
    },
    {
      "path": "/api/cron/monthly-thesis-refresh",
      "schedule": "0 2 1 * *"
    }
  ]
}
```

> All times are UTC. Indian Standard Time = UTC + 5:30.  
> Market closes at 3:30 PM IST = 10:00 AM UTC.  
> `rule-scan` fires at 10:30 AM UTC (4:00 PM IST), `ai-dispatch` at 10:35 AM UTC (4:05 PM IST).

---

## 11. Supabase Schema Additions

These tables support the entire pipeline. Add them to your existing schema.

```sql
-- Stores raw market price snapshots
CREATE TABLE market_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  current_price NUMERIC(12,4) NOT NULL,
  previous_close NUMERIC(12,4),
  day_change_percent NUMERIC(6,2),
  price_30d_ago NUMERIC(12,4),
  price_90d_ago NUMERIC(12,4),
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(symbol, fetched_at::DATE)
);
CREATE INDEX ON market_prices (symbol, fetched_at DESC);

-- Stores rule engine output — events waiting for AI processing
CREATE TABLE pending_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  context JSONB NOT NULL,
  ai_processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON pending_events (user_id, ai_processed, created_at DESC);
CREATE INDEX ON pending_events (event_type, created_at DESC);

-- Stores all AI-generated insights, both event-triggered and user-initiated
CREATE TABLE ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES pending_events(id),
  insight_type TEXT NOT NULL,
  content TEXT NOT NULL,
  model_used TEXT NOT NULL,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  cache_read_tokens INT DEFAULT 0,
  via_batch BOOLEAN DEFAULT FALSE,
  severity TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON ai_insights (user_id, is_read, created_at DESC);

-- Tracks all AI calls for cost monitoring and budget enforcement
CREATE TABLE ai_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL,
  model_used TEXT NOT NULL,
  estimated_input_tokens INT DEFAULT 0,
  estimated_output_tokens INT DEFAULT 0,
  estimated_cost_inr NUMERIC(8,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON ai_usage_log (user_id, call_type, created_at DESC);

-- Tracks Anthropic Batch API jobs
CREATE TABLE batch_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id TEXT NOT NULL UNIQUE,
  job_type TEXT NOT NULL,
  user_count INT NOT NULL,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  user_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- SIP schedules (referenced in Rule 7)
CREATE TABLE sip_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fund_name TEXT NOT NULL,
  fund_symbol TEXT,
  monthly_amount NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ NOT NULL,
  last_stepped_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON sip_schedules (user_id, is_active);

-- RLS for all new tables
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sip_schedules ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "own_data" ON pending_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON ai_insights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON ai_usage_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON sip_schedules FOR ALL USING (auth.uid() = user_id);
-- Market prices are public read
CREATE POLICY "public_read" ON market_prices FOR SELECT USING (true);
```

---

## 12. Cost Monitoring & Alerting

### 12.1 Daily Cost Summary Cron

```typescript
// src/app/api/cron/cost-monitor/route.ts
// Runs: Every day at midnight

export async function GET(request: Request) {
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Get yesterday's AI calls aggregated
  const { data: usage } = await supabase
    .from('ai_usage_log')
    .select('model_used, estimated_input_tokens, estimated_output_tokens')
    .gte('created_at', yesterday)

  const USD_INR = 84
  const pricing: Record<string, [number, number]> = {
    'claude-haiku-4-5-20251001': [1, 5],
    'claude-sonnet-4-6': [3, 15],
  }

  let totalCostINR = 0
  const byModel: Record<string, number> = {}

  for (const row of usage || []) {
    const [inP, outP] = pricing[row.model_used] || [3, 15]
    const cost = (
      (row.estimated_input_tokens / 1e6) * inP +
      (row.estimated_output_tokens / 1e6) * outP
    ) * USD_INR

    totalCostINR += cost
    byModel[row.model_used] = (byModel[row.model_used] || 0) + cost
  }

  // Alert if daily spend exceeds ₹500 (investigate immediately)
  if (totalCostINR > 500) {
    await sendAlertEmail({
      subject: `[MONETRA ALERT] AI spend ₹${totalCostINR.toFixed(0)} in 24h — investigate`,
      body: `Model breakdown: ${JSON.stringify(byModel, null, 2)}`
    })
  }

  // Store daily cost snapshot
  await supabase.from('cost_snapshots').insert({
    date: new Date().toISOString().split('T')[0],
    total_cost_inr: totalCostINR,
    total_calls: usage?.length || 0,
    by_model: byModel,
  })

  return Response.json({ totalCostINR, calls: usage?.length })
}
```

---

## 13. Monthly Cost Projection

At scale, here is what this architecture costs per user per month (assuming prompt caching enabled, model routing applied):

| Call Type | Frequency | Model | Tokens (in/out) | Monthly Cost (₹) |
|---|---|---|---|---|
| Market data fetch + rule engine | 22 trading days | No AI | 0 | ₹0 |
| Threshold alerts (avg 4 events) | ~4×/month | Haiku | 200/350 each | ₹2–3 |
| Weekly digest | 4×/month | Sonnet Batch | 1,200/900 each | ₹6–7 |
| MF rotation analysis | 2×/month | Sonnet | 1,500/1,000 each | ₹5–6 |
| User queries | 6×/month | Mixed | 1,000/800 avg | ₹10–14 |
| Monthly thesis refresh | 1×/month | Sonnet (cached) | 2,000/1,500 | ₹3–4 |
| **Total** | | | | **₹26–34** |

At ₹399/month subscription: **gross AI margin ≈ 91–93%** after inference costs, before infra (Supabase, Vercel, Resend).

The architecture scales linearly. 1,000 users = ₹26,000–₹34,000/month in AI spend against ₹3,99,000 MRR.

---

*— End of Document —*  
*Monetra AI Inference Architecture v1.0 | Internal Engineering Document*
