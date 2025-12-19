import { NextResponse } from 'next/server';

/**
 * GET /api/user/achievements
 * Get user achievements and badges
 */
export async function GET() {
  try {
    // TODO: Fetch from database/blockchain
    // For now, return mock data
    const achievements = [
      {
        id: 'first_bet',
        name: 'First Bet',
        description: 'Placed your first prediction',
        icon: '🎯',
        unlockedAt: null,
        progress: 0,
        target: 1,
      },
      {
        id: 'win_streak_3',
        name: 'Hot Streak',
        description: 'Win 3 predictions in a row',
        icon: '🔥',
        unlockedAt: null,
        progress: 0,
        target: 3,
      },
      {
        id: 'total_volume_1000',
        name: 'Big Player',
        description: 'Reach $1000 in total betting volume',
        icon: '💎',
        unlockedAt: null,
        progress: 0,
        target: 1000,
      },
      {
        id: 'markets_created_1',
        name: 'Market Maker',
        description: 'Create your first market',
        icon: '🏗️',
        unlockedAt: null,
        progress: 0,
        target: 1,
      },
      {
        id: 'followers_10',
        name: 'Influencer',
        description: 'Get 10 followers',
        icon: '⭐',
        unlockedAt: null,
        progress: 0,
        target: 10,
      },
    ];

    return NextResponse.json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch achievements',
      },
      { status: 500 }
    );
  }
}
