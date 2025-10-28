/**
 * React Hooks for Smart Contract Interactions
 * Using Wagmi v2 for type-safe contract interactions
 */

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import {
  CONTRACT_ADDRESSES,
  getContractAddress,
} from '../lib/contracts/addresses';
import {
  PREDICTION_MARKET_ABI,
  AI_ORACLE_ABI,
  TRADER_REPUTATION_ABI,
} from '../lib/contracts/abis';

// ============================================================================
// Prediction Market Hooks
// ============================================================================

/**
 * Get market details by ID
 */
export function useMarket(marketId: number) {
  const chainId = useChainId();

  return useReadContract({
    address: getContractAddress(chainId, 'PREDICTION_MARKET') as `0x${string}`,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'markets',
    args: [BigInt(marketId)],
  });
}

/**
 * Get total market count
 */
export function useMarketCount() {
  const chainId = useChainId();

  return useReadContract({
    address: getContractAddress(chainId, 'PREDICTION_MARKET') as `0x${string}`,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'marketCount',
  });
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
    const chainId = useChainId();

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
      functionName: 'placeBet',
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
    functionName: 'PLATFORM_FEE',
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
    functionName: 'MIN_BET',
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
