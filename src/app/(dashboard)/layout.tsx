'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Sparkles,
  Grid3x3,
  Bell,
  Settings,
  Map,
  Target,
  Zap,
  X,
  MessageSquare,
  Send,
  ChevronRight,
} from 'lucide-react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { OfflineBanner } from '@/components/mobile/offline-banner';
import { haptic } from '@/lib/native/haptics';

// ── Desktop sidebar navigation ──────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { href: '/spending', icon: <Wallet size={18} />, label: 'Spending' },
  { href: '/portfolio', icon: <TrendingUp size={18} />, label: 'Portfolio' },
  { href: '/planner', icon: <Sparkles size={18} />, label: 'AI Planner' },
  { href: '/real-estate', icon: <Map size={18} />, label: 'Real Estate' },
  { href: '/goals', icon: <Target size={18} />, label: 'Goals' },
  { href: '/alerts', icon: <Bell size={18} />, label: 'Alerts' },
  { href: '/passive-income', icon: <Zap size={18} />, label: 'Passive Income' },
];

// ── Mobile bottom nav (5 tabs max) ──────────────────────────────────────────
const BOTTOM_NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home', id: 'home' },
  { href: '/spending', icon: Wallet, label: 'Spend', id: 'spending' },
  { href: '/planner', icon: Sparkles, label: 'AI', id: 'planner', isPrimary: true },
  { href: '/portfolio', icon: TrendingUp, label: 'Portfolio', id: 'portfolio' },
  { href: '/more', icon: Grid3x3, label: 'More', id: 'more' },
];

