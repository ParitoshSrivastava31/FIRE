import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLiveStockPrice } from '@/lib/market/stocks'

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
      .in('asset_type', ['stock', 'etf'])
    
    if (!holdings || holdings.length === 0) {
      return NextResponse.json({ message: 'No stocks to update' })
    }

    const uniqueSymbols = Array.from(new Set(holdings.map(h => h.symbol).filter(Boolean))) as string[]
    
    let updatedCount = 0
    for (const symbol of uniqueSymbols) {
      const liveData = await getLiveStockPrice(symbol)
      if (liveData && liveData.price) {
        await supabase
          .from('portfolio_holdings')
          .update({ 
            current_price: liveData.price,
            previous_close: liveData.previousClose,
            last_updated: new Date().toISOString()
          })
          .eq('symbol', symbol)
          .in('asset_type', ['stock', 'etf'])
          
        updatedCount++
      }
    }

    return NextResponse.json({ success: true, updatedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
