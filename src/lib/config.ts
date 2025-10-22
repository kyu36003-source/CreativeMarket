// Configuration that should be fetched from environment variables
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'PredictBNB',
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'AI-Powered Prediction Markets on BNB Chain',
  url: process.env.NEXT_PUBLIC_SITE_URL || '',
  ogImage: process.env.NEXT_PUBLIC_OG_IMAGE || '',
  links: {
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
    github: process.env.NEXT_PUBLIC_GITHUB_URL || '',
  },
};

// API Configuration - should come from environment
export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || (
    process.env.NODE_ENV === 'production'
      ? '/api'
      : 'http://localhost:3000/api'
  ),
  oracleApiUrl: process.env.NEXT_PUBLIC_ORACLE_API_URL || '',
  marketDataUrl: process.env.NEXT_PUBLIC_MARKET_DATA_URL || '',
};
