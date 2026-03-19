import { NextResponse } from 'next/server'
import { openai, AI_MODEL } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const { message, conversationHistory = [] } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Fetch user profile for context
    const profile = user ? (await supabase
      .from('users')
      .select('full_name, monthly_income, risk_profile, city, occupation')
      .eq('id', user.id)
      .single()).data : null

    const systemPrompt = `You are Monetra's AI Finance Assistant — a friendly, expert financial planner for India.
You are chatting with ${profile?.full_name || 'a user'} who has a ${profile?.risk_profile || 'moderate'} risk profile and lives in ${profile?.city || 'India'}.
Their monthly income is approximately ₹${profile?.monthly_income ? profile.monthly_income.toLocaleString('en-IN') : 'unknown'}.

You specialise in:
- Mutual funds, SIPs, and India-specific investment instruments (PPF, NPS, SGB, ELSS)
- Tax planning under the Indian Income Tax Act (80C, 80CCD, LTCG)
- Stock market analysis for NSE/BSE
- Personal finance and budgeting for Indian households
- Real estate investment in Indian cities

Keep responses concise (max 250 words). Be conversational but specific.
Always end advice responses with: *Not SEBI-registered advice. Consult a qualified RIA.*`

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.map((m: { role: 'user' | 'assistant'; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages,
      stream: true,
      max_tokens: 500,
      temperature: 0.7,
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) controller.enqueue(encoder.encode(content))
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
