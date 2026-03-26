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
  const supabase = await createClient()

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
    .select('id', { count: 'exact', head: true })
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
