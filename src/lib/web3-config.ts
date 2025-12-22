// ============================================================================
// BNB Chain EXCLUSIVE Web3 Configuration with RainbowKit
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

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';

// RainbowKit configuration with BNB Chain support
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!walletConnectProjectId || walletConnectProjectId === 'demo-project-id') {
  console.warn('⚠️ WalletConnect: Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in env');
}

export const bnbChainConfig = getDefaultConfig({
  appName: 'PredictBNB',
  projectId: walletConnectProjectId || '7d5b379d54bd7c2bafb6464aacf75b68', // Fallback to actual project ID
  chains: [bscTestnet, bsc],
  transports: {
    [bscTestnet.id]: http(
      process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL ||
        'https://data-seed-prebsc-1-s1.binance.org:8545/'
    ),
    [bsc.id]: http(
      process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'
    ),
  },
  ssr: true,
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
