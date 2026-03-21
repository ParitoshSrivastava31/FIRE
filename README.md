# Monetra: Turn Your Lifestyle into a Wealth Strategy

Monetra is India's first AI-native, lifestyle-to-investment personal finance operating system. Built out of a need for highly actionable, India-specific financial guidance, Monetra bridges the gap between passive expense tracking and active wealth creation.

## 🌟 The Core Philosophy & Moat

**The Problem:** Most personal finance apps fall into two disconnected silos: they either just track expenses (guilt-tripping you without offering solutions) or they track investments (assuming you already know what to buy). 

**The Monetra Moat:** Our unique moat is the **"Behavioral Bridge" powered by localized AI**. Monetra doesn't just say "You spent 20% too much on Zomato." It says, *"Cutting your dining spend by ₹3,000 this month and redirecting it to a Parag Parikh Flexi Cap SIP will add ₹8.4L to your home downpayment corpus in 7 years."*
We combine aggressive, strict demographic data collection with a custom-prompted Claude AI engine that intimately understands **India-specific instruments** (ELSS, Section 80C/80CCD, AMFI Mutual Funds, SGBs, NPS, and Tier-2 Real Estate dynamics).

---

## 🚀 Deep Dive: Implemented Features & Customer Benefits

We do not assume value; we calculate it. Every feature in the codebase has been hand-crafted to extract immediate, tangible financial value for the customer.

### 1. The AI Investment Planner (`/planner`)
*   **How it works:** When a user completes the strict onboarding wizard (capturing exact monthly surplus, risk tolerance, city, occupation, and goals), this data is fed into a specialized Claude API endpoint. It streams back a highly structured Markdown thesis.
*   **Customer Benefit:** Replaces a ₹15,000/year human Registered Investment Advisor (RIA). It gives the user an exact, personalized playbook: 
    *   Specific Asset Allocation percentages (e.g., 55% Equity, 20% Debt, 10% Gold).
    *   Exact mutual fund names with their AMFI scheme codes (e.g., Axis ELSS Tax Saver).
    *   Downside risk scenario planning (What happens if the market drops 40%?).
    *   Direct tax optimization playbooks perfectly tailored to their declared salaried/freelance occupation.

### 2. Intelligent Spending Tracker & AI Audit (`/spending`)
*   **How it works:** A dual-purpose dashboard featuring a local expense ledger, categorization logic, visual Recharts (Donut and 6-month Bar trends), and the "AI Audit" engine. When clicked, it aggregates month-to-date category totals and sends them to the NLP engine.
*   **Customer Benefit:** Instead of blindly staring at pie charts, the user gets an instant, readable critique of their cash flow. It gamifies frugality by showing them exactly what future wealth they are sacrificing for current hyper-consumption.

### 3. Unified Portfolio Analytics (`/portfolio`)
*   **How it works:** Users track highly specific Indian assets. We've built custom API proxy routes (`/api/market/stocks` and `/api/market/gold`) using `yahoo-finance2` to fetch real-time data for NSE/BSE tickers and Gold ETF prices. The React frontend computes Live P&L, Invested Amount, and plots a 6-month historical line chart comparing the user's specific portfolio against the Nifty 50 benchmark.
*   **Customer Benefit:** A singular, beautiful dashboard that tracks Net Worth accurately. Users no longer need to jump between Zerodha for stocks, Kuvera for MFs, and Excel for FDs/Gold. 

### 4. Zero-Garbage Data Integrity (Onboarding / `middleware.ts`)
*   **How it works:** The AI is only as good as the context window. During `step-1` and `step-2` of onboarding, we enforce strict client-side UI and schema limits (e.g., max 10 Crore incomes, age bounding 18-80, positive-only numbers, proportionate expense-to-income ratios).
*   **Customer Benefit:** The user immediately trusts the platform because it catches manual errors upfront. It prevents the AI from generating absurd, mathematically impossible investment strategies, ensuring every output feels highly realistic and trustworthy.

### 5. Automated Edge Protections & Rate Limiting (`src/lib/rate-limit.ts`)
*   **How it works:** AI inference is expensive. We wrote a custom in-memory HTTP IP-based rate limiter that protects the `/api/ai/*` routes from malicious spam or free-tier abuse. Further, all AI routes are wrapped in semantic `try-catch` Error Boundaries to catch model timeouts.
*   **Customer Benefit:** If the AI provider goes down, the app doesn't crash. The UI gracefully degrades, returning beautifully formatted fallback mock data or clear error notifications, ensuring the user experience remains premium and uninterrupted.

### 6. Maximum Data Portability & Trust (`/settings`)
*   **How it works:** Users have one-click access to download their entire relational financial history as a CSV, and a fully functional, Supabase-backed "Delete Account" workflow that permanently purges their identity and financial data.
*   **Customer Benefit:** High-income users are deeply skeptical of new fintech apps. By giving them an immediate, transparent exit hatch and data export capability, Monetra proves it cares about Data Privacy Law (DPDP/GDPR) compliance, radically lowering the barrier to entry.

## 🛠 Tech Stack Architecture
- **Frontend:** Next.js 14 App Router (React Server Components), Tailwind CSS, shadcn/ui.
- **Backend/Database:** Supabase (PostgreSQL, Row Level Security, Auth).
- **Intelligence:** Anthropic Claude API (Sonnet) using optimized streaming endpoints.
- **Data Visualization:** Recharts (responsive SVG charting).
- **Market Data Hooks:** Custom route handlers integrating with `yahoo-finance2`.
- **Email Infrastructure:** Direct HTTP integration with Resend REST APIs.

## 📈 The Long Term Vision
Monetra isn't just a dashboard; it is a continuously running financial operating system. Right now, it gives you advice based on your input. In Phase 3, via Cron jobs and email alerting loops, it will automatically tap you on the shoulder when your portfolio drifts from its optimal allocation, when your SIPs need stepping up, or when local real estate in your target city hits an affordable price-per-square-foot.
