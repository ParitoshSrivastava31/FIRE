'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Aggressive caching for mobile — reduces network chatter
            staleTime: 5 * 60 * 1000,        // 5 minutes before data is considered stale
            gcTime: 30 * 60 * 1000,           // 30 minutes before unused data is garbage collected
            refetchOnWindowFocus: false,       // Disable on mobile — WebView focus events are noisy
            refetchOnReconnect: true,          // Refetch when coming back online
            retry: 2,                          // Retry failed requests twice
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
