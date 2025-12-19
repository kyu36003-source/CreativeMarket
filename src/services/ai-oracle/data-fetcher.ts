/**
 * Data Fetcher for AI Oracle
 * Fetches data from multiple sources based on market category
 */

import type { SourceData } from './types';

interface MarketData {
  id: number;
  question: string;
  description: string;
  category: string;
  endTime: number;
}

/**
 * Fetch data from multiple sources for market resolution
 */
export async function fetchMarketData(market: MarketData): Promise<SourceData[]> {
  const sources: SourceData[] = [];

  try {
    // Determine which data sources to use based on category
    const category = market.category.toLowerCase();

    if (category === 'crypto' || category === 'defi') {
      // Crypto price data
      const cryptoData = await fetchCryptoData(market);
      if (cryptoData) sources.push(cryptoData);
    }

    if (category === 'nft' || category === 'gaming') {
      // NFT market data
      const nftData = await fetchNFTData(market);
      if (nftData) sources.push(nftData);
    }

    // Always try general web search for additional context
    const webData = await fetchWebData(market);
    if (webData) sources.push(webData);

    return sources;
  } catch (error) {
    console.error('[Data Fetcher] Error:', error);
    return sources; // Return whatever we managed to fetch
  }
}

/**
 * Fetch cryptocurrency price data from CoinGecko
 */
async function fetchCryptoData(market: MarketData): Promise<SourceData | null> {
  try {
    // Extract coin symbol from question (e.g., "Bitcoin", "BTC", "Ethereum")
    const coinMapping: Record<string, string> = {
      bitcoin: 'bitcoin',
      btc: 'bitcoin',
      ethereum: 'ethereum',
      eth: 'ethereum',
      bnb: 'binancecoin',
      binance: 'binancecoin',
      solana: 'solana',
      sol: 'solana',
      cardano: 'cardano',
      ada: 'cardano',
    };

    const questionLower = market.question.toLowerCase();
    let coinId: string | undefined;

    for (const [keyword, id] of Object.entries(coinMapping)) {
      if (questionLower.includes(keyword)) {
        coinId = id;
        break;
      }
    }

    if (!coinId) {
      console.log('[Crypto Data] No recognized coin in question');
      return null;
    }

    // Free CoinGecko API endpoint (no key required)
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const coinData = data[coinId];

    if (!coinData) {
      return null;
    }

    return {
      source: 'CoinGecko',
      category: 'crypto',
      fetchedAt: new Date(),
      data: {
        coin: coinId,
        price: coinData.usd,
        change24h: coinData.usd_24h_change,
        marketCap: coinData.usd_market_cap,
      },
      confidence: 9500, // 95% - CoinGecko is reliable
      metadata: {
        apiVersion: 'v3',
      },
    } as SourceData;
  } catch (error) {
    console.error('[Crypto Data] Fetch error:', error);
    return null;
  }
}

/**
 * Fetch NFT market data (simplified - would need real API in production)
 */
async function fetchNFTData(_market: MarketData): Promise<SourceData | null> {
  try {
    // In production, use OpenSea API, Reservoir, or similar
    // For now, return mock structure
    return {
      source: 'NFT Market Data',
      category: 'crypto' as any,
      fetchedAt: new Date(),
      data: {
        note: 'NFT data fetching not implemented - would use OpenSea/Reservoir API',
      },
      confidence: 5000, // 50% - placeholder
      metadata: {},
    } as SourceData;
  } catch (error) {
    console.error('[NFT Data] Fetch error:', error);
    return null;
  }
}

/**
 * Fetch general web data (simplified - would use search API in production)
 */
async function fetchWebData(market: MarketData): Promise<SourceData | null> {
  try {
    // In production, use Google Custom Search, Bing API, or similar
    // For now, return structured context
    return {
      source: 'Web Search',
      category: 'general',
      fetchedAt: new Date(),
      data: {
        question: market.question,
        description: market.description,
        category: market.category,
        endTime: market.endTime,
        note: 'Would fetch relevant news articles and web sources in production',
      },
      confidence: 7000, // 70%
      metadata: {},
    } as SourceData;
  } catch (error) {
    console.error('[Web Data] Fetch error:', error);
    return null;
  }
}

/**
 * Extract price target from question
 * e.g., "Will Bitcoin reach $50,000?" -> 50000
 */
export function extractPriceTarget(question: string): number | null {
  // Match patterns like "$50,000", "$50000", "$50k", "50000 USD"
  const patterns = [
    /\$([0-9,]+)/,
    /([0-9,]+)\s*USD/i,
    /([0-9,]+)k/i,
  ];

  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match) {
      let value = match[1].replace(/,/g, '');
      if (question.toLowerCase().includes('k')) {
        value = (parseFloat(value) * 1000).toString();
      }
      return parseFloat(value);
    }
  }

  return null;
}

/**
 * Extract date from question
 * e.g., "by January 15th" -> Date
 */
export function extractTargetDate(question: string): Date | null {
  // Simplified date extraction - in production use proper date parsing library
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
  ];

  const questionLower = question.toLowerCase();
  
  for (let i = 0; i < monthNames.length; i++) {
    if (questionLower.includes(monthNames[i])) {
      // Found month - try to extract day and year
      const dayMatch = question.match(/(\d{1,2})(st|nd|rd|th)?/);
      const yearMatch = question.match(/20\d{2}/);
      
      const day = dayMatch ? parseInt(dayMatch[1]) : 1;
      const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
      
      return new Date(year, i, day);
    }
  }

  return null;
}
