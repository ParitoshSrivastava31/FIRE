import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Bypassed for development
    // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const body = await req.json()
    const { profile, expenses, portfolio, goals, riskProfile } = body

    const systemPrompt = `You are Monetra, a SEBI-informed personal finance advisor built for India.
You have deep knowledge of: NSE/BSE equities, mutual funds, SIP mechanics, NPS, PPF, Sovereign Gold Bonds, Indian real estate markets, and tax laws.
Address the user by their first name and use ₹ (Indian Rupees) for all amounts.
Provide a structured investment thesis with actionable insights, an asset allocation plan, and a step-up SIP plan.`

    const userPrompt = `
Generate a personalized investment thesis based on the following data:
Profile: ${JSON.stringify(profile)}
Expenses: ${JSON.stringify(expenses)}
Portfolio: ${JSON.stringify(portfolio)}
Goals: ${JSON.stringify(goals)}
Risk Profile: ${riskProfile}
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      stream: true,
    })

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || ""
          const encoder = new TextEncoder()
          controller.enqueue(encoder.encode(content))
        }
        controller.close()
      }
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
