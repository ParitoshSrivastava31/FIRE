# Monetra — Product Roadmap & Technical Specification

> **India's First Lifestyle-to-Investment AI Finance Planner**
> Version 1.0.0 | Stack: Next.js + Supabase | Market: India-First
> *Confidential — Internal Development Document*

---

## Table of Contents

1. [Product Vision & Overview](#1-product-vision--overview)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Database Schema (Supabase / PostgreSQL)](#3-database-schema-supabase--postgresql)
4. [User Onboarding Flow](#4-user-onboarding-flow)
5. [Pages & Feature Specifications](#5-pages--feature-specifications)
6. [AI Integration — Claude API](#6-ai-integration--claude-api)
7. [Market Data & External Integrations](#7-market-data--external-integrations)
8. [Subscription & Monetisation](#8-subscription--monetisation)
9. [Development Phases & Roadmap](#9-development-phases--roadmap)
10. [Vercel Deployment Configuration](#10-vercel-deployment-configuration)
11. [Design System & UI Guidelines](#11-design-system--ui-guidelines)
12. [Compliance & Legal Considerations](#12-compliance--legal-considerations)
13. [Future Roadmap (Post-MVP Vision)](#13-future-roadmap-post-mvp-vision)

---

## 1. Product Vision & Overview

### 1.1 Product Name & Tagline

- **Product Name:** Monetra
- **Tagline:** Turn your lifestyle into a wealth strategy.

---

### 1.2 Problem Statement

India has 500M+ working adults, yet only ~3% invest in mutual funds and less than 1% in equities. The gap is not awareness — it's actionability. Existing tools either track expenses OR suggest investments, but none bridge the two with real-time AI intelligence tailored to India-specific instruments, regional real estate data, and behavioral nudges.

---

### 1.3 Solution Summary

Monetra is a fullstack, AI-native personal finance operating system. It ingests a user's income, lifestyle spending, and goals, then uses real-time market data and Claude AI to:

- Audit spending habits and identify investable surplus
- Build a personalised, multi-asset investment thesis
- Project wealth across conservative, moderate, and aggressive scenarios
- Provide real-time alerts on portfolio rotation needs
- Map local real estate opportunities with price-per-sqft data
- Suggest passive income streams and business ideas based on income tier

---

### 1.4 Target Users

| User Segment | Description |
|---|---|
| Salaried Professional (₹30K–₹2L/mo) | Primary segment — wants to invest but doesn't know where to start |
| Freelancer / Gig Worker | Irregular income; needs dynamic planning with variable surplus |
| Small Business Owner | Wants to separate personal and business finance, reinvest profits |
| Student / Early Career (22–27) | Building first investment habit; SIP-first approach |
| NRI / Returning Indian | Wants to invest in India; real estate + equity dual-track |

---

### 1.5 Core Value Propositions

> **What Makes Monetra Unique**
>
> 1. **Lifestyle-to-Investment Bridge** — "You spend ₹16K eating out. Redirect ₹8K → this ELSS = ₹42L in 15 years"
> 2. **India-Native** — SIP, NPS, PPF, SGBs, NSE/BSE stocks, Gold ETF, Indian real estate per-sqft data
> 3. **Real-Time AI** — Claude API for dynamic thesis generation, not static rule-based advice
> 4. **Behavioural Nudges** — Gamified savings challenges tied to real investment milestones
> 5. **Regional Real Estate** — Tier-2/3 city data: price/sqft, rental yield, appreciation trends
> 6. **Income Benchmarking** — "At 28 in Kanpur, your income should ideally be ₹X — here's how to get there"

---

## 2. Tech Stack & Architecture

### 2.1 Full Stack Overview

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14+ (App Router) | SSR/SSG pages, API routes, React Server Components |
| Styling | Tailwind CSS + shadcn/ui | Component library, consistent design system |
| Auth | Supabase Auth | Email/OTP/OAuth (Google, GitHub), JWT sessions |
| Database | Supabase (PostgreSQL) | User data, transactions, portfolio, alerts |
| Realtime | Supabase Realtime | Live portfolio value updates, price alerts |
| File Storage | Supabase Storage | Profile images, document uploads |
| AI Engine | Anthropic Claude API | Investment thesis, spending audit, advice generation |
| Market Data | NSE/BSE APIs, Alpha Vantage | Real-time stock, MF NAV, Gold prices |
| Real Estate | PropEquity / custom scraper | Price per sqft by locality/city |
| Charts | Recharts + D3.js | Wealth projection graphs, portfolio allocation |
| Background Jobs | Vercel Cron + Edge Functions | Daily price alerts, portfolio rebalancing checks |
| Notifications | Supabase Edge Functions + FCM | Push alerts for stock movement, SIP reminders |
| Deployment | Vercel | CI/CD, preview branches, edge network |
| Email | Resend | Transactional emails, weekly digests |
| Payments | Razorpay | Premium subscription billing |

---

### 2.2 Next.js App Router Structure

```
monetra/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── onboarding/           # Multi-step onboarding
│   │       ├── step-1/page.tsx   # Personal info
│   │       ├── step-2/page.tsx   # Income & expenses
│   │       ├── step-3/page.tsx   # Goals & risk profile
│   │       └── step-4/page.tsx   # Investment preferences
│   ├── (dashboard)/              # Protected route group
│   │   ├── dashboard/page.tsx    # Main dashboard
│   │   ├── spending/page.tsx     # Expense tracker
│   │   ├── portfolio/page.tsx    # Investment portfolio
│   │   ├── planner/page.tsx      # AI investment planner
│   │   ├── real-estate/page.tsx  # Real estate explorer
│   │   ├── alerts/page.tsx       # Notification center
│   │   ├── passive-income/page.tsx
│   │   ├── goals/page.tsx        # Goal tracker
│   │   └── settings/page.tsx
│   ├── api/                      # API Routes
│   │   ├── ai/thesis/route.ts    # AI investment thesis
│   │   ├── ai/audit/route.ts     # Spending audit
│   │   ├── ai/advice/route.ts    # General advice
│   │   ├── market/stocks/route.ts
│   │   ├── market/mf/route.ts    # Mutual funds NAV
│   │   ├── market/gold/route.ts
│   │   └── realestate/route.ts
│   └── layout.tsx
├── components/                   # Shared components
│   ├── ui/                       # shadcn/ui base
│   ├── charts/                   # Recharts wrappers
│   ├── ai/                       # AI chat/thesis components
│   └── onboarding/               # Onboarding step components
├── lib/
│   ├── supabase/                 # Client + server Supabase
│   ├── anthropic/                # Claude API wrapper
│   └── market/                   # Market data fetchers
└── middleware.ts                 # Auth guard, route protection
```

---

### 2.3 Supabase Auth Configuration

**Authentication Methods:**
- Email + Password (default)
- Magic Link (OTP via email)
- Google OAuth
- Phone OTP (for Indian users — important for trust)

**Auth Flow:**
1. User lands on `/login` or `/signup`
2. Supabase Auth handles session creation, JWT stored in cookies
3. `middleware.ts` checks session on every protected route
4. If authenticated but onboarding not complete → redirect to `/onboarding/step-1`
5. If authenticated and onboarded → redirect to `/dashboard`
6. Supabase Row Level Security (RLS) ensures users can only read/write their own data

**Route Protection Rules (middleware.ts):**
```
Public routes:       /  /login  /signup  /about  /pricing
Auth-only routes:    /dashboard/*  /onboarding/*  (redirect to /login if no session)
Onboarding gate:     if user.onboarding_complete = false → force /onboarding/step-1
Admin routes:        /admin/* → check user.role = 'admin' in Supabase
```

---

## 3. Database Schema (Supabase / PostgreSQL)

### 3.1 `users` (extends Supabase auth.users)

| Column | Type / Notes |
|---|---|
| id | UUID — primary key, FK to auth.users |
| full_name | TEXT |
| avatar_url | TEXT — Supabase Storage URL |
| phone | TEXT — optional |
| city | TEXT — used for real estate locality data |
| state | TEXT |
| date_of_birth | DATE — for age-based benchmarking |
| occupation | TEXT — salaried / freelancer / business |
| monthly_income | NUMERIC(12,2) |
| annual_income | NUMERIC(12,2) |
| risk_profile | ENUM('conservative','moderate','aggressive') |
| onboarding_complete | BOOLEAN DEFAULT false |
| plan | ENUM('free','pro','elite') DEFAULT 'free' |
| created_at | TIMESTAMPTZ DEFAULT now() |
| updated_at | TIMESTAMPTZ |

---

### 3.2 `expenses`

| Column | Type / Notes |
|---|---|
| id | UUID — primary key |
| user_id | UUID — FK to users, RLS enforced |
| category | ENUM('food','transport','entertainment','utilities','emi','healthcare','shopping','other') |
| sub_category | TEXT — e.g. 'dining out', 'OTT subscriptions' |
| amount | NUMERIC(10,2) |
| frequency | ENUM('daily','weekly','monthly','yearly') |
| description | TEXT |
| date | DATE |
| is_recurring | BOOLEAN DEFAULT false |
| created_at | TIMESTAMPTZ DEFAULT now() |

---

### 3.3 `goals`

| Column | Type / Notes |
|---|---|
| id | UUID |
| user_id | UUID — FK |
| name | TEXT — 'Buy a house', 'Retire at 45', 'Child education fund' |
| target_amount | NUMERIC(14,2) |
| current_amount | NUMERIC(14,2) DEFAULT 0 |
| target_date | DATE |
| goal_type | ENUM('retirement','home','education','travel','emergency','business','other') |
| priority | INTEGER 1–5 |
| is_completed | BOOLEAN DEFAULT false |

---

### 3.4 `portfolio_holdings`

| Column | Type / Notes |
|---|---|
| id | UUID |
| user_id | UUID — FK |
| asset_type | ENUM('stock','mutual_fund','etf','gold','fd','ppf','nps','real_estate','crypto','other') |
| symbol | TEXT — NSE/BSE ticker or MF scheme code |
| name | TEXT — human readable name |
| quantity | NUMERIC(12,4) |
| avg_buy_price | NUMERIC(12,4) |
| current_price | NUMERIC(12,4) |
| previous_close | NUMERIC(12,4) — for day change calculation |
| current_value | NUMERIC(14,2) — generated column |
| invested_amount | NUMERIC(14,2) — generated column |
| pnl | NUMERIC(14,2) — generated column |
| pnl_percent | NUMERIC(8,4) — generated column |
| day_change_percent | NUMERIC(8,4) — generated column |
| last_updated | TIMESTAMPTZ |

**Generated column formulas:**
```sql
current_value       = current_price * quantity
invested_amount     = avg_buy_price * quantity
pnl                 = current_value - invested_amount
pnl_percent         = (pnl / invested_amount) * 100
day_change_percent  = ((current_price - previous_close) / previous_close) * 100
```

---

### 3.5 `sip_plans`

| Column | Type / Notes |
|---|---|
| id | UUID |
| user_id | UUID — FK |
| fund_name | TEXT |
| scheme_code | TEXT |
| monthly_amount | NUMERIC(10,2) |
| start_date | DATE |
| step_up_percent | NUMERIC(5,2) DEFAULT 0 — annual step-up |
| tenure_years | INTEGER |
| target_amount | NUMERIC(14,2) — AI projected value |
| is_active | BOOLEAN DEFAULT true |

---

### 3.6 `ai_theses` (stores generated investment theses)

| Column | Type / Notes |
|---|---|
| id | UUID |
| user_id | UUID — FK |
| thesis_type | ENUM('spending_audit','investment_plan','goal_projection','portfolio_review','real_estate') |
| input_snapshot | JSONB — user data at time of generation |
| thesis_content | TEXT — full markdown AI response |
| recommendations | JSONB — structured recommendations array |
| model_version | TEXT — Claude model used |
| created_at | TIMESTAMPTZ |
| is_bookmarked | BOOLEAN DEFAULT false |

---

### 3.7 `alerts`

| Column | Type / Notes |
|---|---|
| id | UUID |
| user_id | UUID — FK |
| alert_type | ENUM('stock_alert','sip_reminder','goal_milestone','portfolio_warning','rebalance','news') |
| title | TEXT |
| body | TEXT |
| related_symbol | TEXT — nullable |
| trigger_value | NUMERIC — price/percent threshold |
| is_read | BOOLEAN DEFAULT false |
| is_active | BOOLEAN DEFAULT true |
| triggered_at | TIMESTAMPTZ |

---

### 3.8 `real_estate_data` (reference table — populated by cron)

| Column | Type / Notes |
|---|---|
| id | UUID |
| city | TEXT |
| locality | TEXT |
| state | TEXT |
| price_per_sqft_min | NUMERIC(10,2) |
| price_per_sqft_max | NUMERIC(10,2) |
| price_per_sqft_avg | NUMERIC(10,2) |
| rental_yield_percent | NUMERIC(5,2) |
| yoy_appreciation_percent | NUMERIC(5,2) — Year-over-year |
| data_source | TEXT |
| last_updated | TIMESTAMPTZ |

---

## 4. User Onboarding Flow

### 4.1 Onboarding Philosophy

Onboarding must feel like a conversation, not a form. Use a progress stepper (Step 1 of 4), soft animations, and show a real-time preview of what FinSight will do with their data. Target completion in under 3 minutes.

---

### 4.2 Step 1 — Personal Profile (`/onboarding/step-1`)

**Fields:**
- Full Name
- Date of Birth (for age benchmarking)
- City (autocomplete — searchable Indian cities, all tiers)
- Occupation: Salaried / Freelancer / Business Owner / Student

**UX Notes:**
- City dropdown seeds real estate locality data for their region
- Occupation affects which investment instruments are prioritised in AI thesis

---

### 4.3 Step 2 — Income & Monthly Expenses (`/onboarding/step-2`)

**Income Fields:**
- Monthly Take-Home Salary (post-tax)
- Other Income Sources (rent, freelance, dividends) — addable rows
- Toggle: "My income is irregular" — triggers monthly avg input

**Expense Categories (with pre-filled estimates, user adjusts):**

| Category | Example Sub-items |
|---|---|
| 🍽️ Food & Dining | Groceries, Dining Out, Food Delivery (Swiggy/Zomato) |
| 🏠 Housing | Rent / EMI, Maintenance, Electricity, Internet |
| 🚗 Transport | Fuel, Cab (Ola/Uber), Public Transport |
| 🎬 Entertainment | OTT, Movies, Events, Hobbies |
| 🏥 Healthcare | Insurance Premium, Medicines, Gym |
| 👗 Shopping | Clothes, Electronics, Personal Care |
| 💳 Loans / EMIs | Car Loan, Personal Loan, Credit Card |
| 📚 Education | Courses, Books, Kids tuition |
| 💰 Current Savings | Any existing SIPs, RD, FD, PF |

**Computed on screen (live):**
- Total Monthly Expense: ₹X
- Monthly Surplus (investable): ₹Y = Income − Expenses
- Savings Rate %: colour-coded bar (red < 10%, yellow 10–25%, green > 25%)

---

### 4.4 Step 3 — Financial Goals (`/onboarding/step-3`)

Users pick from goal cards (multi-select allowed):

- 🏠 Buy a Home
- 🎓 Children's Education
- ✈️ Dream Vacation
- 🚀 Start a Business
- 🌴 Early Retirement
- 🛡️ Emergency Fund (6 months expenses)
- 👴 Retirement Corpus
- 📈 Wealth Creation (general)

For each selected goal, user enters: **Target Amount (₹)**, **Target Year**, **Current Progress (₹0 default)**.

---

### 4.5 Step 4 — Risk Profile & Investment Preferences (`/onboarding/step-4`)

**Risk Quiz (5 questions, auto-calculates profile):**
1. How would you react if your investment dropped 20% in a month?
2. What is your primary investment horizon?
3. What % of surplus are you comfortable locking away for 5+ years?
4. Have you invested in equity before?
5. Do you prefer guaranteed returns or higher potential returns?

**Result:** Conservative / Moderate / Aggressive

**Investment Instrument Preferences (checkbox):**
- Mutual Funds / SIPs
- Direct Stocks (NSE/BSE)
- Gold (Sovereign Gold Bonds / Gold ETF)
- Fixed Deposits / RDs
- PPF / NPS
- Real Estate
- US Stocks (via INDmoney/Vested)
- Crypto (acknowledge risk toggle required)

**Onboarding Completion:**
```
After Step 4:
  → Mark user.onboarding_complete = true in Supabase
  → Trigger: First AI Investment Thesis generation (async)
  → Show celebration screen: "Your FinSight is ready. Here is your wealth snapshot."
  → Redirect to /dashboard with guided tooltip tour (driver.js or Shepherd.js)
```

---

## 5. Pages & Feature Specifications

### 5.1 Dashboard (`/dashboard`)

The command centre. All key metrics at a glance, with an AI summary card at the top.

**Components:**
- **AI Insight Card** — scrollable card with today's AI-generated personalised insight. E.g.: *"Your dining spend is 22% above your 3-month average. Redirecting ₹3,000 to your Home Goal SIP this month would add ₹8.4L to your corpus in 12 years."*
- **Net Worth Widget** — Total Assets − Liabilities, with month-over-month delta
- **Monthly Summary Bar** — Income | Spent | Invested | Remaining (4 segments)
- **Portfolio Performance Card** — Overall P&L, XIRR, compared to Nifty 50
- **Goals Progress** — horizontal progress bars for each active goal
- **Active Alerts Strip** — top 3 unread alerts with icon and 1-line description
- **Market Snapshot** — Nifty 50, Sensex, Gold, USD/INR live ticker
- **Quick Actions** — Add Expense | Add Investment | Ask AI | Set Alert

---

### 5.2 Spending Tracker (`/spending`)

**Features:**
- Monthly calendar view + list view toggle
- Add Expense modal: Category, Sub-category, Amount, Date, Recurring toggle
- Auto-categorisation of expenses using AI (if user pastes bank SMS or description)
- Monthly spending breakdown — donut chart by category
- Month-over-month trend chart per category
- "Audit my spending" button — triggers Claude AI analysis of current month's expenses

**AI Spending Audit Output includes:**
- Top 3 overspending categories vs. income percentage benchmarks
- Specific habit analysis: *"You ordered food delivery 18 times this month (avg ₹340/order = ₹6,120). Cutting to 10 times saves ₹2,720/month"*
- "If you redirected X" scenarios — linked to actual investment instruments
- Peer comparison: *"People in your income bracket in Kanpur spend Y% on dining"*

---

### 5.3 AI Investment Planner (`/planner`)

The core feature. A full-page AI-driven investment thesis generator.

**Layout:**
- Left panel: Input parameters (editable summary of onboarding data, risk profile, goals)
- Right panel: AI-generated Investment Thesis (streamed response via Claude API)

**Thesis Sections (AI generates all of these):**
1. **Executive Summary** — personalised 3-line summary of user's financial position
2. **Investable Surplus Analysis** — breakdown of where the ₹X monthly surplus should go
3. **Asset Allocation Plan** — pie chart recommendation (Equity/Debt/Gold/Real Estate/Liquid)
4. **Specific Instrument Recommendations** — named MFs (with AMFI code), SGB series, NSE stocks
5. **SIP Plan** — exact amounts per fund, with step-up suggestion
6. **Goal Achievement Timeline** — for each goal, projected date at current + recommended pace
7. **Risk Scenario Table** — what happens if markets drop 20%, 40% (downside protection plan)
8. **Tax Optimisation Tips** — ELSS for 80C, NPS for 80CCD, HRA, etc.
9. **Income Growth Actions** — 3 specific suggestions to grow income based on occupation

**Wealth Projection Graph:**
- Multi-line Recharts graph: X-axis = Years (1–30), Y-axis = Corpus (₹)
- 4 lines: Conservative (7% CAGR), Moderate (11%), Aggressive (15%), Inflation-adjusted
- Hover tooltip shows exact value at each year
- Milestone markers: Home purchase target, Retirement target, Education fund
- Toggle: Show with Step-Up SIP vs. Flat SIP

---

### 5.4 Portfolio (`/portfolio`)

**Holdings Table:**

| Column | Notes |
|---|---|
| Asset Name | With asset type badge |
| Invested | Avg buy price × quantity |
| Current Value | current_price × quantity, live |
| P&L (₹) | Green if positive, red if negative |
| P&L% | Colour-coded, with ↑↓ arrow |
| Day Change% | Today's movement vs yesterday's close |

- Sortable columns, filterable by asset type
- Colour-coded P&L: green positive, red negative

**Charts:**
- Portfolio Allocation Donut (Equity / Debt / Gold / Real Estate / Liquid)
- Performance vs Nifty 50 line chart (1W, 1M, 3M, 6M, 1Y, All)
- Asset-wise contribution to total returns bar chart

**AI Portfolio Review:**
- "Review my portfolio" button → Claude analyses current holdings
- Identifies: underperformers, over-concentration risks, missing diversification
- Suggests: rotation opportunities, funds to exit, funds to add
- Rebalancing suggestion: shows current vs recommended allocation

---

### 5.5 Real Estate Explorer (`/real-estate`)

India-first differentiator. No equivalent product exists for Tier-2/3 cities.

**Features:**
- City selector (starts with user's city from onboarding) → shows localities
- Per-locality data table: Area Name | Price/sqft (min–max) | Avg Rental Yield | YoY Appreciation
- Interactive map view (Leaflet.js) with colour-coded price zones
- "Can I afford this area?" calculator: Budget ₹ → shows eligible localities
- EMI calculator: Loan amount + tenure + rate → monthly EMI
- "How long to afford?" calculator: *"At current savings rate, you can buy a 2BHK in Kidwai Nagar in X years"*

**AI Real Estate Advisor:**
- Based on user income and goals → recommends Buy vs. Rent analysis
- If user selects a property type → shows 5-year appreciation projection
- Nearby cities comparison: *"Kanpur vs Lucknow vs Agra — where is your money better placed?"*
- Rental income projection if buying as investment property

---

### 5.6 Goals Tracker (`/goals`)

- Card view of all goals with: Progress bar | Time remaining | Monthly SIP needed
- Add / Edit / Delete goals
- "Accelerate this goal" button → AI suggests specific extra SIP or one-time investment
- Goal achievement simulation: slide monthly investment up/down, see year shift in real-time
- Milestone celebration: confetti animation when a goal is 25%, 50%, 75%, 100% done

---

### 5.7 Alerts & Notifications (`/alerts`)

**Alert Types:**

| Alert Type | Example Trigger |
|---|---|
| Stock Price Alert | HDFC Bank drops below ₹1,550 — user-set threshold |
| Portfolio Warning | Your small-cap allocation exceeds 40% — rebalance suggested |
| SIP Reminder | Your ₹5,000 Axis Bluechip SIP is due in 3 days |
| Goal Milestone | You've reached 50% of your Home Down Payment goal! |
| Market News Alert | RBI cuts repo rate — impact on your debt funds analysed |
| Spending Overage | You've spent 85% of your dining budget for this month |
| Income Benchmark | Based on your profile, aim for a 12% income increase this quarter |
| Investment Opportunity | SGB Series 2025-IV open — aligns with your gold allocation |

**Alert Settings:**
- Per-alert type: toggle on/off
- Delivery: In-app | Push Notification | Email (weekly digest) | WhatsApp (via Twilio)
- Quiet hours setting

---

### 5.8 Passive Income Hub (`/passive-income`)

Unique feature — AI-curated passive income opportunities based on user's investable surplus.

**Opportunity Cards (AI-generated, refreshed weekly):**
- **Dividend Stocks:** "NTPC current dividend yield 3.2% — at your portfolio size, this generates ₹X/month"
- **Debt MF / FD Laddering:** "Split ₹1L across 3/6/12-month FDs for liquidity + returns"
- **P2P Lending:** LenDenClub / Liquiloans — risk-adjusted yield comparison
- **REITs:** Embassy REIT / Mindspace — rental income without property ownership
- **Digital Products / Content:** Based on occupation, suggest info product or course ideas
- **Rental Arbitrage:** If user owns property — rental yield optimisation
- **Angel Investing / Startups:** For Elite plan users with ₹10L+ surplus

**"Build My Passive Income Plan" button:**
- AI generates a 3-tiered passive income strategy (Short/Medium/Long term)
- Shows projected monthly passive income at 1yr, 3yr, 5yr, 10yr

---

### 5.9 Settings (`/settings`)

- Profile: Name, photo, city, occupation
- Linked Accounts: (future) bank SMS parsing, Zerodha API, Groww API
- Notification Preferences: per-type toggles + delivery channel
- Risk Profile: retake quiz
- Subscription: current plan, upgrade CTA, billing history
- Data Export: CSV export of expenses, portfolio
- Delete Account: GDPR-compliant full data deletion

---

## 6. AI Integration — Claude API

### 6.1 AI Use Cases Summary

| Feature | Claude Prompt Type |
|---|---|
| Investment Thesis Generation | Large context — full user profile + goals + market snapshot → structured thesis |
| Spending Audit | Expense list → behavioural insights + redirection suggestions |
| Portfolio Review | Holdings list + market data → rebalancing recommendations |
| Real Estate Advisor | User income + location + preference → buy/rent analysis |
| Passive Income Plan | Surplus amount + risk profile → tiered passive income strategy |
| Goal Acceleration | Specific goal + current progress → targeted investment suggestions |
| Daily Insight Card | Lightweight daily prompt → 2-sentence personalised financial insight |
| Chat with FinSight | Conversational assistant — any finance question, grounded in user data |

---

### 6.2 API Route Structure

**`POST /api/ai/thesis`**
```
Input:   { user_profile, expenses, portfolio, goals, market_snapshot, risk_profile }
Model:   claude-sonnet-4-20250514
Tokens:  max_tokens: 4096
Stream:  true
Output:  Streamed markdown thesis + structured JSONB recommendations
Cache:   Store in ai_theses table, reuse if < 24 hours old
```

**`POST /api/ai/audit`**
```
Input:   { monthly_expenses[], income, month, user_city }
Output:  3–5 bullet insights + redirection scenarios in JSON
Trigger: Manual button OR auto-trigger on 25th of each month
```

**`POST /api/ai/advice`** — General chat, grounded with user profile injected into system prompt.

---

### 6.3 Master System Prompt

```
You are Monetra, a SEBI-informed personal finance advisor built for India.
You have deep knowledge of: NSE/BSE equities, mutual funds, SIP mechanics, NPS, PPF,
Sovereign Gold Bonds, Indian real estate markets, tax laws (80C, 80D, LTCG, STCG),
and financial planning for Tier-2/3 city professionals.

User context will be provided as JSON. Always:
  - Address the user by first name
  - Use ₹ (Indian Rupees) for all amounts
  - Reference India-specific instruments only unless user has opted into US stocks
  - Be specific: name actual funds, actual SIP amounts, actual timelines
  - Show your calculations transparently
  - Flag SEBI advice boundaries — recommend consulting a SEBI RIA for final decisions
  - Never promise specific returns on any equity instrument
  - Always include a downside scenario in every investment thesis
```

---

### 6.4 Rate Limiting & Cost Control

| Plan | AI Thesis | Spending Audit | Chat |
|---|---|---|---|
| Free | 3/month | 5/month | — |
| Pro | Unlimited | Unlimited | 5/day |
| Elite | Unlimited (Priority) | Unlimited | Unlimited |

- Rate limiting tracked via Supabase function call count per user per billing period
- Cache AI responses in `ai_theses` table — same inputs within 24h return cached result

---

## 7. Market Data & External Integrations

### 7.1 Data Sources

| Data Type | Source / API | Refresh Rate |
|---|---|---|
| NSE/BSE Stock Prices | Yahoo Finance (`*.NS` suffix) / Alpha Vantage | Every 5 min (market hours) |
| Mutual Fund NAV | AMFI India via mfapi.in (free, no auth) | Daily after 9PM |
| Gold Price | IBJA / goldapi.io | Hourly |
| Nifty 50 / Sensex | NSE API / Alpha Vantage | Real-time (Pro), 15-min delay (Free) |
| USD/INR Forex | Open Exchange Rates | Hourly |
| Real Estate Price/sqft | PropEquity API / 99acres scraper | Weekly (Vercel Cron) |
| Inflation (CPI) | RBI / MOSPI | Monthly |
| Repo Rate / Policy | RBI RSS | On change |
| SGB Issuance | RBI Notifications | On announcement |

---

### 7.2 Vercel Cron Jobs

| Cron Schedule (UTC) | Task |
|---|---|
| `*/5 3-10 * * 1-5` | Fetch live stock prices, update portfolio, trigger price alerts (market hours IST) |
| `0 15 * * 1-5` | Fetch AMFI NAV, update MF portfolio values |
| `0 2 * * *` | Generate daily AI insight cards for all active users |
| `0 16 * * *` | Check all user alert rules, dispatch triggered alerts |
| `0 18 * * 0` | Update real estate price/sqft data by city/locality |
| `0 19 25 * *` | Trigger auto spending audit for all Pro users |
| `0 18 1 * *` | Generate monthly portfolio performance report, send email digest |

---

## 8. Subscription & Monetisation

### 8.1 Pricing Tiers

| Feature | Free | Pro (₹199/mo) | Elite (₹499/mo) |
|---|---|---|---|
| AI Thesis Generations | 3/month | Unlimited | Unlimited + Priority |
| Spending Audit | 5/month | Unlimited | Unlimited |
| Portfolio Holdings | Up to 10 | Unlimited | Unlimited |
| Real Estate Explorer | Top 5 cities | All cities | All cities + offline report |
| Goal Tracking | Up to 3 goals | Unlimited | Unlimited |
| Real-Time Alerts | 5 alerts max | 50 alerts | Unlimited |
| Daily AI Insights | ✗ | ✓ | ✓ |
| Chat with FinSight | ✗ | 5/day | Unlimited |
| Passive Income Hub | ✗ | ✓ | ✓ |
| Weekly AI Portfolio Review | ✗ | ✗ | ✓ |
| Business Idea Generator | ✗ | ✗ | ✓ |
| WhatsApp Alerts | ✗ | ✗ | ✓ |
| Export CSV / PDF | ✗ | ✓ | ✓ Branded PDF |

---

### 8.2 Payment Integration — Razorpay

- Razorpay Subscription API for recurring billing
- Plan stored in `users.plan` column in Supabase
- `Webhook: razorpay_payment.captured` → update user plan + send confirmation email via Resend
- `Webhook: razorpay_subscription.cancelled` → downgrade to free plan, retain data
- **Trial:** 14-day free Pro trial on signup (no card required)

---

## 9. Development Phases & Roadmap

### Phase 1 — MVP (Weeks 1–6)

> Goal: Working product with core loop — Onboard → Track → AI Thesis → View Portfolio

- **Week 1–2:** Project setup, Supabase schema, Auth (email + Google), middleware, onboarding steps 1–4
- **Week 3–4:** Dashboard, Spending Tracker (add/edit/delete expenses), AI Spending Audit
- **Week 5:** AI Investment Planner with wealth projection graph (Recharts)
- **Week 6:** Portfolio page (manual entry), Goals tracker, Vercel deployment + CI/CD setup

**Deliverable:** Deployed at `finsight.vercel.app`, functional for beta users

---

### Phase 2 — Core Features (Weeks 7–12)

- **Week 7–8:** Real Estate Explorer (Indian cities, price/sqft, EMI calculator)
- **Week 9:** Alerts system (rule-based, in-app + email), Vercel Cron for price checks
- **Week 10:** Passive Income Hub, AI-generated passive income plan
- **Week 11:** Razorpay subscription integration, Free/Pro/Elite plan gating
- **Week 12:** Polish, performance audit, mobile responsiveness, beta user feedback loop

---

### Phase 3 — Intelligence Layer (Weeks 13–18)

- **Week 13–14:** Live market data (NSE/BSE, Gold, Nifty), real-time portfolio P&L
- **Week 15:** Chat with FinSight — conversational Claude chat grounded in user profile
- **Week 16:** Bank SMS parser (auto-categorise expenses from pasted SMS)
- **Week 17:** WhatsApp alert integration (Twilio), push notifications (FCM)
- **Week 18:** Income benchmarking module, peer comparison by city + income bracket

---

### Phase 4 — Growth & Ecosystem (Weeks 19–26)

- Zerodha Kite API integration — auto-import portfolio holdings
- Groww API integration — auto-import MF portfolio
- Hindi language support (i18n with next-intl)
- Mobile app (React Native / Expo — reuse API layer)
- Social goals — share goal milestones (non-financial data only)
- Referral system — 1 month Pro for each referred user who subscribes
- Financial literacy content hub — AI-generated 2-min explainers on SGB, ELSS, XIRR, etc.

---

### 9.1 Implementation Checklist for AI Code Editors

```
[ ]  Next.js 14 App Router with TypeScript strict mode
[ ]  Supabase project init — Auth, DB, Storage, Realtime, Edge Functions
[ ]  RLS policies on ALL tables (user_id = auth.uid())
[ ]  Supabase client: browser (createBrowserClient) + server (createServerClient)
[ ]  middleware.ts: session refresh + route protection + onboarding gate
[ ]  Onboarding: 4-step wizard with progress stepper, Zustand for state
[ ]  Tailwind CSS + shadcn/ui init (dark mode support via class strategy)
[ ]  Recharts for all data visualisations
[ ]  Claude API: streaming enabled for all AI routes
[ ]  Zod validation on all API routes
[ ]  React Query (TanStack) for all data fetching + caching
[ ]  Vercel deployment: preview branches per PR, production on main
[ ]  Environment variables configured (see Section 10)
[ ]  Error tracking: Sentry (free tier)
[ ]  Analytics: PostHog (free tier) — track onboarding funnel, feature usage
[ ]  Vercel Cron: vercel.json with cron job definitions
[ ]  Generated columns in Supabase for P&L, P&L%, day_change_percent
```

---

## 10. Vercel Deployment Configuration

### 10.1 `vercel.json`

```json
{
  "crons": [
    { "path": "/api/cron/market-prices",  "schedule": "*/5 3-10 * * 1-5" },
    { "path": "/api/cron/nav-update",     "schedule": "0 15 * * 1-5"     },
    { "path": "/api/cron/daily-insights", "schedule": "0 2 * * *"        },
    { "path": "/api/cron/alert-checks",   "schedule": "0 16 * * *"       },
    { "path": "/api/cron/realestate",     "schedule": "0 18 * * 0"       }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [{ "key": "X-Content-Type-Options", "value": "nosniff" }]
    }
  ]
}
```

---

### 10.2 Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only — full DB access for server components + crons |
| `ANTHROPIC_API_KEY` | Claude API key — server only, never in client bundle |
| `RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret — server only |
| `RESEND_API_KEY` | Transactional email via Resend |
| `CRON_SECRET` | Secret header to verify Vercel cron authenticity |
| `ALPHA_VANTAGE_KEY` | Stock market data |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics |

---

## 11. Design System & UI Guidelines

### 11.1 Colour Palette

| Token | Value | Usage |
|---|---|---|
| Primary Blue | `#2563EB` | CTA buttons, active states, links, chart primary line |
| Accent Green | `#16A34A` | Positive P&L, goals achieved, success states |
| Warning Amber | `#D97706` | Alerts, overspending warnings, neutral performance |
| Danger Red | `#DC2626` | Negative P&L, critical alerts, errors |
| Dark Slate | `#1E293B` | Headings, primary text |
| Mid Slate | `#475569` | Body text, secondary labels |
| Light BG | `#F8FAFC` | Page background |
| Card BG | `#FFFFFF` | Cards with `border-slate-200` border |

---

### 11.2 Typography

- **Font:** Inter (Google Fonts) — loaded via `next/font/google`
- **Heading sizes:** H1 36px, H2 28px, H3 22px, H4 18px — all `font-bold`
- **Body text:** 14px (`text-sm`) for dashboard data, 16px for reading content
- **Monospace:** JetBrains Mono for all ₹ amounts and numbers in tables

---

### 11.3 Key Component Patterns

- All financial amounts: right-aligned in tables, monospace, coloured by +/−
- All AI-generated content: subtle left border (`border-l-4 border-blue-500`) + light blue bg
- Loading states: Skeleton shimmer for all data cards (use shadcn `Skeleton`)
- Streaming AI text: typewriter effect via word-by-word reveal as Claude streams
- Mobile-first: all dashboards must work on 375px viewport — collapsible sidebar
- Charts: always include a legend, tooltips with ₹ formatted values, empty state illustration

---

## 12. Compliance & Legal Considerations

### 12.1 SEBI Advisory Compliance

> ⚠️ **Important Legal Boundaries**
>
> Monetra is a financial information and planning tool, **NOT** a SEBI Registered Investment Advisor (RIA).
>
> All AI-generated recommendations must include this disclaimer:
> *"This is AI-generated financial information for educational purposes only. It is not personalised investment advice. Please consult a SEBI Registered Investment Advisor before making investment decisions."*
>
> The product **MUST NOT:**
> - Execute trades on behalf of users
> - Accept funds for investment
> - Promise specific returns
> - Provide derivatives or F&O advice without proper licensing
>
> **Future path:** Obtain SEBI RIA license or partner with a SEBI-registered entity to offer formal advisory services.

---

### 12.2 Data Privacy

- All user financial data stored in Supabase with RLS — users can only access their own data
- No selling or sharing of user financial data with third parties
- DPDP Act 2023 (India) + GDPR compliant data handling
- Data deletion: Full account + data purge on request within 30 days
- Encryption: All data encrypted at rest (Supabase default) and in transit (HTTPS only)

---

### 12.3 Required Legal Pages

- `/terms` — Terms of Service including financial information disclaimer
- `/privacy` — Privacy Policy compliant with DPDP Act 2023
- `/disclaimer` — Specific investment disclaimer, regulatory boundaries

---

## 13. Future Roadmap (Post-MVP Vision)

### 13.1 Year 2 Features

- **FinSight Score** — proprietary financial health score (0–850, similar to CIBIL for wealth)
- **Family Finance Mode** — shared dashboard for couples, family financial planning
- **CA Integration** — connect with a chartered accountant for tax filing through the platform
- **Business Finance Module** — for small business owners: cash flow, GST, payroll separation
- **Voice Interface** — Hindi + English voice commands via Web Speech API
- **AI Financial Coach** — weekly 5-minute AI audio brief on user's financial status

---

### 13.2 Potential B2B Pivot

- **FinSight for HR** — employers offer FinSight Pro to employees as a benefit
- **FinSight for Banks** — white-label the AI planner for private bank customers
- **FinSight API** — sell the India real estate + lifestyle-to-investment AI as an API

---

### 13.3 Strategic Moats

1. **Proprietary Tier-2/3 city real estate dataset** — updated weekly — no competitor has this
2. **Behavioural Spending → Investment Bridge** — the "If you ate out less..." feature is deeply viral
3. **India-native AI prompting** — market knowledge baked into system prompts, not generic GPT
4. **User trust through transparency** — all AI calculations shown, SEBI boundaries respected
5. **Network effect** — peer comparison data gets richer with more users in same city + income bracket

---

*— End of Document —*
*Monetra — Product Roadmap v1.0 | Internal Development Document*
