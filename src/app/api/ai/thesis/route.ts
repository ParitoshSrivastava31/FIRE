import { NextResponse } from 'next/server'
import { openai, AI_MODEL } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch real user context
    const profile = user ? (await supabase
      .from('users')
      .select('full_name, monthly_income, risk_profile, city, occupation')
      .eq('id', user.id)
      .single()).data : null

    const goalsData = user ? (await supabase
      .from('goals')
      .select('name, goal_type, target_amount, current_amount, target_date')
      .eq('user_id', user.id)
      .limit(5)).data : []

    const body = await req.json()
    const {
      monthlyInvestment = profile?.monthly_income ? Math.round(profile.monthly_income * 0.4) : 20000,
      projectionYears = 15,
      riskProfile = profile?.risk_profile || body.riskProfile || 'moderate',
      // Legacy fields from old client calls
      expenses, portfolio, goals: bodyGoals,
    } = body

    const goals = goalsData && goalsData.length > 0 ? goalsData : bodyGoals

    const goalsText = goals && goals.length > 0
      ? goals.map((g: { name: string; target_amount: number; target_date?: string }) =>
          `- ${g.name}: ₹${(Number(g.target_amount) / 100000).toFixed(1)}L by ${g.target_date ? new Date(g.target_date).getFullYear() : 'TBD'}`
        ).join('\n')
      : '- No specific goals set (general wealth creation)'

    const systemPrompt = `You are Monetra's AI Financial Advisor — a SEBI-aware, India-first investment planning assistant.
You provide personalised, actionable investment theses for Indian retail investors.
Always reference India-specific instruments: Mutual Funds (AMFI codes), NSE/BSE listed stocks, SGB, PPF, NPS, REITs.
Structure your response with markdown: ## headers, bullet lists, and small tables.
Always end with: *⚠️ Educational information only. Not SEBI-registered investment advice. Consult a qualified RIA before investing.*`

    const userPrompt = `Generate a comprehensive investment thesis for this user:

**Profile:**
- Name: ${profile?.full_name || 'User'}
- City: ${profile?.city || 'India'}  
- Occupation: ${profile?.occupation || 'Salaried'}
- Risk Profile: ${riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1)}
- Monthly Surplus to Invest: ₹${Number(monthlyInvestment).toLocaleString('en-IN')}
- Horizon: ${projectionYears} years

**Financial Goals:**
${goalsText}

${portfolio ? `**Current Portfolio Summary:** ${JSON.stringify(portfolio)}` : ''}
${expenses ? `**Monthly Expenses Context:** ${JSON.stringify(expenses)}` : ''}

Please provide:
1. Asset allocation (% by class + ₹ amount from monthly surplus)
2. Specific mutual fund picks with AMFI scheme codes
3. Monthly SIP schedule breakdown
4. Tax optimisation (80C, 80CCD(1B), LTCG harvesting)
5. Goal achievement timeline
6. Risk scenario table (market -20%, -40%, flat 5Y) with action plan`

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
      max_tokens: 1500,
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
