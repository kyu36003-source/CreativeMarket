import { http, createConfig, fallback } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Get WalletConnect project ID from environment
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

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

// Create connectors array - only include WalletConnect if valid project ID is provided
const createConnectors = () => {
  const connectors: ReturnType<typeof injected>[] = [injected()];
  
  // Only add WalletConnect if a real project ID is provided (not demo)
  if (walletConnectProjectId && walletConnectProjectId !== 'demo-project-id') {
    connectors.push(
      walletConnect({
        projectId: walletConnectProjectId,
        showQrModal: true,
        metadata: {
          name: 'PredictBNB',
          description: 'AI-Powered Prediction Markets on BNB Chain',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://predictbnb.app',
          icons: ['https://predictbnb.app/icon.png'],
        },
      }) as ReturnType<typeof injected>
    );
  } else {
    console.info('💡 WalletConnect disabled: Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID for mobile wallet support');
    console.info('💡 Get free project ID at: https://cloud.walletconnect.com');
  }
  
  return connectors;
};

// BNB Chain Configuration with fallback transports
export const bnbChainConfig = createConfig({
  chains: [bsc, bscTestnet],
  connectors: createConnectors(),
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
