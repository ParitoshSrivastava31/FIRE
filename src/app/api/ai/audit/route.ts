import { NextResponse } from 'next/server'
import { openai, AI_MODEL } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch real expenses from Supabase if user is logged in
    let expenseContext = ''
    if (user) {
      const { data: expenses } = await supabase
        .from('transactions')
        .select('category, amount, description, transaction_date')
        .eq('user_id', user.id)
        .gte('transaction_date', new Date(new Date().setDate(1)).toISOString().split('T')[0])
        .order('amount', { ascending: false })
        .limit(30)

      if (expenses && expenses.length > 0) {
        const byCategory: Record<string, number> = {}
        expenses.forEach((e: { category: string; amount: number }) => {
          byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
        })
        expenseContext = `Real expenses this month:\n` + Object.entries(byCategory)
          .sort(([, a], [, b]) => b - a)
          .map(([cat, amt]) => `- ${cat}: ₹${amt.toLocaleString('en-IN')}`)
          .join('\n')
      }
    }

    const body = await req.json()
    const { expenses: bodyExpenses, income = 120000 } = body

    // Use real data if available, else use body data
    const expenseData = expenseContext || (bodyExpenses
      ? Object.entries(bodyExpenses as Record<string, number>)
          .sort(([, a], [, b]) => b - a)
          .map(([cat, amt]) => `- ${cat}: ₹${amt.toLocaleString('en-IN')}`)
          .join('\n')
      : '- No expense data provided')

    const totalExpenses = bodyExpenses
      ? Object.values(bodyExpenses as Record<string, number>).reduce((s, v) => s + v, 0)
      : 0
    const surplus = income - totalExpenses
    const savingsRate = income > 0 ? Math.round((surplus / income) * 100) : 0

    const systemPrompt = `You are Monetra's AI Spending Analyst for Indian retail investors.
Analyse spending patterns and give actionable, specific reduction suggestions with rupee amounts.
Reference Indian spending contexts: food delivery (Zomato/Swiggy), ride-hailing (Ola/Uber), OTT subscriptions, etc.
Quantify the impact of every suggestion: "Saving ₹X/month → ₹Y Cr in 10 years at 11% CAGR"
Keep your response concise — max 400 words. Use markdown with ## headers.
End with: *⚠️ This is educational information, not financial advice.*`

    const userPrompt = `Audit my spending for this month:

**Monthly Income:** ₹${income.toLocaleString('en-IN')}
**Monthly Surplus:** ₹${surplus.toLocaleString('en-IN')} (${savingsRate}% savings rate)

**Spending Breakdown:**
${expenseData}

Provide:
1. Top 3 overspending areas with specific reduction suggestions
2. Quick wins (habits to change this week)
3. If I redirect ₹5,000/month to investments — what does that grow to?`

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
      max_tokens: 700,
      temperature: 0.6,
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
