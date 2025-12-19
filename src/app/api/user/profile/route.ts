import { NextResponse } from 'next/server';

/**
 * GET /api/user/profile
 * Get user profile information
 */
export async function GET() {
  try {
    // TODO: Fetch from database/blockchain
    // For now, return mock data
    const profile = {
      address: '0x0000000000000000000000000000000000000000',
      name: 'Anonymous Trader',
      bio: 'Prediction market enthusiast',
      avatar: null,
      joinedAt: new Date('2024-01-01').toISOString(),
      stats: {
        totalBets: 0,
        winRate: 0,
        totalWinnings: 0,
        rank: 0,
      },
      following: 0,
      followers: 0,
    };

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch profile',
      },
      { status: 500 }
    );
  }
}
