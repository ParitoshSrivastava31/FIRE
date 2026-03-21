import { NextRequest, NextResponse } from 'next/server'
import { getLiveStockPrice } from '@/lib/market/stocks'

// Common gold proxies in India
const GOLD_INSTRUMENTS = {
  'GOLDBEES.NS': 'Nippon India ETF Gold BeES',
  'SBI-ETF-GOLD.NS': 'SBI Gold ETF',
  'HDFCGOLD.NS': 'HDFC Gold ETF',
  'GC=F': 'Gold Futures (Global/USD)',
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get('symbol')

    if (symbol) {
      const data = await getLiveStockPrice(symbol)
      if (!data) return NextResponse.json({ error: 'Instrument not found' }, { status: 404 })
      return NextResponse.json({ ...data, symbol })
    }

    const topSymbols = Object.keys(GOLD_INSTRUMENTS)
    const results = await Promise.allSettled(
      topSymbols.map(async (sym) => {
        const data = await getLiveStockPrice(sym)
        return data ? { ...data, symbol: sym, description: GOLD_INSTRUMENTS[sym as keyof typeof GOLD_INSTRUMENTS] } : null
      })
    )

    const goldInstruments = results
      .filter((r): r is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof getLiveStockPrice>> & { symbol: string, description: string }>> => 
        r.status === 'fulfilled' && r.value !== null
      )
      .map(r => r.value)

    return NextResponse.json({ gold: goldInstruments, fetchedAt: new Date().toISOString() }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
