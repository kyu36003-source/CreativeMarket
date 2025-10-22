import { http, createConfig } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Get WalletConnect project ID from environment
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect may not work properly.');
}

// BNB Chain Configuration
export const bnbChainConfig = createConfig({
  chains: [bsc, bscTestnet],
  connectors: [
    injected(),
    walletConnect({
      projectId: walletConnectProjectId || '',
    }),
  ],
  transports: {
    [bsc.id]: http(process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'),
    [bscTestnet.id]: http(process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/'),
  },
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
