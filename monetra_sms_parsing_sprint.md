# Monetra — SMS Parsing & Data Ingestion Sprint

> **Sprint type:** Feature Build  
> **Prerequisite:** Capacitor mobile shell working, onboarding complete  
> **Estimated effort:** 3–5 days  
> **Status:** Planned — not started

---

## 1. Objective

Automatically parse Indian banking SMS messages to extract transaction data (debits, credits, UPI payments, EMI, SIP deductions) and ingest them into the Monetra spending tracker. This replaces manual expense entry for 80%+ of transactions.

---

## 2. Indian SMS Format Reference

Indian banks follow semi-standardised SMS patterns:

```
HDFC: "Rs.2,450.00 debited from a/c **1234 on 15-03-25. UPI Ref 507845123456. Avl Bal Rs.45,231.80"
SBI:  "Your a/c X1234 debited by Rs.1,200.00 on 15Mar25 by UPI/JOHN DOE/ref:123456789. Avl Bal: Rs.23,456.78"
ICICI: "ICICI Bank Acct XX234 debited for Rs 3,500.00 on 15-Mar-25; UPI:johndoe@upi Avl Bal Rs 67,890.12"
Kotak: "INR 850.00 debited from Kotak Bank AC 1234 on 15-03-2025. Info: SWIGGY. Avl bal: INR 12,345.67"
Axis:  "Rs.4,200 has been debited from your Axis Bank A/c no. XX2345 towards UPI-AMAZON. Avl Bal: Rs.56,789.00"
```

**Key patterns to extract:**
- Amount (₹/Rs/INR followed by number with commas)
- Direction (debited/credited/received)
- Merchant/payee (after UPI:, Info:, towards, to, from)
- Date
- Account number (last 4 digits)
- Available balance
- Reference number (UPI Ref, ref:)

---

## 3. Required Capacitor Plugin

```bash
# Option A: Community plugin (most popular)
npm install @nicoara/capacitor-sms-inbox
npx cap sync

# Option B: Custom plugin (more control)
# Build a Capacitor plugin that reads SMS via Android ContentResolver
# android.provider.Telephony.Sms.Inbox
```

**Android permissions required:**
```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.RECEIVE_SMS" />
```

> ⚠️ **Play Store Warning:** Google restricts SMS permissions heavily. Finance apps CAN request READ_SMS but must:
> 1. Declare it in the Data Safety form
> 2. Explain the specific use case in the Permissions Declaration Form
> 3. Not store raw SMS content — only extracted transaction data
> 4. Submit a video demo of the SMS reading feature during review

---

## 4. Architecture

```
┌─────────────────────────────┐
│  SMS Inbox (Android)        │
│  ContentResolver query      │
│  Filter: sender ∈ bankList  │
└──────────┬──────────────────┘
           │ Raw SMS text[]
           ▼
┌─────────────────────────────┐
│  SMS Parser Engine          │
│  (src/lib/sms/parser.ts)    │
│                             │
│  1. Detect bank from sender │
│  2. Extract amount          │
│  3. Detect debit/credit     │
│  4. Extract merchant/payee  │
│  5. Parse date              │
│  6. Categorize (AI or rule) │
└──────────┬──────────────────┘
           │ ParsedTransaction[]
           ▼
┌─────────────────────────────┐
│  Deduplication              │
│  (check against DB by       │
│   amount + date + ref)      │
└──────────┬──────────────────┘
           │ NewTransaction[]
           ▼
┌─────────────────────────────┐
│  Supabase Insert            │
│  expenses table             │
│  source: 'sms_auto'         │
└─────────────────────────────┘
```

---

## 5. Implementation Files

### 5.1 Bank Sender ID Registry
```typescript
// src/lib/sms/bank-senders.ts

export const BANK_SENDERS: Record<string, string> = {
  // Transactional sender IDs used by Indian banks
  'HDFCBK': 'HDFC Bank',
  'SBIINB': 'SBI',
  'ICICIB': 'ICICI Bank',
  'KOTAKB': 'Kotak Mahindra',
  'AXISBK': 'Axis Bank',
  'PNBSMS': 'PNB',
  'BOIIND': 'Bank of India',
  'CANBNK': 'Canara Bank',
  'IABORB': 'Indian Bank',
  'YESBNK': 'Yes Bank',
  'IDBIBK': 'IDBI Bank',
  'UNIONB': 'Union Bank',
  'CENTBK': 'Central Bank',
  'BOBIHR': 'Bank of Baroda',
  'FEDBKN': 'Federal Bank',
  'INDUSB': 'IndusInd Bank',
  'RBLBNK': 'RBL Bank',
  // UPI apps (also send transaction SMS)
  'GPAY':   'Google Pay',
  'PYTM':   'Paytm',
  'PHONEPE': 'PhonePe',
}
```

