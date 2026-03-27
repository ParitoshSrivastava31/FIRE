"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Eye, EyeOff, ArrowRight, Check } from "lucide-react";

const PERKS = [
  "14-day Pro trial — no card required",
  "Unlimited AI investment thesis",
  "India-native: SIP, SGB, NPS, PPF",
  "Real-time portfolio P&L tracker",
];

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    if (data.session) {
      router.push("/onboarding/step-1");
      router.refresh();
    } else {
      setIsSuccess(true);
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[var(--emerald-dim)] border border-[var(--emerald)]/20 flex items-center justify-center mx-auto">
            <Check size={28} className="text-[var(--emerald)]" />
          </div>
          <h1 className="font-serif text-3xl text-[var(--text-main)]">Check your email</h1>
          <p className="text-[var(--text-sec)] leading-relaxed">
            We sent a confirmation link to <strong className="text-[var(--text-main)]">{email}</strong>. Click the link to verify your account and start your 14-day Pro trial.
          </p>
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--gold)] hover:underline">
            Back to Sign In
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Left Panel */}
      <div className="hidden lg:flex w-[45%] bg-[var(--card)] border-r border-[var(--border)] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 bg-[var(--emerald-dim)] rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-20 left-10 w-48 h-48 bg-[var(--gold-dim)] rounded-full blur-3xl opacity-40" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="font-serif text-3xl text-[var(--gold)]">Monetra</Link>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--text-muted)] mt-1">
            AI Finance Planner · India-First
          </p>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="font-serif text-4xl text-[var(--text-main)] leading-tight mb-3">
              Start building wealth <span className="text-[var(--gold)]">intelligently</span>
            </h2>
            <p className="text-[var(--text-sec)] text-sm leading-relaxed">
              Join thousands of Indians who use Monetra to turn their spending habits into a wealth strategy — automatically.
            </p>
          </div>
          <ul className="space-y-4">
            {PERKS.map((perk, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--emerald-dim)] flex items-center justify-center shrink-0">
                  <Check size={11} className="text-[var(--emerald)]" />
                </div>
                <span className="text-sm text-[var(--text-sec)]">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Decorative AI Output Preview */}
        <div className="relative z-10 bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[var(--blue-dim)] flex items-center justify-center">
              <Sparkles size={12} className="text-[var(--blue)]" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--blue)]">AI Thesis Preview</span>
          </div>
          <p className="text-xs text-[var(--text-sec)] leading-relaxed">
            &ldquo;Based on your ₹46,000 surplus, allocate ₹25,000 → Parag Parikh Flexi Cap + ₹5,000 → Gold ETF. At 11% CAGR, you reach <span className="font-semibold text-[var(--emerald)]">₹1.04Cr</span> in 10 years.&rdquo;
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-7">
          <div className="lg:hidden text-center">
            <Link href="/" className="font-serif text-3xl text-[var(--gold)]">Monetra</Link>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 bg-[var(--emerald-dim)] border border-[var(--emerald)]/20 rounded-full px-3 py-1 mb-4">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--emerald)]">14-day Pro Trial Free</span>
            </div>
            <h1 className="font-serif text-3xl text-[var(--text-main)]">Create your account</h1>
            <p className="text-sm text-[var(--text-muted)] mt-2">No credit card required. Cancel anytime.</p>
          </div>

          {error && (
            <div className="p-3.5 text-sm text-[var(--red)] bg-[var(--red)]/8 rounded-xl border border-[var(--red)]/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--text-main)]" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Priya Sharma"
                required
                className="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
              <label className="text-sm font-semibold text-[var(--text-main)]" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
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
                  Creating account...
                </>
              ) : (
                <>
                  Create Free Account
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
            onClick={handleGoogleSignup}
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
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--gold)] hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-[11px] text-[var(--text-muted)] leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[var(--text-sec)]">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-[var(--text-sec)]">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
