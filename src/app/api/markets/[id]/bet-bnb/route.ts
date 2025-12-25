/**
 * Pure BNB Betting API Route
 * User sends BNB, facilitator handles WBNB3009 conversion internally
 * 
 * Flow:
 * 1. User sends BNB to facilitator wallet
 * 2. Facilitator wraps BNB → WBNB3009 (already has pool)
 * 3. Facilitator executes bet via X402BettingBNB
 * 4. User gets winnings in BNB
 * 
 * This simplifies UX: User only deals with BNB, never WBNB3009
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  parseEther,
  formatEther,
  type Address,
  type Hex 
} from 'viem';
import { bscTestnet, bsc } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '97');
const chain = CHAIN_ID === 56 ? bsc : bscTestnet;

// Contract addresses
const PREDICTION_MARKET = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as Address;
const _X402_BETTING = process.env.NEXT_PUBLIC_X402_BETTING_ADDRESS as Address;
const WBNB3009 = process.env.NEXT_PUBLIC_WBNB_ADDRESS as Address;

// Facilitator config
const FACILITATOR_PRIVATE_KEY = process.env.FACILITATOR_PRIVATE_KEY as Hex;
const FACILITATOR_FEE_BPS = 50; // 0.5%

// ABIs
const PREDICTION_MARKET_ABI = [
  {
    name: 'buyPositionForUser',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'position', type: 'bool' },
      { name: 'user', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'markets',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'creator', type: 'address' },
      { name: 'question', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
      { name: 'totalYesAmount', type: 'uint256' },
      { name: 'totalNoAmount', type: 'uint256' },
      { name: 'resolved', type: 'bool' },
      { name: 'outcome', type: 'bool' },
      { name: 'resolvedAt', type: 'uint256' },
      { name: 'aiOracleEnabled', type: 'bool' },
    ],
  },
] as const;

const WBNB_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
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
] as const;

// Track pending bets (in production, use Redis/DB)
const _pendingBets = new Map<string, {
  marketId: number;
  position: boolean;
  amount: bigint;
  user: Address;
  timestamp: number;
}>();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketId = parseInt(params.id);
    const body = await request.json();
    const { position, amount, userAddress, txHash } = body;

    // Validate inputs
    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address required' },
        { status: 400 }
      );
    }

    const betAmount = BigInt(amount);
    if (betAmount < parseEther('0.001')) {
      return NextResponse.json(
        { error: 'Minimum bet is 0.001 BNB' },
        { status: 400 }
      );
    }

    // Setup clients
    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    if (!FACILITATOR_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Facilitator not configured' },
        { status: 500 }
      );
    }

    const facilitatorAccount = privateKeyToAccount(FACILITATOR_PRIVATE_KEY);
    const walletClient = createWalletClient({
      account: facilitatorAccount,
      chain,
      transport: http(),
    });

    console.log('[BNB Bet] Processing bet:', {
      marketId,
      position,
      amount: formatEther(betAmount),
      user: userAddress,
      facilitator: facilitatorAccount.address,
    });

    // Check market is active
    const market = await publicClient.readContract({
      address: PREDICTION_MARKET,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'markets',
      args: [BigInt(marketId)],
    });

    const endTime = market[5];
    const resolved = market[8];

    if (resolved) {
      return NextResponse.json(
        { error: 'Market already resolved' },
        { status: 400 }
      );
    }

    if (Number(endTime) * 1000 < Date.now()) {
      return NextResponse.json(
        { error: 'Market has ended' },
        { status: 400 }
      );
    }

    // If txHash provided, verify BNB was received
    if (txHash) {
      console.log('[BNB Bet] Verifying user BNB transfer:', txHash);
      
      try {
        const receipt = await publicClient.getTransactionReceipt({ hash: txHash as Hex });
        
        if (receipt.status !== 'success') {
          return NextResponse.json(
            { error: 'BNB transfer failed' },
            { status: 400 }
          );
        }

        // Verify transfer was to facilitator
        const tx = await publicClient.getTransaction({ hash: txHash as Hex });
        if (tx.to?.toLowerCase() !== facilitatorAccount.address.toLowerCase()) {
          return NextResponse.json(
            { error: 'BNB was not sent to facilitator' },
            { status: 400 }
          );
        }

        // Verify amount matches
        if (tx.value < betAmount) {
          return NextResponse.json(
            { error: `Insufficient BNB sent. Expected ${formatEther(betAmount)}, got ${formatEther(tx.value)}` },
            { status: 400 }
          );
        }

        console.log('[BNB Bet] BNB transfer verified:', formatEther(tx.value), 'BNB');
      } catch (e) {
        console.error('[BNB Bet] Failed to verify tx:', e);
        return NextResponse.json(
          { error: 'Could not verify BNB transfer' },
          { status: 400 }
        );
      }
    }

    // Calculate fee
    const feeAmount = (betAmount * BigInt(FACILITATOR_FEE_BPS)) / BigInt(10000);
    const actualBetAmount = betAmount - feeAmount;

    console.log('[BNB Bet] Amounts:', {
      total: formatEther(betAmount),
      fee: formatEther(feeAmount),
      bet: formatEther(actualBetAmount),
    });

    // Check facilitator has enough BNB to place bet
    const facilitatorBalance = await publicClient.getBalance({
      address: facilitatorAccount.address,
    });

    if (facilitatorBalance < actualBetAmount + parseEther('0.01')) { // Keep 0.01 BNB for gas
      return NextResponse.json(
        { error: 'Facilitator low on funds. Please try again later.' },
        { status: 503 }
      );
    }

    // Place bet on behalf of user using facilitator's BNB
    console.log('[BNB Bet] Placing bet via PredictionMarket.buyPositionForUser...');
    
    const hash = await walletClient.writeContract({
      address: PREDICTION_MARKET,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'buyPositionForUser',
      args: [BigInt(marketId), position, userAddress as Address],
      value: actualBetAmount,
    });

    console.log('[BNB Bet] Transaction submitted:', hash);

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log('[BNB Bet] ✅ Bet placed!', {
      txHash: hash,
      gasUsed: receipt.gasUsed.toString(),
      user: userAddress,
      betAmount: formatEther(actualBetAmount),
    });

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      user: userAddress,
      betAmount: formatEther(actualBetAmount),
      fee: formatEther(feeAmount),
    });

  } catch (error) {
    console.error('[BNB Bet] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check facilitator status
 */
export async function GET() {
  try {
    if (!FACILITATOR_PRIVATE_KEY) {
      return NextResponse.json({ 
        available: false, 
        reason: 'Facilitator not configured' 
      });
    }

    const facilitatorAccount = privateKeyToAccount(FACILITATOR_PRIVATE_KEY);
    
    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    const bnbBalance = await publicClient.getBalance({
      address: facilitatorAccount.address,
    });

    const wbnbBalance = await publicClient.readContract({
      address: WBNB3009,
      abi: WBNB_ABI,
      functionName: 'balanceOf',
      args: [facilitatorAccount.address],
    });

    return NextResponse.json({
      available: bnbBalance > parseEther('0.05'),
      facilitator: facilitatorAccount.address,
      bnbBalance: formatEther(bnbBalance),
      wbnbBalance: formatEther(wbnbBalance),
      minBet: '0.001',
      feeBps: FACILITATOR_FEE_BPS,
    });
  } catch (error) {
    return NextResponse.json({ 
      available: false, 
      reason: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
