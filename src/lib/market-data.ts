import { Market, MarketCategoryInfo } from '@/types/market';

// Helper function to get market odds
export const calculateMarketOdds = (
  totalYes: bigint,
  totalNo: bigint,
): { yesOdds: number; noOdds: number; yesPrice: number; noPrice: number } => {
  const total = Number(totalYes + totalNo);
  if (total === 0) {
    return { yesOdds: 50, noOdds: 50, yesPrice: 0.5, noPrice: 0.5 };
  }

  const yesOdds = (Number(totalYes) / total) * 100;
  const noOdds = (Number(totalNo) / total) * 100;

  return {
    yesOdds: Math.round(yesOdds * 10) / 10,
    noOdds: Math.round(noOdds * 10) / 10,
    yesPrice: Math.round((yesOdds / 100) * 100) / 100,
    noPrice: Math.round((noOdds / 100) * 100) / 100,
  };
};

// Format BNB amount
export const formatBNB = (amount: bigint): string => {
  const bnb = Number(amount) / 1e18;
  return bnb.toFixed(4);
};

// Format USD amount (with dynamic BNB price)
export const formatUSD = (amount: bigint, bnbPrice: number = 600): string => {
  const bnb = Number(amount) / 1e18;
  const usd = bnb * bnbPrice;
  return usd.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// API functions to fetch dynamic data
export async function fetchMarketCategories(): Promise<MarketCategoryInfo[]> {
  // TODO: Implement API call to fetch categories from backend or blockchain
  const response = await fetch('/api/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch market categories');
  }
  return response.json();
}

export async function fetchMarkets(category?: string, searchQuery?: string): Promise<Market[]> {
  // TODO: Implement API call to fetch markets from blockchain or backend
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (searchQuery) params.append('search', searchQuery);
  
  const response = await fetch(`/api/markets?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch markets');
  }
  return response.json();
}

export async function fetchMarketById(marketId: string): Promise<Market> {
  // TODO: Implement API call to fetch specific market from blockchain
  const response = await fetch(`/api/markets/${marketId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch market');
  }
  return response.json();
}
