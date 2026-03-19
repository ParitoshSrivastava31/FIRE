import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages } = body 

    const systemPrompt = {
      role: 'system',
      content: 'You are Monetra, a conversational SEBI-informed personal finance assistant grounded in India-specific instruments.'
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [systemPrompt, ...messages],
    })

    return NextResponse.json(completion.choices[0].message)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
