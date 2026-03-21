"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Shield,
  Target,
  Zap,
  Map,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  Activity,
  Wallet,
  Check,
  Star,
} from "lucide-react";

const FEATURES = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "AI Investment Thesis",
    description:
      "A conversational intelligence that builds a precise SIP roadmap, projecting decades of wealth from your lifestyle.",
  },
  {
    icon: <Wallet className="w-5 h-5" />,
    title: "Lifestyle-to-Wealth Bridge",
    description:
      "Every habit has a future value. We translate your daily spending into potential net worth over decades.",
  },
  {
    icon: <Map className="w-5 h-5" />,
    title: "Real Estate Explorer",
    description:
      "Deep-dive into Tier 1, 2, and 3 cities across India. Discover yields and granular appreciation data.",
  },
  {
    icon: <Activity className="w-5 h-5" />,
    title: "Live Portfolio Harmony",
    description:
      "Equities, Mutual Funds, NPS, and Gold. A single, breathing dashboard tracking your true net worth.",
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Dream Orchestration",
    description:
      "Set milestones and watch the AI dynamically adjust your allocation to keep you on track.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Passive Income Hub",
    description:
      "Automated dividend strategies, REITs, and P2P lending curation for when your money works without you.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Architect, Mumbai",
    quote:
      "Monetra doesn't just track my money — it calms my financial anxiety and shows me a tangible, serene future.",
  },
  {
    name: "Rahul Agarwal",
    role: "Studio Director, Bangalore",
    quote:
      "I finally understand the 12-year impact of my spending habits, wrapped in an experience that feels incredibly premium.",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isInView };
}

