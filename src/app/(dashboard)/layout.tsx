"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PieChart,
  TrendingUp,
  Settings,
  Map,
  Target,
  LayoutDashboard,
  Wallet,
  Bell,
  Zap,
  Menu,
  X,
  Sparkles,
  MessageSquare,
  Send
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { href: "/spending", icon: <Wallet size={18} />, label: "Spending" },
  { href: "/portfolio", icon: <TrendingUp size={18} />, label: "Portfolio" },
  { href: "/planner", icon: <PieChart size={18} />, label: "AI Planner" },
  { href: "/real-estate", icon: <Map size={18} />, label: "Real Estate" },
  { href: "/goals", icon: <Target size={18} />, label: "Goals" },
  { href: "/alerts", icon: <Bell size={18} />, label: "Alerts" },
  { href: "/passive-income", icon: <Zap size={18} />, label: "Passive Income" },
];

const MOBILE_NAV = [
  { href: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Home" },
  { href: "/spending", icon: <Wallet size={20} />, label: "Spend" },
  { href: "/portfolio", icon: <TrendingUp size={20} />, label: "Portfolio" },
  { href: "/planner", icon: <PieChart size={20} />, label: "Planner" },
  { href: "/settings", icon: <Settings size={20} />, label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) return;
    setIsSubmittingFeedback(true);
    // Simulate API call to save feedback to Supabase or send email
    setTimeout(() => {
      setIsSubmittingFeedback(false);
      setFeedbackSuccess(true);
      setTimeout(() => {
        setIsFeedbackOpen(false);
        setFeedbackSuccess(false);
        setFeedbackText("");
      }, 2000);
    }, 800);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">

      {/* ── Ambient orbs (muted for dashboard) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="orb bg-[var(--gold)] w-[400px] h-[400px] top-[-8%] right-[20%] animate-drift" style={{ animationDuration: '35s', opacity: 0.08 }} />
        <div className="orb bg-[var(--blue)] w-[300px] h-[300px] bottom-[5%] left-[10%] animate-drift" style={{ animationDelay: '-10s', animationDuration: '30s', opacity: 0.06 }} />
      </div>

      {/* ── Mobile backdrop ── */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-[260px] flex flex-col shrink-0 transform transition-all duration-300 ease-premium md:transform-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Sidebar glass background */}
        <div className="absolute inset-0 bg-[var(--surface-raised)] backdrop-blur-2xl border-r border-[var(--border)]" />

        {/* Sidebar content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="px-5 py-5 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold)]/70 flex items-center justify-center group-hover:shadow-[0_0_16px_var(--gold-glow)] transition-all duration-500">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-serif text-lg tracking-tight text-[var(--text-main)]">Monetra</span>
            </Link>
            <button
              className="md:hidden p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav section label */}
          <div className="px-5 pt-2 pb-1">
            <p className="section-label">Menu</p>
          </div>

          {/* Nav items */}
          <nav className="flex-1 py-1 overflow-y-auto hide-scrollbar">
            <div className="space-y-0.5 px-2.5">
              {NAV_ITEMS.map((item) => {
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
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--gold)] rounded-r-full" />
                    )}
                    <span className={`w-5 text-center flex justify-center transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Settings at bottom */}
          <div className="px-2.5 py-3 border-t border-[var(--border)]">
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                pathname === '/settings'
                  ? 'text-[var(--gold)] bg-[var(--gold-dim)]'
                  : 'text-[var(--text-sec)] hover:text-[var(--text-main)] hover:bg-[var(--surface)]'
              }`}
            >
              <span className="w-5 text-center flex justify-center">
                <Settings size={18} />
              </span>
              Settings
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-full">
        {/* Top Header */}
        <header className="h-[56px] md:h-[60px] glass-nav flex items-center justify-between px-4 md:px-6 shrink-0 relative z-30">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 -ml-1 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg hover:bg-[var(--surface)] transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="md:hidden font-serif text-lg text-[var(--gold)] leading-none">Monetra</h1>
              <p className="hidden md:block text-sm font-medium text-[var(--text-main)]">Overview</p>
              <p className="hidden md:block text-[11px] text-[var(--text-muted)] mt-0.5">Welcome back</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/alerts"
              className="p-2 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-main)] rounded-xl relative transition-all duration-300 hidden md:flex items-center justify-center"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-[var(--red)] rounded-full ring-2 ring-[var(--background)]" />
            </Link>

            <button className="hidden sm:flex items-center gap-1.5 btn-primary text-[11px] !px-3 !py-1.5 rounded-lg">
              <Sparkles size={12} />
              Upgrade
            </button>

            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--emerald)] flex items-center justify-center text-[10px] font-bold text-white cursor-pointer hover:shadow-lg hover:shadow-[var(--gold-glow)] transition-all duration-300">
              US
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-[100px] md:pb-8 hide-scrollbar">
          <div className="max-w-[1100px] mx-auto w-full animate-fadeUp">
            {children}
          </div>
        </div>

        {/* ── Mobile Bottom Nav ── */}
        <nav className="md:hidden absolute bottom-0 left-0 right-0 glass-nav flex items-center justify-around pb-safe pt-1.5 px-1 z-40 h-[68px] border-t border-[var(--border)]" style={{ backdropFilter: 'blur(24px) saturate(1.8)', WebkitBackdropFilter: 'blur(24px) saturate(1.8)' }}>
          {MOBILE_NAV.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-[56px] h-full gap-1 transition-all duration-300 ${
                  isActive ? "text-[var(--gold)]" : "text-[var(--text-muted)]"
                }`}
              >
                <div className={`transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
                  {item.icon}
                </div>
                <span className="text-[9px] font-semibold tracking-wide">{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-2 w-4 h-[2px] bg-[var(--gold)] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </main>

      {/* ── Global Feedback FAB ── */}
      <button
        onClick={() => setIsFeedbackOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-12 h-12 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-lg flex items-center justify-center text-[var(--gold)] hover:scale-110 hover:shadow-[0_0_15px_var(--gold-glow)] transition-all duration-300 group"
        aria-label="Send Feedback"
      >
        <MessageSquare size={20} className="group-hover:animate-bounce-short" />
      </button>

      {/* ── Feedback Modal ── */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeUp">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsFeedbackOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface)] rounded-lg transition-colors"
            >
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
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
