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
  X
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileMenuOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out md:transform-none ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'} md:flex`}>
        <div className="p-6 pb-4 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-serif text-2xl text-gold">Monetra</span>
          </Link>
          <button 
            className="md:hidden p-1 text-text-muted hover:text-text-main rounded-md hover:bg-card-hover"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pt-2 hidden md:block">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-text-muted">
            AI Finance Planner
          </p>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto w-full">
          <div className="px-5 mb-2">
            <h3 className="text-[10px] font-bold tracking-[0.12em] uppercase text-text-muted">Menu</h3>
          </div>
          <div className="space-y-0.5">
            <NavItem href="/dashboard" current={pathname} icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavItem href="/spending" current={pathname} icon={<Wallet size={18} />} label="Spending" />
            <NavItem href="/portfolio" current={pathname} icon={<TrendingUp size={18} />} label="Portfolio" />
            <NavItem href="/planner" current={pathname} icon={<PieChart size={18} />} label="AI Planner" />
            <NavItem href="/real-estate" current={pathname} icon={<Map size={18} />} label="Real Estate" />
            <NavItem href="/goals" current={pathname} icon={<Target size={18} />} label="Goals" />
            <NavItem href="/alerts" current={pathname} icon={<Bell size={18} />} label="Alerts" />
            <NavItem href="/passive-income" current={pathname} icon={<Zap size={18} />} label="Passive Income" />
          </div>
        </nav>
        
        <div className="p-4 border-t border-border mt-auto">
          <NavItem href="/settings" current={pathname} icon={<Settings size={18} />} label="Settings" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-full">
        {/* Top Header */}
        <header className="h-[64px] md:h-[72px] border-b border-border bg-card/90 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 relative z-30">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-1.5 -ml-1 text-text-muted hover:text-text-main rounded-md hover:bg-card-hover transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="flex flex-col">
              <h1 className="font-semibold text-[22px] md:hidden text-gold font-serif leading-none tracking-tight">Monetra</h1>
              <p className="hidden md:block text-sm font-medium text-text-main tracking-tight">Overview</p>
              <p className="hidden md:block text-[11px] text-text-muted mt-0.5">Welcome back, User</p>
            </div>
          </div>
          
          {/* Topbar Actions */}
          <div className="ml-auto flex items-center gap-4 md:gap-5">
            <Link
              href="/alerts"
              className="p-2 text-text-muted hover:bg-card-hover hover:text-text-main rounded-full relative transition-colors hidden md:block"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-2 w-2 h-2 bg-red rounded-full ring-2 ring-card animate-pulseGlow"></span>
            </Link>
            
            <button className="hidden sm:flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all">
              Upgrade
            </button>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-gold to-emerald flex items-center justify-center text-[11px] font-bold text-white shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              US
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-background p-4 md:p-8 lg:p-10 pb-[90px] md:pb-8 hide-scrollbar">
          <div className="max-w-[1200px] mx-auto w-full">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden absolute bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around pb-safe pt-2 px-1 z-40 shadow-[0_-4px_25px_rgba(0,0,0,0.04)] h-[72px]">
          <MobileNavItem href="/dashboard" current={pathname} icon={<LayoutDashboard size={22} />} label="Home" />
          <MobileNavItem href="/spending" current={pathname} icon={<Wallet size={22} />} label="Spend" />
          <MobileNavItem href="/portfolio" current={pathname} icon={<TrendingUp size={24} />} label="Portfolio" />
          <MobileNavItem href="/planner" current={pathname} icon={<PieChart size={22} />} label="Planner" />
          <MobileNavItem href="/settings" current={pathname} icon={<Settings size={22} />} label="Settings" />
        </nav>
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  current,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  current: string;
}) {
  const isActive = current === href || current?.startsWith(href + '/');
  
  if (isActive) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 px-5 py-3 text-[13px] font-medium transition-all bg-gold-glow text-gold border-r-[3px] border-gold"
      >
        <span className="w-5 text-center flex justify-center">{icon}</span>
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-5 py-3 text-[13px] font-medium transition-all text-text-sec hover:bg-card-hover hover:text-text-main border-r-[3px] border-transparent"
    >
      <span className="w-5 text-center flex justify-center">{icon}</span>
      {label}
    </Link>
  );
}

function MobileNavItem({
  href,
  icon,
  label,
  current,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  current: string;
}) {
  const isActive = current === href || current?.startsWith(href + '/');
  
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center w-[64px] h-full gap-1.5 transition-colors ${
        isActive ? "text-gold" : "text-text-muted hover:text-text-main"
      }`}
    >
      <div className={`${isActive ? "animate-pulseGlow" : ""}`}>
        {icon}
      </div>
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
    </Link>
  );
}
