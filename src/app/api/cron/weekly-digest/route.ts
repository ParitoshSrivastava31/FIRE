/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities */
import { createClient } from '@/lib/supabase/server'
import { MONETRA_SYSTEM_PROMPT } from '@/lib/ai/prompts/system-prompt'
import { openai } from '@/lib/ai/cached-client'
import fs from 'fs'
import path from 'path'
import os from 'os'

export async function GET(request: Request) {
  // Verify this is a legitimate Vercel cron call
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = await createClient()

  // Fetch all Pro users who are active (logged in within last 14 days)
  const { data: activeUsers } = await supabase
    .from('users')
    .select(`
      id, full_name, risk_profile, monthly_income, city,
      portfolio_holdings (asset_type, asset_name, current_value, invested_amount, allocation_percent),
      goals (name, target_amount, current_amount, deadline_date),
      transactions (amount, category, transaction_date)
    `)
    .eq('subscription_tier', 'pro')
    .gte('last_active_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())

  if (!activeUsers || activeUsers.length === 0) {
    return Response.json({ message: 'No active Pro users', count: 0 })
  }

  // Build JSONL string for OpenAI Batch API
  const lines: string[] = []

  // Ensure JSONL file handles users
  activeUsers.forEach((user: any) => {
    const portfolioSummary = buildPortfolioSummary(user)
    const thisWeekSpend = buildThisWeekSpend(user)

    const requestObj = {
      custom_id: `weekly_digest-${user.id}-${Date.now()}`,
      method: "POST",
      url: "/v1/chat/completions",
      body: {
        model: "gpt-4o",
        max_tokens: 1200,
        messages: [
          { role: "system", content: MONETRA_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Generate a weekly financial digest for this user.

USER PROFILE:
- Name: ${user.full_name}
- Risk profile: ${user.risk_profile}
- City: ${user.city}
- Monthly income: ₹${user.monthly_income?.toLocaleString('en-IN')}

PORTFOLIO THIS WEEK:
${portfolioSummary}

SPENDING THIS WEEK:
${thisWeekSpend}

Write a concise weekly digest covering:
1. Portfolio performance summary (2–3 sentences, specific ₹ numbers)
2. Top 1–2 action items for this week (very specific)
3. One behavioural nudge — connect a spending category to an investment opportunity

Format as clean markdown. Maximum 300 words. No bullet points for the narrative, use short paragraphs.`
          }
        ]
      }
    }
    
    lines.push(JSON.stringify(requestObj))
  })

  // Write to temporary file
  const tmpFilePath = path.join(os.tmpdir(), `batch_${Date.now()}.jsonl`)
  fs.writeFileSync(tmpFilePath, lines.join("\n"))

  // Upload file to OpenAI
  let fileId = ""
  try {
    const fileRes = await openai.files.create({
      file: fs.createReadStream(tmpFilePath),
      purpose: "batch"
    })
    fileId = fileRes.id

    // Start batch job
    const batch = await openai.batches.create({
      input_file_id: fileId,
      endpoint: "/v1/chat/completions",
      completion_window: "24h"
    })

    // Store the batch ID so we can poll for results
    await supabase.from('batch_jobs').insert({
      batch_id: batch.id,
      job_type: 'weekly_digest',
      user_count: activeUsers.length,
      status: 'processing',
      created_at: new Date().toISOString(),
      user_ids: activeUsers.map((u: any) => u.id),
    })

    return Response.json({
      success: true,
      batch_id: batch.id,
      users_queued: activeUsers.length
    })

  } catch (error: any) {
    console.error("Batch creation failed", error)
    return Response.json({ success: false, error: error?.message || 'Failed' }, { status: 500 })
  } finally {
    if (fs.existsSync(tmpFilePath)) {
      fs.unlinkSync(tmpFilePath)
    }
  }
}

// Helper: summarise portfolio into compact text (not full JSON)
function buildPortfolioSummary(user: any): string {
  const holdings = user.portfolio_holdings || []
  if (holdings.length === 0) return 'No holdings recorded.'

  const totalValue = holdings.reduce((s: number, h: any) => s + h.current_value, 0)
  const totalInvested = holdings.reduce((s: number, h: any) => s + h.invested_amount, 0)
  const totalPL = totalValue - totalInvested
  const totalPLPct = totalInvested > 0 ? ((totalPL / totalInvested) * 100).toFixed(1) : 0

  const lines = [
    `Total portfolio: ₹${totalValue.toLocaleString('en-IN')} (invested: ₹${totalInvested.toLocaleString('en-IN')}, P&L: ${totalPL >= 0 ? '+' : ''}₹${totalPL.toLocaleString('en-IN')} / ${totalPLPct}%)`
  ]

  // Top 3 holdings by value only — keep tokens minimal
  const top3 = holdings.sort((a: any, b: any) => b.current_value - a.current_value).slice(0, 3)
  for (const h of top3) {
    const pl = h.current_value - h.invested_amount
    const plPct = h.invested_amount > 0 ? ((pl / h.invested_amount) * 100).toFixed(1) : 0
    lines.push(`- ${h.asset_name}: ₹${h.current_value.toLocaleString('en-IN')} (${pl >= 0 ? '+' : ''}${plPct}%)`)
  }

  return lines.join('\n')
}

function buildThisWeekSpend(user: any): string {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recent = (user.transactions || []).filter(
    (t: any) => new Date(t.transaction_date).getTime() >= weekAgo
  )
  if (recent.length === 0) return 'No transactions recorded this week.'

  const byCategory: Record<string, number> = {}
  for (const t of recent) {
    byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount)
  }

  return Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([cat, amt]) => `- ${cat}: ₹${amt.toLocaleString('en-IN')}`)
    .join('\n')
}

