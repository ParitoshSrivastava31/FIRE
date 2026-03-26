# Monetra — Capacitor.js Mobile App Architecture
## From Next.js Webapp → Play Store & App Store

> **Document type:** Mobile Engineering & Product Specification  
> **Scope:** Capacitor integration, mobile UX overhaul, splash screen, onboarding, auth, bottom nav, Play Store publishing pipeline  
> **Stack:** Next.js 14 + Capacitor 6 + Android (Play Store) + iOS (App Store)  
> **Status:** Pre-implementation reference  
> **Author perspective:** Co-founder / Product + Design + Engineering lead

---

## Table of Contents

1. [Why Capacitor Over React Native](#1-why-capacitor-over-react-native)
2. [Architecture Overview — How Capacitor Wraps Next.js](#2-architecture-overview)
3. [Project Setup — Capacitor Installation & Configuration](#3-project-setup)
4. [The Export Strategy — Next.js Static Export](#4-the-export-strategy)
5. [Splash Screen — Design & Implementation](#5-splash-screen)
6. [Mobile-First Design System Overhaul](#6-mobile-first-design-system-overhaul)
7. [Bottom Navigation Bar](#7-bottom-navigation-bar)
8. [Authentication — Google OAuth + Phone OTP](#8-authentication)
9. [Onboarding Flow — Mobile Redesign](#9-onboarding-flow-mobile-redesign)
10. [Native Plugins — Camera, Notifications, Haptics, Storage](#10-native-plugins)
11. [Supabase Realtime on Mobile](#11-supabase-realtime-on-mobile)
12. [Deep Links & Push Notifications](#12-deep-links--push-notifications)
13. [Android Build Pipeline — Play Store](#13-android-build-pipeline)
14. [iOS Build Pipeline — App Store](#14-ios-build-pipeline)
15. [CI/CD with GitHub Actions](#15-cicd-with-github-actions)
16. [Performance Optimisations for Mobile WebView](#16-performance-optimisations-for-mobile-webview)
17. [App Store Assets & Metadata](#17-app-store-assets--metadata)
18. [Known Limitations & Workarounds](#18-known-limitations--workarounds)
19. [Full File & Folder Structure](#19-full-file--folder-structure)

---

## 1. Why Capacitor Over React Native

This is a decision worth articulating clearly before a single line of code is written, because it affects everything downstream.

**The case for Capacitor:**

We already have a functioning Next.js codebase. The AI routes, Supabase integration, Recharts visualisations, shadcn/ui components, and Tailwind design system all exist and work. Capacitor wraps that exact web output in a native WebView shell, giving us a native-feeling app without rebuilding the UI layer from scratch.

The tradeoff is real: Capacitor apps are not as buttery as fully native React Native apps on animation-heavy screens. But Monetra is a **data and analysis product** — the core user actions are reading AI insights, reviewing charts, and adjusting inputs. It is not a photo editor or a game. The 20ms additional input latency of a WebView is imperceptible for these use cases.

**React Native would require:**
- Rewriting every UI component (shadcn/ui has no React Native equivalent)
- Rebuilding the Recharts graphs in Victory Native or custom Skia
- Maintaining two completely separate codebases (web + native)
- Doubling development time and introducing divergence bugs

**Capacitor gives us:**
- One codebase, three deployment targets (web, Android, iOS)
- Access to every native API via a thin JavaScript bridge
- The ability to ship web updates without going through Play Store review (for UI-only changes)
- Proven production usage at scale (Ionic's entire enterprise business runs on this)

**Verdict:** For Monetra's current stage and team size, Capacitor is the correct choice. Revisit React Native only if we need genuinely native-feeling animations at Series A scale.

---

## 2. Architecture Overview

Understanding this mental model is critical before writing any config.

```
┌─────────────────────────────────────────────────────────────┐
│  YOUR NEXT.JS APP  (runs as static export OR dev server)    │
│                                                              │
│  app/  components/  lib/  api/                              │
│  ↓                                                          │
│  next build && next export → /out  (static HTML/JS/CSS)     │
└──────────────────────────┬──────────────────────────────────┘
                           │  Capacitor reads /out
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  CAPACITOR LAYER  (capacitor.config.ts)                     │
│                                                              │
│  - Copies /out → android/app/src/main/assets/public         │
│  - Copies /out → ios/App/App/public                         │
│  - Injects native bridge (capacitor-bridge.js)              │
│  - Exposes native APIs via window.Capacitor.*               │
└──────────┬───────────────────────────────────────┬──────────┘
           │                                        │
           ▼                                        ▼
┌──────────────────────┐              ┌─────────────────────────┐
│  ANDROID             │              │  iOS                    │
│  /android/           │              │  /ios/                  │
│  → Android Studio    │              │  → Xcode                │
│  → APK / AAB         │              │  → IPA                  │
│  → Play Store        │              │  → App Store            │
└──────────────────────┘              └─────────────────────────┘

IMPORTANT: API routes (app/api/*) DO NOT work in static export.
All server logic must move to Supabase Edge Functions or external APIs.
The Next.js app makes HTTP calls to those APIs — it doesn't run them.
```

**The critical architectural shift:** Your Next.js API routes (`/api/ai/thesis`, `/api/cron/*`, etc.) run on Vercel's servers. They are NOT bundled into the mobile app. The mobile app's WebView calls those exact same Vercel-hosted API endpoints over HTTPS. This is correct behaviour — your API layer stays on Vercel, your UI layer goes into the mobile app.

This means:
- **API routes:** No change needed. They live on Vercel and are called remotely.
- **Supabase calls:** No change needed. The Supabase JS client works in WebView.
- **Environment variables with `NEXT_PUBLIC_` prefix:** Baked into the static export at build time. Fine.
- **Server-only env vars** (`ANTHROPIC_API_KEY`, etc.): Stay on Vercel. Never in the app.

---

## 3. Project Setup

### 3.1 Install Capacitor

```bash
# In your existing Next.js project root
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios

# Essential native plugins (install all upfront)
npm install @capacitor/splash-screen
npm install @capacitor/status-bar
npm install @capacitor/push-notifications
npm install @capacitor/local-notifications
npm install @capacitor/haptics
npm install @capacitor/keyboard
npm install @capacitor/app
npm install @capacitor/browser
npm install @capacitor/camera
npm install @capacitor/preferences  # replaces localStorage for native
npm install @capacitor/network
npm install @capacitor/share
npm install @capacitor/google-auth  # for Google Sign-In on mobile
```

### 3.2 `capacitor.config.ts`

Place this in your project root:

```typescript
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.monetra.app',           // Reverse domain — must match Play Console
  appName: 'Monetra',
  webDir: 'out',                      // Next.js static export output directory

  // During development: point to your local Next.js dev server
  // Comment this out for production builds
  server: {
    url: 'http://192.168.x.x:3000',  // Your local IP, not localhost
    cleartext: true,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: false,          // We control hide timing in code
      backgroundColor: '#0F172A',     // Monetra dark slate — matches splash
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },

    StatusBar: {
      style: 'dark',                  // Light icons on dark status bar
      backgroundColor: '#0F172A',
      overlaysWebView: false,
    },

    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    Keyboard: {
      resize: 'body',                 // Resize body not native input
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },

  android: {
    buildOptions: {
      keystorePath: '../monetra-release.keystore',
      keystoreAlias: 'monetra',
    },
    // Allow cleartext HTTP only in debug builds
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,  // false for production
  },

  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#0F172A',
  },
};

export default config;
```

### 3.3 Initialise Native Projects

```bash
# Run once after installing Capacitor
npx cap init

# Add platforms
npx cap add android
npx cap add ios

# These create /android and /ios folders in your project root
# Commit these folders to git — they are part of your project
```

---

## 4. The Export Strategy — Next.js Static Export

This is where most people hit a wall. Next.js App Router has restrictions on static export that you need to handle explicitly.

### 4.1 `next.config.js` changes

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // CRITICAL: enables static export
  trailingSlash: true,        // Required for Capacitor routing
  images: {
    unoptimized: true,        // next/image optimisation doesn't work in static
  },
  // If you use environment variables in client code, they are
  // embedded at build time. Make sure NEXT_PUBLIC_* vars are set during build.
}

module.exports = nextConfig
```

### 4.2 What breaks with `output: 'export'` and how to fix it

| What Breaks | Why | Fix |
|---|---|---|
| `app/api/*` routes | Server-only, can't export | They stay on Vercel. Mobile app calls them over HTTPS. No change needed. |
| `next/image` with external URLs | Needs optimisation server | Set `unoptimized: true` OR use `<img>` tags directly |
| `useSearchParams()` without Suspense | Static rendering constraint | Wrap all `useSearchParams` calls in `<Suspense>` |
| Dynamic routes without `generateStaticParams` | Need to know paths at build time | For auth-gated pages, this is fine since they're all under `(dashboard)/` and generated at runtime |
| Middleware redirects | Edge runtime, not static | Move auth logic to client-side redirect in layout using Supabase client session check |

### 4.3 Auth Middleware Replacement

Since `middleware.ts` doesn't run in static export on the mobile side, replace it with a client-side auth guard:

```typescript
// src/components/auth/auth-guard.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      // Check onboarding gate
      const { data: user } = await supabase
        .from('users')
        .select('onboarding_complete')
        .eq('id', session.user.id)
        .single()

      if (user && !user.onboarding_complete) {
        router.replace('/onboarding/step-1')
      }
    }
    checkAuth()
  }, [])

  return <>{children}</>
}
```

Wrap every `(dashboard)` layout with this component.

### 4.4 Build & Sync Script

Add these to `package.json`:

```json
{
  "scripts": {
    "build:mobile": "next build && npx cap sync",
    "open:android": "npx cap open android",
    "open:ios": "npx cap open ios",
    "dev:android": "npx cap run android --livereload --external",
    "dev:ios": "npx cap run ios --livereload --external"
  }
}
```

`npx cap sync` does two things:
1. Copies your `/out` folder into `android/app/src/main/assets/public` and `ios/App/App/public`
2. Updates native plugin configurations

**Run `npx cap sync` every time you do a production build. Never forget this step.**

---

## 5. Splash Screen

The splash screen is your first brand impression. Get it right. Monetra's identity is serious wealth intelligence — not a playful fintech. The splash should feel premium, dark, and confident.

### 5.1 Design Specification

```
Background:  #0F172A  (deep dark slate — darker than our standard dark bg)
Logo:         Monetra wordmark in white — centered vertically and horizontally
Tagline:      "Turn your lifestyle into a wealth strategy." — appears 400ms after logo
              Font: Inter, 14px, #94A3B8 (muted slate)
Animation:    Logo fades in over 300ms, tagline fades in 400ms later
              No loading spinner. No progress bar. Clean.
Aspect ratio: Fill screen edge-to-edge including status bar (immersive mode)
```

### 5.2 Android Splash Screen Assets

Android requires multiple density versions of the splash drawable.

```
android/app/src/main/res/
├── drawable/           splash.xml (vector or 9-patch)
├── drawable-ldpi/      splash.png (200×320)
├── drawable-mdpi/      splash.png (320×480)
├── drawable-hdpi/      splash.png (480×800)
├── drawable-xhdpi/     splash.png (720×1280)
├── drawable-xxhdpi/    splash.png (1080×1920)
└── drawable-xxxhdpi/   splash.png (1440×2560)
```

**Use a vector drawable for the logo to avoid density issues:**

```xml
<!-- android/app/src/main/res/drawable/splash.xml -->
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Background fill -->
    <item>
        <color android:color="#0F172A"/>
    </item>
    <!-- Centered logo — reference your actual vector asset -->
    <item
        android:gravity="center"
        android:width="180dp"
        android:height="48dp">
        <bitmap
            android:gravity="center"
            android:src="@drawable/monetra_logo_white"/>
    </item>
</layer-list>
```

### 5.3 Controlled Splash Dismissal in Code

Never auto-hide the splash. Control it from your app's root so it hides exactly when the first meaningful content is ready:

```typescript
// src/app/layout.tsx  (root layout)
'use client'

import { useEffect } from 'react'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core'

export default function RootLayout({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    const initNative = async () => {
      if (!Capacitor.isNativePlatform()) return

      // Set status bar style
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.setBackgroundColor({ color: '#0F172A' })
    }

    initNative()
  }, [])

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

```typescript
// src/app/(auth)/login/page.tsx
// Hide splash when the login page is ready to render

'use client'

import { useEffect } from 'react'
import { SplashScreen } from '@capacitor/splash-screen'
import { Capacitor } from '@capacitor/core'

export default function LoginPage() {
  useEffect(() => {
    // Hide splash screen once login page has mounted and is painted
    const hideSplash = async () => {
      if (Capacitor.isNativePlatform()) {
        await SplashScreen.hide({ fadeOutDuration: 300 })
      }
    }
    // Small delay ensures the page has actually painted before hiding
    const timer = setTimeout(hideSplash, 150)
    return () => clearTimeout(timer)
  }, [])

  return (
    // ... login UI
  )
}
```

---

## 6. Mobile-First Design System Overhaul

This is the deepest redesign work. The web layout must be reconsidered from the ground up for 375–430px viewports. Not "made responsive" — **redesigned for touch**.

### 6.1 Core Viewport Principles

```
Safe zones (account for these with padding/margin):
- Top:     Status bar = 44–60px depending on device
- Bottom:  Home indicator on modern Android/iOS = 34px
           Add to bottom nav so it doesn't overlap home indicator

Touch targets: MINIMUM 44×44px for any interactive element
               Preferred: 48×48px with 8px spacing between targets
               Never place two tap targets closer than 8px apart

Typography scale for mobile (different from desktop):
- H1: 28px (was 36px on web)
- H2: 22px (was 28px on web)
- H3: 18px (was 22px on web)
- Body: 15px (slightly larger than web for readability at arm's length)
- Monospace amounts: 15px with tabular-nums font feature

Scrolling:
- Vertical only. Horizontal scrolling only in dedicated carousels with clear affordance.
- Avoid nested scrollviews. One scroll container per screen.
```

### 6.2 Tailwind Mobile Configuration

```javascript
// tailwind.config.ts additions
module.exports = {
  theme: {
    extend: {
      // Safe area inset utilities (for iPhone notch / Android nav bar)
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Bottom nav height constant — use everywhere
      height: {
        'bottom-nav': '64px',
        'bottom-nav-safe': 'calc(64px + env(safe-area-inset-bottom))',
      },
      spacing: {
        'screen-pad': '16px',   // Standard horizontal screen padding on mobile
      }
    }
  }
}
```

```css
/* src/app/globals.css — add these */

/* Prevent text size adjustment on orientation change */
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

/* Prevent tap highlight flash on all tappable elements */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Smooth momentum scrolling on iOS */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

/* Prevent overscroll bounce showing white background */
body {
  overscroll-behavior: none;
  background-color: #0F172A;  /* Match splash so any overscroll is invisible */
}

/* Main content area — accounts for bottom nav */
.main-content {
  padding-bottom: calc(64px + env(safe-area-inset-bottom));
}
```

### 6.3 Card Design for Mobile

On web, cards sit in a grid. On mobile, cards are full-width and stacked. They need to breathe.

```typescript
// src/components/mobile/metric-card.tsx
// The atomic financial data card — used everywhere on mobile

interface MetricCardProps {
  label: string
  value: string
  delta?: { value: string; positive: boolean }
  icon?: React.ReactNode
  onTap?: () => void
}

export function MetricCard({ label, value, delta, icon, onTap }: MetricCardProps) {
  return (
    <button
      onClick={onTap}
      className={`
        w-full text-left bg-slate-800/60 backdrop-blur-sm
        border border-slate-700/50 rounded-2xl
        p-4 active:scale-[0.98] transition-transform duration-100
        ${onTap ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {label}
          </span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">
            {value}
          </span>
          {delta && (
            <span className={`text-sm font-medium ${delta.positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {delta.positive ? '↑' : '↓'} {delta.value}
            </span>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </button>
  )
}
```

---

## 7. Bottom Navigation Bar

The bottom nav is the primary wayfinding system on mobile. It replaces the sidebar entirely. Design it with intent — not just function.

### 7.1 Navigation Structure (5 Tabs)

After careful consideration of the feature set, 5 tabs is the right number for Monetra. 4 is too sparse (combines things that should be separate). 6 is too many (forces 18px icons that are unreadable).

```
Tab 1: Home       → /dashboard          Icon: grid-2x2 or home
Tab 2: Spending   → /spending           Icon: receipt or wallet
Tab 3: Planner    → /planner            Icon: sparkles (AI) ← CENTRE TAB, elevated
Tab 4: Portfolio  → /portfolio          Icon: chart-line or briefcase
Tab 5: More       → /more               Icon: grid or dots (opens bottom sheet with: Goals, Real Estate, Alerts, Passive Income, Settings)
```

The centre tab (AI Planner) gets elevated treatment — visually distinct, slightly larger, with a glowing accent. This is Monetra's core feature and the navigation should reinforce that hierarchy.

### 7.2 Bottom Nav Component

```typescript
// src/components/navigation/bottom-nav.tsx
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Receipt, Sparkles, TrendingUp, Grid3x3 } from 'lucide-react'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { Capacitor } from '@capacitor/core'

const NAV_ITEMS = [
  { label: 'Home',      icon: Home,       href: '/dashboard',  id: 'home' },
  { label: 'Spending',  icon: Receipt,    href: '/spending',   id: 'spending' },
  { label: 'AI',        icon: Sparkles,   href: '/planner',    id: 'planner', isPrimary: true },
  { label: 'Portfolio', icon: TrendingUp, href: '/portfolio',  id: 'portfolio' },
  { label: 'More',      icon: Grid3x3,    href: '/more',       id: 'more' },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleNav = async (href: string) => {
    // Native haptic feedback on navigation tap
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light })
    }
    router.push(href)
  }

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-slate-900/95 backdrop-blur-xl
        border-t border-slate-800/80
        pb-safe-bottom
      "
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
    >
      <div className="flex items-end justify-around px-2 pt-2 pb-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.href)}
                className="relative flex flex-col items-center -mt-4"
              >
                {/* Elevated centre button — the AI tab */}
                <div
                  className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center
                    shadow-lg shadow-blue-500/30
                    transition-all duration-200 active:scale-95
                    ${isActive
                      ? 'bg-blue-500 shadow-blue-500/50'
                      : 'bg-blue-600 hover:bg-blue-500'
                    }
                  `}
                >
                  <Icon size={24} className="text-white" strokeWidth={2} />
                </div>
                <span className={`text-[10px] font-medium mt-1 ${
                  isActive ? 'text-blue-400' : 'text-slate-500'
                }`}>
                  {item.label}
                </span>
              </button>
            )
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.href)}
              className="flex flex-col items-center gap-1 px-3 py-1 min-w-[56px] active:opacity-70 transition-opacity"
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-colors duration-150 ${
                    isActive ? 'text-blue-400' : 'text-slate-500'
                  }`}
                />
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-150 ${
                isActive ? 'text-blue-400' : 'text-slate-500'
              }`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
```

### 7.3 "More" Bottom Sheet

The `/more` route opens a bottom sheet, not a page. This is the correct mobile pattern for secondary navigation.

```typescript
// src/app/(dashboard)/more/page.tsx
// This page renders a bottom sheet over the current view
// Use the `vaul` library for the drawer

import { Drawer } from 'vaul'
import { Target, MapPin, Bell, TrendingUp, Settings, Star } from 'lucide-react'

const MORE_ITEMS = [
  { icon: Target,     label: 'Goals',          href: '/goals',          description: 'Track your financial milestones' },
  { icon: MapPin,     label: 'Real Estate',     href: '/real-estate',    description: 'Property prices by locality' },
  { icon: Bell,       label: 'Alerts',          href: '/alerts',         description: 'Price & portfolio notifications' },
  { icon: TrendingUp, label: 'Passive Income',  href: '/passive-income', description: 'Build income beyond your salary' },
  { icon: Star,       label: 'Upgrade to Pro',  href: '/pricing',        description: 'Unlimited AI + all features', isHighlighted: true },
  { icon: Settings,   label: 'Settings',        href: '/settings',       description: '' },
]
```

---

## 8. Authentication

Mobile auth is different from web auth in two important ways:
1. Google OAuth cannot use redirect URLs in a WebView on Android — it requires the Google Sign-In SDK
2. Phone OTP is a critical trust signal for Indian users (they expect it)

### 8.1 Google Sign-In on Mobile

Standard Supabase Google OAuth with `signInWithOAuth` and a redirect URL does NOT work reliably inside a Capacitor WebView on Android. You must use `@capacitor/google-auth` which invokes the native Google Sign-In SDK.

```bash
npm install @codetrix-studio/capacitor-google-auth
npx cap sync
```

```typescript
// src/lib/auth/google-auth.ts
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'
import { createBrowserClient } from '@supabase/ssr'
import { Capacitor } from '@capacitor/core'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  try {
    if (Capacitor.isNativePlatform()) {
      // Native path: use Google Sign-In SDK
      const googleUser = await GoogleAuth.signIn()
      const idToken = googleUser.authentication.idToken

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      })

      return { error: error?.message || null }
    } else {
      // Web path: standard OAuth redirect
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      return { error: error?.message || null }
    }
  } catch (err: any) {
    return { error: err.message || 'Google sign-in failed' }
  }
}
```

**Android Google Sign-In Setup in `android/app/src/main/res/values/strings.xml`:**

```xml
<resources>
    <string name="app_name">Monetra</string>
    <!-- Get this from Google Cloud Console → OAuth 2.0 Client IDs → Web Client ID -->
    <string name="server_client_id">YOUR_WEB_CLIENT_ID.apps.googleusercontent.com</string>
</resources>
```

### 8.2 Phone OTP Auth

This is the most trusted auth method for Indian users. Supabase supports phone OTP natively.

```typescript
// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

type Step = 'input_phone' | 'verify_otp'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('input_phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const sendOtp = async () => {
    setLoading(true)
    setError('')

    // Format Indian number — ensure +91 prefix
    const formatted = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`

    const { error } = await supabase.auth.signInWithOtp({
      phone: formatted,
      options: { channel: 'sms' }
    })

    if (error) {
      setError(error.message)
      await Haptics.impact({ style: ImpactStyle.Medium })
    } else {
      setStep('verify_otp')
      await Haptics.impact({ style: ImpactStyle.Light })
    }
    setLoading(false)
  }

  const verifyOtp = async () => {
    setLoading(true)
    const formatted = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`

    const { error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: 'sms'
    })

    if (error) {
      setError('Invalid OTP. Please try again.')
      await Haptics.impact({ style: ImpactStyle.Medium })
    }
    // If no error, Supabase session is set, auth guard redirects to dashboard/onboarding
    setLoading(false)
  }

  // ... UI rendering
}
```

### 8.3 Auth Screen Design — Mobile

The login screen should feel like the app, not a generic auth form.

```
Layout:
┌─────────────────────────┐
│  [Status bar]           │
│                         │
│                         │
│   Monetra               │  ← logo + wordmark, centered
│   Turn your lifestyle   │  ← tagline, muted text
│   into a wealth         │
│   strategy.             │
│                         │
│                         │
│  ┌───────────────────┐  │
│  │ +91  Phone number │  │  ← Phone input with country flag
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │  Send OTP →       │  │  ← Primary CTA
│  └───────────────────┘  │
│                         │
│      ─── or ───         │
│                         │
│  ┌───────────────────┐  │
│  │ G  Continue with  │  │  ← Google sign-in
│  │    Google         │  │
│  └───────────────────┘  │
│                         │
│  By continuing you      │  ← Tiny legal disclaimer
│  agree to our Terms     │
└─────────────────────────┘
```

**Colour note:** Dark background (`#0F172A`) on the auth screen. The transition from splash to login should feel seamless — same background, logo already positioned, content fades in. No jarring white flash.

---

## 9. Onboarding Flow — Mobile Redesign

The desktop onboarding was a 4-step wizard. On mobile, break each **section** of each step into its own screen. This reduces cognitive load and makes the back button feel safe (users can correct one field at a time).

### 9.1 New Mobile Onboarding Structure

```
OLD:  4 steps (each step is one long form)
NEW:  10 micro-screens (each screen answers one question)

Screen 1:  "What's your name?" — single text input, large
Screen 2:  "How old are you?" — date picker or year selector
Screen 3:  "Which city do you live in?" — searchable city picker
Screen 4:  "What do you do for work?" — 4 large option cards (tap to select)
           [Salaried] [Freelancer] [Business Owner] [Student]
Screen 5:  "What's your take-home salary?" — number input with ₹ prefix
           Sub-label: "Monthly, after tax"
Screen 6:  "What are your main monthly expenses?" — category sliders
           Pre-filled estimates, user drags to adjust
           Live surplus calculator at the bottom: "You can invest ₹X/month"
Screen 7:  "What are you saving for?" — Goal cards (multi-select)
           Large cards with icon + label, tap to toggle selected state
Screen 8:  "For selected goals — set targets" — one screen per selected goal
           (e.g., if user selected 3 goals, this is 3 screens)
Screen 9:  "How do you react to market dips?" — single question at a time
           (5 risk questions become 5 micro-screens)
Screen 10: "Your financial snapshot is ready" — celebration screen
           Shows: Monthly Surplus | Risk Profile | Top Goal | "Generate My Plan →"
```

### 9.2 Progress Indicator

Use a thin horizontal progress bar at the top, not a numbered stepper. The bar fills smoothly as users progress. Never show "Screen 4 of 10" — it feels like a long survey. A filling bar feels like a journey.

```typescript
// src/components/onboarding/progress-bar.tsx
export function OnboardingProgress({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100

  return (
    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
```

### 9.3 Onboarding State Management

Use Zustand to persist onboarding state across micro-screens. On native, also persist to `@capacitor/preferences` so resuming the app mid-onboarding doesn't lose progress.

```typescript
// src/store/onboarding-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Preferences } from '@capacitor/preferences'
import { Capacitor } from '@capacitor/core'

interface OnboardingState {
  currentScreen: number
  fullName: string
  dateOfBirth: string
  city: string
  occupation: string
  monthlyIncome: number
  expenses: Record<string, number>
  selectedGoals: string[]
  goals: Array<{ name: string; targetAmount: number; targetYear: number }>
  riskAnswers: number[]
  riskProfile: 'conservative' | 'moderate' | 'aggressive' | null
  setField: (key: string, value: any) => void
  nextScreen: () => void
  prevScreen: () => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentScreen: 1,
      fullName: '',
      dateOfBirth: '',
      city: '',
      occupation: '',
      monthlyIncome: 0,
      expenses: {},
      selectedGoals: [],
      goals: [],
      riskAnswers: [],
      riskProfile: null,
      setField: (key, value) => set({ [key]: value }),
      nextScreen: () => set((s) => ({ currentScreen: s.currentScreen + 1 })),
      prevScreen: () => set((s) => ({ currentScreen: Math.max(1, s.currentScreen - 1) })),
      reset: () => set({ currentScreen: 1, fullName: '', city: '' /* ...etc */ }),
    }),
    {
      name: 'monetra-onboarding',
      // Custom storage: use Capacitor Preferences on native, localStorage on web
      storage: {
        getItem: async (name) => {
          if (Capacitor.isNativePlatform()) {
            const { value } = await Preferences.get({ key: name })
            return value ? JSON.parse(value) : null
          }
          const item = localStorage.getItem(name)
          return item ? JSON.parse(item) : null
        },
        setItem: async (name, value) => {
          if (Capacitor.isNativePlatform()) {
            await Preferences.set({ key: name, value: JSON.stringify(value) })
          } else {
            localStorage.setItem(name, JSON.stringify(value))
          }
        },
        removeItem: async (name) => {
          if (Capacitor.isNativePlatform()) {
            await Preferences.remove({ key: name })
          } else {
            localStorage.removeItem(name)
          }
        },
      }
    }
  )
)
```

---

## 10. Native Plugins

### 10.1 Haptic Feedback

Use haptics deliberately — not on every tap, but on meaningful interactions:

```typescript
// src/lib/native/haptics.ts
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { Capacitor } from '@capacitor/core'

export const haptic = {
  // Light: tab bar navigation, toggles, selection changes
  light: async () => {
    if (!Capacitor.isNativePlatform()) return
    await Haptics.impact({ style: ImpactStyle.Light })
  },
  // Medium: button confirms, form submits
  medium: async () => {
    if (!Capacitor.isNativePlatform()) return
    await Haptics.impact({ style: ImpactStyle.Medium })
  },
  // Success: goal milestone hit, SIP activated, payment success
  success: async () => {
    if (!Capacitor.isNativePlatform()) return
    await Haptics.notification({ type: NotificationType.Success })
  },
  // Error: OTP wrong, form validation fail, API error
  error: async () => {
    if (!Capacitor.isNativePlatform()) return
    await Haptics.notification({ type: NotificationType.Error })
  },
  // Warning: budget 80% spent, portfolio drifted
  warning: async () => {
    if (!Capacitor.isNativePlatform()) return
    await Haptics.notification({ type: NotificationType.Warning })
  },
}
```

### 10.2 Network Status

Handle offline gracefully — Indian mobile data is often spotty:

```typescript
// src/hooks/use-network.ts
import { useEffect, useState } from 'react'
import { Network } from '@capacitor/network'
import { Capacitor } from '@capacitor/core'

export function useNetwork() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    Network.getStatus().then(status => setIsOnline(status.connected))

    const listener = Network.addListener('networkStatusChange', status => {
      setIsOnline(status.connected)
    })

    return () => {
      listener.then(l => l.remove())
    }
  }, [])

  return { isOnline }
}
```

Add an offline banner at the top of every screen that activates when `isOnline` is false.

### 10.3 Keyboard Avoidance

The Capacitor keyboard plugin ensures inputs scroll into view when the keyboard opens. Add this global handler:

```typescript
// src/hooks/use-keyboard.ts
import { useEffect, useState } from 'react'
import { Keyboard } from '@capacitor/keyboard'
import { Capacitor } from '@capacitor/core'

export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const showListener = Keyboard.addListener('keyboardWillShow', info => {
      setKeyboardHeight(info.keyboardHeight)
    })

    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0)
    })

    return () => {
      showListener.then(l => l.remove())
      hideListener.then(l => l.remove())
    }
  }, [])

  return { keyboardHeight }
}
```

Apply `paddingBottom: keyboardHeight` to any scrollable form container.

---

## 11. Supabase Realtime on Mobile

Supabase Realtime uses WebSockets, which work fine in Capacitor WebViews. However, manage the connection lifecycle explicitly to avoid battery drain:

```typescript
// src/lib/supabase/realtime-manager.ts
import { App } from '@capacitor/app'
import { createBrowserClient } from '@supabase/ssr'
import { Capacitor } from '@capacitor/core'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

let portfolioChannel: any = null

export function subscribeToPortfolio(userId: string, onUpdate: (payload: any) => void) {
  portfolioChannel = supabase
    .channel(`portfolio:${userId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'portfolio_holdings',
      filter: `user_id=eq.${userId}`
    }, onUpdate)
    .subscribe()
}

// Pause realtime when app goes to background (saves battery + data)
if (Capacitor.isNativePlatform()) {
  App.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) {
      // App went to background — disconnect realtime
      supabase.removeAllChannels()
    } else {
      // App came back to foreground — reconnect
      const userId = /* get from session */ ''
      if (userId) subscribeToPortfolio(userId, () => {})
    }
  })
}
```

---

## 12. Deep Links & Push Notifications

### 12.1 Deep Links

Configure deep links so that push notifications can open specific screens:

```typescript
// src/app/layout.tsx
import { App } from '@capacitor/app'

App.addListener('appUrlOpen', (event) => {
  // monetra://alerts/123 → /alerts?id=123
  // monetra://portfolio   → /portfolio
  const url = new URL(event.url)
  const path = url.pathname
  // Push to router
  window.location.href = path
})
```

**Android deep link config in `android/app/src/main/AndroidManifest.xml`:**

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="monetra" />
    <data android:scheme="https" android:host="app.monetra.in" />
</intent-filter>
```

### 12.2 Push Notification Registration

```typescript
// src/lib/native/push.ts
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function initialisePush(userId: string) {
  if (!Capacitor.isNativePlatform()) return

  // Request permission
  const permission = await PushNotifications.requestPermissions()
  if (permission.receive !== 'granted') return

  // Register with FCM/APNs
  await PushNotifications.register()

  // Capture the FCM token and store in Supabase
  PushNotifications.addListener('registration', async (token) => {
    await supabase
      .from('device_tokens')
      .upsert({
        user_id: userId,
        token: token.value,
        platform: Capacitor.getPlatform(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,platform' })
  })

  // Handle received notifications (foreground)
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    // Show an in-app toast instead of the system notification
    console.log('Push received in foreground:', notification)
  })

  // Handle notification tap (background/killed)
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const data = action.notification.data
    if (data?.deep_link) {
      window.location.href = data.deep_link
    }
  })
}
```

---

## 13. Android Build Pipeline — Play Store

### 13.1 Prerequisites

```
Required:
- Android Studio (latest stable — Hedgehog or newer)
- JDK 17 (bundled with Android Studio)
- Android SDK 34 (target) + SDK 24 (min — Android 7.0)
- A release keystore (generate once, keep safe forever)
```

### 13.2 Generate Release Keystore

```bash
# Run this ONCE. Store the keystore file and passwords in a password manager.
# LOSING THE KEYSTORE = LOSING YOUR PLAY STORE LISTING. Back it up to 3 places.

keytool -genkey -v \
  -keystore monetra-release.keystore \
  -alias monetra \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You will be prompted for:
# - Keystore password (use a strong password)
# - Key password (can be same as keystore password)
# - Name, organisation, city, state, country code
```

### 13.3 `android/app/build.gradle` — Release Config

```gradle
android {
    defaultConfig {
        applicationId "in.monetra.app"
        minSdk 24                    // Android 7.0 — covers 97%+ of Indian devices
        targetSdk 34
        versionCode 1                // Increment by 1 for every Play Store release
        versionName "1.0.0"          // Semantic version shown to users
    }

    signingConfigs {
        release {
            storeFile file("../../monetra-release.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias "monetra"
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
}
```

### 13.4 Build Commands

```bash
# Step 1: Build Next.js static export
npm run build

# Step 2: Sync to Android
npx cap sync android

# Step 3: Build release APK (for testing)
cd android && ./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk

# Step 4: Build release AAB (for Play Store — required for new apps)
cd android && ./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### 13.5 Play Store Submission Checklist

```
Account Setup:
[ ] Create Google Play Developer account — $25 one-time fee
[ ] Complete identity verification
[ ] Set up payments profile for paid apps/subscriptions

App Setup (Play Console):
[ ] Create new app → Application → India as primary market
[ ] App category: Finance
[ ] Target age group: 18+
[ ] Content rating questionnaire (finance app — low rating)

Store Listing (required):
[ ] App name: Monetra (max 30 chars)
[ ] Short description: India's AI finance planner. Spending → Investment. (max 80 chars)
[ ] Full description: 4000 chars max — see Section 17
[ ] App icon: 512×512px PNG (no alpha, no rounded corners — Play adds them)
[ ] Feature graphic: 1024×500px
[ ] Screenshots: Phone (min 2, max 8) — 320–3840px
    → Login screen
    → Dashboard
    → AI Planner with streamed thesis
    → Spending audit
    → Portfolio view
    → Goal tracker
[ ] Privacy policy URL (required for finance apps)

Technical:
[ ] Upload AAB file
[ ] Set up signing: "App signing by Google Play" (recommended — they hold the key)
[ ] OR "Use the same key across your apps" with your keystore
[ ] Target API 34 (required for new apps in 2024)
[ ] Declare permissions — justify each in the permission declaration form

Finance App Specific:
[ ] Financial features declaration — declare that app provides financial info, not transactions
[ ] Target country: India (primary)
[ ] Sensitive permissions: SMS (if reading OTP) requires declaration
[ ] Data safety form — fill completely: what data collected, shared, encrypted
    → Financial info (yes, stored in Supabase, encrypted, not sold)
    → Personal info (name, email, phone — yes, required for account)
    → Location (no — city is manually entered, not GPS)

Release:
[ ] Internal testing track → test with 5–10 users
[ ] Closed testing (alpha) → beta users, collect crash reports
[ ] Open testing (beta) → wider audience
[ ] Production → submit for review (3–7 days for new apps)
```

### 13.6 Required `AndroidManifest.xml` Permissions

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.VIBRATE" />        <!-- Haptics -->
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />  <!-- Local notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />       <!-- Android 13+ push -->
```

**Do NOT request `CAMERA`, `LOCATION`, or `READ_SMS` unless you actively use them.** Requesting unused permissions triggers Play Store review rejections for finance apps.

---

## 14. iOS Build Pipeline — App Store

### 14.1 Prerequisites

```
Required:
- Mac with macOS 14+
- Xcode 15+
- Apple Developer account — $99/year
- iPhone/iPad for testing
```

### 14.2 Xcode Configuration

```bash
# Open iOS project
npx cap open ios

# In Xcode:
# 1. Select Monetra target → Signing & Capabilities
# 2. Set Team: your Apple Developer account
# 3. Bundle Identifier: in.monetra.app
# 4. Set minimum deployment target: iOS 15.0 (covers 99%+ active devices)
```

**`ios/App/App/Info.plist` additions:**

```xml
<!-- App Transport Security — allow HTTPS to your API domains -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
</dict>

<!-- Face ID / Touch ID description (if you add biometric auth later) -->
<key>NSFaceIDUsageDescription</key>
<string>Use Face ID to securely access your Monetra account.</string>

<!-- Push notifications capability is added via Xcode Signing & Capabilities -->
```

### 14.3 App Store Connect Submission

```
App Information:
[ ] App name: Monetra
[ ] Bundle ID: in.monetra.app
[ ] SKU: monetra-india-001
[ ] Primary language: English (India)
[ ] Category: Finance > Financial Planning

Content Rights:
[ ] No third-party content without rights
[ ] Privacy Policy URL required

App Review Information:
[ ] Login credentials for demo account (reviewer needs to see the app)
    → Create a pre-filled demo account with sample data
[ ] Notes: "This is a financial planning information app. No actual transactions are executed."

Finance App Notes:
[ ] App may show financial data and AI-generated analysis
[ ] Does NOT execute trades or hold user funds
[ ] Complies with SEBI disclaimer requirements
[ ] Data stored on Supabase (AWS infrastructure in ap-south-1)
```

---

## 15. CI/CD with GitHub Actions

Automate builds so `main` branch merges trigger production releases.

```yaml
# .github/workflows/mobile-build.yml

name: Mobile Build & Deploy

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_POSTHOG_KEY: ${{ secrets.NEXT_PUBLIC_POSTHOG_KEY }}

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Sync Capacitor
        run: npx cap sync android

      - name: Decode Keystore
        run: |
          echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 --decode > monetra-release.keystore

      - name: Build Android AAB
        run: |
          cd android && ./gradlew bundleRelease
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}

      - name: Upload to Play Store (Internal Track)
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
          packageName: in.monetra.app
          releaseFiles: android/app/build/outputs/bundle/release/app-release.aab
          track: internal
          status: completed
```

**GitHub Secrets to configure:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `KEYSTORE_BASE64` — base64 encoded keystore file (`base64 -i monetra-release.keystore`)
- `KEYSTORE_PASSWORD`
- `KEY_PASSWORD`
- `GOOGLE_PLAY_SERVICE_ACCOUNT` — JSON from Google Play Console API access

---

## 16. Performance Optimisations for Mobile WebView

Capacitor's WebView is Chrome on Android and WKWebView on iOS. These are fast, but you can make them feel native with targeted optimisations.

### 16.1 Eliminate the White Flash on App Start

The biggest offender. On Android, WebView shows a white flash before your app's dark background loads. Fix it:

```java
// android/app/src/main/java/in/monetra/app/MainActivity.java

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Set WebView background to match splash before it loads
    WebView webView = getBridge().getWebView();
    webView.setBackgroundColor(Color.parseColor("#0F172A"));
  }
}
```

### 16.2 Disable Overscroll Glow

Android's blue overscroll glow is ugly in a finance app:

```java
// In MainActivity.java
webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
```

### 16.3 React Query Caching

Configure TanStack Query with aggressive caching so navigating between tabs feels instant:

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 minutes — data considered fresh
      gcTime: 1000 * 60 * 30,         // 30 minutes — keep in memory
      retry: 2,
      refetchOnWindowFocus: false,     // Don't refetch on app foreground (handle manually)
      refetchOnReconnect: true,        // Refetch when network restores
    },
  },
})
```

### 16.4 Route Prefetching

Prefetch the most likely next page on tab hover/press:

```typescript
// In BottomNav component — prefetch on long press / hover
import { useRouter } from 'next/navigation'

const router = useRouter()

// Prefetch all nav destinations on mount
useEffect(() => {
  NAV_ITEMS.forEach(item => router.prefetch(item.href))
}, [])
```

### 16.5 Chart Rendering — Defer Heavy Charts

Recharts renders synchronously. On mobile, this can cause a perceptible jank on first load. Use Suspense to defer:

```typescript
import dynamic from 'next/dynamic'

// Load wealth projection chart only when user scrolls to it
const WealthProjectionChart = dynamic(
  () => import('@/components/charts/wealth-projection'),
  { ssr: false, loading: () => <div className="h-64 bg-slate-800 rounded-2xl animate-pulse" /> }
)
```

---

## 17. App Store Assets & Metadata

### 17.1 Icon Design

```
App icon dimensions required:
- Android Play Store: 512×512px (PNG, no alpha)
- iOS App Store: 1024×1024px (PNG, no alpha, no rounded corners)
- Adaptive icon (Android): 108×108dp with 72×72dp safe zone

Design direction:
- Background: Deep blue-black gradient (#0A0F1E → #1E293B)
- Symbol: "M" lettermark in white with a subtle upward arrow integrated
  OR a stylised upward-trending graph line in blue (#2563EB)
- No text in the icon — the wordmark is too small at 48px
- The icon should read well at 48px (home screen) AND 16px (notification)
- Avoid: gradients that look grey when scaled down, thin lines under 2dp

Export formats:
- 1 master SVG at 1024×1024
- Export as PNG at all required sizes
```

### 17.2 Play Store Full Description (4000 chars max)

```
Monetra — India's AI Finance Planner

Stop wondering where your money goes. Start knowing exactly how to grow it.

Monetra is built specifically for India. It understands ELSS, PPF, NPS, Sovereign Gold Bonds, SIPs, and the real estate markets in your city — not just generic global advice.

THE PROBLEM WE SOLVE
Most finance apps either track your expenses (and guilt-trip you about them) or show your investments (assuming you already know what to buy). Nobody connects the two. Monetra does.

"You spent ₹6,400 on food delivery last month. Redirecting ₹3,000 of that to a Parag Parikh Flexi Cap SIP adds ₹11.2L to your corpus over 10 years." That's the Monetra difference.

WHAT MONETRA DOES FOR YOU

AI Investment Planner
Upload your income, expenses, and goals once. Monetra's AI generates a complete, personalised investment thesis — specific fund names, exact SIP amounts, tax-saving strategies under Section 80C and 80CCD, and a 30-year wealth projection. No jargon. No generic advice.

Smart Spending Tracker
Log expenses in seconds. Our AI analyses your spending every month and shows you the investment opportunity hiding inside your habits. See how small changes compound into crores over time.

Live Portfolio Dashboard
Track your NSE/BSE stocks, mutual funds, Gold ETFs, FDs, PPF, and NPS in one unified dashboard. Real-time P&L, XIRR, and benchmark comparison against Nifty 50.

Real Estate Explorer
India's only personal finance app with Tier-2 and Tier-3 city real estate data. See price per sq.ft., rental yields, and year-on-year appreciation by locality. Know if you can afford your dream home — and when.

Goal Tracker
Set targets for your home, education fund, retirement, or business. See exactly how much to invest each month to hit them. Get alerts when you're falling behind.

Smart Alerts
Get notified when your stocks move significantly, your portfolio drifts from its target allocation, or a tax-loss harvesting opportunity appears.

BUILT FOR INDIA
₹ amounts, not dollars. Indian instruments, not American ETFs. Tier-2 city context, not Mumbai-only data. Hindi support coming soon.

PRIVACY & SECURITY
Your financial data is encrypted and stored securely. We never sell your data. Delete your account and all data anytime from the app.

DISCLAIMER
Monetra provides AI-generated financial information for educational purposes. It is not a SEBI-registered investment advisor. Please consult a SEBI RIA before making investment decisions.

Free plan available. Pro at ₹199/month.
```

---

## 18. Known Limitations & Workarounds

| Issue | Impact | Workaround |
|---|---|---|
| `next/image` optimisation doesn't work | Images not auto-resized | Use `unoptimized: true` in config + manually size images at source |
| API routes don't exist in static export | None — they run on Vercel | Ensure all API calls use absolute URLs (`process.env.NEXT_PUBLIC_API_URL`) |
| `localStorage` not persistent across reinstalls on Android | Auth sessions lost | Use `@capacitor/preferences` for sensitive storage |
| WebView keyboard pushes content up unexpectedly | Bad UX on forms | Use Capacitor Keyboard plugin with `resize: 'body'` |
| Google OAuth redirect doesn't work in WebView | Login broken | Use `@codetrix-studio/capacitor-google-auth` native SDK |
| Recharts SVGs can lag on first render | Perceived slowness | Dynamic import + Suspense skeleton for all charts |
| Status bar overlaps content on some Android devices | Layout broken | Use `env(safe-area-inset-top)` padding everywhere |
| In-app browser for external links opens full WebView | Confusing navigation | Use `@capacitor/browser` with `openInWebView: false` for external links |
| Supabase Realtime disconnects when app backgrounds | Stale data on foreground | Listen to `App.appStateChange` and reconnect channels on foreground |
| Play Store review takes 7–14 days for new finance apps | Slow initial launch | Submit with full demo account credentials and clear compliance notes |

---

## 19. Full File & Folder Structure

After Capacitor is added, your project structure becomes:

```
monetra/
├── android/                          # ← Generated by Capacitor. Commit to git.
│   ├── app/
│   │   ├── build.gradle              # App-level gradle config (version codes here)
│   │   └── src/main/
│   │       ├── AndroidManifest.xml   # Permissions, deep links
│   │       ├── assets/public/        # ← Your built web app lives here (auto-synced)
│   │       ├── java/in/monetra/app/
│   │       │   └── MainActivity.java # WebView customisation
│   │       └── res/
│   │           ├── drawable/         # Splash screen assets
│   │           ├── mipmap-*/         # App icon at various densities
│   │           └── values/
│   │               └── strings.xml   # Google Client ID
│   └── build.gradle                  # Project-level gradle config
│
├── ios/                              # ← Generated by Capacitor. Commit to git.
│   └── App/
│       ├── App/
│       │   ├── AppDelegate.swift
│       │   ├── Info.plist            # iOS permissions, bundle ID
│       │   └── public/              # ← Your built web app lives here (auto-synced)
│       └── App.xcodeproj/
│
├── out/                              # ← next build output. DO NOT commit. In .gitignore
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Handles splash hide + phone/Google auth
│   │   │   └── onboarding/
│   │   │       └── [step]/page.tsx   # Mobile micro-screen onboarding
│   │   └── (dashboard)/
│   │       ├── layout.tsx            # Contains AuthGuard + BottomNav + safe area padding
│   │       ├── dashboard/page.tsx
│   │       ├── spending/page.tsx
│   │       ├── planner/page.tsx
│   │       ├── portfolio/page.tsx
│   │       └── more/page.tsx         # Opens bottom sheet for secondary nav
│   │
│   ├── components/
│   │   ├── navigation/
│   │   │   ├── bottom-nav.tsx        # Main mobile nav
│   │   │   └── more-sheet.tsx        # Bottom sheet for secondary navigation
│   │   ├── mobile/
│   │   │   ├── metric-card.tsx       # Financial data card
│   │   │   ├── offline-banner.tsx    # Network status banner
│   │   │   └── pull-to-refresh.tsx   # Native pull-to-refresh wrapper
│   │   ├── onboarding/
│   │   │   └── progress-bar.tsx
│   │   └── auth/
│   │       └── auth-guard.tsx
│   │
│   ├── lib/
│   │   ├── native/
│   │   │   ├── haptics.ts            # Centralised haptic feedback
│   │   │   └── push.ts               # Push notification registration
│   │   ├── auth/
│   │   │   └── google-auth.ts        # Native Google Sign-In abstraction
│   │   └── supabase/
│   │       └── realtime-manager.ts   # Background-aware realtime subscriptions
│   │
│   ├── hooks/
│   │   ├── use-network.ts
│   │   └── use-keyboard.ts
│   │
│   └── store/
│       └── onboarding-store.ts       # Zustand + Capacitor Preferences
│
├── capacitor.config.ts               # ← Capacitor root config
├── next.config.js                    # output: 'export' + trailingSlash
├── monetra-release.keystore          # ← NEVER COMMIT. Add to .gitignore
├── .github/
│   └── workflows/
│       └── mobile-build.yml          # CI/CD pipeline
└── package.json                      # build:mobile, open:android, dev:android scripts
```

---

## Quick Reference — Commands You'll Run Daily

```bash
# Development (hot reload in Android emulator)
npm run dev:android

# Production build + sync
npm run build:mobile

# Open Android Studio (for signing, emulator, logs)
npx cap open android

# Open Xcode (for iOS)
npx cap open ios

# Build release AAB for Play Store
cd android && ./gradlew bundleRelease

# Check Capacitor doctor (diagnoses native setup issues)
npx cap doctor

# Update Capacitor version
npx cap update
```

---

*— End of Document —*  
*Monetra Mobile Architecture v1.0 | Internal Engineering Document*  
*Next step: Run `npm install @capacitor/core @capacitor/cli && npx cap init`*
