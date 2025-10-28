// ============================================================================
// BNB Chain EXCLUSIVE Web3 Configuration
// ============================================================================
//
// 🟡 IMPORTANT: This dApp ONLY works on BNB Chain (BSC)
// 
// Supported Networks:
// ✅ BNB Chain Mainnet (Chain ID: 56)
// ✅ BNB Chain Testnet (Chain ID: 97)
//
// NOT Supported:
// ❌ Ethereum, Polygon, Arbitrum, Optimism, Avalanche, etc.
//
// Why BNB Chain exclusive? 
// - Ultra-low transaction fees ($0.10-0.30 vs $5-50 on Ethereum)
// - 3-second block times (vs 12s on Ethereum)
// - 50M+ active wallets
// - Perfect for gasless transaction implementation
// - Native integration with Binance ecosystem
//
// See full explanation: /docs/BNB_CHAIN_EXCLUSIVE.md
// ============================================================================

import { http, createConfig, fallback } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Multiple RPC endpoints for fallback (improves reliability)
const BSC_MAINNET_RPCS = [
  process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
  'https://bsc-dataseed1.binance.org/',
  'https://bsc-dataseed2.binance.org/',
  'https://bsc-dataseed3.binance.org/',
  'https://bsc.publicnode.com',
];

const BSC_TESTNET_RPCS = [
  process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  'https://data-seed-prebsc-2-s1.binance.org:8545/',
  'https://bsc-testnet.publicnode.com',
];

// BNB Chain Configuration with fallback transports
export const bnbChainConfig = createConfig({
  chains: [bsc, bscTestnet],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    // Use fallback transport with multiple RPC endpoints for better reliability
    [bsc.id]: fallback(
      BSC_MAINNET_RPCS.map((url) => 
        http(url, {
          batch: {
            wait: 100, // Batch requests to reduce connection count
          },
          timeout: 10000, // 10 second timeout
          retryCount: 3,
          retryDelay: 1000, // 1 second between retries
          // Force HTTP polling instead of WebSocket
          fetchOptions: {
            mode: 'cors',
          },
        })
      ),
      {
        rank: true, // Automatically rank transports by latency
      }
    ),
    [bscTestnet.id]: fallback(
      BSC_TESTNET_RPCS.map((url) => 
        http(url, {
          batch: {
            wait: 100,
          },
          timeout: 10000,
          retryCount: 3,
          retryDelay: 1000,
          fetchOptions: {
            mode: 'cors',
          },
        })
      ),
      {
        rank: true,
      }
    ),
  },
  // Automatically reconnect on mount
  ssr: true,
  // Additional stability options
  multiInjectedProviderDiscovery: true,
  // Polling interval for block updates (prevents WebSocket usage)
  pollingInterval: 4000, // Poll every 4 seconds instead of using WebSocket
});

// Chain IDs for easy reference
export const CHAIN_IDS = {
  BSC_MAINNET: 56,
  BSC_TESTNET: 97,
} as const;

// RPC URLs - fetch from environment or use defaults
export const RPC_URLS = {
  [CHAIN_IDS.BSC_MAINNET]: process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
  [CHAIN_IDS.BSC_TESTNET]: process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/',
} as const;

// Block Explorer URLs
export const EXPLORER_URLS = {
  [CHAIN_IDS.BSC_MAINNET]: 'https://bscscan.com',
  [CHAIN_IDS.BSC_TESTNET]: 'https://testnet.bscscan.com',
} as const;

// Native Currency
export const NATIVE_CURRENCY = {
  name: 'BNB',
  symbol: 'BNB',
  decimals: 18,
} as const;
