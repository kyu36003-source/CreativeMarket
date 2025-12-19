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
  // CRYPTO PRICE PREDICTIONS
  {
    id: 1n,
    question: "Will Bitcoin reach $150,000 by end of Q1 2026?",
    description: "BTC currently at $106K. Institutional adoption accelerating with BlackRock ETF inflows hitting $2.1B weekly. MicroStrategy buying, halving effects materializing.",
    category: "Crypto",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 103 * DAY),
    totalYesAmount: parseEther('845.2'),
    totalNoAmount: parseEther('634.8'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 2n,
    question: "Will Ethereum reach $6,000 before March 2026?",
    description: "ETH at $3,942. Pectra upgrade launching Jan 2026 with major scalability improvements. Staking yields attractive at 3.2%. Institutional interest growing.",
    category: "Crypto",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 73 * DAY),
    totalYesAmount: parseEther('623.7'),
    totalNoAmount: parseEther('489.3'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 3n,
    question: "Will Solana flip BNB in market cap by February 2026?",
    description: "SOL at $213 ($103B mcap) vs BNB at $108B. Solana's DeFi TVL growing 40% monthly. Firedancer upgrade promising 1M TPS. Memecoin mania driving adoption.",
    category: "Crypto",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 45 * DAY),
    totalYesAmount: parseEther('534.9'),
    totalNoAmount: parseEther('412.1'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },

  // DEFI PROTOCOLS
  {
    id: 4n,
    question: "Will Aave TVL surpass $50B before end of Q1 2026?",
    description: "Currently at $33.2B with strong momentum. V4 launch imminent with cross-chain liquidity. Real-world assets integration attracting institutions. DeFi leader.",
    category: "DeFi",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 103 * DAY),
    totalYesAmount: parseEther('712.4'),
    totalNoAmount: parseEther('487.9'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 5n,
    question: "Will Uniswap v4 reach $100B in cumulative volume by March 2026?",
    description: "V4 hooks revolutionizing AMM design. Currently processing $1.8B daily. Fee switch debate resolved. Institutional integrations with Paradigm backing.",
    category: "DeFi",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 92 * DAY),
    totalYesAmount: parseEther('489.6'),
    totalNoAmount: parseEther('398.4'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 6n,
    question: "Will MakerDAO rebrand to Sky complete migration before February 2026?",
    description: "USDS stablecoin replacing DAI. $5B locked in migration contracts. Governance vote passed 89%. New tokenomics launching. DeFi OG's biggest transformation.",
    category: "DeFi",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 62 * DAY),
    totalYesAmount: parseEther('612.8'),
    totalNoAmount: parseEther('445.2'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },

  // NFT & GAMING
  {
    id: 7n,
    question: "Will Azuki Elementals floor price exceed 3 ETH by Q1 2026?",
    description: "Currently at 1.2 ETH. Anime studio partnership announced. Physical redemptions launching. Chiru Labs rebuilding trust after rocky launch. Community hopeful.",
    category: "NFT",
    creator: DEMO_CREATORS.artist,
    endTime: BigInt(now + 95 * DAY),
    totalYesAmount: parseEther('234.5'),
    totalNoAmount: parseEther('312.7'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 8n,
    question: "Will Illuvium exceed 100K monthly active players by March 2026?",
    description: "Open beta launched with 45K players. AAA graphics and gameplay. $72M raised. Polygon zkEVM integration smooth. GameFi finally delivering on promise.",
    category: "NFT",
    creator: DEMO_CREATORS.brand,
    endTime: BigInt(now + 82 * DAY),
    totalYesAmount: parseEther('456.9'),
    totalNoAmount: parseEther('378.1'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },

  // ALTCOINS
  {
    id: 9n,
    question: "Will Chainlink reach $50 before end of Q1 2026?",
    description: "LINK at $28.34. CCIP adoption exploding with SWIFT partnership. Staking v0.2 launching. Banking giants testing oracles. 900+ integrations and growing.",
    category: "Crypto",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 103 * DAY),
    totalYesAmount: parseEther('678.3'),
    totalNoAmount: parseEther('521.7'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 10n,
    question: "Will Arbitrum TVL exceed Optimism by February 2026?",
    description: "ARB at $8.2B TVL vs OP at $7.1B. Stylus upgrade enabling Rust contracts. Gaming partnerships announced. L2 wars heating up. Ethereum scaling battle.",
    category: "DeFi",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 58 * DAY),
    totalYesAmount: parseEther('512.6'),
    totalNoAmount: parseEther('434.4'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },

  // CRYPTO EVENTS
  {
    id: 11n,
    question: "Will Bitcoin ETF options launch before March 2026?",
    description: "SEC reviewing applications from Cboe, CME. BlackRock lobbying heavily. $56B in ETF inflows creating demand. Options could unlock $100B+ in derivatives.",
    category: "Crypto",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 82 * DAY),
    totalYesAmount: parseEther('723.4'),
    totalNoAmount: parseEther('512.6'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 12n,
    question: "Will Ethereum ETF inflows exceed $10B by end of Q1 2026?",
    description: "Currently at $3.2B total inflows. Grayscale conversion complete. Fidelity, BlackRock marketing ramping up. Staking yields attracting institutions.",
    category: "Crypto",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 103 * DAY),
    totalYesAmount: parseEther('598.7'),
    totalNoAmount: parseEther('489.3'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },

  // MUSIC & ARTISTS
  {
    id: 13n,
    question: "Will Beyoncé announce album release before March 2026?",
    description: "Cryptic Instagram posts hint at studio sessions. Renaissance tour film broke records. Fans analyzing lyrics for clues. Parkwood Entertainment tight-lipped.",
    category: "Music",
    creator: DEMO_CREATORS.artist,
    endTime: BigInt(now + 85 * DAY),
    totalYesAmount: parseEther('456.8'),
    totalNoAmount: parseEther('378.2'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 14n,
    question: "Will Drake's 'For All The Dogs' go #1 on Billboard by February 2026?",
    description: "Album dropped with mixed reviews. Streaming numbers strong at 400M+ first week. Competition from Doja Cat and Bad Bunny. Chart battle heating up.",
    category: "Music",
    creator: DEMO_CREATORS.artist,
    endTime: BigInt(now + 55 * DAY),
    totalYesAmount: parseEther('389.4'),
    totalNoAmount: parseEther('312.6'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },

  // MOVIES & TV
  {
    id: 15n,
    question: "Will Dune 3 release date be announced before Q2 2026?",
    description: "Denis Villeneuve confirmed working on Messiah. Part Two grossed $714M. Legendary Pictures eager. Script in development. Fans demanding trilogy conclusion.",
    category: "Movies",
    creator: DEMO_CREATORS.brand,
    endTime: BigInt(now + 163 * DAY),
    totalYesAmount: parseEther('534.7'),
    totalNoAmount: parseEther('423.3'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 16n,
    question: "Will Stranger Things Season 5 premiere before July 2026?",
    description: "Final season filming wrapped December 2025. Netflix confirmed 2026 release. Post-production ongoing. Massive finale promised. 286M+ viewers waiting.",
    category: "Movies",
    creator: DEMO_CREATORS.brand,
    endTime: BigInt(now + 195 * DAY),
    totalYesAmount: parseEther('612.9'),
    totalNoAmount: parseEther('478.1'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },

  // CELEBRITY RELATIONSHIPS
  {
    id: 17n,
    question: "Will Taylor Swift and Travis Kelce announce engagement before Q2 2026?",
    description: "Dating since Sept 2023. NFL season boosting visibility. Travis seen at Tiffany's. Swifties analyzing every appearance. Vegas odds at 3:1.",
    category: "Entertainment",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 163 * DAY),
    totalYesAmount: parseEther('723.6'),
    totalNoAmount: parseEther('589.4'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 18n,
    question: "Will Bad Bunny release new album before March 2026?",
    description: "Last album Oct 2023. Studio sessions reported in Puerto Rico. Collaboration rumors with Drake. 'Most wanted' tour grossed $435M. Fans demanding new music.",
    category: "Music",
    creator: DEMO_CREATORS.artist,
    endTime: BigInt(now + 85 * DAY),
    totalYesAmount: parseEther('467.8'),
    totalNoAmount: parseEther('398.2'),
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
