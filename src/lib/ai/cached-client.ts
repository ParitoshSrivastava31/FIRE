import OpenAI from 'openai'
import { MONETRA_SYSTEM_PROMPT } from './prompts/system-prompt'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  // If pointing to OpenRouter, un-comment baseURL and set OpenRouter API key above
  // baseURL: 'https://openrouter.ai/api/v1',
})

export interface CachedCallOptions {
  userMessage: string
  model: string
  maxTokens: number
  stream?: boolean
}

/**
 * Note: OpenAI automatically caches prompts when identical prefixes are sent 
 * (Prompt Caching feature for GPT-4o models). We don't need explicit `cache_control` blocks
 * like with Anthropic.
 */
export async function callWithCache(options: CachedCallOptions) {
  const { userMessage, model, maxTokens, stream = false } = options

  if (stream) {
    const streamRes = await openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      stream: true,
      messages: [
        { role: 'system', content: MONETRA_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ]
    })
    return streamRes
  }

  const response = await openai.chat.completions.create({
    model,
    max_tokens: maxTokens,
    stream: false,
    messages: [
      { role: 'system', content: MONETRA_SYSTEM_PROMPT },
      { role: 'user', content: userMessage }
    ]
  })

  return response
}
