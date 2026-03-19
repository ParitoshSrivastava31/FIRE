import OpenAI from 'openai'

// Supports OpenAI, Anthropic (via OpenRouter), Gemini (via OpenRouter), or any OpenAI-compatible API.
// Set ANTHROPIC_API_KEY (from OpenRouter) for Claude/Gemini/OSS models.
// Set OPENAI_API_KEY for direct OpenAI usage.
const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY
const useOpenRouter = !!process.env.ANTHROPIC_API_KEY

if (!apiKey) {
  console.warn('[AI] No API key found. Set ANTHROPIC_API_KEY (OpenRouter) or OPENAI_API_KEY.')
}

export const openai = new OpenAI({
  apiKey,
  ...(useOpenRouter && {
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://monetra.app',
      'X-Title': 'Monetra AI Finance Planner',
    },
  }),
})

// Default model — Claude claude-sonnet via OpenRouter, falls back to gpt-4o-mini
export const AI_MODEL = useOpenRouter
  ? 'anthropic/claude-sonnet-4-5'
  : 'gpt-4o-mini'
