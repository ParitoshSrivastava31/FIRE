/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities */
import { NextRequest, NextResponse } from 'next/server'
import { getLiveStockPrice } from '@/lib/market/stocks'

const POPULAR_STOCKS = [
  'HDFCBANK.NS',
  'RELIANCE.NS',
  'TCS.NS',
  'INFY.NS',
  'ICICIBANK.NS',
  'ITC.NS',
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get('symbol')

    if (symbol) {
      const data = await getLiveStockPrice(symbol)
      if (!data) return NextResponse.json({ error: 'Stock not found' }, { status: 404 })
      return NextResponse.json({ ...data, symbol })
    }

    const results = await Promise.allSettled(
      POPULAR_STOCKS.map(async (sym) => {
        const data = await getLiveStockPrice(sym)
        return data ? { ...data, symbol: sym } : null
      })
    )

    const stocks = results
      .filter((r): r is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof getLiveStockPrice>> & { symbol: string }>> => 
        r.status === 'fulfilled' && r.value !== null
      )
      .map(r => r.value)

    return NextResponse.json({ stocks, fetchedAt: new Date().toISOString() }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}

