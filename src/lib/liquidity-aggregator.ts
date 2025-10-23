/**
 * Liquidity Aggregation Service
 * 
 * Solves: "Liquidity spread across many small markets"
 * Pools liquidity from similar creative markets for better pricing
 */

import type { CreativeMarketType } from './creative-templates';

export interface LiquidityPool {
  id: string;
  name: string;
  category: string;
  marketType: CreativeMarketType;
  totalLiquidity: string; // in USDC
  marketCount: number;
  apr: number;
  volume24h: string;
  lpTokens: string;
}

export interface MarketLiquidity {
  marketId: string;
  poolId: string;
  shareOfPool: number; // 0-1
  effectiveLiquidity: string; // Total available including pooled
}

/**
 * Liquidity Aggregator
 * Combines liquidity from similar markets for better efficiency
 */
export class LiquidityAggregator {
  private pools: Map<string, LiquidityPool>;

  constructor() {
    this.pools = new Map();
    this.initializeDefaultPools();
  }

  /**
   * Initialize default liquidity pools for each creative category
   */
  private initializeDefaultPools() {
    const categories: Array<{ type: CreativeMarketType; name: string; category: string }> = [
      { type: 'design-contest', name: 'Design Pool', category: 'Design' },
      { type: 'music-release', name: 'Music Pool', category: 'Music' },
      { type: 'content-virality', name: 'Content Pool', category: 'Content' },
      { type: 'art-auction', name: 'Art Pool', category: 'Art' },
      { type: 'brand-approval', name: 'Marketing Pool', category: 'Marketing' },
      { type: 'influencer-collab', name: 'Influencer Pool', category: 'Influencer Marketing' },
    ];

    categories.forEach(({ type, name, category }) => {
      const poolId = `pool-${type}`;
      this.pools.set(poolId, {
        id: poolId,
        name,
        category,
        marketType: type,
        totalLiquidity: this.mockPoolLiquidity(),
        marketCount: Math.floor(Math.random() * 20) + 5,
        apr: 8 + Math.random() * 12, // 8-20% APR
        volume24h: (Math.random() * 50000).toFixed(2),
        lpTokens: '1000000',
      });
    });
  }

  /**
   * Mock pool liquidity for demo
   */
  private mockPoolLiquidity(): string {
    return (25000 + Math.random() * 75000).toFixed(2); // 25K-100K USDC
  }

  /**
   * Get all liquidity pools
   */
  getPools(): LiquidityPool[] {
    return Array.from(this.pools.values());
  }

  /**
   * Get pool by market type
   */
  getPoolByMarketType(marketType: CreativeMarketType): LiquidityPool | undefined {
    const poolId = `pool-${marketType}`;
    return this.pools.get(poolId);
  }

  /**
   * Calculate effective liquidity for a market
   * Markets benefit from pooled liquidity of similar markets
   */
  getEffectiveLiquidity(marketId: string, marketType: CreativeMarketType): MarketLiquidity {
    const pool = this.getPoolByMarketType(marketType);
    
    if (!pool) {
      return {
        marketId,
        poolId: 'none',
        shareOfPool: 0,
        effectiveLiquidity: '1000', // Default isolated liquidity
      };
    }

    // Market gets access to pooled liquidity
    // Share is based on market's individual contribution
    const shareOfPool = 1 / pool.marketCount; // Equal weight for simplicity
    const effectiveLiquidity = parseFloat(pool.totalLiquidity) * 0.5; // Can access 50% of pool

    return {
      marketId,
      poolId: pool.id,
      shareOfPool,
      effectiveLiquidity: effectiveLiquidity.toFixed(2),
    };
  }

  /**
   * Find best price across aggregated liquidity
   */
  async findBestPrice(
    marketType: CreativeMarketType,
    amount: number,
    side: 'yes' | 'no'
  ): Promise<{
    price: number;
    priceImpact: number;
    effectivePrice: number;
    gasEstimate: string;
  }> {
    const pool = this.getPoolByMarketType(marketType);
    
    if (!pool) {
      // No pool, standard pricing
      return {
        price: 0.5,
        priceImpact: 5.0,
        effectivePrice: 0.525,
        gasEstimate: '0.001 BNB',
      };
    }

    // With pooled liquidity, price impact is reduced
    const totalLiquidity = parseFloat(pool.totalLiquidity);
    const priceImpact = (amount / totalLiquidity) * 100; // Percentage
    const reducedImpact = priceImpact * 0.6; // 40% reduction due to pooling
    
    const basePrice = 0.5;
    const effectivePrice = basePrice + (reducedImpact / 200); // Adjust for impact

    return {
      price: basePrice,
      priceImpact: reducedImpact,
      effectivePrice: Math.min(0.99, Math.max(0.01, effectivePrice)),
      gasEstimate: '0.0008 BNB', // Batched, so cheaper
    };
  }

