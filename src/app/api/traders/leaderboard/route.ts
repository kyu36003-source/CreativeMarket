import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/traders/leaderboard
 * Returns top traders by reputation
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || 'all'; // 24h, 7d, 30d, all
  const limit = parseInt(searchParams.get('limit') || '10');

  // Mock top traders data
  const topTraders = [
    {
      id: '0x1234567890123456789012345678901234567890',
      address: '0x1234567890123456789012345678901234567890',
      username: 'CryptoWhale',
      avatar: null,
      stats: {
        totalBets: 156,
        totalWins: 124,
        totalLosses: 32,
        winRate: 79.5,
        totalVolume: '450.5',
        totalProfit: '125.3',
        roi: 27.8,
        currentStreak: 8,
        bestStreak: 15,
        reputationScore: 885,
        averageBetSize: '2.89',
      },
      badges: [
        { name: 'Platinum Trader', tier: 4, unlockedAt: Date.now() - 30 * 24 * 60 * 60 * 1000 },
        { name: 'High Roller', tier: 3, unlockedAt: Date.now() - 60 * 24 * 60 * 60 * 1000 },
      ],
      specialties: ['Crypto', 'Technology'],
      followers: 1243,
      isVerified: true,
      joinedAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
    },
    {
      id: '0x2345678901234567890123456789012345678901',
      address: '0x2345678901234567890123456789012345678901',
      username: 'AIPredictor',
      avatar: null,
      stats: {
        totalBets: 203,
        totalWins: 158,
        totalLosses: 45,
        winRate: 77.8,
        totalVolume: '380.2',
        totalProfit: '95.7',
        roi: 25.2,
        currentStreak: 5,
        bestStreak: 12,
        reputationScore: 825,
        averageBetSize: '1.87',
      },
      badges: [
        { name: 'Gold Trader', tier: 3, unlockedAt: Date.now() - 45 * 24 * 60 * 60 * 1000 },
        { name: 'Tech Guru', tier: 2, unlockedAt: Date.now() - 90 * 24 * 60 * 60 * 1000 },
      ],
      specialties: ['Technology', 'Business'],
      followers: 987,
      isVerified: true,
      joinedAt: Date.now() - 150 * 24 * 60 * 60 * 1000,
    },
    {
      id: '0x3456789012345678901234567890123456789012',
      address: '0x3456789012345678901234567890123456789012',
      username: 'SportsBetter',
      avatar: null,
      stats: {
        totalBets: 98,
        totalWins: 72,
        totalLosses: 26,
        winRate: 73.5,
        totalVolume: '210.8',
        totalProfit: '58.3',
        roi: 27.7,
        currentStreak: 3,
        bestStreak: 9,
        reputationScore: 680,
        averageBetSize: '2.15',
      },
      badges: [
        { name: 'Gold Trader', tier: 3, unlockedAt: Date.now() - 20 * 24 * 60 * 60 * 1000 },
      ],
      specialties: ['Sports'],
      followers: 654,
      isVerified: false,
      joinedAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
    },
    {
      id: '0x4567890123456789012345678901234567890123',
      address: '0x4567890123456789012345678901234567890123',
      username: 'MarketMaster',
      avatar: null,
      stats: {
        totalBets: 134,
        totalWins: 95,
        totalLosses: 39,
        winRate: 70.9,
        totalVolume: '298.4',
        totalProfit: '72.1',
        roi: 24.2,
        currentStreak: 0,
        bestStreak: 11,
        reputationScore: 625,
        averageBetSize: '2.23',
      },
      badges: [
        { name: 'Gold Trader', tier: 3, unlockedAt: Date.now() - 15 * 24 * 60 * 60 * 1000 },
      ],
      specialties: ['Crypto', 'Business'],
      followers: 521,
      isVerified: true,
      joinedAt: Date.now() - 100 * 24 * 60 * 60 * 1000,
    },
    {
      id: '0x5678901234567890123456789012345678901234',
      address: '0x5678901234567890123456789012345678901234',
      username: 'DeFiDegen',
      avatar: null,
      stats: {
        totalBets: 87,
        totalWins: 58,
        totalLosses: 29,
        winRate: 66.7,
        totalVolume: '156.9',
        totalProfit: '38.2',
        roi: 24.4,
        currentStreak: 2,
        bestStreak: 7,
        reputationScore: 475,
        averageBetSize: '1.80',
      },
      badges: [
        { name: 'Silver Trader', tier: 2, unlockedAt: Date.now() - 10 * 24 * 60 * 60 * 1000 },
      ],
      specialties: ['Crypto'],
      followers: 389,
      isVerified: false,
      joinedAt: Date.now() - 80 * 24 * 60 * 60 * 1000,
    },
  ];

  // In production, filter by period and fetch from blockchain
  const traders = topTraders.slice(0, limit);

  return NextResponse.json({
    traders,
    total: topTraders.length,
    period,
    limit,
  });
}
