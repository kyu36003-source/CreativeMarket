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
  process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL ||
    'https://data-seed-prebsc-1-s1.binance.org:8545/',
  'https://data-seed-prebsc-2-s1.binance.org:8545/',
  'https://bsc-testnet.publicnode.com',
  'https://bsc-testnet-rpc.publicnode.com',
];

// BNB Chain Configuration with fallback transports
// Production ready - uses BSC Testnet with static data fallback
export const bnbChainConfig = createConfig({
  chains: [bscTestnet, bsc],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    // BSC Testnet (Chain ID 97) - Primary network for demo
    [bscTestnet.id]: fallback(
      BSC_TESTNET_RPCS.map(url =>
        http(url, {
          batch: {
            wait: 100,
          },
          timeout: 10000,
          retryCount: 2, // Reduced retries for faster fallback to static data
          retryDelay: 500,
          fetchOptions: {
            mode: 'cors',
          },
        })
      ),
      {
        rank: true,
      }
    ),
    // BSC Mainnet (Chain ID 56) - For future production use
    [bsc.id]: fallback(
      BSC_MAINNET_RPCS.map(url =>
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
  ssr: true,
  multiInjectedProviderDiscovery: true,
  pollingInterval: 4000,
});

// Chain IDs for easy reference
export const CHAIN_IDS = {
  BSC_MAINNET: 56,
  BSC_TESTNET: 97,
} as const;

// RPC URLs - fetch from environment or use defaults
export const RPC_URLS = {
  [CHAIN_IDS.BSC_MAINNET]:
    process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
  [CHAIN_IDS.BSC_TESTNET]:
    process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL ||
    'https://data-seed-prebsc-1-s1.binance.org:8545/',
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
