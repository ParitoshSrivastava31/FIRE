/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment, react/no-unescaped-entities */
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Monetra",
  description: "How Monetra collects, uses, and protects your personal and financial data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl text-[var(--gold)]">Monetra</Link>
          <Link href="/" className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">← Back to Home</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div>
          <p className="text-[var(--gold)] text-xs font-bold tracking-widest uppercase mb-3">Legal</p>
          <h1 className="font-serif text-4xl text-[var(--text-main)]">Privacy Policy</h1>
          <p className="text-[var(--text-muted)] text-sm mt-3">Last updated: March 19, 2025 · Compliant with DPDPA 2023</p>
        </div>

        <div className="bg-[var(--emerald-dim)] border border-[var(--emerald)]/20 rounded-2xl p-5">
          <p className="text-sm font-bold text-[var(--emerald)] mb-1">🛡️ Your Data, Your Control</p>
          <p className="text-sm text-[var(--text-sec)] leading-relaxed">
            We never sell your financial data. You can export or delete your data at any time from Settings. We are compliant with India's <strong>Digital Personal Data Protection Act (DPDPA) 2023</strong>.
          </p>
        </div>

        {[
          {
            title: "1. What We Collect",
            content: `**Account Data:** Email address, name, date of birth, city, occupation — collected during signup and onboarding.

**Financial Data:** Income, monthly expenses, investment portfolio holdings, financial goals, risk profile — provided voluntarily by you.

**Usage Data:** Pages visited, features used, session duration — collected automatically via analytics.

**Device Data:** Browser type, operating system, IP address — for security and fraud prevention.`,
          },
          {
            title: "2. How We Use Your Data",
            content: `• **AI Personalisation:** Your financial data powers AI-generated investment theses, spending audits, and recommendations
• **Product Functionality:** Storing your portfolio, goals, and expenses so you can track them over time
• **Security:** Detecting suspicious activity, rate limiting, and preventing fraud
• **Service Improvement:** Aggregated, anonymised usage patterns to improve AI accuracy
• **Communication:** Important account notifications (never marketing spam without consent)`,
          },
          {
            title: "3. Data Storage and Security",
            content: `Your data is stored in Supabase (PostgreSQL) hosted on AWS in the ap-south-1 (Mumbai) region. We implement:
• Row-Level Security (RLS): Your data is isolated — no user can access another's data
• Encryption at rest (AES-256) and in transit (TLS 1.3)
• API keys are never stored in client-side code
• Regular security audits and dependency updates`,
          },
          {
            title: "4. Third-Party Services",
            content: `We use the following third-party services:

| Service | Purpose | Data Shared |
|---|---|---|
| Supabase | Database & Auth | Account + financial data |
| OpenRouter / Anthropic | AI model API | Anonymised financial profile for prompt |
| Vercel | Hosting | Request logs (IP, headers) |
| AMFI / mfapi.in | Mutual fund NAVs | None (public API) |
| Yahoo Finance | Stock prices | None (public API) |

We do not use Google Analytics, Facebook Pixel, or any advertising trackers.`,
          },
          {
            title: "5. Your Rights Under DPDPA 2023",
            content: `As a Data Principal under India's DPDPA 2023, you have the right to:
• **Access:** Request a copy of all personal data we hold about you
• **Correction:** Update inaccurate personal data
• **Erasure:** Request deletion of your account and all associated data
• **Grievance Redressal:** Contact our Data Protection Officer

To exercise these rights, email us at privacy@monetra.app or use the Settings > Delete Account option in the app.`,
          },
          {
            title: "6. Data Retention",
            content: `• Active account data: Retained while your account is active
• Deleted accounts: All personal data erased within 30 days
• Financial transaction history: Can be exported before deletion
• Aggregated/anonymised analytics: May be retained indefinitely`,
          },
          {
            title: "7. Children's Privacy",
            content: `Monetra is not intended for users under 18 years of age. We do not knowingly collect personal data from minors. If we become aware that a minor has provided us with personal data, we will delete it promptly.`,
          },
          {
            title: "8. Changes to This Policy",
            content: `We may update this Privacy Policy. We will notify you via email and in-app notification at least 14 days before material changes take effect. Continued use after the effective date constitutes acceptance.`,
          },
          {
            title: "9. Contact Us",
            content: `**Data Protection Officer:** Monetra\nprivacy@monetra.app\n\nFor grievances under DPDPA 2023, you may also approach the Data Protection Board of India.`,
          },
        ].map((section) => (
          <div key={section.title} className="space-y-3">
            <h2 className="font-bold text-base text-[var(--text-main)]">{section.title}</h2>
            <div className="text-sm text-[var(--text-sec)] leading-relaxed whitespace-pre-line">
              {section.content.split("\n").map((line, i) => {
                if (line.startsWith("**") && line.endsWith("**")) {
                  return <p key={i} className="font-bold text-[var(--text-main)] mt-2">{line.replace(/\*\*/g, "")}</p>;
                }
                if (line.startsWith("|") && !line.includes("---")) {
                  const cells = line.split("|").filter(Boolean).map(c => c.trim());
                  return <div key={i} className="flex gap-4 border-b border-[var(--border)] py-2 text-xs">{cells.map((c, ci) => <span key={ci} className="flex-1">{c.replace(/\*\*/g, "")}</span>)}</div>;
                }
                return <p key={i} className="mt-1">{line.replace(/\*\*/g, "")}</p>;
              })}
            </div>
            <div className="border-b border-[var(--border)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

