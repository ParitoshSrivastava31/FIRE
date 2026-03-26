'use client';

import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Serif_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['300', '400', '500', '600', '700'],
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-dm-serif',
  weight: '400',
  style: ['normal', 'italic'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
});

function NativeInit() {
  useEffect(() => {
    const init = async () => {
      if (!Capacitor.isNativePlatform()) return;

      // Status bar: light mode — dark icons on white/cream background
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      try {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#FAFAFA' });
        await StatusBar.show();
      } catch {
        // StatusBar may not be available on all platforms — fail silently
      }

      // Handle app URL opens (deep links for push notification taps)
      const { App } = await import('@capacitor/app');
      App.addListener('appUrlOpen', (event) => {
        try {
          const url = new URL(event.url);
          const path = url.pathname;
          if (path && path !== '/') {
            window.location.href = path;
          }
        } catch {
          // Malformed URL — ignore
        }
      });
    };

    init();
  }, []);

  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Monetra | India&apos;s First Lifestyle-to-Investment AI Finance Planner</title>
        <meta
          name="description"
          content="Turn your lifestyle into a wealth strategy. Monetra uses AI to audit your spending and build a personalised investment portfolio tailored to the Indian market."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#FAFAFA" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${plusJakarta.variable} ${dmSerif.variable} ${jetbrainsMono.variable} antialiased selection:bg-gold selection:text-white`}
      >
        <NativeInit />
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
