/**
 * useBNBBet Hook
 * Pure BNB betting - user pays BNB, system handles WBNB internally
 * 
 * Flow:
 * 1. User sends BNB to facilitator
 * 2. Facilitator places bet on user's behalf
 * 3. User pays ZERO gas for the bet placement!
 * 
 * This is the simplest UX: Just pay BNB, get position.
 */

'use client';

import { useState, useCallback } from 'react';
import { useAccount, useSendTransaction } from 'wagmi';
import { parseEther, formatEther, type Address, type Hex } from 'viem';

// Facilitator wallet address (receives BNB, places bets)
const FACILITATOR_ADDRESS = process.env.NEXT_PUBLIC_FACILITATOR_ADDRESS as Address ||
  '0x3A67492c38d5D72749fD124cB4Daee2e883AF732' as Address;

export interface BNBBetResult {
  success: boolean;
  transactionHash?: Hex;
  error?: string;
}

interface FacilitatorStatus {
  available: boolean;
  facilitator: string;
  bnbBalance: string;
  wbnbBalance: string;
  minBet: string;
  feeBps: number;
  reason?: string;
}

/**
 * Check if facilitator is available and has funds
 */
export function useFacilitatorStatus() {
  const [status, setStatus] = useState<FacilitatorStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/markets/0/bet-bnb');
      const data = await response.json();
      setStatus(data);
      return data;
    } catch (error) {
      console.error('Failed to check facilitator status:', error);
      setStatus({ 
        available: false, 
        reason: 'Failed to check status',
        facilitator: FACILITATOR_ADDRESS,
        bnbBalance: '0',
        wbnbBalance: '0',
        minBet: '0.001',
        feeBps: 50,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { status, isLoading, checkStatus };
}

/**
 * Hook for placing bets with pure BNB
 * User sends BNB → Facilitator places bet → Zero gas for user!
 */
export function useBNBBet() {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'sending' | 'confirming' | 'placing' | 'done'>('idle');

  const { sendTransactionAsync } = useSendTransaction();

  /**
   * Place bet using pure BNB
   * @param marketId Market to bet on
   * @param position true = YES, false = NO
   * @param amount Bet amount in BNB (e.g., "0.01")
   */
  const placeBet = useCallback(async (
    marketId: number,
    position: boolean,
    amount: string
  ): Promise<BNBBetResult> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsPending(true);
    setError(null);
    setStep('sending');

    try {
      const betAmountWei = parseEther(amount);

      // Step 1: Send BNB to facilitator
      console.log('[BNB Bet] Sending BNB to facilitator...', {
        amount,
        facilitator: FACILITATOR_ADDRESS,
      });

      const txHash = await sendTransactionAsync({
        to: FACILITATOR_ADDRESS,
        value: betAmountWei,
      });

      console.log('[BNB Bet] BNB sent, tx:', txHash);
      setStep('confirming');

      // Step 2: Wait a bit for tx to propagate (facilitator will verify on-chain)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 3: Tell facilitator to place bet
      setStep('placing');
      console.log('[BNB Bet] Requesting facilitator to place bet...');

      const response = await fetch(`/api/markets/${marketId}/bet-bnb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position,
          amount: betAmountWei.toString(),
          userAddress: address,
          txHash,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to place bet');
      }

      console.log('[BNB Bet] ✅ Bet placed!', result);
      setStep('done');

      return {
        success: true,
        transactionHash: result.transactionHash,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[BNB Bet] Error:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsPending(false);
      setTimeout(() => setStep('idle'), 2000);
    }
  }, [address, sendTransactionAsync]);

  return {
    placeBet,
    isPending,
    error,
    step,
    facilitatorAddress: FACILITATOR_ADDRESS,
  };
}

/**
 * Alternative: Deposit-then-bet flow
 * User deposits BNB to pool, then can place multiple gasless bets
 */
export function useBNBDeposit() {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [depositBalance, setDepositBalance] = useState<bigint>(BigInt(0));

  const { sendTransactionAsync } = useSendTransaction();

  /**
   * Deposit BNB to betting pool
   */
  const deposit = useCallback(async (amount: string) => {
    if (!address) return { success: false, error: 'Wallet not connected' };

    setIsPending(true);
    try {
      const txHash = await sendTransactionAsync({
        to: FACILITATOR_ADDRESS,
        value: parseEther(amount),
        data: '0x' as Hex, // Simple transfer, no data
      });

      // Register deposit with backend
      await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          txHash,
          amount: parseEther(amount).toString(),
        }),
      });

      return { success: true, txHash };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsPending(false);
    }
  }, [address, sendTransactionAsync]);

  /**
   * Check user's deposit balance
   */
  const checkBalance = useCallback(async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/deposits/${address}`);
      const data = await response.json();
      setDepositBalance(BigInt(data.balance || '0'));
    } catch (e) {
      console.error('Failed to check deposit balance:', e);
    }
  }, [address]);

  return {
    deposit,
    checkBalance,
    depositBalance,
    depositFormatted: formatEther(depositBalance),
    isPending,
  };
}