function Section({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-premium ${className}`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-hidden relative font-sans">

      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="orb bg-[var(--gold)] w-[500px] h-[500px] top-[-5%] left-[-5%] animate-drift" style={{ animationDuration: '30s' }} />
        <div className="orb bg-[var(--blue)] w-[400px] h-[400px] bottom-[10%] right-[-5%] animate-drift" style={{ animationDelay: '-8s', animationDuration: '35s' }} />
        <div className="orb bg-[var(--emerald)] w-[350px] h-[350px] top-[40%] left-[50%] animate-drift" style={{ animationDelay: '-15s', animationDuration: '28s', opacity: 0.15 }} />
      </div>

      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-50 glass-nav transition-all duration-500">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold)]/70 flex items-center justify-center group-hover:shadow-[0_0_16px_var(--gold-glow)] transition-all duration-500">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-serif text-xl tracking-tight text-[var(--text-main)]">Monetra</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-[13px] font-medium text-[var(--text-sec)] hover:text-[var(--text-main)] transition-colors duration-300">Features</Link>
            <Link href="#pricing" className="text-[13px] font-medium text-[var(--text-sec)] hover:text-[var(--text-main)] transition-colors duration-300">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] font-medium text-[var(--text-sec)] hover:text-[var(--text-main)] transition-colors duration-300 px-3 py-2">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-primary text-[13px] !px-4 !py-2 rounded-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative z-10 pt-32 pb-20 px-6 flex flex-col items-center text-center min-h-[90vh] justify-center">

        <div
          className={`inline-flex items-center gap-2 mb-6 glass-panel px-3.5 py-1.5 rounded-full transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] animate-glow-pulse" />
          <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
            AI-Powered Finance
          </span>
        </div>

        <h1
          className={`font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[80px] text-[var(--text-main)] leading-[1.08] tracking-[-0.02em] max-w-4xl mx-auto text-balance transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          Where your lifestyle
          <br />
          meets{" "}
          <span className="relative inline-block">
            <span className="relative z-10 italic gradient-text from-[var(--gold)] via-[var(--blue)] to-[var(--emerald)]">
              infinite potential
            </span>
            <div className="absolute -inset-2 blur-2xl opacity-15 bg-gradient-to-r from-[var(--gold)] via-[var(--blue)] to-[var(--emerald)] z-0 animate-breathe" />
          </span>
        </h1>

        <p
          className={`mt-6 text-lg text-[var(--text-sec)] max-w-xl mx-auto leading-relaxed font-light transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          A deeply sensory, AI-driven financial planner that translates your habits into a living architecture of growing wealth.
        </p>

        {/* Central action bar */}
        <div
          className={`mt-10 w-full max-w-xl relative group z-20 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <div className="absolute -inset-[2px] bg-gradient-to-r from-[var(--gold)] via-[var(--blue)] to-[var(--emerald)] rounded-2xl opacity-0 group-hover:opacity-20 group-focus-within:opacity-30 transition-opacity duration-700 blur-sm" />
          <div className="relative flex items-center glass-panel rounded-xl p-1.5 transition-all duration-500 focus-within:border-[var(--border-light)]">
            <div className="pl-3 pr-1">
              <Sparkles className="w-4 h-4 text-[var(--gold)]" />
            </div>
            <input
              type="text"
              placeholder="Describe your vision (e.g., 'A home in the mountains by 45')"
              className="w-full bg-transparent border-none outline-none text-[var(--text-main)] placeholder-[var(--text-muted)] text-sm px-2 py-3 font-light"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Link
              href={`/signup?vision=${encodeURIComponent(searchValue)}`}
              className="bg-[var(--text-main)] text-[var(--background)] p-3 rounded-lg hover:scale-105 transition-all duration-300 flex items-center justify-center shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Social proof */}
        <div className={`mt-8 flex items-center gap-4 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex -space-x-2">
            {["bg-gradient-to-br from-[var(--gold)] to-[var(--emerald)]", "bg-gradient-to-br from-[var(--blue)] to-[var(--gold)]", "bg-gradient-to-br from-[var(--emerald)] to-[var(--blue)]"].map((bg, i) => (
              <div key={i} className={`w-7 h-7 rounded-full ${bg} border-2 border-[var(--background)] flex items-center justify-center text-[9px] font-bold text-white`}>
                {["PS", "RA", "AK"][i]}
              </div>
            ))}
          </div>
          <p className="text-[12px] text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-sec)]">2,400+</span> people building wealth with Monetra
          </p>
        </div>
      </section>

      {/* ── Dashboard Preview ── */}
      <Section className="relative z-10 px-6 pb-28">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-gradient-to-tr from-[var(--blue)] to-[var(--gold)] blur-[100px] opacity-8 dark:opacity-15 pointer-events-none" />

          <div className="glass-panel p-1.5 rounded-2xl overflow-hidden shadow-2xl relative border-[var(--border-light)]">
            <div className="bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-xl border border-[var(--border)] overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--red)] opacity-60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--gold)] opacity-60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--emerald)] opacity-60" />
                </div>
                <div className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] animate-pulse" />
                  Live Dashboard
                </div>
              </div>
              {/* Content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1 space-y-5">
                  <div>
                    <p className="section-label mb-1">True Net Worth</p>
                    <p className="font-serif text-3xl text-[var(--text-main)]">₹1.42Cr</p>
                    <p className="text-xs text-[var(--emerald)] flex items-center gap-1 mt-1.5 font-medium">
                      <TrendingUp className="w-3.5 h-3.5" /> +2.4% this month
                    </p>
                  </div>
                  <div className="glass-card p-3.5 border-l-2 border-l-[var(--gold)]">
                    <p className="section-label text-[var(--gold)] mb-1.5">AI Insight</p>
                    <p className="text-xs font-light text-[var(--text-sec)] leading-relaxed">
                      Your weekend dining surplus of ₹12,000 could accelerate your <strong className="text-[var(--text-main)]">Mountain Home SIP</strong> by 14 months.
                    </p>
                  </div>
                </div>
                <div className="md:col-span-2 relative min-h-[180px] flex items-end">
                  <div className="w-full h-full absolute inset-0 flex items-end justify-between px-3 pb-3 gap-1">
                    {[35, 50, 40, 65, 58, 80, 74, 95, 88, 100].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md relative overflow-hidden" style={{ height: `${h}%` }}>
                        <div
                          className="absolute inset-0 rounded-t-md"
                          style={{
                            background: `linear-gradient(to top, var(--blue-dim), var(--blue))`,
                            opacity: 0.15 + (h / 200),
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <Section>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[var(--text-main)] mb-4 tracking-[-0.02em]">
                A quiet mechanism for <span className="italic text-[var(--gold)]">growth</span>
              </h2>
              <p className="text-base text-[var(--text-sec)] font-light leading-relaxed">
                Every tool is designed to feel effortless, not overwhelming. Intelligence should be calm.
              </p>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, idx) => (
              <Section key={idx} delay={idx * 80}>
                <div className="glass-card glass-panel-hover p-6 rounded-2xl group cursor-default relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--glow-gold)] rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700" />
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-hover)] flex items-center justify-center mb-4 border border-[var(--border)] text-[var(--gold)] group-hover:bg-[var(--gold-dim)] group-hover:border-[var(--gold-glow)] transition-all duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-[15px] font-semibold text-[var(--text-main)] mb-2">{feature.title}</h3>
                  <p className="text-[13px] text-[var(--text-sec)] font-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Section>
            <div className="grid md:grid-cols-2 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="glass-card p-7 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--glow-gold)] rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
                  <div className="flex gap-0.5 mb-4 text-[var(--gold)]">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-[15px] text-[var(--text-main)] leading-relaxed mb-5 font-light">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--emerald)] flex items-center justify-center text-white text-[10px] font-bold">
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[var(--text-main)]">{t.name}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Section>
            <div className="text-center mb-14 max-w-2xl mx-auto">
              <h2 className="font-serif text-3xl sm:text-4xl text-[var(--text-main)] mb-3 tracking-[-0.02em]">
                Simple, transparent pricing
              </h2>
              <p className="text-base text-[var(--text-sec)] font-light">
                Start free. Upgrade when you need unlimited intelligence.
              </p>
            </div>
          </Section>

          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            <Section>
              <div className="glass-card p-7 rounded-2xl flex flex-col h-full">
                <h3 className="text-xl font-serif text-[var(--text-main)] mb-1">Foundation</h3>
                <p className="section-label mb-5">Free forever</p>
                <div className="font-serif text-4xl mb-6 text-[var(--text-main)]">₹0<span className="text-sm text-[var(--text-sec)] font-sans font-normal">/mo</span></div>
                <ul className="space-y-3 mb-8 flex-1">
                  {["3 AI thesis generations/month", "Basic portfolio syncing", "Top 5 cities — Real Estate"].map((item) => (
                    <li key={item} className="flex gap-2.5 text-[13px] text-[var(--text-sec)]">
                      <Check className="w-4 h-4 text-[var(--emerald)] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="btn-ghost text-center rounded-xl">
                  Start Free
                </Link>
              </div>
            </Section>

            <Section delay={100}>
              <div className="glass-card p-7 rounded-2xl flex flex-col relative overflow-hidden h-full border-[var(--border-light)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold-dim)] to-[var(--blue-dim)] opacity-30 pointer-events-none" />
                <div className="absolute top-0 right-0 px-3 py-1 bg-[var(--text-main)] text-[var(--background)] text-[9px] uppercase tracking-widest font-bold rounded-bl-xl z-10">
                  Popular
                </div>
                <div className="relative z-10 flex flex-col h-full">
                  <h3 className="text-xl font-serif text-[var(--text-main)] mb-1">Pro</h3>
                  <p className="section-label text-[var(--gold)] mb-5">Unlimited intelligence</p>
                  <div className="font-serif text-4xl mb-6 text-[var(--text-main)]">₹199<span className="text-sm text-[var(--text-sec)] font-sans font-normal">/mo</span></div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {["Unlimited AI thesis & daily insights", "Live granular portfolio sync", "All India Real Estate mapping", "Priority AI processing"].map((item) => (
                      <li key={item} className="flex gap-2.5 text-[13px] text-[var(--text-main)]">
                        <Check className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup?plan=pro" className="btn-primary text-center rounded-xl">
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <Section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-[var(--text-main)] mb-6 tracking-[-0.02em]">
            Start building wealth today
          </h2>
          <p className="text-base text-[var(--text-sec)] font-light mb-8 max-w-md mx-auto">
            Join thousands turning their lifestyle into a strategic, intelligent wealth architecture.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 btn-primary text-base !px-6 !py-3 rounded-xl"
          >
            <span>Create your account</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
          </Link>
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-8 px-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--gold)] to-[var(--gold)]/70 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="font-serif text-base tracking-tight">Monetra</span>
          </div>
          <div className="flex gap-6 text-[12px] text-[var(--text-muted)]">
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors duration-300">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors duration-300">Terms</Link>
            <Link href="/disclaimer" className="hover:text-[var(--text-main)] transition-colors duration-300">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
