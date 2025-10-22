import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/markets
 * Returns prediction markets with optional filtering
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Mock markets data
  const allMarkets = [
    {
      id: '1',
      question: 'Will Bitcoin reach $100,000 by end of 2025?',
      description: 'Predict if Bitcoin (BTC) will reach or exceed $100,000 USD by December 31, 2025.',
      category: 'crypto',
      creator: '0x0000000000000000000000000000000000000000',
      endTime: new Date('2025-12-31').getTime() / 1000,
      totalYesAmount: '50000000000000000000', // 50 BNB
      totalNoAmount: '30000000000000000000', // 30 BNB
      resolved: false,
      outcome: false,
      resolvedAt: 0,
      aiOracleEnabled: true,
      yesOdds: 62.5, // 50/(50+30) * 100
      noOdds: 37.5,
      totalVolume: '80000000000000000000', // 80 BNB
      participantCount: 42,
    },
    {
      id: '2',
      question: 'Will Ethereum merge to Proof of Stake be successful?',
      description: 'Predict if Ethereum 2.0 merge will be completed without major issues.',
      category: 'crypto',
      creator: '0x0000000000000000000000000000000000000000',
      endTime: new Date('2025-11-30').getTime() / 1000,
      totalYesAmount: '100000000000000000000', // 100 BNB
      totalNoAmount: '20000000000000000000', // 20 BNB
      resolved: false,
      outcome: false,
      resolvedAt: 0,
      aiOracleEnabled: false,
      yesOdds: 83.3,
      noOdds: 16.7,
      totalVolume: '120000000000000000000',
      participantCount: 87,
    },
    {
      id: '3',
      question: 'Will SpaceX land humans on Mars by 2030?',
      description: 'Predict if SpaceX successfully lands humans on Mars before January 1, 2030.',
      category: 'technology',
      creator: '0x0000000000000000000000000000000000000000',
      endTime: new Date('2030-01-01').getTime() / 1000,
      totalYesAmount: '15000000000000000000', // 15 BNB
      totalNoAmount: '35000000000000000000', // 35 BNB
      resolved: false,
      outcome: false,
      resolvedAt: 0,
      aiOracleEnabled: true,
      yesOdds: 30,
      noOdds: 70,
      totalVolume: '50000000000000000000',
      participantCount: 25,
    },
    {
      id: '4',
      question: 'Will the 2026 World Cup final be played in North America?',
      description: 'Predict if the final match of 2026 FIFA World Cup will be hosted in a North American venue.',
      category: 'sports',
      creator: '0x0000000000000000000000000000000000000000',
      endTime: new Date('2026-07-19').getTime() / 1000,
      totalYesAmount: '40000000000000000000', // 40 BNB
      totalNoAmount: '10000000000000000000', // 10 BNB
      resolved: false,
      outcome: false,
      resolvedAt: 0,
      aiOracleEnabled: false,
      yesOdds: 80,
      noOdds: 20,
      totalVolume: '50000000000000000000',
      participantCount: 33,
    },
    {
      id: '5',
      question: 'Will AI replace 50% of software jobs by 2030?',
      description: 'Predict if artificial intelligence will replace at least 50% of traditional software development jobs.',
      category: 'technology',
      creator: '0x0000000000000000000000000000000000000000',
      endTime: new Date('2030-12-31').getTime() / 1000,
      totalYesAmount: '25000000000000000000', // 25 BNB
      totalNoAmount: '75000000000000000000', // 75 BNB
      resolved: false,
      outcome: false,
      resolvedAt: 0,
      aiOracleEnabled: true,
      yesOdds: 25,
      noOdds: 75,
      totalVolume: '100000000000000000000',
      participantCount: 156,
    },
  ];

  // Filter by category
  let filteredMarkets = category
    ? allMarkets.filter((m) => m.category === category)
    : allMarkets;

  // Filter by status
  if (status === 'active') {
    filteredMarkets = filteredMarkets.filter((m) => !m.resolved && m.endTime * 1000 > Date.now());
  } else if (status === 'resolved') {
    filteredMarkets = filteredMarkets.filter((m) => m.resolved);
  } else if (status === 'ended') {
    filteredMarkets = filteredMarkets.filter((m) => m.endTime * 1000 < Date.now() && !m.resolved);
  }

  // Apply limit
  const markets = filteredMarkets.slice(0, limit);

  return NextResponse.json({
    markets,
    total: filteredMarkets.length,
    page: 1,
    limit,
  });
}

/**
 * POST /api/markets
 * Create a new prediction market
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { question, description, category, endTime } = body;
    
    if (!question || !description || !category || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, this would interact with the smart contract
    const newMarket = {
      id: Date.now().toString(),
      question,
      description,
      category,
      creator: '0x0000000000000000000000000000000000000000',
      endTime,
      totalYesAmount: '0',
      totalNoAmount: '0',
      resolved: false,
      outcome: false,
      resolvedAt: 0,
      aiOracleEnabled: body.aiOracleEnabled || false,
      yesOdds: 50,
      noOdds: 50,
      totalVolume: '0',
      participantCount: 0,
    };

    return NextResponse.json(newMarket, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
