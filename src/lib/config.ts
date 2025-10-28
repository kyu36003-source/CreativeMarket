// ============================================================================
// Site Configuration - BNB Chain Exclusive Prediction Markets
// ============================================================================
// 
// 🟡 NETWORK SUPPORT: BNB CHAIN EXCLUSIVE
// This dApp is built exclusively for BNB Chain (BSC).
// Supported: BNB Mainnet (56), BNB Testnet (97)
// NOT Supported: Ethereum, Polygon, Arbitrum, or any other chains
//
// Why BNB Chain? See: /docs/BNB_CHAIN_EXCLUSIVE.md
// ============================================================================

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'PredictBNB',
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'BNB Chain Exclusive - Follow Top Traders. Auto-Copy Their Predictions. Earn While You Learn.',
  tagline: 'Copy Trading for Prediction Markets on BNB Chain',
  url: process.env.NEXT_PUBLIC_SITE_URL || '',
  ogImage: process.env.NEXT_PUBLIC_OG_IMAGE || '',
  
  // Network Configuration - BNB Chain Only
  network: {
    name: 'BNB Chain',
    mainnet: {
      chainId: 56,
      name: 'BNB Smart Chain Mainnet',
      nativeCurrency: 'BNB',
      rpcUrl: 'https://bsc-dataseed.binance.org/',
      explorer: 'https://bscscan.com',
    },
    testnet: {
      chainId: 97,
      name: 'BNB Smart Chain Testnet',
      nativeCurrency: 'BNB',
      rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      explorer: 'https://testnet.bscscan.com',
      faucet: 'https://www.bnbchain.org/en/testnet-faucet',
    },
  },
  
  links: {
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
    github: process.env.NEXT_PUBLIC_GITHUB_URL || '',
    discord: process.env.NEXT_PUBLIC_DISCORD_URL || '',
    telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL || '',
  },
  
  social: {
    twitterHandle: '@PredictBNB',
    discordInvite: 'https://discord.gg/predictbnb',
  },
} as const;

// ============================================================================
// API Configuration
// ============================================================================

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || (
    process.env.NODE_ENV === 'production'
      ? '/api'
      : 'http://localhost:3000/api'
  ),
  
  endpoints: {
    // Copy Trading
    topTraders: '/traders/leaderboard',
    traderProfile: (id: string) => `/traders/${id}`,
    followTrader: (id: string) => `/traders/${id}/follow`,
    unfollowTrader: (id: string) => `/traders/${id}/unfollow`,
    copySettings: '/user/copy-settings',
    traderStats: (id: string) => `/traders/${id}/stats`,
    
    // Markets
    markets: '/markets',
    marketById: (id: string) => `/markets/${id}`,
    trendingMarkets: '/markets/trending',
    
    // User
    profile: '/user/profile',
    portfolio: '/user/portfolio',
    followedTraders: '/user/following',
    followers: '/user/followers',
    achievements: '/user/achievements',
    
    // Analytics
    marketStats: (id: string) => `/analytics/market/${id}`,
    userStats: '/analytics/user',
  },
  
  // External APIs
  oracleApiUrl: process.env.NEXT_PUBLIC_ORACLE_API_URL || '',
  marketDataUrl: process.env.NEXT_PUBLIC_MARKET_DATA_URL || '',
} as const;

// ============================================================================
// Copy Trading Configuration
// ============================================================================

export const copyTradingConfig = {
  fees: {
    copyFee: 5,              // 5% of follower profits go to trader
    platformFee: 5,          // 5% platform fee on copy trades
    standardTradeFee: 2,     // 2% on direct trades
  },
  
  limits: {
    free: {
      maxFollowedTraders: 3,
      maxCopyAmount: 1,      // 1 BNB max per copy
      dailyLimit: 10,        // 10 BNB daily
    },
    premium: {
      maxFollowedTraders: 20,
      maxCopyAmount: 10,
      dailyLimit: 100,
    },
  },
  
  defaults: {
    copyPercentage: 50,      // Default 50% of trader's bet size
    maxPerTrade: 0.1,        // Default max 0.1 BNB per trade
    stopLoss: 20,            // Default 20% stop loss
  },
  
  verification: {
    minTradesForLeaderboard: 50,
    minDaysHistory: 30,
    kycRequiredForTop10: true,
  },
  
  badges: {
    bronze: { minFollowers: 10, color: '#CD7F32', title: 'Bronze Trader' },
    silver: { minFollowers: 100, color: '#C0C0C0', title: 'Silver Trader' },
    gold: { minFollowers: 500, color: '#FFD700', title: 'Gold Trader' },
    platinum: { minFollowers: 1000, color: '#E5E4E2', title: 'Platinum Trader' },
  },
} as const;

// ============================================================================
// Premium Subscription
// ============================================================================

export const premiumConfig = {
  price: {
    monthly: {
      usd: 19,
      bnb: 0.05,             // Approximate, should be dynamic
    },
    yearly: {
      usd: 190,              // 2 months free
      bnb: 0.5,
    },
  },
  
  features: [
    'Follow unlimited traders',
    'Zero copy trading fees',
    'Advanced analytics dashboard',
    'Custom alerts & notifications',
    'Early access to new markets',
    'Priority customer support',
    'API access',
    'Exclusive trader insights',
  ],
} as const;

// ============================================================================
// Gamification Configuration
// ============================================================================

export const gamificationConfig = {
  achievements: [
    { id: 'first_follow', name: 'First Follow', reward: 5, icon: '👥' },
    { id: 'first_win', name: 'First Win', reward: 10, icon: '🎯' },
    { id: 'streak_5', name: '5 Win Streak', reward: 25, icon: '🔥' },
    { id: 'streak_10', name: '10 Win Streak', reward: 50, icon: '⚡' },
    { id: 'follower_10', name: '10 Followers', reward: 50, icon: '⭐' },
    { id: 'follower_100', name: '100 Followers', reward: 200, icon: '💎' },
    { id: 'profit_1000', name: '$1K Profit', reward: 100, icon: '💰' },
    { id: 'profit_10000', name: '$10K Profit', reward: 500, icon: '🏆' },
  ],
  
  referralProgram: {
    referrerBonus: 10,       // 10% of referee's copy fees (lifetime)
    refereeBonus: 5,         // $5 signup bonus
    lifetime: true,
  },
  
  levels: {
    novice: { min: 0, max: 100, title: 'Novice Predictor' },
    trader: { min: 100, max: 500, title: 'Skilled Trader' },
    expert: { min: 500, max: 2000, title: 'Expert Trader' },
    master: { min: 2000, max: 10000, title: 'Master Trader' },
    legend: { min: 10000, max: Infinity, title: 'Legendary Oracle' },
  },
} as const;

// ============================================================================
// Feature Flags
// ============================================================================

export const featureFlags = {
  copyTrading: true,
  premiumSubscription: true,
  achievements: true,
  referrals: true,
  aiInsights: false,        // Coming soon
  liveMarkets: false,       // Coming soon
  socialFeed: false,        // Coming soon
} as const;
