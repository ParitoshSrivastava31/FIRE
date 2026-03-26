import { createClient } from '@/lib/supabase/server'
import { routeToModel } from '@/lib/ai/model-router'
import { callWithCache } from '@/lib/ai/cached-client'
import { buildEventPrompt } from '@/lib/ai/prompts/event-prompts'
import { EventSeverity, EventType } from '@/lib/rule-engine'

// Mocking the FCM notification for now since it's an architecture stub
export async function sendPushNotification({ userId, title, body, data }: any) {
  console.log(`[FCM Mock] Push to ${userId}: ${title} - ${body}`, data)
}

export async function GET(request: Request) {
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = await createClient()

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
    const userProfile = Array.isArray(event.users) ? event.users[0] : event.users
    
    if (!userProfile) {
      skipped++
      continue
    }

    // Free users: only get critical alerts
    if (userProfile.subscription_tier === 'free' && event.severity !== 'critical') {
      skipped++
      continue
    }

    // Route to correct model
    const routing = routeToModel(event.event_type as EventType)

    // Build the compact, focused prompt for this event
    const userMessage = buildEventPrompt(event, userProfile)

    try {
      const response = await callWithCache({
        userMessage,
        model: routing.model,
        maxTokens: routing.maxTokens,
        stream: false,
      })

      // @ts-ignore - OpenAI response typing
      const insightText = response.choices?.[0]?.message?.content || ''
      // @ts-ignore
      const usage = response.usage || {}

      // Store the insight
      await supabase.from('ai_insights').insert({
        user_id: event.user_id,
        event_id: event.id,
        insight_type: event.event_type,
        content: insightText,
        model_used: routing.model,
        input_tokens: usage.prompt_tokens || 0,
        output_tokens: usage.completion_tokens || 0,
        cache_read_tokens: usage.prompt_tokens_details?.cached_tokens || 0,
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
          title: getNotificationTitle(event.event_type as EventType, event.severity as EventSeverity),
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
