/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities */
import { createClient } from '@/lib/supabase/server'
import { routeToModel } from '@/lib/ai/model-router'
import { callWithCache } from '@/lib/ai/cached-client'
import { checkAndDeductBudget } from '@/lib/ai/budget-manager'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await request.json()
  // Support both legacy `message` + `conversationHistory` and new `query` + `portfolio_context`
  const query = body.query || body.message
  const portfolio_context = body.portfolio_context
  const history = body.conversationHistory || []

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

  let histString = ''
  if (history.length > 0) {
    histString = "\nPREVIOUS CONVERSATION HISTORY:\n" + history.map((m: any) => `${m.role}: ${m.content}`).join("\n") + "\n"
  }

  // Build contextual user message — compact, not the entire DB
  const userMessage = buildUserQueryPrompt(query, portfolio_context, user.id) + histString

  const streamResponse = await callWithCache({
    userMessage,
    model: routing.model,
    maxTokens: routing.maxTokens,
    stream: true,
  })

  // OpenAI streaming via standard Web Streams API logic
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      let totalOutput = ''
      
      try {
        // @ts-ignore
        for await (const chunk of streamResponse) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            totalOutput += content
            controller.enqueue(encoder.encode(content)) // Return plain text chunks compatible with existing UI if necessary, or the exact data structure if needed.
            // The existing ui seems to expect plain text from stream based on "content" so leaving it simple, or SSE.
            // Wait, existing UI `advice/route.ts` returned plain text chunked 'Transfer-Encoding': 'chunked'
          }
        }
      } catch (e) {
        console.error("Stream error", e)
      } finally {
        logAiCall(user.id, routing.model, query.length, totalOutput.length)
        controller.close()
      }
    }
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
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

async function logAiCall(userId: string, model: string, inputChars: number, outputChars: number) {
  // Estimate tokens (rough: 4 chars per token)
  const estInputTokens = Math.ceil(inputChars / 4)
  const estOutputTokens = Math.ceil(outputChars / 4)

  const supabase = await createClient()
  await supabase.from('ai_usage_log').insert({
    user_id: userId,
    call_type: 'user_query',
    model_used: model,
    estimated_input_tokens: estInputTokens,
    estimated_output_tokens: estOutputTokens,
    created_at: new Date().toISOString(),
  })
}

