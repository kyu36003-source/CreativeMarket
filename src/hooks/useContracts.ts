/**
 * React Hooks for Smart Contract Interactions
 * Using Wagmi v2 for type-safe contract interactions
 * 
 * With Static Data Fallback for production demo
 */

import { useEffect, useState } from 'react';
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import {
  getContractAddress,
} from '../lib/contracts/addresses';
import {
  PREDICTION_MARKET_ABI,
  AI_ORACLE_ABI,
  TRADER_REPUTATION_ABI,
} from '../lib/contracts/abis';
import { getStaticMarket, getStaticMarketCount, StaticMarketData } from '../lib/static-markets';

// ============================================================================
// Prediction Market Hooks (with Static Data Fallback)
// ============================================================================

/**
 * Get market details by ID
 * Falls back to static data if blockchain connection fails
 */
export function useMarket(marketId: number) {
  const chainId = useChainId();
  const effectiveChainId = chainId || 97;
  
  const blockchainResult = useReadContract({
    address: getContractAddress(effectiveChainId, 'PREDICTION_MARKET') as `0x${string}`,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'markets',
    args: [BigInt(marketId)],
    chainId: effectiveChainId,
    query: {
      retry: false, // Don't retry on failure
      staleTime: 30000, // 30 seconds
    },
  });

  // Use static data if blockchain call fails
  const [staticData, setStaticData] = useState<StaticMarketData | null>(null);
  
  useEffect(() => {
    if (blockchainResult.isError) {
      const market = getStaticMarket(marketId);
      if (market) {
        // Convert StaticMarketData to array format matching contract response
        const _marketArray = [
          market.id,
          market.question,
          market.description,
          market.category,
          market.creator,
          market.endTime,
          market.totalYesAmount,
          market.totalNoAmount,
          market.resolved,
          market.outcome,
          market.resolvedAt,
          market.aiOracleEnabled,
        ];
        setStaticData(market);
      }
    }
  }, [blockchainResult.isError, marketId]);

  // Return blockchain data if available, otherwise static data
  if (blockchainResult.data) {
    return blockchainResult;
  }

  if (staticData) {
    return {
      ...blockchainResult,
      data: [
        staticData.id,
        staticData.question,
        staticData.description,
        staticData.category,
        staticData.creator,
        staticData.endTime,
        staticData.totalYesAmount,
        staticData.totalNoAmount,
        staticData.resolved,
        staticData.outcome,
        staticData.resolvedAt,
        staticData.aiOracleEnabled,
      ],
      isError: false,
      error: null,
    };
  }

  return blockchainResult;
}

/**
 * Get total market count
 * Falls back to static data count if blockchain connection fails
 */
export function useMarketCount() {
  const chainId = useChainId();
  const effectiveChainId = chainId || 97;

  const blockchainResult = useReadContract({
    address: getContractAddress(effectiveChainId, 'PREDICTION_MARKET') as `0x${string}`,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'marketCount',
    chainId: effectiveChainId,
    query: {
      retry: false,
      staleTime: 30000,
    },
  });

  // Use static data count if blockchain call fails
  if (blockchainResult.isError || blockchainResult.data === undefined) {
    return {
      ...blockchainResult,
      data: getStaticMarketCount(),
      isError: false,
      error: null,
    };
  }

  return blockchainResult;
}

/**
 * Get user's position in a market
 */