### 5.2 Parser Engine (core logic)
```typescript
// src/lib/sms/parser.ts

export interface ParsedTransaction {
  amount: number
  type: 'debit' | 'credit'
  merchant: string | null
  date: string            // ISO date
  accountLast4: string | null
  balance: number | null
  reference: string | null
  rawSms: string          // keep for debugging
  bankName: string
  confidence: number      // 0-1, how confident the parse is
}

// Amount regex — handles ₹, Rs, Rs., INR with commas
const AMOUNT_REGEX = /(?:Rs\.?|INR|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi

// Direction detection
const DEBIT_KEYWORDS = ['debited', 'spent', 'paid', 'withdrawn', 'deducted', 'purchase']
const CREDIT_KEYWORDS = ['credited', 'received', 'deposited', 'refund', 'cashback']

// Merchant extraction
const MERCHANT_PATTERNS = [
  /(?:UPI[:\-\/]|Info:\s*|towards\s+|to\s+|at\s+|for\s+)([A-Za-z0-9\s@._-]+)/i,
  /(?:VPA\s+)([a-z0-9@._-]+)/i,
]

export function parseSms(smsBody: string, sender: string, bankName: string): ParsedTransaction | null {
  // 1. Extract amount
  const amountMatch = AMOUNT_REGEX.exec(smsBody)
  if (!amountMatch) return null
  const amount = parseFloat(amountMatch[1].replace(/,/g, ''))

  // 2. Detect direction
  const bodyLower = smsBody.toLowerCase()
  const isDebit = DEBIT_KEYWORDS.some(kw => bodyLower.includes(kw))
  const isCredit = CREDIT_KEYWORDS.some(kw => bodyLower.includes(kw))
  const type = isCredit ? 'credit' : 'debit' // default to debit if ambiguous

  // 3. Extract merchant
  let merchant: string | null = null
  for (const pattern of MERCHANT_PATTERNS) {
    const match = pattern.exec(smsBody)
    if (match) {
      merchant = match[1].trim().substring(0, 50)
      break
    }
  }

  // 4. Extract account last 4
  const acctMatch = /(?:a\/c|acct?|AC)\s*[*Xx]*(\d{4})/i.exec(smsBody)
  const accountLast4 = acctMatch ? acctMatch[1] : null

  // 5. Extract balance
  const balMatch = /(?:Avl\.?\s*Bal|Available\s*Balance|Bal)[:\s]*(?:Rs\.?|INR|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i.exec(smsBody)
  const balance = balMatch ? parseFloat(balMatch[1].replace(/,/g, '')) : null

  // 6. Extract reference
  const refMatch = /(?:Ref[:\s]*|ref\s*:?\s*|UPI\s*Ref\s*)(\d+)/i.exec(smsBody)
  const reference = refMatch ? refMatch[1] : null

  // 7. Confidence scoring
  let confidence = 0.5
  if (amountMatch) confidence += 0.2
  if (isDebit || isCredit) confidence += 0.15
  if (merchant) confidence += 0.1
  if (accountLast4) confidence += 0.05

  return {
    amount,
    type,
    merchant,
    date: new Date().toISOString().split('T')[0], // fallback, parse from SMS if possible
    accountLast4,
    balance,
    reference,
    rawSms: smsBody,
    bankName,
    confidence: Math.min(confidence, 1),
  }
}
```

### 5.3 SMS Reader (Capacitor bridge)
```typescript
// src/lib/sms/reader.ts

import { Capacitor } from '@capacitor/core'
import { BANK_SENDERS } from './bank-senders'
import { parseSms, ParsedTransaction } from './parser'

export async function readBankSms(sinceDate: Date): Promise<ParsedTransaction[]> {
  if (!Capacitor.isNativePlatform()) return []
  
  // Use the SMS inbox plugin to read messages
  const { SmsInbox } = await import('@nicoara/capacitor-sms-inbox')
  
  const bankSenderIds = Object.keys(BANK_SENDERS)
  const transactions: ParsedTransaction[] = []
  
  for (const senderId of bankSenderIds) {
    try {
      const { messages } = await SmsInbox.getMessages({
        filter: { address: senderId, after: sinceDate.getTime() }
      })
      
      for (const msg of messages) {
        const parsed = parseSms(msg.body, senderId, BANK_SENDERS[senderId])
        if (parsed && parsed.confidence >= 0.6) {
          transactions.push(parsed)
        }
      }
    } catch {
      // Sender not found or permission denied — skip
    }
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
```

