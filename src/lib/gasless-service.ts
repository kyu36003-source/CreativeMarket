/**
 * Gasless Transaction Service
 *
 * Solves YZi Labs Priority #3: Make prediction markets feel like normal apps
 * Users don't need crypto or gas fees - we sponsor their transactions
 */

import { type Address } from 'viem';

export interface GaslessTransactionRequest {
  userAddress: Address;
  targetContract: Address;
  functionName: string;
  args: any[];
  value?: bigint;
}

export interface GaslessTransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  gasSaved: string; // Amount of gas user didn't pay
  sponsoredBy: 'platform' | 'user';
}

/**
 * Gasless Transaction Manager
 * Sponsors gas fees for users to improve UX
 */
export class GaslessService {
  private relayerAddress: Address;
  private enabled: boolean;
  private gasBalance: bigint;
  private maxGasPerTx: bigint;

  constructor() {
    // In production, this would be a dedicated relayer wallet
    this.relayerAddress = (process.env.NEXT_PUBLIC_RELAYER_ADDRESS ||
      '0x0') as Address;
    this.enabled = process.env.NEXT_PUBLIC_GASLESS_ENABLED === 'true';
    this.gasBalance = BigInt(1e18); // Mock: 1 BNB balance
    this.maxGasPerTx = BigInt(5e17); // Max 0.5 BNB per tx
  }

  /**
   * Check if gasless mode is available for this user
   */
  async isGaslessAvailable(userAddress: Address): Promise<boolean> {
    if (!this.enabled) return false;

    // Check if user is eligible (e.g., new user, small transaction)
    const eligibility = await this.checkEligibility(userAddress);
    return eligibility.eligible;
  }

  /**
   * Check user eligibility for gasless transactions
   */
  private async checkEligibility(_userAddress: Address): Promise<{
    eligible: boolean;
    reason: string;
    limitRemaining: number;
  }> {
    // Mock eligibility check
    // In production: check user's tx history, market participation, etc.

    return {
      eligible: true,
      reason: 'New user promotion - 10 free transactions',
      limitRemaining: 10,
    };
  }

  /**
   * Execute a gasless transaction
   */
  async executeGasless(
    request: GaslessTransactionRequest
  ): Promise<GaslessTransactionResult> {
    try {
      // Check eligibility
      const eligible = await this.isGaslessAvailable(request.userAddress);
      if (!eligible) {
        return {
          success: false,
          error: 'User not eligible for gasless transactions',
          gasSaved: '0',
          sponsoredBy: 'user',
        };
      }

      // Estimate gas
      const estimatedGas = await this.estimateGas(request);
      if (estimatedGas > this.maxGasPerTx) {
        return {
          success: false,
          error: 'Transaction exceeds gas limit for sponsored transactions',
          gasSaved: '0',
          sponsoredBy: 'user',
        };
      }

      // In production: Use a real relayer (Biconomy, Gelato, etc.)
      // For demo: Mock successful transaction
      const txHash = this.mockTransaction(request);

      return {
        success: true,
        txHash,
        gasSaved: this.formatGasSaved(estimatedGas),
        sponsoredBy: 'platform',
      };
    } catch (error) {
      console.error('Gasless transaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        gasSaved: '0',
        sponsoredBy: 'user',
      };
    }
  }

  /**
   * Estimate gas for transaction
   */
  private async estimateGas(
    _request: GaslessTransactionRequest
  ): Promise<bigint> {
    // Mock gas estimation
    // In production: use viem's estimateGas
    return BigInt(100000); // ~100k gas units
  }

  /**
   * Mock transaction for demo
   */
  private mockTransaction(_request: GaslessTransactionRequest): string {
    // Generate fake tx hash
    const randomBytes = new Uint8Array(32);
    if (typeof window !== 'undefined') {
      crypto.getRandomValues(randomBytes);
    }
    return (
      '0x' +
      Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    );
  }

  /**
   * Format gas saved for display
   */
  private formatGasSaved(gasAmount: bigint): string {
    // Assume 5 gwei gas price
    const gasPrice = BigInt(5e9);
    const costInWei = gasAmount * gasPrice;
    const costInBNB = Number(costInWei) / 1e18;
    return `~${costInBNB.toFixed(6)} BNB`;
  }

  /**
   * Get user's gasless transaction stats
   */
  async getUserGaslessStats(_userAddress: Address): Promise<{
    totalTransactions: number;
    totalGasSaved: string;
    remainingFreeTxs: number;
  }> {
    // Mock stats
    return {
      totalTransactions: 7,
      totalGasSaved: '0.0042 BNB',
      remainingFreeTxs: 3,
    };
  }

  /**
   * Batch multiple transactions into one gasless call
   */
  async batchGasless(
    requests: GaslessTransactionRequest[]
  ): Promise<GaslessTransactionResult> {
    // Combine multiple user actions into one sponsored transaction
    // E.g., approve + trade in one tx

    const totalGas = BigInt(requests.length) * BigInt(100000);

    if (totalGas > this.maxGasPerTx) {
      return {
        success: false,
        error: 'Batch exceeds gas limit',
        gasSaved: '0',
        sponsoredBy: 'user',
      };
    }

    return {
      success: true,
      txHash: this.mockTransaction(requests[0]),
      gasSaved: this.formatGasSaved(totalGas),
      sponsoredBy: 'platform',
    };
  }
}

// Singleton instance
export const gaslessService = new GaslessService();

/**
 * React hook for gasless transactions
 */
export function useGasless() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalGasSaved: '0',
    remainingFreeTxs: 0,
  });

  useEffect(() => {
    // Check if gasless is available
    const checkAvailability = async () => {
      if (typeof window !== 'undefined') {
        const enabled = process.env.NEXT_PUBLIC_GASLESS_ENABLED === 'true';
        setIsEnabled(enabled);
      }
    };
    checkAvailability();
  }, []);

  const executeGasless = async (request: GaslessTransactionRequest) => {
    return gaslessService.executeGasless(request);
  };

  const refreshStats = async (userAddress: Address) => {
    const userStats = await gaslessService.getUserGaslessStats(userAddress);
    setStats(userStats);
  };

  return {
    isEnabled,
    stats,
    executeGasless,
    refreshStats,
  };
}

// Export for use in other components
import { useState, useEffect } from 'react';