export function usePosition(marketId: number) {
  const chainId = useChainId();
  const { address } = useAccount();

  return useReadContract({
    address: getContractAddress(chainId, 'PREDICTION_MARKET') as `0x${string}`,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'positions',
    args: address ? [BigInt(marketId), address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

/**
 * Create a new market
 */
export function useCreateMarket() {
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createMarket = async (params: {
    question: string;
    description: string;
    category: string;
    endTime: Date;
    aiOracleEnabled: boolean;
  }) => {

    return writeContract({
      address: getContractAddress(
        chainId,
        'PREDICTION_MARKET'
      ) as `0x${string}`,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'createMarket',
      args: [
        params.question,
        params.description,
        params.category,
        BigInt(Math.floor(params.endTime.getTime() / 1000)),
        params.aiOracleEnabled,
      ],
    });
  };

  return {
    createMarket,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Place a bet on a market
 */
export function usePlaceBet() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const chainId = useChainId();

  const placeBet = async (
    marketId: number,
    position: boolean,
    amount: string
  ) => {
    return writeContract({
      address: getContractAddress(
        chainId,
        'PREDICTION_MARKET'
      ) as `0x${string}`,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'buyPosition',
      args: [BigInt(marketId), position],
      value: parseEther(amount),
    });
  };

  return {
    placeBet,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Claim winnings from a resolved market
 */
export function useClaimWinnings() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const chainId = useChainId();

  const claimWinnings = async (marketId: number) => {
    return writeContract({
      address: getContractAddress(
        chainId,
        'PREDICTION_MARKET'
      ) as `0x${string}`,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'claimWinnings',
      args: [BigInt(marketId)],
    });
  };

  return {
    claimWinnings,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Resolve a market (oracle only)
 */
export function useResolveMarket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const chainId = useChainId();

  const resolveMarket = async (marketId: number, outcome: boolean) => {
    return writeContract({
      address: getContractAddress(
        chainId,
        'PREDICTION_MARKET'
      ) as `0x${string}`,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'resolveMarket',
      args: [BigInt(marketId), outcome],
    });
  };

  return {
    resolveMarket,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============================================================================
// AI Oracle Hooks
// ============================================================================

/**
 * Request resolution from AI Oracle
 */
export function useRequestResolution() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const chainId = useChainId();

  const requestResolution = async (marketId: number, dataSource: string) => {
    return writeContract({
      address: getContractAddress(chainId, 'AI_ORACLE') as `0x${string}`,
      abi: AI_ORACLE_ABI,
      functionName: 'requestResolution',
      args: [BigInt(marketId), dataSource],
    });
  };

  return {
    requestResolution,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Get resolution request details
 */
export function useResolutionRequest(requestId: number) {
  const chainId = useChainId();

  return useReadContract({
    address: getContractAddress(chainId, 'AI_ORACLE') as `0x${string}`,
    abi: AI_ORACLE_ABI,
    functionName: 'resolutionRequests',
    args: [BigInt(requestId)],
  });
}

// ============================================================================
// Trader Reputation Hooks
// ============================================================================

/**
 * Get trader reputation
 */
export function useTraderReputation(traderAddress?: string) {
  const chainId = useChainId();
  const { address } = useAccount();
  const targetAddress = traderAddress || address;

  return useReadContract({
    address: getContractAddress(chainId, 'PREDICTION_MARKET') as `0x${string}`,
    abi: TRADER_REPUTATION_ABI,
    functionName: 'getReputation',
    args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!targetAddress,
    },
  });
}

/**
 * Get trader success rate
 */
export function useSuccessRate(traderAddress?: string) {
  const chainId = useChainId();
  const { address } = useAccount();
  const targetAddress = traderAddress || address;

  return useReadContract({
    address: getContractAddress(chainId, 'PREDICTION_MARKET') as `0x${string}`,
    abi: TRADER_REPUTATION_ABI,
    functionName: 'getSuccessRate',
    args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!targetAddress,
    },
  });
}

/**
 * Get trader tier
 */
export function useTraderTier(traderAddress?: string) {
  const chainId = useChainId();
  const { address } = useAccount();
  const targetAddress = traderAddress || address;

  return useReadContract({
    address: getContractAddress(chainId, 'PREDICTION_MARKET') as `0x${string}`,
    abi: TRADER_REPUTATION_ABI,
    functionName: 'getTier',
    args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!targetAddress,
    },
  });
}

/**
 * Get trader reputation score
 */
export function useReputationScore(traderAddress?: string) {
  const chainId = useChainId();
  const effectiveChainId = chainId || 97;
  const { address } = useAccount();
  const targetAddress = traderAddress || address;

  // First get the reputation contract address from PredictionMarket
  const { data: reputationContractAddress } = useReadContract({
    address: getContractAddress(effectiveChainId, 'PREDICTION_MARKET') as `0x${string}`,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'reputationContract' as 'marketCount',
    chainId: effectiveChainId,
  });

  return useReadContract({
    address: (reputationContractAddress as unknown) as `0x${string}`,
    abi: TRADER_REPUTATION_ABI,
    functionName: 'getReputationScore',
    args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
    chainId: effectiveChainId,
    query: {
      enabled: !!targetAddress && !!reputationContractAddress,
    },
  });
}

/**
 * Get minimum reputation required to create markets
 */
export function useMinReputationToCreate() {
  const chainId = useChainId();
  const effectiveChainId = chainId || 97;

  return useReadContract({
    address: getContractAddress(effectiveChainId, 'PREDICTION_MARKET') as `0x${string}`,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'MIN_REPUTATION_TO_CREATE' as 'marketCount',
    chainId: effectiveChainId,
  });
}

/**
 * Enable copy trading
 */
export function useEnableCopyTrading() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const chainId = useChainId();

  const enableCopyTrading = async () => {
    return writeContract({
      address: getContractAddress(
        chainId,
        'PREDICTION_MARKET'
      ) as `0x${string}`,
      abi: TRADER_REPUTATION_ABI,
      functionName: 'enableCopyTrading',
    });
  };

  return {
    enableCopyTrading,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Get platform fee
 */
export function usePlatformFee() {
  const chainId = useChainId();

  return useReadContract({
    address: getContractAddress(chainId, 'PREDICTION_MARKET') as `0x${string}`,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'PLATFORM_FEE' as 'marketCount',
  });
}

/**
 * Get minimum bet amount
 */
export function useMinBet() {
  const chainId = useChainId();

  return useReadContract({
    address: getContractAddress(chainId, 'PREDICTION_MARKET') as `0x${string}`,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'MIN_BET' as 'marketCount',
  });
}

/**
 * Calculate potential winnings
 */
export function useCalculateWinnings(
  marketId: number,
  position: boolean,
  betAmount: string
) {
  const { data: market } = useMarket(marketId);

  if (!market || !betAmount) {
    return { potentialWinnings: '0', odds: 0 };
  }

  const [, , , , , , totalYes, totalNo] = market as any[];
  const totalYesNum = Number(formatEther(totalYes));
  const totalNoNum = Number(formatEther(totalNo));
  const betNum = Number(betAmount);

  const totalPool = totalYesNum + totalNoNum + betNum;
  const winningPool = position ? totalYesNum + betNum : totalNoNum + betNum;
  const losingPool = position ? totalNoNum : totalYesNum;

  // Calculate payout: (your bet / winning pool) * total pool
  const payout = (betNum / winningPool) * totalPool;
  const profit = payout - betNum;
  const odds = losingPool / winningPool;

  return {
    potentialWinnings: profit.toFixed(4),
    odds: odds.toFixed(2),
    payout: payout.toFixed(4),
  };
}

// ============================================================================
// Copy Trading Hooks
// ============================================================================

/**
 * Follow a trader to copy their trades
 */
export function useFollowTrader() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const chainId = useChainId();

  const followTrader = async (
    traderAddress: string,
    maxAmountPerTrade: string,
    copyPercentage: number
  ) => {
    return writeContract({
      address: getContractAddress(chainId, 'PREDICTION_MARKET') as `0x${string}`,
      abi: TRADER_REPUTATION_ABI,
      functionName: 'followTrader',
      args: [
        traderAddress as `0x${string}`,
        parseEther(maxAmountPerTrade),
        BigInt(copyPercentage),
      ],
    });
  };

  return {
    followTrader,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Unfollow a trader to stop copying their trades
 */
export function useUnfollowTrader() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const chainId = useChainId();

  const unfollowTrader = async (traderAddress: string) => {
    return writeContract({
      address: getContractAddress(chainId, 'PREDICTION_MARKET') as `0x${string}`,
      abi: TRADER_REPUTATION_ABI,
      functionName: 'unfollowTrader',
      args: [traderAddress as `0x${string}`],
    });
  };

  return {
    unfollowTrader,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Get followers of a trader
 */
export function useTraderFollowers(traderAddress?: string) {
  const chainId = useChainId();

  return useReadContract({
    address: getContractAddress(chainId, 'PREDICTION_MARKET') as `0x${string}`,
    abi: TRADER_REPUTATION_ABI,
    functionName: 'getFollowers',
    args: traderAddress ? [traderAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!traderAddress,
    },
  });
}

/**
 * Get traders that a user is following
 */
export function useFollowingList(followerAddress?: string) {
  const chainId = useChainId();

  return useReadContract({
    address: getContractAddress(chainId, 'PREDICTION_MARKET') as `0x${string}`,
    abi: TRADER_REPUTATION_ABI,
    functionName: 'getFollowing',
    args: followerAddress ? [followerAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!followerAddress,
    },
  });
}
