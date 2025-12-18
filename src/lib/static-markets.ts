/**
 * Static Market Data for Production Demo
 * 
 * Used when blockchain connection is unavailable or for initial demo
 * Data is designed to look realistic and showcase platform capabilities
 */

import { parseEther } from 'viem';

export interface StaticMarketData {
  id: bigint;
  question: string;
  description: string;
  category: string;
  creator: string;
  endTime: bigint;
  totalYesAmount: bigint;
  totalNoAmount: bigint;
  resolved: boolean;
  outcome: boolean;
  resolvedAt: bigint;
  aiOracleEnabled: boolean;
}

// Demo wallet addresses (realistic looking)
const DEMO_CREATORS = {
  artist: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
  brand: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
  community: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
};

// Calculate end times (realistic dates)
const now = Math.floor(Date.now() / 1000);
const DAY = 86400;
const WEEK = DAY * 7;

export const STATIC_MARKETS: StaticMarketData[] = [
  {
    id: 1n,
    question: "Will Bored Ape #7495 sell for over 100 ETH by December 31, 2025?",
    description: "Popular BAYC NFT currently listed at 95 ETH. Market sentiment is bullish with recent floor price increases.",
    category: "NFT",
    creator: DEMO_CREATORS.artist,
    endTime: BigInt(now + 13 * DAY), // 13 days from now
    totalYesAmount: parseEther('142.5'),
    totalNoAmount: parseEther('87.3'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 2n,
    question: "Will Bitcoin reach $120,000 before February 2026?",
    description: "BTC currently at $105K. Institutional adoption accelerating, but regulatory concerns remain.",
    category: "Crypto",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 45 * DAY), // 45 days from now
    totalYesAmount: parseEther('285.7'),
    totalNoAmount: parseEther('194.2'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 3n,
    question: "Will Taylor Swift release a new album in Q1 2026?",
    description: "Recent studio activity and social media hints suggest new music coming. Insiders report recording sessions.",
    category: "Entertainment",
    creator: DEMO_CREATORS.brand,
    endTime: BigInt(now + 103 * DAY), // ~3.5 months
    totalYesAmount: parseEther('67.8'),
    totalNoAmount: parseEther('45.1'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 4n,
    question: "Will Ethereum successfully complete the next major upgrade by March 2026?",
    description: "Pectra upgrade scheduled for Q1 2026. Testnet results positive but timeline historically delays.",
    category: "Technology",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 92 * DAY),
    totalYesAmount: parseEther('178.4'),
    totalNoAmount: parseEther('122.9'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 5n,
    question: "Will Nike launch a Web3 sneaker collection before April 2026?",
    description: "Nike's .SWOOSH platform gaining traction. Leaked designs show AR-enabled digital wearables coming soon.",
    category: "Fashion",
    creator: DEMO_CREATORS.brand,
    endTime: BigInt(now + 115 * DAY),
    totalYesAmount: parseEther('94.3'),
    totalNoAmount: parseEther('71.6'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 6n,
    question: "Will a Web3 game reach 1M daily active users before June 2026?",
    description: "Top contenders: Off The Grid, Parallel, and Big Time. Mobile gaming integration is key factor.",
    category: "Gaming",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 165 * DAY),
    totalYesAmount: parseEther('156.2'),
    totalNoAmount: parseEther('203.7'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
];

// Helper to get market by ID
export function getStaticMarket(marketId: number): StaticMarketData | undefined {
  return STATIC_MARKETS.find(m => Number(m.id) === marketId);
}

// Helper to get market count
export function getStaticMarketCount(): bigint {
  return BigInt(STATIC_MARKETS.length);
}

// Helper to check if static mode is enabled
export function isStaticMode(): boolean {
  // Check if we're in production or if NEXT_PUBLIC_USE_STATIC_DATA is set
  return (
    process.env.NEXT_PUBLIC_USE_STATIC_DATA === 'true' ||
    process.env.NODE_ENV === 'production'
  );
}

// Export for display
export { DEMO_CREATORS };
