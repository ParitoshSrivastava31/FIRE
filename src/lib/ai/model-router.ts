import { EventType } from '@/lib/rule-engine'

export type ModelChoice = 'gpt-4o-mini' | 'gpt-4o' | string

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

  // ── Fast Model (Mini/Haiku): short, structured, factual output ──────────
  // Use when: output is ≤ 200 words, no complex reasoning needed,
  // single asset analysis, simple yes/no style insight

  const fastEvents: EventType[] = [
    'stock_significant_drop',
    'stock_significant_gain',
    'sip_step_up_due',
    'gold_entry_opportunity',
  ]

  if (fastEvents.includes(eventType as EventType)) {
    return {
      model: 'gpt-4o-mini',
      maxTokens: 300,
      useCache: true,
      useBatch: false, // alerts need near-real-time delivery
      rationale: 'Single-asset event with structured output — fast model sufficient'
    }
  }

  // ── Batch Complex Model: high quality, non-urgent, background jobs ───────
  // Use when: output can wait up to 24 hours, 50% cost saving applies,
  // weekly digests, scheduled analysis, non-time-sensitive reports

  if (eventType === 'weekly_digest') {
    return {
      model: 'gpt-4o',
      maxTokens: 1500,
      useCache: true,
      useBatch: true,
      rationale: 'Weekly digest — non-urgent, Batch API gives 50% discount'
    }
  }

  // ── Complex Model (real-time): complex reasoning, multiple assets ────────
  // Use when: cross-asset analysis, portfolio-level reasoning,
  // fund rotation, tax strategy, user-initiated complex queries

  const complexEvents: EventType[] = [
    'mf_underperforming_benchmark',
    'mf_category_rotation_opportunity',
    'portfolio_allocation_drift',
    'rebalancing_required',
    'tax_loss_harvesting_opportunity',
    'goal_milestone_at_risk',
  ]

  if (complexEvents.includes(eventType as EventType)) {
    return {
      model: 'gpt-4o',
      maxTokens: 600,
      useCache: true,
      useBatch: false,
      rationale: 'Multi-asset or strategic event — complex model needed for quality'
    }
  }

  if (eventType === 'investment_thesis') {
    return {
      model: 'gpt-4o',
      maxTokens: 2000,
      useCache: true,
      useBatch: false,
      rationale: 'Full thesis generation — high quality required'
    }
  }

  // ── User query routing — classify by complexity ───────────────────
  if (eventType === 'user_query' && userQuery) {
    const isSimpleQuery = isSimpleQuestion(userQuery)
    return {
      model: isSimpleQuery ? 'gpt-4o-mini' : 'gpt-4o',
      maxTokens: isSimpleQuery ? 250 : 800,
      useCache: true,
      useBatch: false,
      rationale: isSimpleQuery ? 'Simple factual query' : 'Complex analysis query'
    }
  }

  // Default fallback
  return {
    model: 'gpt-4o',
    maxTokens: 800,
    useCache: true,
    useBatch: false,
    rationale: 'Default — complex'
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

  // If it matches a complex pattern, always use Sonnet equivalent
  if (complexPatterns.some(p => p.test(q))) return false

  // If it matches a simple pattern, use Haiku equivalent
  if (simplePatterns.some(p => p.test(q))) return true

  // Default: queries under 60 chars are likely simple
  return query.length < 60
}
