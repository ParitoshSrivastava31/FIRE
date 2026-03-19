import { NextRequest, NextResponse } from 'next/server'
import { getMutualFundNAV } from '@/lib/market/mf'

// Popular mutual fund scheme codes (AMFI)
const POPULAR_FUNDS: Record<string, string> = {
  '122639': 'Parag Parikh Flexi Cap Fund',
  '120503': 'Axis Long Term Equity Fund (ELSS)',
  '113177': 'HDFC Midcap Opportunities Fund',
  '119551': 'SBI Small Cap Fund',
  '118989': 'Mirae Asset Large Cap Fund',
  '101206': 'HDFC Balanced Advantage Fund',
  '118825': 'Canara Robeco Flexi Cap Fund',
  '120716': 'Kotak Flexicap Fund',
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const schemeCode = searchParams.get('code')

    if (schemeCode) {
      // Fetch single fund
      const nav = await getMutualFundNAV(schemeCode)
      if (!nav) {
        return NextResponse.json({ error: 'Fund not found' }, { status: 404 })
      }
      return NextResponse.json(nav)
    }

    // Fetch top funds in parallel (with 3s timeout)
    const topCodes = Object.keys(POPULAR_FUNDS).slice(0, 6)
    const results = await Promise.allSettled(
      topCodes.map(async (code) => {
        const nav = await getMutualFundNAV(code)
        return nav ? { ...nav, schemeCode: code } : null
      })
    )

    const funds = results
      .filter((r): r is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof getMutualFundNAV>> & { schemeCode: string }>> =>
        r.status === 'fulfilled' && r.value !== null
      )
      .map((r) => r.value)

    return NextResponse.json({ funds, fetchedAt: new Date().toISOString() }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
