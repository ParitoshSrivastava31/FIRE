# Monetra — Data Ingestion Pipeline v2

> **Priority:** P0 — Nothing else matters until this works  
> **Stack:** Next.js 14 · TypeScript · Supabase · Capacitor (Android wrapper)  
> **Scope:** SMS-first ingestion with a 4-level cost-optimised categorisation engine  
> **Future pillars:** PDF upload, Account Aggregator (AA), Portfolio sync (Zerodha/CAMS) are scoped out below — not built yet

---

## Table of Contents

1. [The Core Problem](#1-the-core-problem)
2. [The PWA/SMS Reality Check](#2-the-pwasms-reality-check)
3. [Recommended Path — Capacitor Wrapper](#3-recommended-path--capacitor-wrapper)
4. [SMS Parser — Regex Pattern Engine](#4-sms-parser--regex-pattern-engine)
5. [The 4-Level Categorisation Stack](#5-the-4-level-categorisation-stack)
6. [Level 0 — Keyword Dictionary](#6-level-0--keyword-dictionary)
7. [Level 1 — Fuzzy Merchant Matching](#7-level-1--fuzzy-merchant-matching)
8. [Level 2 — Gemini Flash (Cheapest AI)](#8-level-2--gemini-flash)
9. [Level 3 — Failure Logging](#9-level-3--failure-logging)
10. [SMS Sync Service — Full Orchestrator](#10-sms-sync-service)
11. [Unified Transaction Normaliser](#11-unified-transaction-normaliser)
12. [Deduplication Logic](#12-deduplication-logic)
13. [Onboarding Permission Flow](#13-onboarding-permission-flow)
14. [Supabase Schema](#14-supabase-schema)
15. [Cost Reality — What This Actually Costs](#15-cost-reality)
16. [Future Pillars (Not Built Yet)](#16-future-pillars)
17. [Build Order](#17-build-order)

---

## 1. The Core Problem

Manual data entry is the single biggest retention killer in personal finance apps. The failure loop:

```
User signs up → Manually enters 10 transactions →
Life happens → Misses 3 days → Backlog feels huge →
Stops entering → Data incomplete → AI insights wrong →
App feels broken → User churns
```

The fix: every bank transaction flows in automatically, without the user doing anything after the initial setup.

India is uniquely well-positioned for this. Every major Indian bank — HDFC, ICICI, SBI, Axis, Kotak, PNB, BoB — sends an SMS for every single transaction. ₹50 UPI payment to a chai stall? SMS. ₹2 lakh NEFT? SMS. Salary credit? SMS. These messages follow ~15 predictable patterns and contain everything Monetra needs: amount, type (debit/credit), merchant, and balance.

---

## 2. The PWA/SMS Reality Check

**The honest problem:** A standard web app or PWA running in a browser has zero access to the device's SMS inbox. The Web SMS API does not exist as a cross-browser standard. This is intentional — browsers sandbox apps from sensitive device data.

**What this means for Monetra:**

| Platform | SMS Access via Browser/PWA | Solution |
|---|---|---|
| Android (Chrome PWA) | ❌ Not possible | Capacitor wrapper → APK |
| iOS (Safari PWA) | ❌ Not possible | WhatsApp bot fallback |
| Desktop Web | ❌ Not applicable | PDF upload (future) |

**The user install step is unavoidable for SMS.** There is no path to SMS ingestion without the user installing something beyond a browser bookmark. This is not a Monetra limitation — it is a platform security constraint.

The good news: you already said users will need to install Monetra on Android. That install step is the exact moment to request SMS permission. The user is already committed enough to install an app — the permission ask at that point has a much higher grant rate than a cold browser popup.

---

## 3. Recommended Path — Capacitor Wrapper

### Why Capacitor, not a separate companion app

A "companion SMS forwarder" (a second tiny APK) adds friction: users must install two apps, understand why two apps exist, and keep both running. Capacitor wraps your existing Next.js app into a single APK. One install, one app, native SMS access. Your entire codebase stays in TypeScript/Next.js — Capacitor adds a thin native shell around it.

### 3.1 Setup

```bash
# In your existing Next.js project
npm install @capacitor/core @capacitor/android @capacitor/cli
npm install capacitor-sms-inbox   # community plugin for SMS read access

# Initialise Capacitor (run once)
npx cap init Monetra com.monetra.app --web-dir=out

# Add Android platform
npx cap add android

# After each Next.js build, sync to Android
next build && next export
npx cap sync android

# Open in Android Studio to sign and generate APK
npx cap open android
```

### 3.2 Build pipeline adjustment

```json
// package.json — add these scripts
{
  "scripts": {
    "build:android": "next build && next export && npx cap sync android",
    "open:android": "npx cap open android"
  }
}
```

```javascript
// next.config.js — required for static export (Capacitor needs static HTML)
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}
module.exports = nextConfig
```

> **Note on API routes:** `output: 'export'` means your Next.js API routes (`/api/*`) won't be served from the APK — they still live on Vercel. The Capacitor app calls your Vercel-hosted API endpoints over HTTPS. This is correct and expected. Your backend does not change.

### 3.3 SMS Reader Plugin

```typescript
// src/lib/sms/sms-reader.ts

import { Capacitor } from '@capacitor/core'

export interface RawSMS {
  id: string
  address: string    // sender short code e.g. "HDFCBK"
  body: string       // full SMS text
  date: number       // unix timestamp ms
}

export async function isNativeSMSAvailable(): Promise<boolean> {
  return Capacitor.getPlatform() === 'android'
}

export async function readBankSMSMessages(daysBack: number = 90): Promise<RawSMS[]> {
  if (!(await isNativeSMSAvailable())) return []

  const { SmsInbox } = await import('capacitor-sms-inbox')
  const since = Date.now() - daysBack * 24 * 60 * 60 * 1000

  const { messages } = await SmsInbox.getSmsMessages({
    filters: {
      minDate: since,
      addresses: KNOWN_BANK_SENDER_IDS,
    }
  })

  return messages
}

export async function readNewSMSMessagesSince(timestamp: number): Promise<RawSMS[]> {
  if (!(await isNativeSMSAvailable())) return []

  const { SmsInbox } = await import('capacitor-sms-inbox')

  const { messages } = await SmsInbox.getSmsMessages({
    filters: {
      minDate: timestamp,
      addresses: KNOWN_BANK_SENDER_IDS,
    }
  })

  return messages
}

// TRAI-registered sender IDs for all major Indian banks + UPI apps
// These are short codes, not phone numbers — safe to whitelist
export const KNOWN_BANK_SENDER_IDS: string[] = [
  // HDFC Bank
  'HDFCBK', 'HDFC', 'HDFCBN', 'HDFCCC',
  // ICICI Bank
  'ICICIB', 'ICICI', 'ICICIN',
  // SBI
  'SBIINB', 'SBIPSG', 'SBI', 'SBISMS',
  // Axis Bank
  'AXISBK', 'AXISBN', 'UTIBOP',
  // Kotak Mahindra Bank
  'KOTAKB', 'KOTAK', 'KOTAKM',
  // Yes Bank
  'YESBNK', 'YESBKG',
  // IndusInd Bank
  'INDBNK', 'INDUSB', 'INDUSL',
  // Federal Bank
  'FEDBNK', 'FEDERA',
  // IDFC First Bank
  'IDFCBK', 'IDFCFB',
  // Bandhan Bank
  'BANDHB',
  // Punjab National Bank
  'PNBSMS', 'PNBBNK',
  // Bank of Baroda
  'BOIIND', 'BARBOD',
  // Canara Bank
  'CANBNK', 'CANARA',
  // Union Bank
  'UBIBNK',
  // RBL Bank
  'RBLBNK',
  // AU Small Finance Bank
  'AUSFBK',
  // UPI / Payments
  'PTMBNK', 'PAYTMB', 'PHONEPE', 'GPAY', 'BHIMUPI',
  // Credit cards
  'AMEXIN', 'SCBNK', 'CITIBN', 'HSBCIN',
]
```

---

## 4. SMS Parser — Regex Pattern Engine

The parser converts raw SMS text into a structured transaction object. Uses pure regex — no AI involved. Fast, free, handles 95%+ of Indian bank SMS formats.

```typescript
// src/lib/sms/sms-parser.ts

export type TransactionType = 'debit' | 'credit' | 'otp' | 'promo' | 'unknown'
export type PaymentChannel = 'UPI' | 'NEFT' | 'IMPS' | 'RTGS' | 'ATM' | 'POS' | 'CARD' | 'EMI' | 'NACH' | 'SALARY'

export interface ParsedTransaction {
  type: TransactionType
  amount?: number
  currency: 'INR'
  account_masked?: string
  merchant?: string
  reference?: string
  balance_after?: number
  channel?: PaymentChannel
  raw_date: Date
  raw_sms: string
  confidence: number           // 0–1
}

// ─────────────────────────────────────────────────────────────────
// PATTERN LIBRARY
// Add patterns when new formats appear in sms_parse_failures table
// ─────────────────────────────────────────────────────────────────

type PatternDef = {
  name: string
  regex: RegExp
  extract: (match: RegExpMatchArray) => Partial<ParsedTransaction>
}

const PATTERNS: PatternDef[] = [

  // ── HDFC debit ────────────────────────────────────────────────
  // "Rs.500.00 debited from a/c **1234 on 15-01-25 by UPI-Swiggy. Avl Bal:Rs.12450.50"
  {
    name: 'hdfc_debit',
    regex: /Rs\.([\d,]+(?:\.\d+)?)\s+debited from a\/c\s+\**(\d{4})\s+on[\s\d\-]+by\s+([\w\s\-@./]+?)\.?\s*Avl Bal[:\s]*Rs\.([\d,]+(?:\.\d+)?)/i,
    extract: m => ({
      type: 'debit',
      amount: parseAmount(m[1]),
      account_masked: m[2],
      merchant: cleanMerchant(m[3]),
      balance_after: parseAmount(m[4]),
      channel: detectChannel(m[3]),
    })
  },

  // ── HDFC credit ───────────────────────────────────────────────
  // "Rs.50000.00 credited to a/c **1234 on 01-02-25. Avl Bal:Rs.62450.50"
  {
    name: 'hdfc_credit',
    regex: /Rs\.([\d,]+(?:\.\d+)?)\s+credited to a\/c\s+\**(\d{4})\s+on[\s\d\-]+(?:by\s+([\w\s\-@./]+?))?\s*\.?\s*Avl Bal[:\s]*Rs\.([\d,]+(?:\.\d+)?)/i,
    extract: m => ({
      type: 'credit',
      amount: parseAmount(m[1]),
      account_masked: m[2],
      merchant: cleanMerchant(m[3] || 'Credit'),
      balance_after: parseAmount(m[4]),
      channel: detectChannel(m[3] || ''),
    })
  },

  // ── ICICI debit ───────────────────────────────────────────────
  // "ICICI Bank Acct XX1234 debited for Rs 1,200.00 on 15-Jan-25. Info: UPI/Zomato"
  {
    name: 'icici_debit',
    regex: /ICICI Bank Acct\s+XX(\d{4})\s+debited for Rs\s+([\d,]+(?:\.\d+)?)\s+on[\s\w\-]+\.\s*Info:\s*([\w\/\s\-@.]+)/i,
    extract: m => ({
      type: 'debit',
      amount: parseAmount(m[2]),
      account_masked: m[1],
      merchant: cleanMerchant(m[3]),
      channel: detectChannel(m[3]),
    })
  },

  // ── ICICI credit ──────────────────────────────────────────────
  {
    name: 'icici_credit',
    regex: /ICICI Bank Acct\s+XX(\d{4})\s+credited (?:with )?Rs\s+([\d,]+(?:\.\d+)?)\s+on[\s\w\-]+/i,
    extract: m => ({
      type: 'credit',
      amount: parseAmount(m[2]),
      account_masked: m[1],
    })
  },

  // ── SBI debit ─────────────────────────────────────────────────
  // "Your A/C XXXXXX1234 debited by Rs 500.00 on 15/01/25 UPI-Swiggy"
  {
    name: 'sbi_debit',
    regex: /A\/C\s+\w*(\d{4})\s+(?:is )?debited\s+(?:by\s+)?Rs\.?\s*([\d,]+(?:\.\d+)?)\s+on\s+[\d\/\-]+\s*([\w\-\/@.]+)?/i,
    extract: m => ({
      type: 'debit',
      amount: parseAmount(m[2]),
      account_masked: m[1],
      merchant: m[3] ? cleanMerchant(m[3]) : undefined,
      channel: detectChannel(m[3] || ''),
    })
  },

  // ── SBI credit ────────────────────────────────────────────────
  {
    name: 'sbi_credit',
    regex: /A\/C\s+\w*(\d{4})\s+credited\s+(?:by\s+)?Rs\.?\s*([\d,]+(?:\.\d+)?)\s+on\s+[\d\/\-]+/i,
    extract: m => ({
      type: 'credit',
      amount: parseAmount(m[2]),
      account_masked: m[1],
    })
  },

  // ── Axis Bank ─────────────────────────────────────────────────
  // "INR 500.00 debited from Axis Bank AC XXXX1234 on 15-01-2025 at Amazon. Avbl Bal INR 8500.00"
  {
    name: 'axis_debit',
    regex: /INR\s+([\d,]+(?:\.\d+)?)\s+debited from Axis Bank AC\s+\w*(\d{4})\s+on[\s\d\-]+at\s+([\w\s.]+)\.\s*Avbl Bal INR\s+([\d,]+(?:\.\d+)?)/i,
    extract: m => ({
      type: 'debit',
      amount: parseAmount(m[1]),
      account_masked: m[2],
      merchant: cleanMerchant(m[3]),
      balance_after: parseAmount(m[4]),
    })
  },

  // ── Kotak Bank ────────────────────────────────────────────────
  // "Kotak Bank: INR 3,000.00 debited from a/c ending 1234 on 15-01-25. UPI Ref 456789"
  {
    name: 'kotak_debit',
    regex: /Kotak Bank:\s+INR\s+([\d,]+(?:\.\d+)?)\s+debited from a\/c ending\s+(\d{4})\s+on[\s\d\-:]+IST\.?\s*(?:UPI Ref\s+(\d+))?/i,
    extract: m => ({
      type: 'debit',
      amount: parseAmount(m[1]),
      account_masked: m[2],
      reference: m[3],
      channel: 'UPI',
    })
  },

  // ── Generic UPI debit (PhonePe/GPay style) ────────────────────
  // "Debited INR 250.00 from a/c XXXX1234 to VPA swiggy@ybl on 15-01-25"
  {
    name: 'upi_debit_generic',
    regex: /[Dd]ebited\s+(?:INR|Rs\.?)\s*([\d,]+(?:\.\d+)?)\s+from\s+(?:a\/c\s+)?\w*(\d{4})\s+to\s+(?:VPA\s+)?([\w@.]+)\s+on/i,
    extract: m => ({
      type: 'debit',
      amount: parseAmount(m[1]),
      account_masked: m[2],
      merchant: cleanMerchant(m[3]),
      channel: 'UPI',
    })
  },

  // ── Generic UPI credit ────────────────────────────────────────
  // "You have received Rs.500 from 9876543210 via UPI. Ref: 456789012345"
  {
    name: 'upi_credit_generic',
    regex: /(?:received|credited)\s+Rs?\.?\s*([\d,]+(?:\.\d+)?)\s+from\s+([\w\s@\d.]+?)\s+(?:via UPI|through UPI)/i,
    extract: m => ({
      type: 'credit',
      amount: parseAmount(m[1]),
      merchant: cleanMerchant(m[2]),
      channel: 'UPI',
    })
  },

  // ── Salary credit ─────────────────────────────────────────────
  // "Salary of INR 65,000.00 credited to A/C XXXXXX1234 on 01-02-25"
  {
    name: 'salary_credit',
    regex: /[Ss]alary\s+(?:of\s+)?(?:INR|Rs\.?)\s*([\d,]+(?:\.\d+)?)\s+credited/i,
    extract: m => ({
      type: 'credit',
      amount: parseAmount(m[1]),
      merchant: 'Salary',
      channel: 'SALARY',
    })
  },

  // ── ATM withdrawal ────────────────────────────────────────────
  // "Rs.10000 withdrawn from ATM on 15-01-25. Avl Bal:Rs.5234"
  {
    name: 'atm_debit',
    regex: /Rs\.([\d,]+(?:\.\d+)?)\s+withdrawn from ATM\s+on[\s\d\-]+\.\s*Avl Bal[:\s]*Rs\.([\d,]+(?:\.\d+)?)/i,
    extract: m => ({
      type: 'debit',
      amount: parseAmount(m[1]),
      balance_after: parseAmount(m[2]),
      merchant: 'ATM Withdrawal',
      channel: 'ATM',
    })
  },

  // ── Credit card spend ─────────────────────────────────────────
  // "HDFC Credit Card XX1234 used for INR 1,299 at Netflix on 15-01-25"
  {
    name: 'credit_card_spend',
    regex: /Credit Card\s+(?:\w+)?(\d{4})\s+(?:has been )?used\s+for\s+(?:INR|Rs\.?)\s*([\d,]+(?:\.\d+)?)\s+at\s+([\w\s.]+)\s+on/i,
    extract: m => ({
      type: 'debit',
      amount: parseAmount(m[2]),
      account_masked: m[1],
      merchant: cleanMerchant(m[3]),
      channel: 'CARD',
    })
  },

  // ── NACH / SIP auto-debit ─────────────────────────────────────
  // "NACH debit of INR 5,000 done for HDFC Mutual Fund from a/c XX1234 on 10-02-25"
  {
    name: 'nach_debit',
    regex: /NACH\s+debit\s+of\s+(?:INR|Rs\.?)\s*([\d,]+(?:\.\d+)?)\s+(?:done\s+)?for\s+([\w\s]+?)\s+from/i,
    extract: m => ({
      type: 'debit',
      amount: parseAmount(m[1]),
      merchant: cleanMerchant(m[2]),
      channel: 'NACH',
    })
  },

  // ── EMI debit ─────────────────────────────────────────────────
  // "EMI of INR 8,500 for Loan A/C 1234 debited on 05-02-25"
  {
    name: 'emi_debit',
    regex: /EMI\s+of\s+(?:INR|Rs\.?)\s*([\d,]+(?:\.\d+)?)\s+for\s+(?:Loan|Card)\s+(?:A\/C\s+)?\w*(\d{4})/i,
    extract: m => ({
      type: 'debit',
      amount: parseAmount(m[1]),
      account_masked: m[2],
      merchant: 'EMI Payment',
      channel: 'EMI',
    })
  },
]

// ─────────────────────────────────────────────────────────────────
// MAIN PARSE FUNCTION
// ─────────────────────────────────────────────────────────────────

export function parseSMS(sms: RawSMS): ParsedTransaction {
  const body = sms.body.trim()
  const date = new Date(sms.date)

  // Fast reject: OTP
  if (/\b(OTP|One.?Time.?Password|verification code|is your)\b/i.test(body)) {
    return { type: 'otp', currency: 'INR', raw_date: date, raw_sms: body, confidence: 1 }
  }

  // Fast reject: promotional (has promo keywords but no transaction keywords)
  const hasPromoKeywords = /\b(offer|cashback|reward|win|congratulations|upgrade|apply now|loan offer|pre-approved)\b/i.test(body)
  const hasTransactionKeywords = /\b(debited|credited|withdrawn|paid|received|balance)\b/i.test(body)
  if (hasPromoKeywords && !hasTransactionKeywords) {
    return { type: 'promo', currency: 'INR', raw_date: date, raw_sms: body, confidence: 1 }
  }

  // Try each pattern in order
  for (const pattern of PATTERNS) {
    const match = body.match(pattern.regex)
    if (match) {
      const extracted = pattern.extract(match)
      return {
        type: 'unknown',
        currency: 'INR',
        raw_date: date,
        raw_sms: body,
        confidence: 0.95,
        ...extracted,
      }
    }
  }

  // No pattern matched — will be logged
  return {
    type: 'unknown',
    currency: 'INR',
    raw_date: date,
    raw_sms: body,
    confidence: 0,
  }
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

function parseAmount(s: string): number {
  return parseFloat(s.replace(/,/g, ''))
}

function cleanMerchant(raw: string): string {
  return raw
    .replace(/UPI[\/\-]/i, '')
    .replace(/\bVPA\b/i, '')
    .replace(/\b(IMPS|NEFT|RTGS|REF|Ref)\b.*/i, '')
    .replace(/[\/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
}

function detectChannel(info: string): PaymentChannel {
  const s = info.toUpperCase()
  if (s.includes('UPI') || s.includes('@')) return 'UPI'
  if (s.includes('NEFT')) return 'NEFT'
  if (s.includes('IMPS')) return 'IMPS'
  if (s.includes('RTGS')) return 'RTGS'
  if (s.includes('ATM')) return 'ATM'
  if (s.includes('POS')) return 'POS'
  if (s.includes('NACH') || s.includes('ECS')) return 'NACH'
  if (s.includes('EMI')) return 'EMI'
  if (s.includes('SALARY') || s.includes('SAL')) return 'SALARY'
  return 'UPI'
}
```

---

## 5. The 4-Level Categorisation Stack

Categorisation is a label-assignment problem, not a reasoning problem. Using a powerful model like Sonnet or even Haiku for this is massive overkill. The correct approach is a cascade: cheap layers first, AI only for what slips through.

```
Transaction description arrives
         │
         ▼
 Level 0: Keyword dictionary      → ~60% hit rate, ₹0/transaction
         │ (no match)
         ▼
 Level 1: Fuzzy merchant matching → ~20% hit rate, ₹0/transaction
         │ (no match)
         ▼
 Level 2: Gemini Flash batch      → ~18% hit rate, ~₹0.00015/transaction
         │ (model says "unknown")
         ▼
 Level 3: Log to failure table    → ~2% for manual pattern addition
```

Total AI cost at this cascade: a user with 500 transactions on first sync costs approximately **₹0.05 in AI spend**. Not ₹5. Not ₹50. ₹0.05.

---

## 6. Level 0 — Keyword Dictionary

```typescript
// src/lib/categorisation/keyword-dict.ts

export type Category =
  | 'food_dining'
  | 'groceries'
  | 'transport'
  | 'entertainment'
  | 'utilities'
  | 'healthcare'
  | 'shopping'
  | 'education'
  | 'rent_housing'
  | 'emi_loan'
  | 'insurance'
  | 'sip_investment'
  | 'stock_purchase'
  | 'ppf_nps'
  | 'salary'
  | 'freelance_income'
  | 'investment_returns'
  | 'atm_cash'
  | 'transfer'
  | 'other'

// Each entry: [keyword, category, optional: is it an exact match?]
// Keywords are lowercased. Matching is case-insensitive contains.
// Ordered from most specific → least specific within each category.

export const KEYWORD_MAP: Array<[string, Category]> = [
  // ── Investment (check before food — "groww" could be confused) ─
  ['mutual fund', 'sip_investment'],
  ['mf ', 'sip_investment'],
  ['sip', 'sip_investment'],
  ['nach', 'sip_investment'],
  ['elss', 'sip_investment'],
  ['nps', 'ppf_nps'],
  ['ppf', 'ppf_nps'],
  ['sgb', 'sip_investment'],
  ['zerodha', 'stock_purchase'],
  ['groww', 'stock_purchase'],
  ['upstox', 'stock_purchase'],
  ['kuvera', 'sip_investment'],
  ['paytm money', 'sip_investment'],
  ['coin by zerodha', 'sip_investment'],

  // ── Salary / income ───────────────────────────────────────────
  ['salary', 'salary'],
  ['payroll', 'salary'],
  ['sal credit', 'salary'],
  ['dividend', 'investment_returns'],
  ['interest credit', 'investment_returns'],
  ['fd maturity', 'investment_returns'],
  ['rd maturity', 'investment_returns'],

  // ── Food & Dining ─────────────────────────────────────────────
  ['swiggy', 'food_dining'],
  ['zomato', 'food_dining'],
  ['zomato pro', 'food_dining'],
  ['dunzo', 'food_dining'],
  ['eatsure', 'food_dining'],
  ['mcdonalds', 'food_dining'],
  ['dominos', 'food_dining'],
  ['pizza hut', 'food_dining'],
  ['kfc', 'food_dining'],
  ['subway', 'food_dining'],
  ['starbucks', 'food_dining'],
  ['cafe coffee day', 'food_dining'],
  ['ccd', 'food_dining'],
  ['restaurant', 'food_dining'],
  ['dhaba', 'food_dining'],

  // ── Groceries ─────────────────────────────────────────────────
  ['bigbasket', 'groceries'],
  ['big basket', 'groceries'],
  ['blinkit', 'groceries'],
  ['zepto', 'groceries'],
  ['instamart', 'groceries'],
  ['jiomart', 'groceries'],
  ['dmart', 'groceries'],
  ['reliance fresh', 'groceries'],
  ['nature basket', 'groceries'],
  ['supermarket', 'groceries'],
  ['grofers', 'groceries'],

  // ── Transport ─────────────────────────────────────────────────
  ['ola', 'transport'],
  ['uber', 'transport'],
  ['rapido', 'transport'],
  ['namma yatri', 'transport'],
  ['auto', 'transport'],
  ['metro', 'transport'],
  ['irctc', 'transport'],
  ['indigo', 'transport'],
  ['air india', 'transport'],
  ['spicejet', 'transport'],
  ['vistara', 'transport'],
  ['redbus', 'transport'],
  ['abhibus', 'transport'],
  ['petrol', 'transport'],
  ['fuel', 'transport'],
  ['hp petrol', 'transport'],
  ['bpcl', 'transport'],
  ['iocl', 'transport'],
  ['fastag', 'transport'],

  // ── Entertainment ─────────────────────────────────────────────
  ['netflix', 'entertainment'],
  ['amazon prime', 'entertainment'],
  ['prime video', 'entertainment'],
  ['hotstar', 'entertainment'],
  ['disney', 'entertainment'],
  ['spotify', 'entertainment'],
  ['gaana', 'entertainment'],
  ['jiosaavn', 'entertainment'],
  ['wynk', 'entertainment'],
  ['youtube premium', 'entertainment'],
  ['bookmyshow', 'entertainment'],
  ['pvr', 'entertainment'],
  ['inox', 'entertainment'],
  ['cinepolis', 'entertainment'],

  // ── Utilities ─────────────────────────────────────────────────
  ['airtel', 'utilities'],
  ['jio', 'utilities'],
  ['vi ', 'utilities'],
  ['vodafone', 'utilities'],
  ['bsnl', 'utilities'],
  ['act fibernet', 'utilities'],
  ['hathway', 'utilities'],
  ['tata sky', 'utilities'],
  ['dish tv', 'utilities'],
  ['sun direct', 'utilities'],
  ['electricity', 'utilities'],
  ['bescom', 'utilities'],
  ['msedcl', 'utilities'],
  ['bses', 'utilities'],
  ['tneb', 'utilities'],
  ['water bill', 'utilities'],
  ['gas bill', 'utilities'],
  ['piped gas', 'utilities'],
  ['mahanagar gas', 'utilities'],
  ['indraprastha gas', 'utilities'],
  ['broadband', 'utilities'],

  // ── Healthcare ────────────────────────────────────────────────
  ['apollo', 'healthcare'],
  ['fortis', 'healthcare'],
  ['max hospital', 'healthcare'],
  ['practo', 'healthcare'],
  ['netmeds', 'healthcare'],
  ['pharmeasy', 'healthcare'],
  ['1mg', 'healthcare'],
  ['medplus', 'healthcare'],
  ['pharmacy', 'healthcare'],
  ['medical', 'healthcare'],
  ['hospital', 'healthcare'],
  ['clinic', 'healthcare'],
  ['diagnostic', 'healthcare'],
  ['thyrocare', 'healthcare'],

  // ── Shopping ──────────────────────────────────────────────────
  ['amazon', 'shopping'],
  ['flipkart', 'shopping'],
  ['myntra', 'shopping'],
  ['ajio', 'shopping'],
  ['nykaa', 'shopping'],
  ['meesho', 'shopping'],
  ['snapdeal', 'shopping'],
  ['tata cliq', 'shopping'],
  ['reliance digital', 'shopping'],
  ['croma', 'shopping'],
  ['vijay sales', 'shopping'],

  // ── Education ─────────────────────────────────────────────────
  ['unacademy', 'education'],
  ['byju', 'education'],
  ['vedantu', 'education'],
  ['coursera', 'education'],
  ['udemy', 'education'],
  ['tuition', 'education'],
  ['school fee', 'education'],
  ['college fee', 'education'],

  // ── Rent / Housing ────────────────────────────────────────────
  ['rent', 'rent_housing'],
  ['society maintenance', 'rent_housing'],
  ['housing society', 'rent_housing'],
  ['maintenance charge', 'rent_housing'],

  // ── EMI / Loans ───────────────────────────────────────────────
  ['emi', 'emi_loan'],
  ['home loan', 'emi_loan'],
  ['car loan', 'emi_loan'],
  ['personal loan', 'emi_loan'],
  ['loan repay', 'emi_loan'],

  // ── Insurance ─────────────────────────────────────────────────
  ['lic', 'insurance'],
  ['insurance premium', 'insurance'],
  ['life insurance', 'insurance'],
  ['health insurance', 'insurance'],
  ['star health', 'insurance'],
  ['hdfc ergo', 'insurance'],
  ['icici lombard', 'insurance'],
  ['tata aig', 'insurance'],

  // ── ATM ───────────────────────────────────────────────────────
  ['atm withdrawal', 'atm_cash'],
  ['atm cash', 'atm_cash'],
  ['cash withdrawal', 'atm_cash'],
]

export function applyKeywordCategory(description: string): Category | null {
  const lower = description.toLowerCase()
  for (const [keyword, category] of KEYWORD_MAP) {
    if (lower.includes(keyword)) return category
  }
  return null
}
```

---

## 7. Level 1 — Fuzzy Merchant Matching

Keyword matching misses misspellings and truncated merchant names from UPI VPAs like `SWGY*UPI*34521` or `MCDonald934@okicici`. Fuzzy matching catches these.

```bash
npm install fuse.js
```

```typescript
// src/lib/categorisation/fuzzy-matcher.ts

import Fuse from 'fuse.js'
import type { Category } from './keyword-dict'

// Known merchant → category mapping
// Keys are canonical merchant names (clean, lowercase)
const MERCHANT_CATEGORY_MAP: Record<string, Category> = {
  'swiggy': 'food_dining',
  'zomato': 'food_dining',
  'blinkit': 'groceries',
  'bigbasket': 'groceries',
  'zepto': 'groceries',
  'ola cabs': 'transport',
  'uber india': 'transport',
  'rapido': 'transport',
  'irctc': 'transport',
  'netflix': 'entertainment',
  'amazon prime': 'entertainment',
  'hotstar': 'entertainment',
  'spotify': 'entertainment',
  'airtel': 'utilities',
  'jio recharge': 'utilities',
  'vodafone idea': 'utilities',
  'amazon': 'shopping',
  'flipkart': 'shopping',
  'myntra': 'shopping',
  'zerodha': 'stock_purchase',
  'groww': 'stock_purchase',
  'hdfc mutual fund': 'sip_investment',
  'icici pru mf': 'sip_investment',
  'sbi mutual fund': 'sip_investment',
  'axis mutual fund': 'sip_investment',
  'mirae asset': 'sip_investment',
  'parag parikh': 'sip_investment',
}

const merchantNames = Object.keys(MERCHANT_CATEGORY_MAP)

const fuse = new Fuse(merchantNames, {
  includeScore: true,
  threshold: 0.35,    // 0 = exact, 1 = match anything. 0.35 is a good balance.
  minMatchCharLength: 4,
})

export function fuzzyMatchMerchant(description: string): {
  category: Category | null
  matched_merchant: string | null
  score: number
} {
  const cleaned = description
    .toLowerCase()
    .replace(/[*@\/\\]/g, ' ')
    .replace(/\b(upi|ref|txn|id|pay|payment|india)\b/gi, '')
    .replace(/\d{6,}/g, '')     // remove reference numbers
    .replace(/\s+/g, ' ')
    .trim()

  if (cleaned.length < 3) return { category: null, matched_merchant: null, score: 0 }

  const results = fuse.search(cleaned)

  if (results.length === 0) return { category: null, matched_merchant: null, score: 0 }

  const best = results[0]
  const score = 1 - (best.score ?? 1) // convert fuse score to confidence (higher = better)

  if (score < 0.65) return { category: null, matched_merchant: null, score }

  const merchant = best.item
  return {
    category: MERCHANT_CATEGORY_MAP[merchant] ?? null,
    matched_merchant: merchant,
    score,
  }
}
```

---

## 8. Level 2 — Gemini Flash

Gemini Flash 2.0 is Google's smallest and cheapest model. At $0.075 per million input tokens, it costs **13× less than Claude Haiku** for a task this simple. Categorisation needs no reasoning — just pattern recognition from a label list. Flash is perfect.

```bash
npm install @google/generative-ai
```

```typescript
// src/lib/categorisation/gemini-categoriser.ts

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Category } from './keyword-dict'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Use gemini-2.0-flash — cheapest, still accurate for classification
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

// The category list sent in every prompt — small, cached by Gemini automatically
const CATEGORY_LIST = [
  'food_dining', 'groceries', 'transport', 'entertainment',
  'utilities', 'healthcare', 'shopping', 'education',
  'rent_housing', 'emi_loan', 'insurance', 'sip_investment',
  'stock_purchase', 'ppf_nps', 'salary', 'freelance_income',
  'investment_returns', 'atm_cash', 'transfer', 'other',
].join('/')

interface BatchInput {
  index: number
  description: string
  type: 'debit' | 'credit'
  amount: number
}

interface BatchResult {
  index: number
  category: Category
  merchant_clean: string
}

export async function categoriseBatchWithGemini(
  transactions: BatchInput[]
): Promise<BatchResult[]> {
  if (transactions.length === 0) return []

  // Build a compact prompt — minimal tokens
  const lines = transactions
    .map(t => `${t.index}|${t.type.toUpperCase()}|${t.amount}|${t.description}`)
    .join('\n')

  const prompt = `You are categorising Indian bank transactions. 
For each line (format: index|type|amount|description), output ONLY a JSON array.
Each object: {"i": index, "c": category, "m": clean merchant name (max 25 chars)}

Valid categories: ${CATEGORY_LIST}

Rules:
- NACH/SIP/mutual fund → sip_investment  
- Salary → salary
- ATM → atm_cash  
- If debit and category unclear → other
- If credit and category unclear → transfer
- merchant name: extract the actual business name, remove UPI/ref/numbers

Transactions:
${lines}

Respond with ONLY the JSON array, no explanation.`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json|```/g, '').trim()
    const parsed: Array<{ i: number; c: string; m: string }> = JSON.parse(text)

    return parsed.map(item => ({
      index: item.i,
      category: (item.c as Category) ?? 'other',
      merchant_clean: item.m ?? '',
    }))
  } catch (err) {
    console.error('[GEMINI_CATEGORISER] Parse error:', err)
    // Return 'other' for all on failure — never block ingestion
    return transactions.map(t => ({
      index: t.index,
      category: 'other' as Category,
      merchant_clean: t.description.slice(0, 25),
    }))
  }
}

// Process in batches of 50 to stay well within token limits
export async function categoriseAllWithGemini(
  transactions: BatchInput[]
): Promise<Map<number, BatchResult>> {
  const results = new Map<number, BatchResult>()
  const BATCH_SIZE = 50

  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE)
    const batchResults = await categoriseBatchWithGemini(batch)
    for (const r of batchResults) {
      results.set(r.index, r)
    }

    // Small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < transactions.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  return results
}
```

---

## 9. Level 3 — Failure Logging

Transactions that reach Level 3 — where even Gemini says "other" and the parse confidence was 0 — are logged for manual review. Every week, scan this table and add new regex patterns or keyword entries. This is your continuous improvement loop.

```typescript
// src/lib/categorisation/failure-logger.ts

import { createClient } from '@/lib/supabase/server'

export async function logParseFailure(params: {
  user_id: string
  raw_sms: string
  sender: string
  reason: 'no_pattern_match' | 'no_amount' | 'gemini_unknown'
}) {
  const supabase = createClient()

  // Anonymise before storing — never store the full SMS
  // Only store enough to identify the pattern
  const anonymised = params.raw_sms
    .replace(/\d{10,}/g, 'XXXXXXXXXX')    // remove phone numbers
    .replace(/\d{4,}/g, 'XXXX')           // remove account numbers, amounts
    .slice(0, 200)

  await supabase.from('sms_parse_failures').insert({
    sender: params.sender,
    anonymised_sms: anonymised,
    reason: params.reason,
    created_at: new Date().toISOString(),
  })
  // Note: user_id intentionally NOT stored — privacy
}
```

---

## 10. SMS Sync Service — Full Orchestrator

This is the file that ties everything together. Called on app open (incremental) and on first install (full 90-day sync).

```typescript
// src/lib/sms/sms-sync-service.ts

import { readBankSMSMessages, readNewSMSMessagesSince, isNativeSMSAvailable } from './sms-reader'
import { parseSMS } from './sms-parser'
import { applyKeywordCategory } from '../categorisation/keyword-dict'
import { fuzzyMatchMerchant } from '../categorisation/fuzzy-matcher'
import { categoriseAllWithGemini } from '../categorisation/gemini-categoriser'
import { logParseFailure } from '../categorisation/failure-logger'
import { normaliseTransaction } from './normaliser'
import { deduplicateTransactions } from './deduplicator'
import { createClient } from '@/lib/supabase/server'

export interface SyncResult {
  sms_read: number
  skipped_otp: number
  skipped_promo: number
  parse_failures: number
  transactions_new: number
  duplicates_skipped: number
  categorised_by_keyword: number
  categorised_by_fuzzy: number
  categorised_by_gemini: number
  logged_as_unknown: number
}

export async function runFullSync(userId: string): Promise<SyncResult> {
  return _runSync(userId, 90)
}

export async function runIncrementalSync(userId: string): Promise<SyncResult> {
  const supabase = createClient()
  const { data: user } = await supabase
    .from('users')
    .select('sms_last_synced_at')
    .eq('id', userId)
    .single()

  const lastSync = user?.sms_last_synced_at
    ? new Date(user.sms_last_synced_at).getTime()
    : Date.now() - 90 * 24 * 60 * 60 * 1000

  return _runSync(userId, 0, lastSync)
}

async function _runSync(
  userId: string,
  daysBack: number,
  sinceTimestamp?: number
): Promise<SyncResult> {
  const result: SyncResult = {
    sms_read: 0, skipped_otp: 0, skipped_promo: 0, parse_failures: 0,
    transactions_new: 0, duplicates_skipped: 0,
    categorised_by_keyword: 0, categorised_by_fuzzy: 0,
    categorised_by_gemini: 0, logged_as_unknown: 0,
  }

  if (!(await isNativeSMSAvailable())) {
    console.warn('[SMS_SYNC] Not on Android — skipping SMS sync')
    return result
  }

  // Read SMS messages
  const rawMessages = sinceTimestamp
    ? await readNewSMSMessagesSince(sinceTimestamp)
    : await readBankSMSMessages(daysBack)

  result.sms_read = rawMessages.length
  if (rawMessages.length === 0) return result

  // ── Phase 1: Parse all SMS messages ──────────────────────────
  const parsed = []
  for (const sms of rawMessages) {
    const p = parseSMS(sms)

    if (p.type === 'otp') { result.skipped_otp++; continue }
    if (p.type === 'promo') { result.skipped_promo++; continue }

    if (!p.amount || p.amount <= 0) {
      await logParseFailure({
        user_id: userId,
        raw_sms: sms.body,
        sender: sms.address,
        reason: p.confidence === 0 ? 'no_pattern_match' : 'no_amount',
      })
      result.parse_failures++
      continue
    }

    parsed.push({ sms, parsed: p })
  }

  if (parsed.length === 0) return result

  // ── Phase 2: Normalise ────────────────────────────────────────
  const normalised = parsed.map(({ sms, parsed: p }) =>
    normaliseTransaction(p, userId, sms.address)
  )

  // ── Phase 3: Deduplicate ──────────────────────────────────────
  const supabase = createClient()
  const unique = await deduplicateTransactions(normalised, userId, supabase)
  result.duplicates_skipped = normalised.length - unique.length

  if (unique.length === 0) return result

  // ── Phase 4: Categorise — 4-level cascade ────────────────────
  const needsGemini: Array<{ idx: number; desc: string; type: 'debit' | 'credit'; amount: number }> = []

  for (let i = 0; i < unique.length; i++) {
    const tx = unique[i]
    const desc = tx.merchant_raw || tx.description || ''

    // Level 0: Special flags first (salary, SIP — high confidence)
    if (tx.is_salary) {
      tx.category = 'salary'
      result.categorised_by_keyword++
      continue
    }
    if (tx.is_investment) {
      tx.category = 'sip_investment'
      result.categorised_by_keyword++
      continue
    }
    if (tx.channel === 'ATM') {
      tx.category = 'atm_cash'
      result.categorised_by_keyword++
      continue
    }

    // Level 0: Keyword dictionary
    const kwCategory = applyKeywordCategory(desc)
    if (kwCategory) {
      tx.category = kwCategory
      result.categorised_by_keyword++
      continue
    }

    // Level 1: Fuzzy matching
    const fuzzyResult = fuzzyMatchMerchant(desc)
    if (fuzzyResult.category) {
      tx.category = fuzzyResult.category
      tx.merchant_normalised = fuzzyResult.matched_merchant ?? undefined
      result.categorised_by_fuzzy++
      continue
    }

    // Level 2: Queue for Gemini
    needsGemini.push({
      idx: i,
      desc,
      type: tx.type as 'debit' | 'credit',
      amount: tx.amount,
    })
  }

  // Level 2: Batch call to Gemini Flash for remaining transactions
  if (needsGemini.length > 0) {
    const geminiResults = await categoriseAllWithGemini(
      needsGemini.map((t, i) => ({ index: i, description: t.desc, type: t.type, amount: t.amount }))
    )

    for (let i = 0; i < needsGemini.length; i++) {
      const { idx } = needsGemini[i]
      const geminiResult = geminiResults.get(i)

      if (geminiResult && geminiResult.category !== 'other') {
        unique[idx].category = geminiResult.category
        unique[idx].merchant_normalised = geminiResult.merchant_clean || undefined
        result.categorised_by_gemini++
      } else {
        // Level 3: Log failure
        await logParseFailure({
          user_id: userId,
          raw_sms: unique[idx].raw_sms ?? '',
          sender: '',
          reason: 'gemini_unknown',
        })
        unique[idx].category = unique[idx].type === 'credit' ? 'transfer' : 'other'
        result.logged_as_unknown++
      }
    }
  }

  // ── Phase 5: Insert to DB ─────────────────────────────────────
  const toInsert = unique.map(tx => ({
    user_id: tx.user_id,
    source: tx.source,
    transaction_date: tx.transaction_date,
    amount: tx.amount,
    type: tx.type,
    description: tx.description,
    merchant_raw: tx.merchant_raw,
    merchant_normalised: tx.merchant_normalised,
    category: tx.category,
    channel: tx.channel,
    account_masked: tx.account_masked,
    reference: tx.reference,
    balance_after: tx.balance_after,
    is_investment: tx.is_investment,
    is_salary: tx.is_salary,
    deduplication_hash: tx.deduplication_hash,
  }))

  const { error } = await supabase.from('transactions').insert(toInsert)
  if (error) {
    console.error('[SMS_SYNC] Insert error:', error)
  } else {
    result.transactions_new = toInsert.length

    // Update last sync timestamp
    await supabase
      .from('users')
      .update({ sms_last_synced_at: new Date().toISOString() })
      .eq('id', userId)
  }

  return result
}
```

---

## 11. Unified Transaction Normaliser

```typescript
// src/lib/sms/normaliser.ts

import type { ParsedTransaction, PaymentChannel } from './sms-parser'
import { createHash } from 'crypto'

export type IngestionSource = 'sms' | 'manual'

export interface NormalisedTransaction {
  user_id: string
  source: IngestionSource
  transaction_date: string
  amount: number
  type: 'debit' | 'credit'
  description: string
  merchant_raw: string
  merchant_normalised?: string
  category?: string
  channel?: PaymentChannel
  account_masked?: string
  reference?: string
  balance_after?: number
  is_investment: boolean
  is_salary: boolean
  deduplication_hash: string
  raw_sms?: string
}

export function normaliseTransaction(
  parsed: ParsedTransaction,
  userId: string,
  sender: string
): NormalisedTransaction {
  const merchant = parsed.merchant || ''
  const type = parsed.type === 'debit' ? 'debit' : 'credit'

  return {
    user_id: userId,
    source: 'sms',
    transaction_date: parsed.raw_date.toISOString(),
    amount: parsed.amount ?? 0,
    type,
    description: merchant || sender,
    merchant_raw: merchant,
    channel: parsed.channel,
    account_masked: parsed.account_masked,
    reference: parsed.reference,
    balance_after: parsed.balance_after,
    is_investment: isInvestmentTransaction(merchant, parsed.channel),
    is_salary: isSalaryCredit(merchant, type),
    deduplication_hash: generateHash({
      date: parsed.raw_date.toISOString().split('T')[0],
      amount: parsed.amount ?? 0,
      type,
      account: parsed.account_masked ?? '',
      reference: parsed.reference ?? '',
    }),
    raw_sms: parsed.raw_sms,
  }
}

function isInvestmentTransaction(merchant: string, channel?: PaymentChannel): boolean {
  const m = merchant.toLowerCase()
  return (
    channel === 'NACH' ||
    m.includes('mutual fund') || m.includes('mf ') ||
    m.includes('sip') || m.includes('elss') ||
    m.includes('nps') || m.includes('ppf') ||
    m.includes('sgb') || m.includes('zerodha') ||
    m.includes('groww') || m.includes('kuvera')
  )
}

function isSalaryCredit(merchant: string, type: string): boolean {
  if (type !== 'credit') return false
  const m = merchant.toLowerCase()
  return m.includes('salary') || m.includes('payroll') || m.includes('sal credit')
}

function generateHash(params: Record<string, string | number>): string {
  const str = Object.values(params).join('|')
  return createHash('sha256').update(str).digest('hex').slice(0, 16)
}
```

---

## 12. Deduplication Logic

```typescript
// src/lib/sms/deduplicator.ts

import type { SupabaseClient } from '@supabase/supabase-js'
import type { NormalisedTransaction } from './normaliser'

export async function deduplicateTransactions(
  incoming: NormalisedTransaction[],
  userId: string,
  supabase: SupabaseClient
): Promise<NormalisedTransaction[]> {
  if (incoming.length === 0) return []

  // Fetch existing hashes from last 90 days
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const { data: existing } = await supabase
    .from('transactions')
    .select('deduplication_hash, transaction_date, amount, type')
    .eq('user_id', userId)
    .gte('transaction_date', since)

  // Two sets for two strategies
  const existingHashes = new Set((existing ?? []).map(t => t.deduplication_hash))

  // Signature: date + amount + type (catches cross-source duplicates)
  const existingSignatures = new Set(
    (existing ?? []).map(t =>
      `${t.transaction_date.split('T')[0]}|${t.amount}|${t.type}`
    )
  )

  const unique: NormalisedTransaction[] = []
  const batchHashes = new Set<string>()
  const batchSigs = new Set<string>()

  for (const tx of incoming) {
    if (existingHashes.has(tx.deduplication_hash)) continue
    if (batchHashes.has(tx.deduplication_hash)) continue

    const sig = `${tx.transaction_date.split('T')[0]}|${tx.amount}|${tx.type}`
    if (existingSignatures.has(sig)) continue
    if (batchSigs.has(sig)) continue

    batchHashes.add(tx.deduplication_hash)
    batchSigs.add(sig)
    unique.push(tx)
  }

  return unique
}
```

---

## 13. Onboarding Permission Flow

The permission ask is the highest-leverage UX moment in the app. Design it to communicate value first, ask second.

```typescript
// src/app/(auth)/onboarding/step-2/page.tsx
// Runs after income/expense collection (Step 1)

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { isNativeSMSAvailable } from '@/lib/sms/sms-reader'
import { runFullSync } from '@/lib/sms/sms-sync-service'

export default function SMSPermissionStep() {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'syncing' | 'done' | 'skipped'>('idle')
  const [syncResult, setSyncResult] = useState<{ count: number } | null>(null)

  async function handleGrant() {
    setState('syncing')

    try {
      // This triggers Android's SMS permission dialog
      const available = await isNativeSMSAvailable()

      if (!available) {
        // User is on web — skip gracefully
        setState('skipped')
        return
      }

      const result = await runFullSync('current-user-id') // replace with actual userId from session
      setSyncResult({ count: result.transactions_new })
      setState('done')

      // Small delay so user sees success state
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err) {
      console.error('SMS sync failed:', err)
      setState('skipped')
    }
  }

  if (state === 'syncing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Importing your transactions...</p>
        <p className="text-xs text-muted-foreground mt-1">This takes about 10–15 seconds</p>
      </div>
    )
  }

  if (state === 'done' && syncResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <span style={{ fontSize: 24 }}>✓</span>
        </div>
        <h2 className="text-xl font-medium mb-2">
          {syncResult.count} transactions imported
        </h2>
        <p className="text-sm text-muted-foreground">
          Monetra will automatically stay updated. Taking you to your dashboard...
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col px-6 py-8 max-w-sm mx-auto">
      <h2 className="text-xl font-medium mb-2">
        See your complete financial picture
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Monetra reads your bank SMS messages to automatically track every
        transaction — no manual entry, ever.
      </p>

      {/* Concrete preview — show value before asking */}
      <div className="bg-muted rounded-xl p-4 mb-6 space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Auto-imported for you:</p>
        {[
          ['UPI payments (Swiggy, Zomato, Amazon...)', true],
          ['Salary credits', true],
          ['SIP and mutual fund debits', true],
          ['ATM withdrawals and card spends', true],
          ['OTPs and promotional messages', false],
        ].map(([label, included]) => (
          <div key={String(label)} className="flex justify-between text-sm">
            <span>{String(label)}</span>
            <span className={included ? 'text-green-600' : 'text-muted-foreground'}>
              {included ? '✓' : 'Ignored'}
            </span>
          </div>
        ))}
      </div>

      {/* Privacy statement */}
      <p className="text-xs text-muted-foreground mb-6">
        Only transaction amounts, dates, and merchant names are stored.
        Full SMS text is never saved. You can revoke this permission
        anytime in Settings → Data & Privacy.
      </p>

      <button
        onClick={handleGrant}
        className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-medium mb-3"
      >
        Allow SMS access — import 90 days
      </button>

      <button
        onClick={() => { setState('skipped'); router.push('/dashboard') }}
        className="text-sm text-muted-foreground text-center"
      >
        Skip — I'll enter transactions manually
      </button>
    </div>
  )
}
```

### Trigger incremental sync on app open

```typescript
// src/app/(dashboard)/layout.tsx
// Every time the dashboard loads, check for new SMS silently

'use client'

import { useEffect } from 'react'
import { runIncrementalSync } from '@/lib/sms/sms-sync-service'
import { useSupabaseUser } from '@/lib/supabase/client'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useSupabaseUser()

  useEffect(() => {
    if (!user?.id) return

    // Run in background — do not await, do not block render
    runIncrementalSync(user.id).catch(err => {
      // Silent fail — never break the UI for a background sync
      console.warn('[INCREMENTAL_SYNC] Failed silently:', err)
    })
  }, [user?.id])

  return <>{children}</>
}
```

---

## 14. Supabase Schema

```sql
-- Add ingestion columns to transactions table
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'
    CHECK (source IN ('sms', 'manual')),
  ADD COLUMN IF NOT EXISTS merchant_raw TEXT,
  ADD COLUMN IF NOT EXISTS merchant_normalised TEXT,
  ADD COLUMN IF NOT EXISTS is_investment BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_salary BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deduplication_hash TEXT,
  ADD COLUMN IF NOT EXISTS raw_sms TEXT;   -- temp, can be cleared after 30 days

-- Unique dedup constraint
CREATE UNIQUE INDEX IF NOT EXISTS transactions_dedup_idx
  ON transactions (user_id, deduplication_hash)
  WHERE deduplication_hash IS NOT NULL;

-- Fast index for rule engine's daily date-range queries
CREATE INDEX IF NOT EXISTS transactions_user_date_idx
  ON transactions (user_id, transaction_date DESC);

-- Fast index for category aggregation (spending dashboard)
CREATE INDEX IF NOT EXISTS transactions_user_category_idx
  ON transactions (user_id, category, transaction_date DESC);

-- Add SMS sync tracking to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS sms_permission_granted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sms_last_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS data_completeness_score INT DEFAULT 0;

-- SMS parse failure log — for improving patterns
-- Intentionally does NOT store user_id (privacy)
CREATE TABLE IF NOT EXISTS sms_parse_failures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender TEXT NOT NULL,          -- bank short code only, no user identifier
  anonymised_sms TEXT NOT NULL,  -- amounts/numbers replaced with XXXX
  reason TEXT NOT NULL
    CHECK (reason IN ('no_pattern_match', 'no_amount', 'gemini_unknown')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS on sms_parse_failures — intentionally no user_id stored
-- Admin-only table for pattern improvement

-- Ingestion audit log (per user)
CREATE TABLE IF NOT EXISTS ingestion_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  sms_read INT DEFAULT 0,
  transactions_new INT DEFAULT 0,
  duplicates_skipped INT DEFAULT 0,
  parse_failures INT DEFAULT 0,
  categorised_by_keyword INT DEFAULT 0,
  categorised_by_fuzzy INT DEFAULT 0,
  categorised_by_gemini INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ingestion_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON ingestion_events
  FOR ALL USING (auth.uid() = user_id);
```

### Environment variables to add

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
# Get from: https://aistudio.google.com/app/apikey — free tier is generous
```

---

## 15. Cost Reality

At the 4-level cascade, here is the actual AI cost per user for their entire monthly transaction volume:

| Scenario | Transactions | L0+L1 hit | Gemini calls | Gemini cost |
|---|---|---|---|---|
| Light user | 80 tx/month | ~66 (82%) | ~14 | ₹0.009 |
| Average user | 200 tx/month | ~165 (82%) | ~35 | ₹0.022 |
| Heavy user | 500 tx/month | ~415 (83%) | ~85 | ₹0.054 |
| First sync (90 days backfill) | 1,500 tx | ~1,250 (83%) | ~250 | ₹0.16 |

Gemini Flash at $0.075/M input tokens, ~150 tokens per transaction description.

**The total AI categorisation cost for your entire user base at 1,000 paying users is under ₹100/month.** This is not a line item that needs optimising. It is negligible.

---

## 16. Future Pillars (Not Built Yet)

These are intentionally out of scope for the current build. Described here so the architecture team knows what's coming and can design schemas accordingly.

**Pillar 2 — Bank Statement PDF Upload**  
Users upload their bank statement PDF. A `pdfplumber` Python subprocess extracts the transaction table. Falls back to Claude Vision for scanned/image PDFs. Flows into the same normalise → dedup → categorise pipeline. Primarily useful for: iOS users (no SMS), historical backfill beyond 90 days, and users who want to add fixed deposit or recurring deposit history. Estimated build time: 1 week.

**Pillar 3 — Account Aggregator (RBI Open Banking)**  
India's AA framework allows users to share bank data directly via their bank's app — no scraping, fully RBI-regulated. Covers all 50+ AA-enabled banks with up to 2 years of history. Requires registering Monetra as an FIU (Financial Information User) via Setu or Finvu and obtaining a production AA license (4–8 week process via Sahamati). This is the gold standard for data completeness. Build after reaching 500 paying users.

**Pillar 4 — Portfolio Auto-Sync (Zerodha / Groww / CAMS)**  
Zerodha Kite API and Groww API for equity portfolio sync. CAMS/KFintech gateway or CAS PDF upload for mutual fund portfolio. This closes the loop between transaction data (what you spent) and portfolio data (what you invested). Build alongside or after Account Aggregator.

---

## 17. Build Order

**Week 1 — Foundation**
- [ ] Install Capacitor + `@capacitor/android` + `capacitor-sms-inbox`
- [ ] Configure `next.config.js` for static export
- [ ] Add `build:android` script to package.json
- [ ] Implement `sms-reader.ts` with `KNOWN_BANK_SENDER_IDS`
- [ ] Implement `sms-parser.ts` with all 13 regex patterns
- [ ] Test parser against at least 50 real SMS samples from beta users

**Week 2 — Categorisation + Pipeline**
- [ ] Install `fuse.js`
- [ ] Implement `keyword-dict.ts` with full merchant list
- [ ] Implement `fuzzy-matcher.ts`
- [ ] Add `GEMINI_API_KEY` to environment, implement `gemini-categoriser.ts`
- [ ] Implement `normaliser.ts` and `deduplicator.ts`
- [ ] Implement `sms-sync-service.ts` (full orchestrator)
- [ ] Run Supabase migrations
- [ ] Wire incremental sync into dashboard layout

**Week 3 — UX + Polish**
- [ ] Build onboarding SMS permission screen
- [ ] Add background incremental sync on app open
- [ ] Build data completeness score + progress indicator
- [ ] Add `sms_parse_failures` viewer in admin panel (Supabase Table Editor is fine for now)
- [ ] Collect first 100 parse failures from beta users → add new patterns

**Ongoing**
- [ ] Weekly: review `sms_parse_failures` → add new regex patterns to `sms-parser.ts`
- [ ] Weekly: expand `KEYWORD_MAP` with new merchants from uncategorised transactions
- [ ] Monthly: retrain fuzzy matcher with newly confirmed merchant-category pairs

---

*— End of Document —*  
*Monetra Data Ingestion Pipeline v2.0 | Internal Engineering Specification*
