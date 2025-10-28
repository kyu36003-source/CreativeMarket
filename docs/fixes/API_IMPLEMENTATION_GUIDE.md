# API Implementation Guide

This document provides specifications for implementing the required API endpoints for the PredictBNB application.

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Endpoints

### 1. Get Market Categories
Retrieve all available market categories.

**Endpoint:** `GET /api/categories`

**Response:**
```typescript
MarketCategory[]

interface MarketCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}
```

**Example Response:**
```json
[
  {
    "id": "crypto",
    "name": "Cryptocurrency",
    "icon": "₿",
    "description": "Crypto prices, launches, and blockchain events"
  },
  {
    "id": "sports",
    "name": "Sports",
    "icon": "⚽",
    "description": "Sporting events, tournaments, and player performance"
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### 2. Get Markets
Retrieve markets with optional filtering.

**Endpoint:** `GET /api/markets`

**Query Parameters:**
- `category` (optional) - Filter by category ID
- `search` (optional) - Search in question and description

**Response:**
```typescript
Market[]

interface Market {
  id: string;
  question: string;
  description: string;
  category: string;
  creator: string;
  endTime: number;
  totalYesAmount: bigint;
  totalNoAmount: bigint;
  resolved: boolean;
  outcome: boolean | null;
  resolvedAt: number | null;
  imageUrl?: string;
  tags?: string[];
}
```

**Example Response:**
```json
[
  {
    "id": "1",
    "question": "Will Bitcoin reach $100,000 by end of 2025?",
    "description": "Market resolves YES if Bitcoin reaches $100k...",
    "category": "crypto",
    "creator": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "endTime": 1735689599,
    "totalYesAmount": "125000000000000000000",
    "totalNoAmount": "85000000000000000000",
    "resolved": false,
    "outcome": null,
    "resolvedAt": null,
    "imageUrl": "https://example.com/btc.png",
    "tags": ["bitcoin", "price", "cryptocurrency"]
  }
]
```

**Implementation Notes:**
- BigInt values should be serialized as strings in JSON
- `endTime` and `resolvedAt` are Unix timestamps (seconds)
- Query blockchain smart contract for real-time market data
- Implement caching for better performance

**Status Codes:**
- `200` - Success
- `400` - Invalid parameters
- `500` - Server error

---

### 3. Get Market by ID
Retrieve a specific market's details.

**Endpoint:** `GET /api/markets/:marketId`

**Path Parameters:**
- `marketId` - The unique market identifier

**Response:**
```typescript
Market (same interface as above)
```

**Status Codes:**
- `200` - Success
- `404` - Market not found
- `500` - Server error

---

### 4. Get AI Analysis
Retrieve AI-powered analysis for a specific market.

**Endpoint:** `GET /api/ai-analysis/:marketId`

**Path Parameters:**
- `marketId` - The unique market identifier

**Response:**
```typescript
AIAnalysis

interface AIAnalysis {
  marketId: string;
  sentiment: number; // -1 to 1
  confidence: number; // 0 to 100
  factors: Array<{
    name: string;
    impact: number; // 0 to 1
    description: string;
  }>;
  recommendation: 'buy_yes' | 'buy_no' | 'hold' | 'uncertain';
  sources: string[];
  lastUpdated: number; // Unix timestamp
}
```

**Example Response:**
```json
{
  "marketId": "1",
  "sentiment": 0.65,
  "confidence": 76,
  "factors": [
    {
      "name": "Historical trend correlation",
      "impact": 0.85,
      "description": "Strong positive correlation with past patterns"
    },
    {
      "name": "News sentiment",
      "impact": 0.6,
      "description": "Recent news coverage is predominantly positive"
    },
    {
      "name": "Social media buzz",
      "impact": 0.55,
      "description": "Increasing mentions and engagement"
    }
  ],
  "recommendation": "buy_yes",
  "sources": [
    "Twitter API",
    "CoinGecko",
    "Google News",
    "Reddit",
    "Historical price data"
  ],
  "lastUpdated": 1729612800
}
```

**Implementation Notes:**
- This should integrate with AI oracle service
- Analysis should be cached and updated periodically
- Consider implementing rate limiting for expensive AI operations
- `sentiment`: -1 (bearish) to 1 (bullish)
- `confidence`: 0-100 percentage
- `impact`: 0-1 for each factor (0.7+ = high, 0.4-0.7 = medium, <0.4 = low)

**Status Codes:**
- `200` - Success
- `404` - Market not found or no analysis available
- `500` - Server error
- `503` - AI service unavailable

---

## Error Response Format

All error responses should follow this format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {} // Optional additional context
  }
}
```

