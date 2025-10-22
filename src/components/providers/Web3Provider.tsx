'use client';

import { ReactNode, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { bnbChainConfig } from '@/lib/web3-config';
import { Web3ErrorBoundary } from '@/components/Web3ErrorBoundary';

// Create QueryClient with proper error handling and retry logic
const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent refetch on window focus to reduce connection attempts
        refetchOnWindowFocus: false,
        // Retry failed requests with exponential backoff
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Cache time
        staleTime: 60000, // 1 minute
      },
      mutations: {
        // Retry mutations on failure
        retry: 2,
      },
    },
  });
};

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Web3Provider({ children }: { children: ReactNode }) {
  // Only create the query client once per browser session
  const [queryClient] = useState(() => getQueryClient());

  return (
    <Web3ErrorBoundary>
      <WagmiProvider config={bnbChainConfig} reconnectOnMount={true}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </Web3ErrorBoundary>
  );
}