  /**
   * Add liquidity to a pool
   */
  async addLiquidity(
    marketType: CreativeMarketType,
    amount: string,
    userAddress: string
  ): Promise<{
    success: boolean;
    lpTokens: string;
    share: number;
  }> {
    const pool = this.getPoolByMarketType(marketType);
    
    if (!pool) {
      return {
        success: false,
        lpTokens: '0',
        share: 0,
      };
    }

    // Calculate LP tokens to mint
    const amountNum = parseFloat(amount);
    const currentLiquidity = parseFloat(pool.totalLiquidity);
    const lpTokensToMint = (amountNum / currentLiquidity) * parseFloat(pool.lpTokens);
    const userShare = amountNum / (currentLiquidity + amountNum);

    // Update pool (in production, this would be on-chain)
    pool.totalLiquidity = (currentLiquidity + amountNum).toString();

    return {
      success: true,
      lpTokens: lpTokensToMint.toFixed(6),
      share: userShare * 100,
    };
  }

  /**
   * Remove liquidity from pool
   */
  async removeLiquidity(
    marketType: CreativeMarketType,
    lpTokens: string
  ): Promise<{
    success: boolean;
    amountReceived: string;
    fees: string;
  }> {
    const pool = this.getPoolByMarketType(marketType);
    
    if (!pool) {
      return {
        success: false,
        amountReceived: '0',
        fees: '0',
      };
    }

    const lpTokensNum = parseFloat(lpTokens);
    const share = lpTokensNum / parseFloat(pool.lpTokens);
    const amountReceived = parseFloat(pool.totalLiquidity) * share;
    const fees = amountReceived * 0.003; // 0.3% fee

    return {
      success: true,
      amountReceived: (amountReceived - fees).toFixed(2),
      fees: fees.toFixed(2),
    };
  }

  /**
   * Get pool statistics
   */
  getPoolStats(marketType: CreativeMarketType): {
    tvl: string;
    volume24h: string;
    apr: string;
    utilization: string;
    marketsSupported: number;
  } | null {
    const pool = this.getPoolByMarketType(marketType);
    
    if (!pool) return null;

    // Calculate utilization (how much of the pool is actively being used)
    const utilization = 35 + Math.random() * 30; // 35-65% mock

    return {
      tvl: `$${parseFloat(pool.totalLiquidity).toLocaleString()}`,
      volume24h: `$${parseFloat(pool.volume24h).toLocaleString()}`,
      apr: `${pool.apr.toFixed(2)}%`,
      utilization: `${utilization.toFixed(1)}%`,
      marketsSupported: pool.marketCount,
    };
  }

  /**
   * Compare isolated vs pooled liquidity benefits
   */
  compareLiquidityModels(
    marketType: CreativeMarketType,
    tradeAmount: number
  ): {
    isolated: {
      slippage: number;
      priceImpact: number;
      gasCost: string;
    };
    pooled: {
      slippage: number;
      priceImpact: number;
      gasCost: string;
      benefit: string;
    };
  } {
    // Isolated market (traditional approach)
    const isolatedSlippage = (tradeAmount / 1000) * 100; // High slippage on small pool
    const isolatedImpact = isolatedSlippage * 1.5;
    
    // Pooled liquidity (our approach)
    const pool = this.getPoolByMarketType(marketType);
    const pooledSlippage = pool 
      ? (tradeAmount / parseFloat(pool.totalLiquidity)) * 100
      : isolatedSlippage;
    const pooledImpact = pooledSlippage * 0.8; // Reduced due to depth

    const improvement = ((isolatedImpact - pooledImpact) / isolatedImpact) * 100;

    return {
      isolated: {
        slippage: isolatedSlippage,
        priceImpact: isolatedImpact,
        gasCost: '0.0015 BNB',
      },
      pooled: {
        slippage: pooledSlippage,
        priceImpact: pooledImpact,
        gasCost: '0.0008 BNB',
        benefit: `${improvement.toFixed(1)}% better pricing`,
      },
    };
  }
}

// Singleton instance
export const liquidityAggregator = new LiquidityAggregator();
