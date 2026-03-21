import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/providers/QueryProvider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dm-serif",
  weight: "400",
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Monetra | India's First Lifestyle-to-Investment AI Finance Planner",
  description: "Turn your lifestyle into a wealth strategy. Monetra uses AI to audit your spending and build a personalised, real-time investment portfolio tailored to the Indian market.",
  keywords: ["AI Finance Planner", "Personal Finance India", "SIP Recommendations", "Expense Tracker AI", "Mutual Funds India", "Real Estate India"],
  authors: [{ name: "Monetra Team" }],
  creator: "Monetra HQ",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://monetra.in",
    title: "Monetra | AI Finance Planner",
    description: "The intelligent way to track spending and invest surplus for Indian professionals.",
    siteName: "Monetra",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monetra | AI Finance Planner",
    description: "Turn your lifestyle into a wealth strategy. Get AI-powered SIP and real estate recommendations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${dmSerif.variable} ${jetbrainsMono.variable} antialiased selection:bg-gold selection:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
