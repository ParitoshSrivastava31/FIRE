import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMutualFundNAV } from '@/lib/market/mf'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const supabase = await createClient()
    
    const { data: holdings } = await supabase
      .from('portfolio_holdings')
      .select('symbol')
      .eq('asset_type', 'mutual_fund')
    
    if (!holdings || holdings.length === 0) {
      return NextResponse.json({ message: 'No mutual funds to update' })
    }

    const uniqueSchemeCodes = Array.from(new Set(holdings.map(h => h.symbol).filter(Boolean))) as string[]
    
    let updatedCount = 0
    for (const code of uniqueSchemeCodes) {
      const mfData = await getMutualFundNAV(code)
      if (mfData && mfData.nav) {
        await supabase
          .from('portfolio_holdings')
          .update({ 
            current_price: mfData.nav,
            last_updated: new Date().toISOString()
          })
          .eq('symbol', code)
          .eq('asset_type', 'mutual_fund')
          
        updatedCount++
      }
    }

    return NextResponse.json({ success: true, updatedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
