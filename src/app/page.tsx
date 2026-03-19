"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Sparkles,
  Shield,
  Target,
  PieChart,
  Zap,
  Map,
  Bell,
  ArrowRight,
  Check,
  ChevronDown,
  Star,
  Activity,
  Wallet,
  BarChart2,
} from "lucide-react";

// Ticker Items
const TICKER_ITEMS = [
  { label: "NIFTY 50", value: "23,452.10", change: "+0.84%" },
  { label: "SENSEX", value: "77,301.45", change: "+0.72%" },
  { label: "GOLD", value: "₹74,250/10g", change: "+0.31%" },
  { label: "USD/INR", value: "₹83.42", change: "-0.12%" },
  { label: "HDFC BANK", value: "₹1,598.70", change: "+1.42%" },
  { label: "RELIANCE", value: "₹2,854.90", change: "+0.65%" },
  { label: "INFOSYS", value: "₹1,712.30", change: "-0.23%" },
  { label: "NIFTY MIDCAP", value: "51,240.85", change: "+1.04%" },
];

const FEATURES = [
  {
    icon: <Sparkles size={22} />,
    color: "blue",
    title: "AI Investment Thesis",
    description:
      "Claude AI builds your personalised investment plan — named funds, exact SIP amounts, and a 30-year wealth projection graph.",
  },
  {
    icon: <Wallet size={22} />,
    color: "gold",
    title: "Lifestyle-to-Wealth Bridge",
    description:
      "\"You spend ₹16K dining out. Redirect ₹8K → ELSS = ₹42L in 15 years.\" Monetra turns spending habits into investable insight.",
  },
  {
    icon: <TrendingUp size={22} />,
    color: "emerald",
    title: "Live Portfolio Tracker",
    description:
      "Real-time P&L, XIRR, and day-change for stocks, mutual funds, gold, FDs, and NPS — all in one view vs Nifty 50.",
  },
  {
    icon: <Map size={22} />,
    color: "gold",
    title: "India Real Estate Explorer",
    description:
      "Price/sqft, rental yield, and YoY appreciation for every locality in Tier-1, 2, and 3 cities. No other tool has this.",
  },
  {
    icon: <Target size={22} />,
    color: "blue",
    title: "Goal Tracker",
    description:
      "Set goals, track milestones, and get AI acceleration suggestions. Slide the SIP amount and watch your target year shift in real-time.",
  },
  {
    icon: <Zap size={22} />,
    color: "emerald",
    title: "Passive Income Hub",
    description:
      "AI-curated dividend stocks, REITs, P2P lending, and FD laddering strategies based on your investable surplus.",
  },
  {
    icon: <Bell size={22} />,
    color: "gold",
    title: "Smart Alerts",
    description:
      "Stock price alerts, SIP reminders, goal milestones, and rebalancing triggers — delivered in-app, email, and WhatsApp.",
  },
  {
    icon: <Shield size={22} />,
    color: "blue",
    title: "India-Native & Compliant",
    description:
      "Built for NSE/BSE, AMFI, SGB, NPS, PPF, and SEBI-compliant advice boundaries. Not a generic global tool repackaged.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    tagline: "Get started, no card required",
    cta: "Start for Free",
    ctaHref: "/signup",
    highlight: false,
    features: [
      "3 AI thesis generations/month",
      "5 spending audits/month",
      "Up to 10 portfolio holdings",
      "Top 5 cities — Real Estate",
      "Up to 3 goals",
      "5 price alerts max",
    ],
    missing: ["Daily AI Insights", "Chat with FinSight", "Passive Income Hub", "CSV Export"],
  },
  {
    name: "Pro",
    price: "₹199",
    period: "/month",
    tagline: "For serious wealth builders",
    cta: "Start 14-Day Free Trial",
    ctaHref: "/signup?plan=pro",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Unlimited AI thesis generations",
      "Unlimited spending audits",
      "Unlimited portfolio holdings",
      "All cities — Real Estate",
      "Unlimited goals",
      "50 price alerts",
      "Daily AI Insights",
      "Chat with FinSight (5/day)",
      "Passive Income Hub",
      "CSV Export",
    ],
    missing: ["Weekly AI Portfolio Review", "Branded PDF", "WhatsApp Alerts"],
  },
  {
    name: "Elite",
    price: "₹499",
    period: "/month",
    tagline: "For HNI and power users",
    cta: "Go Elite",
    ctaHref: "/signup?plan=elite",
    highlight: false,
    features: [
      "Everything in Pro",
      "Weekly AI Portfolio Review",
      "Business Idea Generator",
      "Unlimited chat sessions",
      "Branded PDF reports",
      "Offline Real Estate reports",
      "WhatsApp Alerts",
      "Priority AI processing",
      "Angel Investing insights (₹10L+ surplus)",
    ],
    missing: [],
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    city: "Bangalore",
    occupation: "Software Engineer",
    plan: "Pro",
    avatar: "PS",
    quote:
      "Monetra showed me I was spending ₹22K/month on food delivery. Redirecting just half of that into a Nifty 50 SIP — I'm on track for ₹1.4Cr in 12 years. Genuinely life-changing.",
    stars: 5,
  },
  {
    name: "Rahul Agarwal",
    city: "Kanpur",
    occupation: "Business Owner",
    plan: "Elite",
    avatar: "RA",
    quote:
      "The real estate explorer for Tier-2 cities is unreal. I found a locality in Kanpur with 11% YoY appreciation that I had no idea about. Bought a flat, now earning 6.2% rental yield.",
    stars: 5,
  },
  {
    name: "Meera Nair",
    city: "Kochi",
    occupation: "Freelancer",
    plan: "Pro",
    avatar: "MN",
    quote:
      "As a freelancer, my income is irregular. Monetra's dynamic surplus calculator accounts for that — it tells me exactly how much to invest each month based on what I actually earned.",
    stars: 5,
  },
];

