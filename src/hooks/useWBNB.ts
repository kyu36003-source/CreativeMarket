/**
 * useWBNB Hook
 * React hooks for WBNB3009 wrapping/unwrapping and balance checking
 * 
 * WBNB3009 is required for gasless betting:
 * 1. User wraps BNB → WBNB3009 (pays gas once)
 * 2. User signs EIP-3009 authorization (free, off-chain)
 * 3. Facilitator executes bet (facilitator pays gas)
 */

'use client';

import { useCallback, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseEther, formatEther, type Address } from 'viem';

// WBNB3009 Contract ABI (only the functions we need)
const WBNB3009_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
] as const;

// Get WBNB3009 address from env
const getWBNBAddress = (): Address => {
  return (process.env.NEXT_PUBLIC_WBNB_ADDRESS || '0x70e4730A3b4aC6E6E395e8ED9c46B9c0f753A4fA') as Address;
};

/**
 * Hook to get WBNB3009 balance for the connected wallet
 */
export function useWBNBBalance() {
  const { address, isConnected } = useAccount();
  const wbnbAddress = getWBNBAddress();

  const { data: balance, isLoading, refetch, error } = useReadContract({
    address: wbnbAddress,
    abi: WBNB3009_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  });

  return {
    balance: balance as bigint | undefined,
    balanceFormatted: balance ? formatEther(balance as bigint) : '0',
    isLoading,
    refetch,
    error,
  };
}

/**
 * Hook to get native BNB balance
 */
export function useBNBBalance() {
  const { address, isConnected } = useAccount();

  const { data: balance, isLoading, refetch } = useBalance({
    address: address,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000,
    },
  });

  return {
    balance: balance?.value,
    balanceFormatted: balance ? balance.formatted : '0',
    isLoading,
    refetch,
  };
}

/**
 * Hook to wrap BNB to WBNB3009
 */
export function useWrapBNB() {
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const wbnbAddress = getWBNBAddress();
  const { refetch: refetchWBNB } = useWBNBBalance();
  const { refetch: refetchBNB } = useBNBBalance();

  const wrap = useCallback(async (amount: string) => {
    const amountWei = parseEther(amount);
    
    writeContract({
      address: wbnbAddress,
      abi: WBNB3009_ABI,
      functionName: 'deposit',
      value: amountWei,
    });
  }, [writeContract, wbnbAddress]);

  // Refetch balances on success
  useEffect(() => {
    if (isSuccess) {
      refetchWBNB();
      refetchBNB();
    }
  }, [isSuccess, refetchWBNB, refetchBNB]);

  return {
    wrap,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError,
  };
}

/**
 * Hook to unwrap WBNB3009 back to BNB
 */
export function useUnwrapBNB() {
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const wbnbAddress = getWBNBAddress();
  const { refetch: refetchWBNB } = useWBNBBalance();
  const { refetch: refetchBNB } = useBNBBalance();

  const unwrap = useCallback(async (amount: string) => {
    const amountWei = parseEther(amount);
    
    writeContract({
      address: wbnbAddress,
      abi: WBNB3009_ABI,
      functionName: 'withdraw',
      args: [amountWei],
    });
  }, [writeContract, wbnbAddress]);

  // Refetch balances on success
  useEffect(() => {
    if (isSuccess) {
      refetchWBNB();
      refetchBNB();
    }
  }, [isSuccess, refetchWBNB, refetchBNB]);

  return {
    unwrap,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError,
  };
}

/**
 * Combined hook for WBNB management
 */
export function useWBNB() {
  const { balance: wbnbBalance, balanceFormatted: wbnbFormatted, isLoading: wbnbLoading, refetch: refetchWBNB } = useWBNBBalance();
  const { balance: bnbBalance, balanceFormatted: bnbFormatted, isLoading: bnbLoading, refetch: refetchBNB } = useBNBBalance();
  const wrapHook = useWrapBNB();
  const unwrapHook = useUnwrapBNB();

  const refetchAll = useCallback(() => {
    refetchWBNB();
    refetchBNB();
  }, [refetchWBNB, refetchBNB]);

  return {
    // Balances
    wbnbBalance,
    wbnbFormatted,
    bnbBalance,
    bnbFormatted,
    isLoading: wbnbLoading || bnbLoading,
    
    // Wrap
    wrap: wrapHook.wrap,
    isWrapping: wrapHook.isPending || wrapHook.isConfirming,
    wrapSuccess: wrapHook.isSuccess,
    wrapHash: wrapHook.hash,
    wrapError: wrapHook.error,
    
    // Unwrap
    unwrap: unwrapHook.unwrap,
    isUnwrapping: unwrapHook.isPending || unwrapHook.isConfirming,
    unwrapSuccess: unwrapHook.isSuccess,
    unwrapHash: unwrapHook.hash,
    unwrapError: unwrapHook.error,
    
    // Utils
    refetch: refetchAll,
    wbnbAddress: getWBNBAddress(),
  };
}
