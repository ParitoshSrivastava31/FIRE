import Link from "next/link";

export const metadata = {
  title: "Investment Disclaimer | Monetra",
  description: "Important disclaimers about AI-generated financial information on Monetra.",
};

export default function DisclaimerPage() {
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
          <h1 className="font-serif text-4xl text-[var(--text-main)]">Investment Disclaimer</h1>
          <p className="text-[var(--text-muted)] text-sm mt-3">Last updated: March 19, 2025</p>
        </div>

        <div className="bg-[var(--red)]/8 border border-[var(--red)]/20 rounded-2xl p-5 space-y-2">
          <p className="text-sm font-bold text-[var(--red)]">⚠️ Please Read Carefully Before Using AI Features</p>
          <p className="text-sm text-[var(--text-sec)] leading-relaxed">
            Monetra is <strong>NOT a SEBI Registered Investment Advisor</strong>. All AI-generated content is for educational purposes only. Past performance is not indicative of future results. Mutual fund investments are subject to market risks.
          </p>
        </div>

        {[
          {
            title: "Not Investment Advice",
            content: `Monetra provides AI-generated financial information through its investment thesis generator, spending audit tool, portfolio analysis, and AI chat features. This information:

• Is for educational and informational purposes ONLY
• Does NOT constitute personalised investment advice
• Is NOT a recommendation to buy, sell, or hold any security
• Is NOT tax advice or legal advice
• Is NOT guaranteed to be accurate, complete, or timely

Monetra, its founders, officers, employees, and AI systems are NOT registered with the Securities and Exchange Board of India (SEBI) as Investment Advisers under the SEBI (Investment Advisers) Regulations, 2013.`,
          },
          {
            title: "Market Risk Disclosure",
            content: `All investments involve risk. The following risks apply to investments discussed on this platform:

• **Equity Risk:** Stock and equity mutual fund prices can decline significantly
• **Interest Rate Risk:** Debt fund NAVs can fall when interest rates rise
• **Liquidity Risk:** Some investments (ELSS, PPF, NPS) have lock-in periods
• **Inflation Risk:** Returns may not always beat inflation
• **Currency Risk:** International funds are subject to exchange rate movements
• **Concentration Risk:** Overweighting any single sector or company increases risk

**Standard Mutual Fund Disclaimer:** "Mutual Fund investments are subject to market risks. Please read all scheme-related documents carefully before investing."`,
          },
          {
            title: "AI Limitations",
            content: `Monetra's AI system (powered by large language models):

• May generate inaccurate fund recommendations, AMFI codes, or performance data
• Does not have access to real-time market prices during thesis generation
• Cannot predict future market movements or guarantee any rate of return
• May not account for your complete personal financial situation
• Is based on general financial knowledge up to a training data cutoff

Always verify AI-generated information with official sources such as AMFI (amfiindia.com), NSE/BSE, or RBI.`,
          },
          {
            title: "No Client Relationship",
            content: `Use of Monetra does not create a client-advisor relationship. We are a technology company providing financial planning software tools, not a financial services company. No fiduciary duty is created by your use of the Platform.`,
          },
          {
            title: "SEBI RIA Referral Recommendation",
            content: `For personalised investment advice, we strongly recommend consulting a SEBI Registered Investment Adviser (RIA). You can find registered advisors at:

• SEBI SCORES Portal: scores.gov.in
• BASL (BSE Administration & Supervision Ltd): basl.com
• AMFI's registered distributors list: amfiindia.com`,
          },
          {
            title: "Projection Disclaimers",
            content: `All wealth projection charts and simulations shown on Monetra:

• Use assumed rates of return (7%, 11%, 15% CAGR) for illustrative purposes only
• Do not guarantee actual investment returns
• Assume consistent monthly contributions without market timing
• Do not account for taxes on capital gains
• Are mathematical projections, not predictions

Actual returns will vary based on market conditions, fund selection, timing, and individual circumstances.`,
          },
          {
            title: "Regulatory Framework",
            content: `Monetra operates as a financial technology (fintech) product under:
• Companies Act, 2013 (India)
• Information Technology Act, 2000 (India)
• Digital Personal Data Protection Act (DPDPA), 2023
• Consumer Protection Act, 2019

We are NOT regulated by SEBI, RBI, IRDAI, or PFRDA as a financial service provider.`,
          },
          {
            title: "Questions",
            content: `If you have questions about this disclaimer or our platform's nature, contact us at: legal@monetra.app`,
          },
        ].map((section) => (
          <div key={section.title} className="space-y-3">
            <h2 className="font-bold text-base text-[var(--text-main)]">{section.title}</h2>
            <div className="text-sm text-[var(--text-sec)] leading-relaxed">
              {section.content.split("\n").map((line, i) => {
                if (line.startsWith("• **") || line.startsWith("• ")) {
                  return <p key={i} className="ml-3 mt-1">• {line.slice(2).replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
                }
                if (line.startsWith("**") && line.endsWith("**")) {
                  return <p key={i} className="font-bold text-[var(--text-main)] mt-3">{line.replace(/\*\*/g, "")}</p>;
                }
                if (!line.trim()) return <div key={i} className="mt-2" />;
                return <p key={i} className="mt-1">{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
              })}
            </div>
            <div className="border-b border-[var(--border)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
