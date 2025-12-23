/**
 * x402 Protocol Client
 * Implements HTTP 402 "Payment Required" protocol for gasless betting
 * Based on: https://github.com/coinbase/x402
 * 
 * TRUE GASLESS: User just signs a bet authorization, no tokens needed!
 * Facilitator fronts the BNB and places the bet on user's behalf.
 */

import { Address, Hex, keccak256, encodePacked } from 'viem';

export interface PaymentRequirements {
  scheme: 'exact';
  network: string; // e.g., "eip155:56" for BSC mainnet
  amount: string; // atomic units
  asset: Address; // 0x0 for native BNB (true gasless)
  payTo: Address; // recipient (PredictionMarket contract)
  maxTimeoutSeconds: number;
  resource: string; // URL path
  description: string;
  mimeType: string;
  extra?: {
    name: string; // 'PredictBNB'
    version: string; // '1'
    isNative?: boolean; // true for true gasless
    marketId?: number;
    position?: boolean;
  };
}

export interface PaymentRequiredResponse {
  x402Version: number;
  error: string;
  resource: {
    url: string;
    description: string;
    mimeType: string;
  };
  accepts: PaymentRequirements[];
}

export interface PaymentPayload {
  x402Version: number;
  resource?: {
    url: string;
    description: string;
    mimeType: string;
  };
  accepted: PaymentRequirements;
  payload: {
    signature: Hex;
    authorization: {
      from: Address;
      to: Address;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: Hex;
    };
  };
}

export interface SettlementResponse {
  success: boolean;
  payer: Address;
  transaction?: Hex;
  network: string;
  errorReason?: string;
}

/**
 * x402 HTTP Client for PredictBNB gasless betting
 */
export class X402Client {
  private baseUrl: string;
  private facilitatorUrl: string;

  constructor(
    baseUrl: string = typeof window !== 'undefined' ? window.location.origin : '',
    facilitatorUrl: string = '/api/x402'
  ) {
    this.baseUrl = baseUrl;
    this.facilitatorUrl = facilitatorUrl;
  }

  /**
   * Create bet authorization signature for TRUE GASLESS betting
   * User just signs a simple authorization - no WBNB needed!
   * @param params Authorization parameters
   * @param signTypedData Wallet signing function
   */
  async createPaymentAuthorization(
    params: {
      from: Address;
      to: Address;
      value: bigint;
      validAfter: number;
      validBefore: number;
      nonce: Hex;
      tokenAddress: Address;
      tokenName: string;
      tokenVersion: string;
      chainId: number;
      isNative?: boolean;
      marketId?: number;
      position?: boolean;
    },
    signTypedData: (args: any) => Promise<Hex>
  ): Promise<PaymentPayload['payload']> {
    // Validate required address params
    if (!params.from || !params.to) {
      throw new Error('Missing required address params: from or to');
    }
    
    // TRUE GASLESS: Sign a simple bet authorization
    // No WBNB needed - facilitator fronts the BNB!
    const domain = {
      name: 'PredictBNB',
      version: '1',
      chainId: params.chainId,
      verifyingContract: params.to, // PredictionMarket contract
    };

    const types = {
      BetAuthorization: [
        { name: 'marketId', type: 'uint256' },
        { name: 'position', type: 'bool' },
        { name: 'amount', type: 'uint256' },
        { name: 'user', type: 'address' },
        { name: 'nonce', type: 'bytes32' },
        { name: 'validBefore', type: 'uint256' },
      ],
    };

    const message = {
      marketId: params.marketId?.toString() || '0',
      position: params.position ?? true,
      amount: params.value.toString(),
      user: params.from,
      nonce: params.nonce,
      validBefore: params.validBefore.toString(),
    };

    console.log('[X402] TRUE GASLESS - Signing bet authorization:', {
      domain,
      message,
    });

    const signature = await signTypedData({
      domain,
      types,
      primaryType: 'BetAuthorization',
      message,
    });

    return {
      signature,
      authorization: {
        from: params.from,
        to: params.to,
        value: params.value.toString(),
        validAfter: params.validAfter.toString(),
        validBefore: params.validBefore.toString(),
        nonce: params.nonce,
      },
    };
  }

  /**
   * Create full x402 payment payload
   */
  async createPaymentPayload(
    paymentRequired: PaymentRequiredResponse,
    selectedIndex: number,
    authorizationPayload: PaymentPayload['payload']
  ): Promise<PaymentPayload> {
    const selectedRequirement = paymentRequired.accepts[selectedIndex];

    return {
      x402Version: 2,
      resource: paymentRequired.resource,
      accepted: selectedRequirement,
      payload: authorizationPayload,
    };
  }