// ── More bottom sheet items ──────────────────────────────────────────────────
const MORE_ITEMS = [
  { icon: Target, label: 'Goals', href: '/goals', desc: 'Track financial milestones' },
  { icon: Map, label: 'Real Estate', href: '/real-estate', desc: 'Property by locality' },
  { icon: Bell, label: 'Alerts', href: '/alerts', desc: 'Portfolio notifications' },
  { icon: Zap, label: 'Passive Income', href: '/passive-income', desc: 'Income beyond salary' },
  { icon: Settings, label: 'Settings', href: '/settings', desc: '' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    setIsMoreSheetOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMoreSheetOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMoreSheetOpen]);

  // Prefetch all bottom nav destinations on mount for instant tab switching
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    BOTTOM_NAV.forEach(item => {
      if (item.id !== 'more') router.prefetch(item.href);
    });
    MORE_ITEMS.forEach(item => router.prefetch(item.href));
  }, []);

  const handleBottomNav = async (href: string, id: string) => {
    await haptic.light();
    if (id === 'more') {
      setIsMoreSheetOpen(true);
      return;
    }
    router.push(href);
  };

  const handleMoreItem = async (href: string) => {
    await haptic.light();
    setIsMoreSheetOpen(false);
    router.push(href);
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) return;
    setIsSubmittingFeedback(true);
    setTimeout(() => {
      setIsSubmittingFeedback(false);
      setFeedbackSuccess(true);
      setTimeout(() => {
        setIsFeedbackOpen(false);
        setFeedbackSuccess(false);
        setFeedbackText('');
      }, 2000);
    }, 800);
  };

  // Determine if "More" is active (when any secondary route is active)
  const moreRoutes = MORE_ITEMS.map(i => i.href);
  const isMoreActive = moreRoutes.some(r => pathname === r || pathname?.startsWith(r + '/'));

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-[var(--background)]">
        <OfflineBanner />

        {/* ── Ambient orbs (muted for dashboard) ── */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="orb bg-[var(--gold)] w-[400px] h-[400px] top-[-8%] right-[20%] animate-drift" style={{ animationDuration: '35s', opacity: 0.08 }} />
          <div className="orb bg-[var(--blue)] w-[300px] h-[300px] bottom-[5%] left-[10%] animate-drift" style={{ animationDelay: '-10s', animationDuration: '30s', opacity: 0.06 }} />
        </div>

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:flex relative inset-y-0 left-0 z-50 w-[260px] flex-col shrink-0">
          <div className="absolute inset-0 bg-[var(--surface-raised)] backdrop-blur-2xl border-r border-[var(--border)]" />
          <div className="relative z-10 flex flex-col h-full">
            {/* Logo */}
            <div className="px-5 py-5 flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold)]/70 flex items-center justify-center group-hover:shadow-[0_0_16px_var(--gold-glow)] transition-all duration-500">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-serif text-lg tracking-tight text-[var(--text-main)]">Monetra</span>
              </Link>
            </div>

            <div className="px-5 pt-2 pb-1">
              <p className="section-label">Menu</p>
            </div>

            <nav className="flex-1 py-1 overflow-y-auto hide-scrollbar">
              <div className="space-y-0.5 px-2.5">
                {SIDEBAR_ITEMS.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 group relative ${
                        isActive
                          ? 'text-[var(--gold)] bg-[var(--gold-dim)]'
                          : 'text-[var(--text-sec)] hover:text-[var(--text-main)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--gold)] rounded-r-full" />}
                      <span className={`w-5 text-center flex justify-center transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="px-2.5 py-3 border-t border-[var(--border)]">
              <Link href="/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${pathname === '/settings' ? 'text-[var(--gold)] bg-[var(--gold-dim)]' : 'text-[var(--text-sec)] hover:text-[var(--text-main)] hover:bg-[var(--surface)]'}`}>
                <span className="w-5 text-center flex justify-center"><Settings size={18} /></span>
                Settings
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-full">
          {/* Top Header */}
          <header
            className="glass-nav flex items-center justify-between px-4 md:px-6 shrink-0 relative z-30"
            style={{
              paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
              paddingBottom: '8px',
              minHeight: '56px',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <h1 className="md:hidden font-serif text-lg text-[var(--gold)] leading-none">Monetra</h1>
                <p className="hidden md:block text-sm font-medium text-[var(--text-main)]">Overview</p>
                <p className="hidden md:block text-[11px] text-[var(--text-muted)] mt-0.5">Welcome back</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Link href="/alerts" className="p-2 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-main)] rounded-xl relative transition-all duration-300 hidden md:flex items-center justify-center">
                <Bell size={18} />
                <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-[var(--red)] rounded-full ring-2 ring-[var(--background)]" />
              </Link>
              <button className="hidden sm:flex items-center gap-1.5 btn-primary text-[11px] !px-3 !py-1.5 rounded-lg">
                <Sparkles size={12} />
                Upgrade
              </button>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--emerald)] flex items-center justify-center text-[10px] font-bold text-white cursor-pointer hover:shadow-lg transition-all duration-300">
                US
              </div>
            </div>
          </header>

          {/* Scrollable Content — padded for bottom nav on mobile */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-nav md:pb-8 hide-scrollbar scroll-touch">
            <div className="max-w-[1100px] mx-auto w-full animate-fadeUp">
              {children}
            </div>
          </div>

          {/* ── Mobile Bottom Navigation ── */}
          <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-end justify-around px-2 pt-2 border-t border-[var(--border)] will-change-transform"
            style={{
              background: 'color-mix(in srgb, var(--background) 92%, transparent)',
              backdropFilter: 'blur(24px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
            }}
          >
            {BOTTOM_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'more'
                ? isMoreActive
                : pathname === item.href || pathname?.startsWith(item.href + '/');

              if (item.isPrimary) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleBottomNav(item.href, item.id)}
                    className="relative flex flex-col items-center -mt-4"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 ${isActive ? 'bg-[var(--gold)] shadow-[var(--gold-glow)]' : 'bg-[var(--gold)] hover:brightness-105'}`}>
                      <Icon size={22} className="text-white" strokeWidth={2} />
                    </div>
                    <span className={`text-[10px] font-semibold mt-1.5 ${isActive ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleBottomNav(item.href, item.id)}
                  className="flex flex-col items-center gap-1 px-3 py-1 min-w-[56px] active:opacity-70 transition-opacity"
                >
                  <div className="relative">
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className={`transition-colors duration-150 ${isActive ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'}`}
                    />
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--gold)]" />
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold transition-colors duration-150 ${isActive ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </main>

        {/* ── More Bottom Sheet (secondary nav) ── */}
        {isMoreSheetOpen && (
          <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 md:hidden" onClick={() => setIsMoreSheetOpen(false)} />
            <div className="fixed bottom-0 left-0 right-0 z-[60] md:hidden animate-slideUp">
            <div
              className="rounded-t-3xl border-t border-[var(--border)] shadow-2xl"
              style={{
                background: 'var(--surface-raised)',
                paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
              }}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 rounded-full bg-[var(--border-light)]" />
                </div>
                <div className="px-5 pb-2">
                  <p className="section-label">More</p>
                </div>
                <div className="px-4 space-y-1 pb-2">
                  {MORE_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleMoreItem(item.href)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 active:scale-[0.99] ${isActive ? 'bg-[var(--gold-dim)]' : 'hover:bg-[var(--surface)]'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-[var(--gold)] text-white' : 'bg-[var(--surface)] text-[var(--text-sec)]'}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${isActive ? 'text-[var(--gold)]' : 'text-[var(--text-main)]'}`}>{item.label}</p>
                          {item.desc && <p className="text-xs text-[var(--text-muted)] truncate">{item.desc}</p>}
                        </div>
                        <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Feedback FAB ── */}
        <button
          onClick={() => { haptic.light(); setIsFeedbackOpen(true); }}
          className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] md:bottom-8 right-4 md:right-8 z-50 w-12 h-12 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-lg flex items-center justify-center text-[var(--gold)] hover:scale-110 hover:shadow-[0_0_15px_var(--gold-glow)] transition-all duration-300 group"
          aria-label="Send Feedback"
        >
          <MessageSquare size={20} />
        </button>

        {/* ── Feedback Modal ── */}
        {isFeedbackOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeUp">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsFeedbackOpen(false)} className="absolute top-4 right-4 p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface)] rounded-lg transition-colors">
                <X size={18} />
              </button>
              <h2 className="font-serif text-xl text-[var(--text-main)] mb-1">Feedback & Support</h2>
              <p className="text-xs text-[var(--text-sec)] mb-5">Have a suggestion or found a bug? Let us know.</p>
              {feedbackSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--emerald-dim)] flex items-center justify-center text-[var(--emerald)]">
                    <Sparkles size={24} />
                  </div>
                  <p className="font-medium text-[var(--text-main)]">Thank you!</p>
                  <p className="text-xs text-[var(--text-muted)]">Your feedback helps us build a better Monetra.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    className="w-full h-32 p-3 text-sm bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/50 resize-none transition-all"
                    placeholder="What's on your mind?..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={!feedbackText.trim() || isSubmittingFeedback}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm font-semibold disabled:opacity-50"
                  >
                    {isSubmittingFeedback ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><Send size={16} /> Send Message</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
