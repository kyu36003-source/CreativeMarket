/**
 * x402 Facilitator Service
 * Handles payment verification and settlement (gas sponsorship)
 * Runs as backend API to sponsor gas for x402 payments
 */

import { Address, Hex, createPublicClient, createWalletClient, http } from 'viem';
import { bsc, bscTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import type { PaymentPayload, PaymentRequirements, SettlementResponse } from './x402Client';

// ABI for X402BettingBNB contract - matches the actual deployed contract
const X402_BETTING_ABI = [
  {
    name: 'gaslessBetWithBNB',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'position', type: 'bool' },
      { name: 'from', type: 'address' },
      { name: 'wbnbValue', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    name: 'usedNonces',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'nonce', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'facilitator',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

export interface VerificationRequest {
  paymentPayload: PaymentPayload;
  paymentRequirements: PaymentRequirements;
}

export interface VerificationResponse {
  isValid: boolean;
  payer: Address;
  invalidReason?: string;
}

/**
 * x402 Facilitator - Sponsors gas and executes payments
 */
export class X402Facilitator {
  private publicClient;
  private walletClient;
  private facilitatorAccount;
  private x402BettingAddress: Address;
  private chainId: number;

  constructor(
    chainId: number = 97, // BSC Testnet
    facilitatorPrivateKey?: Hex,
    x402BettingAddress?: Address
  ) {
    this.chainId = chainId;
    const chain = chainId === 56 ? bsc : bscTestnet;

    // Setup public client
    this.publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    // Setup wallet client (facilitator)
    if (facilitatorPrivateKey) {
      this.facilitatorAccount = privateKeyToAccount(facilitatorPrivateKey);
      this.walletClient = createWalletClient({
        account: this.facilitatorAccount,
        chain,
        transport: http(),
      });
    }

    this.x402BettingAddress = x402BettingAddress || process.env.NEXT_PUBLIC_X402_BETTING_ADDRESS as Address;
  }

  /**
   * Verify payment authorization (x402 /verify endpoint)
   * Note: X402BettingBNB doesn't have on-chain verification, 
   * we do basic checks and rely on the WBNB3009 contract's signature verification
   */
  async verifyPayment(request: VerificationRequest): Promise<VerificationResponse> {
    try {
      const { paymentPayload, paymentRequirements } = request;
      const { authorization, signature } = paymentPayload.payload;

      // Basic validation
      if (!authorization || !signature) {
        return {
          isValid: false,
          payer: authorization?.from || '0x0' as Address,
          invalidReason: 'missing_authorization_or_signature',
        };
      }

      // Check amount matches
      if (authorization.value !== paymentRequirements.amount) {
        return {
          isValid: false,
          payer: authorization.from,
          invalidReason: 'amount_mismatch',
        };
      }

      // Check nonce hasn't been used
      try {
        const nonceUsed = await this.publicClient.readContract({
          address: this.x402BettingAddress,
          abi: X402_BETTING_ABI,
          functionName: 'usedNonces',
          args: [authorization.nonce],
        });

        if (nonceUsed) {
          return {
            isValid: false,
            payer: authorization.from,
            invalidReason: 'nonce_already_used',
          };
        }
      } catch (e) {
        // If we can't check nonce, continue (will fail at execution if duplicate)
        console.warn('Could not check nonce:', e);
      }

      // Check time validity
      const now = Math.floor(Date.now() / 1000);
      if (now < parseInt(authorization.validAfter)) {
        return {
          isValid: false,
          payer: authorization.from,
          invalidReason: 'authorization_not_yet_valid',
        };
      }
      if (now > parseInt(authorization.validBefore)) {
        return {
          isValid: false,
          payer: authorization.from,
          invalidReason: 'authorization_expired',
        };
      }

      return {
        isValid: true,
        payer: authorization.from,
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        isValid: false,
        payer: request.paymentPayload.payload.authorization?.from || '0x0' as Address,
        invalidReason: error instanceof Error ? error.message : 'unknown_error',
      };
    }
  }

  /**
   * Settle payment (execute on-chain transaction)
   * x402 /settle endpoint - Facilitator sponsors gas
   * Calls gaslessBetWithBNB on X402BettingBNB contract
   */
  async settlePayment(
    request: VerificationRequest,
    marketId: number,
    position: boolean
  ): Promise<SettlementResponse> {
    try {
      // First verify
      const verification = await this.verifyPayment(request);
      if (!verification.isValid) {
        return {
          success: false,
          payer: verification.payer,
          network: `eip155:${this.chainId}`,
          errorReason: verification.invalidReason,
        };
      }

      // Check facilitator wallet exists
      if (!this.walletClient || !this.facilitatorAccount) {
        return {
          success: false,
          payer: verification.payer,
          network: `eip155:${this.chainId}`,
          errorReason: 'facilitator_wallet_not_configured',
        };
      }

      const { authorization, signature } = request.paymentPayload.payload;

      console.log('[X402] Executing gaslessBetWithBNB:', {
        marketId,
        position,
        from: authorization.from,
        value: authorization.value,
        validAfter: authorization.validAfter,
        validBefore: authorization.validBefore,
        nonce: authorization.nonce,
      });

      // Execute gasless transaction (facilitator pays gas)
      const hash = await this.walletClient.writeContract({
        address: this.x402BettingAddress,
        abi: X402_BETTING_ABI,
        functionName: 'gaslessBetWithBNB',
        args: [
          BigInt(marketId),
          position,
          authorization.from,
          BigInt(authorization.value),
          BigInt(authorization.validAfter),
          BigInt(authorization.validBefore),
          authorization.nonce,
          signature,
        ],
      });

      console.log('[X402] Transaction submitted:', hash);

      // Wait for confirmation
      await this.publicClient.waitForTransactionReceipt({ hash });

      console.log('[X402] Transaction confirmed!');

      return {
        success: true,
        payer: verification.payer,
        transaction: hash,
        network: `eip155:${this.chainId}`,
      };
    } catch (error) {
      console.error('Payment settlement error:', error);
      return {
        success: false,
        payer: request.paymentPayload.payload.authorization.from,
        network: `eip155:${this.chainId}`,
        errorReason: error instanceof Error ? error.message : 'settlement_failed',
      };
    }
  }

  /**
   * Get payment requirements for a bet
   * Uses WBNB3009 for gasless BNB betting
   */
  getPaymentRequirements(
    marketId: number,
    amount: bigint,
    resourceUrl: string
  ): PaymentRequirements {
    // WBNB3009 address for gasless betting
    const wbnbAddress = process.env.NEXT_PUBLIC_WBNB_ADDRESS as Address || 
      '0x70e4730A3b4aC6E6E395e8ED9c46B9c0f753A4fA' as Address;
    
    return {
      scheme: 'exact',
      network: `eip155:${this.chainId}`,
      amount: amount.toString(),
      asset: wbnbAddress, // WBNB3009 address (user needs WBNB balance)
      payTo: this.x402BettingAddress,
      maxTimeoutSeconds: 300, // 5 minutes
      resource: resourceUrl,
      description: `Place bet on market #${marketId}`,
      mimeType: 'application/json',
      extra: {
        name: 'WBNB3009',
        version: '1',
        isNative: false, // Using WBNB3009, not raw BNB
        wbnbAddress: wbnbAddress,
      },
    };
  }

  /**
   * Check if user can use gasless betting
   */
  async canUseGasless(_userAddress: Address): Promise<{
    canUse: boolean;
    reason?: string;
  }> {
    try {
      // Check if user has tokens
      // In production, check balance and other criteria
      return {
        canUse: true,
      };
    } catch (_error) {
      return {
        canUse: false,
        reason: 'verification_failed',
      };
    }
  }
}

// Singleton instance for server-side use
let facilitatorInstance: X402Facilitator | null = null;

/**
 * Format a private key to proper Hex format
 * Accepts keys with or without 0x prefix, validates length
 */
function formatPrivateKey(key: string | undefined): Hex | undefined {
  if (!key) return undefined;
  
  // Remove whitespace
  let cleanKey = key.trim();
  
  // Add 0x prefix if missing
  if (!cleanKey.startsWith('0x')) {
    cleanKey = `0x${cleanKey}`;
  }
  
  // Validate length (should be 66 chars: 0x + 64 hex chars)
  if (cleanKey.length !== 66) {
    console.error(`Invalid private key length: expected 66, got ${cleanKey.length}`);
    return undefined;
  }
  
  // Validate hex characters
  if (!/^0x[0-9a-fA-F]{64}$/.test(cleanKey)) {
    console.error('Invalid private key format: must be hex characters');
    return undefined;
  }
  
  return cleanKey as Hex;
}

export function getFacilitator(chainId?: number): X402Facilitator {
  if (!facilitatorInstance) {
    // Try multiple env var names for flexibility
    const rawKey = process.env.FACILITATOR_PRIVATE_KEY || 
                   process.env.X402_FACILITATOR_PRIVATE_KEY ||
                   process.env.PRIVATE_KEY;
    
    console.log('[X402 Facilitator] Initializing...');
    console.log('[X402 Facilitator] Chain ID:', chainId || process.env.NEXT_PUBLIC_CHAIN_ID || '97');
    console.log('[X402 Facilitator] Betting contract:', process.env.NEXT_PUBLIC_X402_BETTING_ADDRESS);
    console.log('[X402 Facilitator] Private key present:', !!rawKey, rawKey ? `(length: ${rawKey.length})` : '');
    
    const formattedKey = formatPrivateKey(rawKey);
    
    if (!formattedKey) {
      console.error('❌ X402 Facilitator: No valid private key found. Gasless betting will NOT work!');
      console.error('Set FACILITATOR_PRIVATE_KEY in Vercel environment variables with a valid private key (64 hex chars)');
    } else {
      console.log('✅ X402 Facilitator: Private key configured successfully');
    }
    
    facilitatorInstance = new X402Facilitator(
      chainId || parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '97'),
      formattedKey,
      process.env.NEXT_PUBLIC_X402_BETTING_ADDRESS as Address
    );
  }
  return facilitatorInstance;
}
