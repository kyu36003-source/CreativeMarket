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

export const STATIC_MARKETS: StaticMarketData[] = [
  {
    id: 1n,
    question: "Will Aave TVL surpass $40B before end of January 2026?",
    description: "Currently at $33.289B with strong growth momentum. Recent protocol upgrades and Ethereum recovery driving adoption. DeFi TVL showing bullish trends.",
    category: "DeFi",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 43 * DAY), // Jan 31, 2026
    totalYesAmount: parseEther('312.4'),
    totalNoAmount: parseEther('187.9'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 2n,
    question: "Will Hyperliquid (HYPE) reach $50 before February 14, 2026?",
    description: "Currently trading at $23.68, up 14.7% this week. Revolutionary perps DEX gaining market share from CEXs. $6.4B market cap and climbing.",
    category: "DeFi",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 58 * DAY), // Valentine's Day 2026
    totalYesAmount: parseEther('428.7'),
    totalNoAmount: parseEther('294.3'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 3n,
    question: "Will a creator-owned NFT marketplace flip OpenSea volume by March 2026?",
    description: "Blur, Foundation, and Zora collectively approaching OpenSea's market share. Creator royalties and gas optimization driving migration.",
    category: "Creative",
    creator: DEMO_CREATORS.artist,
    endTime: BigInt(now + 93 * DAY), // End of March 2026
    totalYesAmount: parseEther('198.5'),
    totalNoAmount: parseEther('267.8'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 4n,
    question: "Will Ethena (ENA) surpass $1 before March 1, 2026?",
    description: "Current price $0.1993, up 21.5% weekly. USDe stablecoin at $6.4B mcap. Institutional adoption accelerating with synthetic dollar demand.",
    category: "DeFi",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 72 * DAY),
    totalYesAmount: parseEther('367.2'),
    totalNoAmount: parseEther('423.9'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 5n,
    question: "Will Music NFT platforms generate $100M+ creator revenue in Q1 2026?",
    description: "Sound.xyz, Royal, and Catalog leading the charge. Direct-to-fan streaming royalties disrupting Spotify model. Major artists experimenting with drops.",
    category: "Creative",
    creator: DEMO_CREATORS.artist,
    endTime: BigInt(now + 103 * DAY), // End of Q1 2026
    totalYesAmount: parseEther('156.8'),
    totalNoAmount: parseEther('189.4'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 6n,
    question: "Will Lido (stETH) TVL exceed $30B before April 2026?",
    description: "Currently $25.739B despite 11.37% weekly decline. Ethereum staking dominance at 28%. Pectra upgrade expected to boost liquid staking demand.",
    category: "DeFi",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 115 * DAY),
    totalYesAmount: parseEther('289.3'),
    totalNoAmount: parseEther('312.6'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 7n,
    question: "Will AI-generated art surpass $50M in NFT sales by February 2026?",
    description: "Midjourney V7 and DALL-E 3 enabling professional quality. Art Blocks integrating AI tools. Debate over authenticity vs innovation driving discourse.",
    category: "Creative",
    creator: DEMO_CREATORS.artist,
    endTime: BigInt(now + 55 * DAY),
    totalYesAmount: parseEther('134.7'),
    totalNoAmount: parseEther('98.2'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 8n,
    question: "Will Uniswap V4 surpass $20B daily volume within 60 days of launch?",
    description: "V4 hooks enabling custom AMM logic. Solana DEXs at $11.6B daily volume proving demand. Fee revenue could 10x from current $525M/day.",
    category: "DeFi",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 95 * DAY),
    totalYesAmount: parseEther('412.9'),
    totalNoAmount: parseEther('368.4'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 9n,
    question: "Will tokenized film rights platform reach $250M valuation by May 2026?",
    description: "Decentralized Pictures and Shibuya leading fractional IP ownership. Independent filmmakers raising via NFT presales. A24 exploring Web3 distribution.",
    category: "Creative",
    creator: DEMO_CREATORS.brand,
    endTime: BigInt(now + 143 * DAY),
    totalYesAmount: parseEther('87.4'),
    totalNoAmount: parseEther('124.6'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 10n,
    question: "Will Ethereum hit $5000 before Bitcoin reaches $150K?",
    description: "ETH at $2835, BTC at $86,339. ETH/BTC ratio improving post-Shapella. Institutional flows favoring ETH ETFs. Pectra upgrade could be catalyst.",
    category: "DeFi",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 180 * DAY),
    totalYesAmount: parseEther('523.8'),
    totalNoAmount: parseEther('476.2'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 11n,
    question: "Will on-chain creator subscriptions exceed Patreon revenue by Q2 2026?",
    description: "Paragraph, Mirror, and Lens Protocol enabling Web3 subscriptions. 0% platform fees vs Patreon's 12%. 50K+ creators already migrated.",
    category: "Creative",
    creator: DEMO_CREATORS.artist,
    endTime: BigInt(now + 165 * DAY),
    totalYesAmount: parseEther('203.4'),
    totalNoAmount: parseEther('287.9'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 12n,
    question: "Will Pump.fun token hit $0.01 before March 2026?",
    description: "Currently $0.001886, up 31.9% weekly. Solana memecoin launchpad dominating with $1.1B mcap. Fee revenue surpassing major DEXs.",
    category: "DeFi",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 85 * DAY),
    totalYesAmount: parseEther('342.6'),
    totalNoAmount: parseEther('298.7'),
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
