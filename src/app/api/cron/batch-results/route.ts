/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities */
import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/ai/cached-client'
// In-app mock for sendDigestEmail since it doesn't exist yet
async function sendDigestEmail(params: any) {
  console.log(`[Email Mock] Digest sent to ${params.to}`)
}

export async function GET(request: Request) {
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = await createClient()

  // Find all pending batch jobs
  const { data: pendingBatches } = await supabase
    .from('batch_jobs')
    .select('*')
    .eq('status', 'processing')

  for (const job of pendingBatches || []) {
    try {
      const batchStatus = await openai.batches.retrieve(job.batch_id)

      if (batchStatus.status !== 'completed' && batchStatus.status !== 'failed') {
        continue
      }

      if (batchStatus.status === 'failed') {
        await supabase
          .from('batch_jobs')
          .update({ status: 'failed', completed_at: new Date().toISOString() })
          .eq('batch_id', job.batch_id)
        continue
      }

      // Collect all results
      if (!batchStatus.output_file_id) continue

      const fileResponse = await openai.files.content(batchStatus.output_file_id)
      const fileContents = await fileResponse.text()

      const results: Record<string, string> = {}
      
      const rows = fileContents.trim().split('\n')
      for (const row of rows) {
        if (!row) continue
        const parsed = JSON.parse(row)
        if (parsed.response?.status_code === 200) {
          const userId = parsed.custom_id.split('-')[1] // `weekly_digest-${userId}-${timestamp}`
          const content = parsed.response.body.choices[0]?.message?.content
          if (content) {
            results[userId] = content
          }
        }
      }

      // Store insights and trigger delivery
      for (const [userId, digestText] of Object.entries(results)) {
        await supabase.from('ai_insights').insert({
          user_id: userId,
          insight_type: job.job_type,
          content: digestText,
          model_used: 'gpt-4o',
          via_batch: true,
          created_at: new Date().toISOString(),
        })

        // Trigger email delivery
        if (job.job_type === 'weekly_digest') {
          const { data: user } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', userId)
            .single()

          if (user?.email) {
            await sendDigestEmail({
              to: user.email,
              name: user.full_name,
              digest: digestText,
              week: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
            })
          }
        }
      }

      // Mark batch as complete
      await supabase
        .from('batch_jobs')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('batch_id', job.batch_id)

    } catch (error) {
      console.error(`Error processing batch ${job.batch_id}:`, error)
    }
  }

  return Response.json({ success: true })
}