  /**
   * Encode payment payload as base64 header
   */
  encodePaymentHeader(payload: PaymentPayload): string {
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Decode payment required header
   */
  decodePaymentRequired(header: string): PaymentRequiredResponse {
    return JSON.parse(Buffer.from(header, 'base64').toString('utf-8'));
  }

  /**
   * Decode settlement response header
   */
  decodeSettlementResponse(header: string): SettlementResponse {
    return JSON.parse(Buffer.from(header, 'base64').toString('utf-8'));
  }

  /**
   * Request betting with x402 protocol
   * Handles 402 Payment Required → Sign → Retry flow
   */
  async betWithX402(
    marketId: number,
    position: boolean,
    amount: bigint,
    walletAddress: Address,
    signTypedData: (args: any) => Promise<Hex>,
    chainId: number
  ): Promise<{
    success: boolean;
    transaction?: Hex;
    error?: string;
  }> {
    try {
      // Step 1: Initial request (expect 402)
      const initialResponse = await fetch(`${this.baseUrl}/api/markets/${marketId}/bet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position,
          amount: amount.toString(),
          address: walletAddress,
        }),
      });

      // Step 2: Handle 402 Payment Required
      if (initialResponse.status !== 402) {
        return {
          success: false,
          error: `Unexpected status: ${initialResponse.status}`,
        };
      }

      const paymentRequiredHeader = initialResponse.headers.get('PAYMENT-REQUIRED');
      if (!paymentRequiredHeader) {
        return {
          success: false,
          error: 'Missing PAYMENT-REQUIRED header',
        };
      }

      const paymentRequired = this.decodePaymentRequired(paymentRequiredHeader);

      // Step 3: Select payment method (first available)
      const selectedPayment = paymentRequired.accepts[0];
      
      // Validate selectedPayment has required fields
      if (!selectedPayment || !selectedPayment.payTo || !selectedPayment.amount) {
        console.error('Invalid payment requirements:', selectedPayment);
        return {
          success: false,
          error: 'Invalid payment requirements from server',
        };
      }
      // Step 4: Create payment authorization
      const now = Math.floor(Date.now() / 1000);
      const nonce = keccak256(
        encodePacked(
          ['address', 'uint256', 'uint256'],
          [walletAddress, BigInt(marketId), BigInt(now)]
        )
      );

      const authPayload = await this.createPaymentAuthorization(
        {
          from: walletAddress,
          to: selectedPayment.payTo, // PredictionMarket contract
          value: BigInt(selectedPayment.amount),
          validAfter: now,
          validBefore: now + selectedPayment.maxTimeoutSeconds,
          nonce,
          tokenAddress: selectedPayment.asset,
          tokenName: selectedPayment.extra?.name || 'PredictBNB',
          tokenVersion: selectedPayment.extra?.version || '1',
          chainId,
          isNative: selectedPayment.extra?.isNative ?? true,
          marketId: selectedPayment.extra?.marketId ?? marketId,
          position: selectedPayment.extra?.position ?? position,
        },
        signTypedData
      );

      // Step 5: Create full payment payload
      const paymentPayload = await this.createPaymentPayload(
        paymentRequired,
        0,
        authPayload
      );

      // Step 6: Retry with payment signature
      console.log('[X402 Client] Sending payment with signature...');
      const paymentResponse = await fetch(`${this.baseUrl}/api/markets/${marketId}/bet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PAYMENT-SIGNATURE': this.encodePaymentHeader(paymentPayload),
        },
        body: JSON.stringify({
          position,
          amount: amount.toString(),
          address: walletAddress,
        }),
      });

      console.log('[X402 Client] Payment response status:', paymentResponse.status);

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        console.error('[X402 Client] Payment failed:', errorData);
        return {
          success: false,
          error: errorData.error || errorData.details || 'Payment failed',
        };
      }

      // Step 7: Parse settlement response
      const settlementHeader = paymentResponse.headers.get('PAYMENT-RESPONSE');
      if (settlementHeader) {
        const settlement = this.decodeSettlementResponse(settlementHeader);
        if (settlement.success) {
          return {
            success: true,
            transaction: settlement.transaction,
          };
        } else {
          return {
            success: false,
            error: settlement.errorReason || 'Settlement failed',
          };
        }
      }

      // Success without explicit settlement response
      const responseData = await paymentResponse.json();
      return {
        success: true,
        transaction: responseData.transactionHash,
      };
    } catch (error) {
      console.error('x402 payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate random nonce for payment authorization
   */
  generateNonce(userAddress: Address, marketId: number): Hex {
    const timestamp = Date.now();
    return keccak256(
      encodePacked(
        ['address', 'uint256', 'uint256'],
        [userAddress, BigInt(marketId), BigInt(timestamp)]
      )
    );
  }
}

export const x402Client = new X402Client();
