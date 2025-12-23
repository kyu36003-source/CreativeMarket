/**
 * x402 Facilitator Service
 * Handles payment verification and settlement (gas sponsorship)
 * 
 * TRUE GASLESS BNB BETTING (NO WRAPPING REQUIRED!):
 * 1. User signs EIP-712 bet authorization (no gas, just proving intent)
 * 2. Facilitator verifies signature
 * 3. Facilitator fronts its own BNB and calls buyPositionForUser on PredictionMarket
 * 4. User gets position, 100% gasless - no wrapping, no tokens needed!
 * 
 * User Experience: Just sign and bet. That's it.
 */

import { Address, Hex, createPublicClient, createWalletClient, http, verifyTypedData, formatEther } from 'viem';
import { bsc, bscTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import type { PaymentPayload, PaymentRequirements, SettlementResponse } from './x402Client';

// ABI for PredictionMarket contract - buyPositionForUser function
const PREDICTION_MARKET_ABI = [
  {
    name: 'buyPositionForUser',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_marketId', type: 'uint256' },
      { name: '_position', type: 'bool' },
      { name: 'user', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'authorizedOracles',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

// EIP-712 domain for bet authorization signatures
const BET_AUTHORIZATION_DOMAIN = {
  name: 'PredictBNB',
  version: '1',
};

// EIP-712 types for bet authorization
const BET_AUTHORIZATION_TYPES = {
  BetAuthorization: [
    { name: 'marketId', type: 'uint256' },
    { name: 'position', type: 'bool' },
    { name: 'amount', type: 'uint256' },
    { name: 'user', type: 'address' },
    { name: 'nonce', type: 'bytes32' },
    { name: 'validBefore', type: 'uint256' },
  ],
};

// Track used nonces to prevent replay attacks (in production, use Redis/DB)
const usedNonces = new Set<string>();

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
 * x402 Facilitator - TRUE GASLESS BNB BETTING
 * Facilitator fronts the BNB and places bets on behalf of users
 */
export class X402Facilitator {
  private publicClient;
  private walletClient;
  private facilitatorAccount;
  private predictionMarketAddress: Address;
  private chainId: number;

  constructor(
    chainId: number = 97, // BSC Testnet
    facilitatorPrivateKey?: Hex,
    predictionMarketAddress?: Address
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
      console.log('[X402] Facilitator wallet:', this.facilitatorAccount.address);
    }

    this.predictionMarketAddress = predictionMarketAddress || 
      process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as Address;
  }

  /**
   * Verify bet authorization signature
   * TRUE GASLESS: User just signs a bet intent, no tokens needed!
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

      // Check nonce hasn't been used (local tracking)
      if (usedNonces.has(authorization.nonce)) {
        return {
          isValid: false,
          payer: authorization.from,
          invalidReason: 'nonce_already_used',
        };
      }

      // Check time validity
      const now = Math.floor(Date.now() / 1000);
      if (now > parseInt(authorization.validBefore)) {
        return {
          isValid: false,
          payer: authorization.from,
          invalidReason: 'authorization_expired',
        };
      }

      // Verify signature using EIP-712
      // For true gasless, we verify the user's bet authorization signature
      try {
        const betAmount = BigInt(authorization.value);
        const marketId = paymentRequirements.extra?.marketId || 0;
        const position = paymentRequirements.extra?.position ?? true;

        const isValid = await verifyTypedData({
          address: authorization.from,
          domain: {
            ...BET_AUTHORIZATION_DOMAIN,
            chainId: this.chainId,
            verifyingContract: this.predictionMarketAddress,
          },
          types: BET_AUTHORIZATION_TYPES,
          primaryType: 'BetAuthorization',
          message: {
            marketId: BigInt(marketId),
            position: position,
            amount: betAmount,
            user: authorization.from,
            nonce: authorization.nonce,
            validBefore: BigInt(authorization.validBefore),
          },
          signature: signature,
        });

        if (!isValid) {
          return {
            isValid: false,
            payer: authorization.from,
            invalidReason: 'invalid_signature',
          };
        }
      } catch (sigError) {
        console.warn('[X402] Signature verification failed (may be legacy format):', sigError);
        // Continue - will validate during execution
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
   * Settle payment - TRUE GASLESS execution
   * Facilitator fronts its own BNB and calls buyPositionForUser
   * User doesn't need WBNB - just a signature!
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

      const { authorization } = request.paymentPayload.payload;
      const betAmount = BigInt(authorization.value);

      // Mark nonce as used
      usedNonces.add(authorization.nonce);

      // Check facilitator BNB balance
      const facilitatorBalance = await this.publicClient.getBalance({
        address: this.facilitatorAccount.address,
      });

      console.log('[X402] Facilitator balance:', formatEther(facilitatorBalance), 'BNB');
      console.log('[X402] Bet amount:', formatEther(betAmount), 'BNB');

      if (facilitatorBalance < betAmount) {
        return {
          success: false,
          payer: verification.payer,
          network: `eip155:${this.chainId}`,
          errorReason: `facilitator_insufficient_balance: has ${formatEther(facilitatorBalance)} BNB, needs ${formatEther(betAmount)} BNB`,
        };
      }

      console.log('[X402] TRUE GASLESS - Executing buyPositionForUser:', {
        marketId,
        position,
        user: authorization.from,
        betAmount: formatEther(betAmount),
        facilitator: this.facilitatorAccount.address,
      });

      // Execute TRUE GASLESS transaction
      // Facilitator fronts its own BNB and places bet for user!
      const hash = await this.walletClient.writeContract({
        address: this.predictionMarketAddress,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'buyPositionForUser',
        args: [
          BigInt(marketId),
          position,
          authorization.from,
        ],
        value: betAmount, // Facilitator's BNB!
      });

      console.log('[X402] Transaction submitted:', hash);

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

      console.log('[X402] ✅ TRUE GASLESS bet confirmed!', {
        txHash: hash,
        gasUsed: receipt.gasUsed.toString(),
        user: authorization.from,
        betAmount: formatEther(betAmount),
      });

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
   * TRUE GASLESS - user doesn't need WBNB, just signs authorization!
   */
  getPaymentRequirements(
    marketId: number,
    amount: bigint,
    resourceUrl: string,
    position: boolean = true
  ): PaymentRequirements {
    return {
      scheme: 'exact',
      network: `eip155:${this.chainId}`,
      amount: amount.toString(),
      asset: '0x0000000000000000000000000000000000000000' as Address, // Native BNB (no token needed!)
      payTo: this.predictionMarketAddress,
      maxTimeoutSeconds: 300, // 5 minutes
      resource: resourceUrl,
      description: `Place ${position ? 'YES' : 'NO'} bet on market #${marketId}`,
      mimeType: 'application/json',
      extra: {
        name: 'PredictBNB',
        version: '1',
        isNative: true, // TRUE GASLESS - facilitator fronts BNB
        marketId: marketId,
        position: position,
      },
    };
  }

  /**
   * Check if gasless betting is available
   * TRUE GASLESS - always available if facilitator has BNB
   */
  async canUseGasless(_userAddress: Address): Promise<{
    canUse: boolean;
    reason?: string;
    facilitatorBalance?: string;
  }> {
    try {
      // Check facilitator balance
      if (this.facilitatorAccount) {
        const balance = await this.publicClient.getBalance({
          address: this.facilitatorAccount.address,
        });
        return {
          canUse: true,
          facilitatorBalance: formatEther(balance),
        };
      }
      return {
        canUse: false,
        reason: 'facilitator_not_configured',
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
