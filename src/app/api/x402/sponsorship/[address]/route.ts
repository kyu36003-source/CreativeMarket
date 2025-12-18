/**
 * x402 Gas Sponsorship API Route
 * Returns user's total sponsored gas amount
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { bsc, bscTestnet } from 'viem/chains';

const X402_BETTING_ABI = [
  {
    name: 'gasAllowances',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const userAddress = params.address as `0x${string}`;
    const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '97');
    const chain = chainId === 56 ? bsc : bscTestnet;

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    const x402BettingAddress = process.env
      .NEXT_PUBLIC_X402_BETTING_ADDRESS as `0x${string}`;

    if (!x402BettingAddress) {
      return NextResponse.json(
        { error: 'X402 Betting contract not configured' },
        { status: 500 }
      );
    }

    // Read sponsored amount from contract
    const totalSponsored = await publicClient.readContract({
      address: x402BettingAddress,
      abi: X402_BETTING_ABI,
      functionName: 'gasAllowances',
      args: [userAddress],
    });

    return NextResponse.json({
      address: userAddress,
      totalSponsored: totalSponsored.toString(),
      chain: chainId,
    });
  } catch (error) {
    console.error('Failed to fetch gas sponsorship:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch',
      },
      { status: 500 }
    );
  }
}