## Authentication

Currently, the application doesn't require authentication for reading market data. However, for future implementations:

- Write operations (create market, place prediction) should require wallet signature verification
- AI analysis requests may require API key authentication
- Consider implementing rate limiting per wallet address

## Blockchain Integration

### Reading Market Data
```typescript
// Pseudocode for fetching markets from smart contract
async function fetchMarketsFromBlockchain(): Promise<Market[]> {
  const contract = new ethers.Contract(MARKET_ADDRESS, MARKET_ABI, provider);
  const marketCount = await contract.getMarketCount();
  
  const markets = [];
  for (let i = 0; i < marketCount; i++) {
    const market = await contract.getMarket(i);
    markets.push({
      id: market.id.toString(),
      question: market.question,
      // ... map other fields
      totalYesAmount: market.totalYesAmount.toString(),
      totalNoAmount: market.totalNoAmount.toString(),
    });
  }
  
  return markets;
}
```

### Caching Strategy
1. Use Redis or similar for caching market data
2. Update cache on blockchain events (NewMarket, BetPlaced, MarketResolved)
3. Set TTL based on market activity
4. Implement cache invalidation on state changes

## WebSocket Support (Optional but Recommended)

For real-time updates, consider implementing WebSocket endpoints:

```
ws://your-domain.com/api/ws/markets
ws://your-domain.com/api/ws/markets/:marketId
```

**Events:**
- `market:created` - New market created
- `market:updated` - Market data changed
- `market:resolved` - Market resolved
- `bet:placed` - New bet placed
- `odds:changed` - Odds updated

## Testing

### Example cURL Commands

Get categories:
```bash
curl https://your-domain.com/api/categories
```

Get markets:
```bash
curl "https://your-domain.com/api/markets?category=crypto&search=bitcoin"
```

Get specific market:
```bash
curl https://your-domain.com/api/markets/1
```

Get AI analysis:
```bash
curl https://your-domain.com/api/ai-analysis/1
```

## Performance Considerations

1. **Caching**: Implement aggressive caching for market data
2. **Pagination**: Add pagination for markets list (consider adding `page` and `limit` params)
3. **Rate Limiting**: Protect expensive operations (AI analysis)
4. **CDN**: Use CDN for static assets (market images)
5. **Database Indexing**: Index frequently queried fields (category, creator, resolved status)
6. **Batch Requests**: Consider adding batch endpoints for fetching multiple markets

## Security

1. **Input Validation**: Validate all query parameters and path parameters
2. **SQL Injection**: Use parameterized queries
3. **XSS Protection**: Sanitize user-generated content
4. **CORS**: Configure appropriate CORS headers
5. **Rate Limiting**: Implement rate limiting per IP/wallet
6. **DDoS Protection**: Use Cloudflare or similar

## Monitoring

Implement logging and monitoring for:
- API response times
- Error rates
- Blockchain RPC call failures
- AI oracle service availability
- Cache hit/miss rates
- User activity patterns

## Next.js API Routes Example

```typescript
// app/api/markets/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  try {
    // Fetch from blockchain/database
    const markets = await fetchMarkets({ category, search });
    
    return NextResponse.json(markets);
  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Failed to fetch markets' } },
      { status: 500 }
    );
  }
}
```

## Resources

- BNB Chain Documentation: https://docs.bnbchain.org/
- Ethers.js: https://docs.ethers.org/
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Redis: https://redis.io/docs/
