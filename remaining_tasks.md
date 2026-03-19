# Remaining Implementation Tasks — Monetra

Based on your [finsight_ai_roadmap.md](file:///c:/Users/parit/OneDrive/Documents/Projects/FIRE/monetra/finsight_ai_roadmap.md) and the current state of the codebase, we have successfully completed the frontend layout and mock UI for all the core dashboard pages. 

The following items are the pending tasks required to turn these mock layouts into a fully functional application, organized by architectural layer and priority.

## 1. Authentication & Middleware (Phase 1)
> **Note on implementation:** Set up all backend logic and functionality, but keep route protection disabled/mocked during development to avoid having to log in constantly. Wire it up fully only during the final phase of completion.
Currently, auth is mocked in the dashboard header and the onboarding directory exists but needs business logic.
- [ ] **Supabase Setup:** Initialize the Supabase project, get the keys, and configure `NEXT_PUBLIC_SUPABASE_URL` and anon keys.
- [ ] **Supabase Clients:** Implement SSR-compatible Supabase clients (`@supabase/ssr` or `auth-helpers-nextjs`) in a `src/lib/supabase` folder.
- [ ] **Auth Pages:** Build functional `/login` and `/signup` pages using Supabase Auth (Email + Google OAuth).
- [ ] **Middleware Guard:** Implement `middleware.ts` to protect `/dashboard/*` routes and redirect unauthenticated users.
- [ ] **Onboarding Gate:** Ensure authenticated users without `onboarding_complete` are forced into the `/onboarding` 4-step flow.
- [ ] **Zustand State:** Add Zustand for handling the multi-step onboarding state before submitting to Supabase.

## 2. Database Schema & Data Fetching (Phase 1 & 2)
The UI currently relies on hardcoded `const` arrays. We need to define the schema and wire it up.
- [ ] **Execute SQL schema migrations:** Create the tables defined in the roadmap (`users`, `expenses`, `goals`, `portfolio_holdings`, `sip_plans`, `ai_theses`, `alerts`, `real_estate_data`).
- [ ] **Row Level Security (RLS):** Apply Supabase RLS policies so users only see their own rows.
- [ ] **React Query Setup:** Install `@tanstack/react-query` and configure the provider in [layout.tsx](file:///c:/Users/parit/OneDrive/Documents/Projects/FIRE/monetra/src/app/layout.tsx) for client-side caching.
- [ ] **Wire up Dashboard Pages:** Replace mock arrays in Spending, Portfolio, Goals, Real Estate, Alerts, and Passive income with `useQuery` hooks fetching from Supabase.

## 3. AI Integration — Claude API (Phase 3)
> **Note on quality:** Ensure the AI integration is "world-class" and real-time, providing actionable value grounded in live, real-world data (market APIs and Indian real estate feeds).
The AI features require backend API routes that interact with Anthropic's Claude.
- [ ] **Setup `src/lib/anthropic`:** Create the Claude client wrapper.
- [ ] **API Route - Investment Thesis:** Build `POST /api/ai/thesis` to stream the AI response for the `/planner` page.
- [ ] **API Route - Spending Audit:** Build `POST /api/ai/audit` for the `/spending` page.
- [ ] **API Route - Gen Advice:** Build `POST /api/ai/advice` for chat functionalities.
- [ ] **Database caching:** Wire up the AI routes to save generated theses into the `ai_theses` Supabase table to avoid redundant API calls.

## 4. External Data & Cron Jobs (Phase 2 & 3)
- [ ] **Market APIs:** Integrate Alpha Vantage or Yahoo Finance for real-time stock prices and AMFI for Mutual Fund NAVs.
- [ ] **Vercel Cron Implementation:** Create the actual Next.js API endpoints that Vercel invokes (e.g., `/api/cron/market-prices`, `/api/cron/daily-insights`).
- [ ] **Real Estate Data Updater:** Create a scraping or API-based ingestion script to update the `real_estate_data` per city/locality weekly.

## 5. Subscriptions & Monetisation (Phase 2)
- [ ] **Razorpay Integration:** Set up the Razorpay SDK to handle Pro/Elite subscriptions on the Settings page.
- [ ] **Webhooks:** Create `/api/webhooks/razorpay` to listen for `payment.captured` and `subscription.cancelled` events and update the `users.plan` column.

## 6. UI Polish & Compliance (Ongoing)
- [ ] **shadcn/ui Initialization:** Start adding specific interactive generic components from the shadcn registry (modals, toasts, forms).
- [ ] **Legal Pages (Compliance):** Create `/terms`, `/privacy`, and `/disclaimer` statically to satisfy SEBI compliance notes.
- [ ] **Email Integration:** Set up Resend (`RESEND_API_KEY`) for transaction emails and weekly portfolio digests.

---

### Suggested Next Steps:
The most logical next step to make the application functional is **Step 1 & 2: Supabase Initialization, Auth, and Database setup.** This is required before we can save user data or generate AI theses.