const FAQS = [
  {
    q: "Is Monetra a SEBI Registered Investment Advisor?",
    a: "No. Monetra is a financial information and planning tool. All AI-generated content is for educational purposes and is not personalised investment advice. We clearly disclose SEBI boundaries in every AI output. Always consult a SEBI RIA before making investment decisions.",
  },
  {
    q: "What makes Monetra different from ET Money, Groww, or INDmoney?",
    a: "Those apps execute transactions. Monetra is your planning OS — it tells you *what* to invest, *why*, and *how much*, based on your spending habits and goals. We also cover Tier-2/3 city real estate data that no competitor has.",
  },
  {
    q: "Is my financial data safe?",
    a: "Yes. All data is stored in Supabase with Row Level Security — you can only access your own data. We are DPDP Act 2023 and GDPR compliant. We do not sell or share your data with any third party.",
  },
  {
    q: "Do I need to connect my bank account?",
    a: "No. You enter your income and expenses manually (or paste a bank statement). Future versions will support Zerodha Kite and Groww API auto-import for portfolio holdings.",
  },
  {
    q: "What is the 14-day Pro trial?",
    a: "Sign up for free and get full Pro plan features for 14 days — no credit card required. At the end of the trial, you can choose to upgrade or continue on the Free plan.",
  },
  {
    q: "Which AI model powers the investment thesis?",
    a: "Monetra uses Claude (Anthropic) via a custom system prompt trained on India-specific finance: NSE/BSE equities, AMFI mutual funds, SGB, NPS, PPF, and SEBI compliance requirements.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <button
        className="w-full flex items-center justify-between text-left py-5 gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-[var(--text-main)] text-[15px] leading-snug">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-[var(--text-muted)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-60 pb-5" : "max-h-0"}`}
      >
        <p className="text-[var(--text-sec)] text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, color, title, description }: (typeof FEATURES)[0]) {
  const colorMap: Record<string, string> = {
    blue: "bg-[var(--blue-dim)] text-[var(--blue)]",
    gold: "bg-[var(--gold-dim)] text-[var(--gold)]",
    emerald: "bg-[var(--emerald-dim)] text-[var(--emerald)]",
  };
  return (
    <div className="group bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4 hover:border-[var(--border-light)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-[var(--text-main)] text-[15px] mb-2">{title}</h3>
        <p className="text-[var(--text-sec)] text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const tickerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl text-[var(--gold)] tracking-tight">Monetra</span>
            <span className="hidden sm:inline-block text-[10px] font-bold tracking-[0.15em] uppercase text-[var(--text-muted)] border border-[var(--border)] rounded-full px-2 py-0.5">
              Beta
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-[var(--text-sec)] hover:text-[var(--text-main)] transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-[var(--text-sec)] hover:text-[var(--text-main)] transition-colors">Pricing</a>
            <a href="#faq" className="text-sm font-medium text-[var(--text-sec)] hover:text-[var(--text-main)] transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-[var(--text-sec)] hover:text-[var(--text-main)] transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 bg-[var(--gold)] text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 hover:shadow-lg hover:-translate-y-[1px] transition-all"
            >
              Get Started
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[var(--blue-dim)] rounded-full blur-3xl opacity-60 animate-drift" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-[var(--gold-dim)] rounded-full blur-3xl opacity-50 animate-drift" style={{ animationDelay: "4s" }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-full px-4 py-2 mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)]">
              India&apos;s First Lifestyle-to-Investment AI
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-[var(--text-main)] leading-[1.05] tracking-tight mb-6 text-balance">
            Turn your lifestyle into a{" "}
            <span className="text-[var(--gold)] relative">
              wealth strategy
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none">
                <path d="M2 6C50 2 100 1 150 3C200 5 250 4 298 2" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-sec)] max-w-2xl mx-auto leading-relaxed mb-10">
            Monetra audits your spending, builds a personalised AI investment thesis, and tracks your wealth across stocks, mutual funds, gold, and real estate — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--gold)] text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5 transition-all text-base"
            >
              Start for Free — No card needed
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--card)] border border-[var(--border)] text-[var(--text-main)] font-semibold px-8 py-4 rounded-xl hover:border-[var(--border-light)] hover:shadow-md transition-all text-base"
            >
              Sign In
            </Link>
          </div>

          <p className="mt-5 text-xs text-[var(--text-muted)] font-medium">
            14-day Pro trial · No credit card required · DPDP-compliant
          </p>

          {/* Hero Card Preview */}
          <div className="mt-16 max-w-3xl mx-auto relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-transparent to-[var(--background)] z-10 pointer-events-none bottom-0 top-auto h-32" />
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
              {/* Mock Dashboard Header */}
              <div className="bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
                <span className="font-serif text-lg text-[var(--gold)]">Monetra</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--emerald)] animate-pulse" />
                  <span className="text-xs font-medium text-[var(--text-muted)]">Market Open</span>
                </div>
              </div>
              {/* Mock KPI Cards */}
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Net Worth", val: "₹1.24Cr", chg: "+2.4%", pos: true },
                  { label: "Portfolio", val: "₹84.6L", chg: "+1.8%", pos: true },
                  { label: "Monthly Cashflow", val: "₹1.8L", chg: "+12%", pos: true },
                  { label: "Goals On-Track", val: "4/5", chg: "+1 this month", pos: true },
                ].map((item) => (
                  <div key={item.label} className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
                    <p className="text-[9px] font-bold tracking-widest uppercase text-[var(--text-muted)] mb-2">{item.label}</p>
                    <p className="font-mono text-lg font-medium text-[var(--text-main)]">{item.val}</p>
                    <p className="text-[11px] font-semibold text-[var(--emerald)] mt-1">{item.chg}</p>
                  </div>
                ))}
              </div>
              {/* Mock AI Insight */}
              <div className="px-6 pb-6">
                <div className="bg-[var(--blue-dim)] border border-[var(--blue)]/20 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shrink-0">
                    <Sparkles size={14} className="text-[var(--blue)]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--blue)] mb-1">AI Insight</p>
                    <p className="text-sm text-[var(--text-sec)] leading-relaxed">
                      Your dining spend is <span className="font-semibold text-[var(--text-main)]">22% above</span> your 3-month average. Redirecting{" "}
                      <span className="font-semibold text-[var(--text-main)]">₹3,000</span> to your Home Goal SIP would add{" "}
                      <span className="font-semibold text-[var(--emerald)]">₹8.4L</span> to your corpus in 12 years.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Ticker */}
      <div className="border-y border-[var(--border)] bg-[var(--card)] overflow-hidden py-3">
        <div className="flex gap-0 animate-[ticker_30s_linear_infinite]" style={{ width: "max-content" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-6 border-r border-[var(--border)] last:border-0 shrink-0">
              <span className="text-[11px] font-bold text-[var(--text-muted)] tracking-wider uppercase">{item.label}</span>
              <span className="font-mono text-sm font-medium text-[var(--text-main)]">{item.value}</span>
              <span className={`text-[11px] font-bold ${item.change.startsWith("+") ? "text-[var(--emerald)]" : "text-[var(--red)]"}`}>
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Social Proof Bar */}
      <section className="py-10 px-4 sm:px-6 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-14">
          {[
            { n: "12,000+", l: "Beta Signups" },
            { n: "₹850Cr+", l: "Portfolio Tracked" },
            { n: "4.9★", l: "Early User Rating" },
            { n: "50+", l: "Indian Cities" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-serif text-3xl sm:text-4xl text-[var(--text-main)] font-bold">{s.n}</p>
              <p className="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--gold)] mb-4">What Monetra Does</p>
            <h2 className="font-serif text-4xl sm:text-5xl text-[var(--text-main)] mb-5">
              Everything in one wealth OS
            </h2>
            <p className="text-[var(--text-sec)] max-w-xl mx-auto text-lg leading-relaxed">
              Not just another expense tracker or investment app — Monetra bridges both with real-time AI and India-native data.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* AI Demo Section */}
      <section className="py-24 px-4 sm:px-6 bg-[var(--card)] border-y border-[var(--border)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--blue-dim)] rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[var(--gold-dim)] rounded-full blur-3xl opacity-30" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--blue)] mb-4">AI Investment Planner</p>
            <h2 className="font-serif text-4xl sm:text-5xl text-[var(--text-main)] mb-4">
              Your thesis, in seconds
            </h2>
            <p className="text-[var(--text-sec)] max-w-lg mx-auto">
              Enter your income and goals. Monetra&apos;s AI generates a complete, personalised investment strategy — not generic advice.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Panel */}
            <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-sm text-[var(--text-muted)] tracking-widest uppercase">Your Profile</h3>
              {[
                { l: "Monthly Income", v: "₹1,20,000" },
                { l: "Monthly Expenses", v: "₹74,000" },
                { l: "Investable Surplus", v: "₹46,000" },
                { l: "Risk Profile", v: "Moderate" },
                { l: "Primary Goal", v: "Home in 7 years" },
              ].map((row) => (
                <div key={row.l} className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
                  <span className="text-sm text-[var(--text-sec)]">{row.l}</span>
                  <span className="font-mono text-sm font-medium text-[var(--text-main)]">{row.v}</span>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 bg-[var(--gold)] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all text-sm mt-2">
                <Sparkles size={14} />
                Generate My Investment Thesis
              </button>
            </div>

            {/* Output Panel */}
            <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--blue-dim)] to-transparent opacity-30 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[var(--blue)] animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--blue)]">AI Thesis — Generating...</span>
                </div>
                <div className="space-y-3 text-sm text-[var(--text-sec)] leading-relaxed">
                  <p><span className="font-semibold text-[var(--text-main)]">Executive Summary:</span> Based on your ₹46,000 surplus and Moderate risk profile, here is your personalised wealth strategy targeting a ₹40L home down payment by 2031.</p>
                  <div className="border-l-2 border-[var(--blue)] pl-3">
                    <p className="font-semibold text-[var(--text-main)] mb-1">Recommended Allocation</p>
                    <p>• Equity MFs (SIP): ₹25,000/month — Parag Parikh Flexi Cap, HDFC Midcap</p>
                    <p>• Gold ETF: ₹5,000/month — SBI Gold ETF</p>
                    <p>• Liquid Fund: ₹10,000/month — Emergency buffer</p>
                    <p>• PPF: ₹6,000/month — Tax saving + 80C</p>
                  </div>
                  <div className="border-l-2 border-[var(--emerald)] pl-3">
                    <p className="font-semibold text-[var(--emerald)] mb-1">10-Year Projection</p>
                    <p>Conservative (7% CAGR): <span className="font-mono font-bold text-[var(--text-main)]">₹78.4L</span></p>
                    <p>Moderate (11% CAGR): <span className="font-mono font-bold text-[var(--emerald)]">₹1.04Cr</span></p>
                    <p>Aggressive (15% CAGR): <span className="font-mono font-bold text-[var(--gold)]">₹1.38Cr</span></p>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] italic border-t border-[var(--border)] pt-2">This is AI-generated financial information for educational purposes only. Not personalised investment advice. Consult a SEBI RIA before investing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--gold)] mb-4">User Stories</p>
            <h2 className="font-serif text-4xl sm:text-5xl text-[var(--text-main)]">
              Real people. Real results.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4 hover:border-[var(--border-light)] hover:shadow-lg transition-all">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={13} className="text-[var(--gold)] fill-[var(--gold)]" />
                  ))}
                </div>
                <p className="text-sm text-[var(--text-sec)] leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-[var(--border)]">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--emerald)] flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--text-main)]">{t.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{t.occupation} · {t.city} · {t.plan} Plan</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 bg-[var(--card)] border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--gold)] mb-4">Pricing</p>
            <h2 className="font-serif text-4xl sm:text-5xl text-[var(--text-main)] mb-4">
              Transparent, no-nonsense pricing
            </h2>
            <p className="text-[var(--text-sec)] max-w-md mx-auto">Start free. Upgrade when you&apos;re ready. No surprise charges.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-7 flex flex-col gap-5 transition-all ${
                  plan.highlight
                    ? "border-[var(--gold)] bg-[var(--gold-glow)] shadow-xl scale-[1.02]"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--border-light)] hover:shadow-md"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[var(--gold)] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-[var(--text-main)] text-lg">{plan.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{plan.tagline}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-4xl font-bold text-[var(--text-main)]">{plan.price}</span>
                  <span className="text-sm text-[var(--text-muted)]">{plan.period}</span>
                </div>
                <Link
                  href={plan.ctaHref}
                  className={`w-full text-center font-bold text-sm py-3 rounded-xl transition-all ${
                    plan.highlight
                      ? "bg-[var(--gold)] text-white hover:opacity-90 hover:shadow-lg"
                      : "bg-[var(--card)] border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--border-light)] hover:shadow-sm"
                  }`}
                >
                  {plan.cta}
                </Link>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--text-sec)]">
                      <Check size={14} className="text-[var(--emerald)] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--text-muted)] opacity-40 line-through">
                      <Check size={14} className="shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--gold)] mb-4">FAQ</p>
            <h2 className="font-serif text-4xl sm:text-5xl text-[var(--text-main)]">
              Common questions
            </h2>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl px-6">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[var(--gold-dim)] rounded-full blur-3xl opacity-40" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <Activity size={16} className="text-[var(--emerald)]" />
            <span className="text-sm font-medium text-[var(--text-muted)]">Join 12,000+ users building wealth smarter</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl text-[var(--text-main)] mb-5 leading-tight">
            Your financial future starts <span className="text-[var(--gold)]">today</span>
          </h2>
          <p className="text-[var(--text-sec)] mb-10 text-lg">
            3 minutes to onboard. Lifetime of clarity. Free forever to start.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--gold)] text-white font-bold px-10 py-4 rounded-xl hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5 transition-all text-base"
            >
              Start Your Free Account
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--card)] py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div>
              <span className="font-serif text-2xl text-[var(--gold)]">Monetra</span>
              <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-xs leading-relaxed">
                India&apos;s first lifestyle-to-investment AI finance planner. Not a SEBI Registered Investment Advisor.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[var(--text-sec)]">
              <Link href="/login" className="hover:text-[var(--text-main)] transition-colors">Sign In</Link>
              <Link href="/signup" className="hover:text-[var(--text-main)] transition-colors">Sign Up</Link>
              <Link href="#pricing" className="hover:text-[var(--text-main)] transition-colors">Pricing</Link>
              <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
              <Link href="/disclaimer" className="hover:text-[var(--text-main)] transition-colors">Disclaimer</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
            <p>© 2025 Monetra. All rights reserved. India-first AI finance OS.</p>
            <p>Investments are subject to market risk. Read all scheme documents carefully.</p>
          </div>
        </div>
      </footer>

      {/* Ticker animation keyframe */}
      <style jsx global>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
