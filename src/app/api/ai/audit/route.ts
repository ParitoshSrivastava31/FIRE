import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    const { monthly_expenses, income, month, user_city } = body

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are Monetra, a personal finance auditor for Indian professionals. Output in JSON format providing 3-5 bullet insights and specific redirection scenarios (e.g. cutting dining spend to fund an ELSS SIP).'
        },
        { 
          role: 'user', 
          content: `Audit my spending. Income: ₹${income}, City: ${user_city}. Expenses: ${JSON.stringify(monthly_expenses)}` 
        }
      ],
      response_format: { type: "json_object" }
    })

    return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