### 5.4 Category Mapping (rule-based → AI upgrade later)
```typescript
// src/lib/sms/categorizer.ts

const MERCHANT_CATEGORIES: Record<string, string> = {
  // Food
  'swiggy': 'food', 'zomato': 'food', 'dominos': 'food', 'mcdonalds': 'food',
  'blinkit': 'food', 'bigbasket': 'food', 'zepto': 'food', 'dunzo': 'food',
  
  // Transport
  'ola': 'transport', 'uber': 'transport', 'rapido': 'transport',
  'irctc': 'transport', 'redbus': 'transport', 'metro': 'transport',
  'indian oil': 'transport', 'hp petrol': 'transport', 'bharat petroleum': 'transport',
  
  // Shopping
  'amazon': 'shopping', 'flipkart': 'shopping', 'myntra': 'shopping',
  'ajio': 'shopping', 'meesho': 'shopping', 'nykaa': 'shopping',
  
  // Entertainment
  'netflix': 'entertainment', 'spotify': 'entertainment', 'prime': 'entertainment',
  'bookmyshow': 'entertainment', 'hotstar': 'entertainment',
  
  // Healthcare
  'apollo': 'healthcare', 'pharmeasy': 'healthcare', 'netmeds': 'healthcare',
  '1mg': 'healthcare', 'cult.fit': 'healthcare',
  
  // Bills
  'jio': 'utilities', 'airtel': 'utilities', 'vi ': 'utilities',
  'bescom': 'utilities', 'bwssb': 'utilities', 'electricity': 'utilities',
  
  // Investments (mark as savings, not expense)
  'groww': 'savings', 'zerodha': 'savings', 'kuvera': 'savings',
  'coin': 'savings', 'sip': 'savings', 'mutual fund': 'savings',
}

export function categorizeByMerchant(merchant: string | null): string {
  if (!merchant) return 'other'
  const lower = merchant.toLowerCase()
  
  for (const [keyword, category] of Object.entries(MERCHANT_CATEGORIES)) {
    if (lower.includes(keyword)) return category
  }
  
  return 'other'
}
```

### 5.5 Ingestion Flow (UI + DB)
```typescript
// src/lib/sms/ingest.ts
// Call this from Settings or a "Sync Transactions" button

import { readBankSms } from './reader'
import { categorizeByMerchant } from './categorizer'
import { createClient } from '@/lib/supabase/client'

export async function ingestSmsTransactions(userId: string) {
  const supabase = createClient()
  
  // Read SMS from last 30 days
  const since = new Date()
  since.setDate(since.getDate() - 30)
  
  const transactions = await readBankSms(since)
  
  // Deduplicate: check which references already exist in DB
  const existingRefs = new Set<string>()
  if (transactions.some(t => t.reference)) {
    const { data } = await supabase
      .from('expenses')
      .select('sms_reference')
      .eq('user_id', userId)
      .not('sms_reference', 'is', null)
    
    data?.forEach(d => existingRefs.add(d.sms_reference))
  }
  
  // Filter new transactions
  const newTx = transactions.filter(t => 
    t.type === 'debit' && // Only debits are expenses
    (!t.reference || !existingRefs.has(t.reference))
  )
  
  // Insert into Supabase
  const inserts = newTx.map(tx => ({
    user_id: userId,
    description: tx.merchant || `${tx.bankName} transaction`,
    category: categorizeByMerchant(tx.merchant),
    amount: tx.amount,
    date: tx.date,
    is_recurring: false,
    source: 'sms_auto',
    sms_reference: tx.reference,
    bank_name: tx.bankName,
    confidence: tx.confidence,
  }))
  
  if (inserts.length > 0) {
    await supabase.from('expenses').insert(inserts)
  }
  
  return { total: transactions.length, imported: inserts.length }
}
```

---

## 6. Database Schema Addition

```sql
-- Add to expenses table
ALTER TABLE expenses ADD COLUMN source TEXT DEFAULT 'manual';
-- values: 'manual', 'sms_auto', 'csv_import'

ALTER TABLE expenses ADD COLUMN sms_reference TEXT;
ALTER TABLE expenses ADD COLUMN bank_name TEXT;
ALTER TABLE expenses ADD COLUMN confidence FLOAT DEFAULT 1.0;

-- Index for deduplication
CREATE UNIQUE INDEX idx_expenses_sms_ref ON expenses(user_id, sms_reference) WHERE sms_reference IS NOT NULL;
```

---

## 7. UI — Settings Page "Sync SMS" Section

```
┌─────────────────────────────┐
│  📬 SMS Transaction Sync    │
│                              │
│  Automatically import bank  │
│  SMS to track spending.     │
│                              │
│  ┌────────────────────────┐ │
│  │ 🔄 Sync Last 30 Days  │ │  ← Primary button
│  └────────────────────────┘ │
│                              │
│  Last sync: 2 hours ago     │
│  23 transactions imported   │
│                              │
│  ────────────────────────── │
│                              │
│  ⚙️ Sync Preferences        │
│  [x] Auto-sync daily        │
│  [x] Show before importing  │
│  [ ] Include credits        │
└─────────────────────────────┘
```

---

## 8. Privacy & Compliance

1. **Never store raw SMS** — only extracted transaction data
2. **User consent required** — explicit opt-in before reading SMS
3. **Data safety declaration** — update Play Store data safety form
4. **SMS content not transmitted** — parsing happens entirely on-device
5. **Delete raw data** — `rawSms` field is only for debugging, don't save to DB

---

## 9. Testing Checklist

- [ ] Parser correctly extracts HDFC debit SMS
- [ ] Parser correctly extracts SBI UPI SMS
- [ ] Parser handles credit/refund SMS (marks as credit, not imported to expenses)
- [ ] Deduplication works (same transaction not imported twice)
- [ ] Category mapping works for Swiggy, Amazon, Uber
- [ ] Confidence threshold filters out non-transactional SMS
- [ ] Permission request UI shows clear explanation
- [ ] Play Store permission declaration draft ready

---

*Sprint authored for Monetra Mobile v1.1*
