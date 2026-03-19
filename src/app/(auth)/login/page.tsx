"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, TrendingUp, Shield, Eye, EyeOff, ArrowRight } from "lucide-react";

const HIGHLIGHTS = [
  { icon: <Sparkles size={16} />, text: "AI investment thesis in seconds" },
  { icon: <TrendingUp size={16} />, text: "Live portfolio P&L tracker" },
  { icon: <Shield size={16} />, text: "DPDP-compliant, bank-grade security" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Left Panel — Brand Visual */}
      <div className="hidden lg:flex w-[45%] bg-[var(--card)] border-r border-[var(--border)] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[var(--gold-dim)] rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-[var(--blue-dim)] rounded-full blur-3xl opacity-40" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="font-serif text-3xl text-[var(--gold)]">Monetra</Link>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--text-muted)] mt-1">
            AI Finance Planner · India-First
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="font-serif text-4xl text-[var(--text-main)] leading-tight">
            Turn your lifestyle into a{" "}
            <span className="text-[var(--gold)]">wealth strategy</span>
          </h2>
          <div className="space-y-4">
            {HIGHLIGHTS.map((h, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--gold-dim)] flex items-center justify-center text-[var(--gold)]">
                  {h.icon}
                </div>
                <span className="text-sm font-medium text-[var(--text-sec)]">{h.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative mini dashboard preview */}
        <div className="relative z-10 bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5 space-y-3">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)]">Your Wealth Snapshot</p>
          {[
            { label: "Net Worth", val: "₹1.24Cr", color: "text-[var(--emerald)]" },
            { label: "Monthly Surplus", val: "₹46,000", color: "text-[var(--blue)]" },
            { label: "Portfolio P&L", val: "+18.4%", color: "text-[var(--gold)]" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-sec)]">{row.label}</span>
              <span className={`font-mono text-sm font-bold ${row.color}`}>{row.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <Link href="/" className="font-serif text-3xl text-[var(--gold)]">Monetra</Link>
          </div>

          <div>
            <h1 className="font-serif text-3xl text-[var(--text-main)]">Welcome back</h1>
            <p className="text-sm text-[var(--text-muted)] mt-2">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="p-3.5 text-sm text-[var(--red)] bg-[var(--red)]/8 rounded-xl border border-[var(--red)]/20">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--text-main)]" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[var(--text-main)]" htmlFor="password">Password</label>
                <button type="button" className="text-xs text-[var(--gold)] hover:underline font-medium">Forgot password?</button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[var(--gold)] text-white font-bold text-sm rounded-xl hover:opacity-90 hover:shadow-lg hover:-translate-y-[1px] transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[var(--background)] px-3 text-[var(--text-muted)] font-medium uppercase tracking-wider">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full h-12 border border-[var(--border)] bg-[var(--card)] text-[var(--text-main)] font-semibold text-sm rounded-xl hover:border-[var(--border-light)] hover:shadow-sm transition-all flex items-center justify-center gap-2.5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-[var(--text-muted)]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[var(--gold)] hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
