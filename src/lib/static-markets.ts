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
    question: "Will Moonbirds complete Season 3 art reveal by January 15, 2026?",
    description: "PROOF acquired Moonbirds with ambitious roadmap. 10K holders awaiting Season 3 trait reveals. Spencer Gordon promises 'unprecedented utility drop' in Q1.",
    category: "NFT",
    creator: DEMO_CREATORS.artist,
    endTime: BigInt(now + 28 * DAY),
    totalYesAmount: parseEther('234.7'),
    totalNoAmount: parseEther('156.3'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 2n,
    question: "Will a major music artist drop exclusive album on Sound.xyz before Feb 2026?",
    description: "Sound.xyz revolutionizing music NFTs with $47.2B industry. Catalog sales up 284% in 2025. Warner-signed artists exploring Web3 drops after Grimes success.",
    category: "Music",
    creator: DEMO_CREATORS.artist,
    endTime: BigInt(now + 45 * DAY),
    totalYesAmount: parseEther('298.4'),
    totalNoAmount: parseEther('187.6'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 3n,
    question: "Will Nike .SWOOSH drop physical-redeemable NFT sneakers in Q1 2026?",
    description: "Nike's Web3 platform has 800K users. Leaked designs show AR-enabled digital twins. Previous drops sold out in 7 minutes. Phygital future incoming.",
    category: "Fashion",
    creator: DEMO_CREATORS.brand,
    endTime: BigInt(now + 75 * DAY),
    totalYesAmount: parseEther('412.9'),
    totalNoAmount: parseEther('298.1'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 4n,
    question: "Will CryptoPunks IP sale complete before March 2026?",
    description: "$20M licensing deal rumored with Node Foundation. Yuga Labs restructuring IP strategy. Punk holders voting on commercialization rights. Historic moment for NFTs.",
    category: "NFT",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 85 * DAY),
    totalYesAmount: parseEther('567.3'),
    totalNoAmount: parseEther('434.7'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 5n,
    question: "Will Vevo DSCVR Artists 2026 mint exclusive NFT collection?",
    description: "Vevo launching Web3 strategy for emerging artists (Royel Otis, Sailorr, Sayf). Music copyright at $47.2B. Early access NFTs for superfans being tested.",
    category: "Music",
    creator: DEMO_CREATORS.brand,
    endTime: BigInt(now + 65 * DAY),
    totalYesAmount: parseEther('178.5'),
    totalNoAmount: parseEther('134.2'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 6n,
    question: "Will Zora creator protocol exceed 100K artists by February 2026?",
    description: "Currently 68K creators on Zora. 0% platform fees disrupting OpenSea. NFT Now reporting 'creator exodus' from centralized platforms. Momentum building.",
    category: "Creative",
    creator: DEMO_CREATORS.artist,
    endTime: BigInt(now + 55 * DAY),
    totalYesAmount: parseEther('289.6'),
    totalNoAmount: parseEther('223.4'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 7n,
    question: "Will Art Blocks launch AI-generative collection before March 2026?",
    description: "Anna Ridler & Sofia Crespo won ABS Digital Art Prize with AI works. Art Blocks exploring 'hybrid creativity'. Collectors divided on AI authenticity.",
    category: "Art",
    creator: DEMO_CREATORS.artist,
    endTime: BigInt(now + 82 * DAY),
    totalYesAmount: parseEther('156.8'),
    totalNoAmount: parseEther('198.2'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 8n,
    question: "Will a fashion brand launch tokenized runway collection in Paris Fashion Week?",
    description: "Paris Fashion Week Feb 24 - Mar 4. Dolce & Gabbana, Gucci exploring Web3. Physical garments with NFT certificates. Metaverse wearables gaining traction.",
    category: "Fashion",
    creator: DEMO_CREATORS.brand,
    endTime: BigInt(now + 72 * DAY),
    totalYesAmount: parseEther('324.5'),
    totalNoAmount: parseEther('267.9'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 9n,
    question: "Will The Weeknd's $1B catalog tokenization include NFT royalties?",
    description: "Lyric Capital closed $1B deal. Music industry watching tokenized royalty split. Could revolutionize catalog sales. Fans demand ownership participation.",
    category: "Music",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 95 * DAY),
    totalYesAmount: parseEther('445.2'),
    totalNoAmount: parseEther('389.8'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 10n,
    question: "Will Decentralized Pictures fund indie film via NFT presale before April 2026?",
    description: "Shibuya raised $1.7M for 'White Rabbit'. A24 exploring Web3 distribution. Tokenized film rights disrupting Hollywood funding. Sundance buzz building.",
    category: "Film",
    creator: DEMO_CREATORS.brand,
    endTime: BigInt(now + 115 * DAY),
    totalYesAmount: parseEther('198.4'),
    totalNoAmount: parseEther('156.7'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 11n,
    question: "Will Paragraph migrate 10K+ Substack writers by Q2 2026?",
    description: "Web3 newsletter platform offering 0% fees vs Substack's 10%. Mirror already has 50K creators. Writers seeking Web3 monetization and token gating.",
    category: "Writing",
    creator: DEMO_CREATORS.artist,
    endTime: BigInt(now + 145 * DAY),
    totalYesAmount: parseEther('167.9'),
    totalNoAmount: parseEther('134.1'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 12n,
    question: "Will a Grammy-winning artist drop music video as NFT collection?",
    description: "Grammys Feb 2026. TikTok-music NFTs trending. BMG expanding Web3 publishing. Doja Cat's samples generating $2M+ royalties. NFT collectibles next.",
    category: "Music",
    creator: DEMO_CREATORS.artist,
    endTime: BigInt(now + 68 * DAY),
    totalYesAmount: parseEther('378.6'),
    totalNoAmount: parseEther('312.4'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 13n,
    question: "Will Lens Protocol reach 1M monthly active creators by March 2026?",
    description: "Currently 400K users. Web3 social graph enabling creator monetization. Instagram/Twitter creators exploring decentralized alternatives. Growth accelerating.",
    category: "Social",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 92 * DAY),
    totalYesAmount: parseEther('289.3'),
    totalNoAmount: parseEther('245.7'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 14n,
    question: "Will Aave TVL surpass $40B before end of January 2026?",
    description: "Currently at $33.289B with strong momentum. DeFi blue-chip with proven track record. Ethereum recovery and institutional adoption driving growth.",
    category: "DeFi",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 43 * DAY),
    totalYesAmount: parseEther('312.4'),
    totalNoAmount: parseEther('187.9'),
    resolved: false,
    outcome: false,
    resolvedAt: 0n,
    aiOracleEnabled: true,
  },
  {
    id: 15n,
    question: "Will Hyperliquid (HYPE) reach $50 before Valentine's Day 2026?",
    description: "Trading at $23.68, up 14.7% weekly. Perps DEX stealing market share from CEXs. $6.4B mcap with strong community and product-market fit.",
    category: "DeFi",
    creator: DEMO_CREATORS.community,
    endTime: BigInt(now + 58 * DAY),
    totalYesAmount: parseEther('428.7'),
    totalNoAmount: parseEther('294.3'),
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
