/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities */
import yahooFinance from 'yahoo-finance2'

export async function getLiveStockPrice(symbol: string) {
  try {
    const result = await yahooFinance.quote(symbol) as any
    return {
      price: result.regularMarketPrice,
      previousClose: result.regularMarketPreviousClose,
      changePercent: result.regularMarketChangePercent,
      name: result.shortName || result.longName,
      currency: result.currency
    }
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error)
    return null
  }
}

