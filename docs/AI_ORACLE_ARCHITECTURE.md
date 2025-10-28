# AI Oracle Architecture

**Last Updated:** October 28, 2025  
**Status:** Implementation Phase  
**License:** Apache 2.0

## 🎯 Overview

The AI Oracle system provides automated, AI-assisted resolution for prediction markets on BNB Chain. It combines multiple data sources, GPT-4 analysis, and blockchain integration to create a trustworthy, transparent oracle system.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [System Components](#system-components)
- [Data Flow](#data-flow)
- [Security Model](#security-model)
- [API Integration](#api-integration)
- [Fallback Mechanisms](#fallback-mechanisms)
- [Maintenance](#maintenance)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      PREDICTION MARKET UI                        │
│                    (Next.js Frontend)                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ├─── Read/Write Markets
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    SMART CONTRACTS (BNB Chain)                   │
│  ┌─────────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ PredictionMarket│◄─┤  AIOracle   │◄─┤ TraderReputation │   │
│  └────────┬────────┘  └──────▲──────┘  └──────────────────┘   │
│           │                   │                                  │
│     Events: MarketCreated   Resolutions                          │
└───────────┼───────────────────┼──────────────────────────────────┘
            │                   │
            │                   │
┌───────────▼───────────────────┴──────────────────────────────────┐
│                    AI ORACLE BACKEND SERVICE                      │
│                         (Node.js/TypeScript)                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ORACLE AGENT (Event Listener)               │  │
│  │  - Monitors blockchain events                            │  │
│  │  - Queues resolution requests                            │  │
│  │  - Manages workflow state                                │  │
│  └──────────────┬───────────────────────────────────────────┘  │
│                 │                                                │
│  ┌──────────────▼───────────────────────────────────────────┐  │
│  │           RESOLUTION ENGINE (Core Logic)                 │  │
│  │  - Coordinates data fetching                             │  │
│  │  - Manages AI analysis                                   │  │
│  │  - Calculates confidence scores                          │  │
│  └──────────────┬───────────────────────────────────────────┘  │
│                 │                                                │
│  ┌──────────────┴───────────────────────────────────────────┐  │
│  │              DATA SOURCE ADAPTERS                        │  │
│  │  ┌────────────┐ ┌─────────────┐ ┌──────────────────┐   │  │
│  │  │ CoinGecko  │ │   Binance   │ │  Custom APIs     │   │  │
│  │  │  Adapter   │ │   Adapter   │ │    Adapter       │   │  │
│  │  └─────┬──────┘ └──────┬──────┘ └────────┬─────────┘   │  │
│  └────────┼───────────────┼──────────────────┼─────────────┘  │
│           │               │                  │                  │
└───────────┼───────────────┼──────────────────┼──────────────────┘
            │               │                  │
            │               │                  │
┌───────────▼───────────────▼──────────────────▼──────────────────┐
│                    EXTERNAL DATA SOURCES                         │
│  ┌────────────┐ ┌─────────────┐ ┌──────────────────┐           │
│  │ CoinGecko  │ │   Binance   │ │    OpenAI        │           │
│  │    API     │ │    API      │ │   GPT-4 API      │           │
│  └────────────┘ └─────────────┘ └──────────────────┘           │
└──────────────────────────────────────────────────────────────────┘
            │               │                  │
            └───────────────┴──────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                    EVIDENCE STORAGE (IPFS)                        │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  - Source data snapshots                               │     │
│  │  - AI analysis results                                 │     │
│  │  - Verification steps                                  │     │
│  │  - Confidence calculations                             │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔧 System Components

### 1. Smart Contracts (Blockchain Layer)

#### **PredictionMarket.sol**
- Core prediction market logic
- Market creation and betting
- Resolution triggering
- Payout distribution

#### **AIOracle.sol**
- Resolution request management
- AI agent authorization
- Data source registry
- Confidence threshold enforcement

#### **TraderReputation.sol**
- On-chain reputation tracking
- Performance metrics
- Copy trading enablement

### 2. Backend Service (Application Layer)

#### **Oracle Agent (`oracle-agent.ts`)**
```typescript
// Responsibilities:
- Listen to blockchain events (MarketCreated, ResolutionRequested)
- Queue resolution tasks
- Manage retry logic
- Submit resolutions to blockchain
- Handle gas management
```

#### **Resolution Engine (`resolution-engine.ts`)**
```typescript
// Responsibilities:
- Coordinate multi-source data fetching
- Invoke AI analysis
- Calculate confidence scores
- Compile evidence
- Store evidence on IPFS
```

#### **Data Fetcher (`data-fetcher.ts`)**
```typescript
// Responsibilities:
- Parallel API calls to multiple sources
- Response validation
- Rate limiting
- Caching strategy
- Error handling
```

#### **AI Analyzer (`ai-analyzer.ts`)**
```typescript
// Responsibilities:
- GPT-4 function calling integration
- Context-aware prompts by market category
- Multi-step reasoning
- Bias detection
- Confidence calibration
```

#### **Evidence Storage (`evidence-storage.ts`)**
```typescript
// Responsibilities:
- IPFS upload via Pinata/web3.storage
- Local caching
- Metadata management
- CID verification
```

### 3. Data Source Adapters (Integration Layer)

#### **Base Adapter Interface**
```typescript
interface DataSourceAdapter {
  name: string;
  fetchData(query: ResolutionQuery): Promise<DataResponse>;
  validate(response: any): boolean;
  retryLogic: RetryConfig;
  rateLimit: RateLimitConfig;
}
```

#### **CoinGecko Adapter**
- Price data, market caps, volumes
- Historical data
- Cryptocurrency-specific markets

#### **Binance Adapter**
- Real-time price feeds
- Trading volumes
- High-frequency data

#### **Custom Adapter**
- Sports scores (via The Odds API)
- Weather data (via OpenWeather)
- News sentiment (via NewsAPI)

---

## 🔄 Data Flow

### Resolution Request Flow

```
1. Market Ends
   ↓
2. Oracle Agent Detects Event
   ↓
3. Create Resolution Request in AIOracle Contract
   ↓
4. Fetch Data from Multiple Sources (Parallel)
   │
   ├─→ CoinGecko API
   ├─→ Binance API
   └─→ Custom APIs
   ↓
5. Aggregate & Validate Data
   ↓
6. Send to GPT-4 for Analysis
   │ - Market question
   │ - Fetched data
   │ - Market category context
   │ - Verification rules
   ↓
7. GPT-4 Returns:
   │ - Suggested outcome (YES/NO)
   │ - Confidence score (0-10000)
   │ - Reasoning steps
   │ - Data points used
   ↓
8. Compile Evidence Package
   │ - Source data
   │ - AI analysis
   │ - Timestamps
   │ - Verification chain
   ↓
9. Upload to IPFS
   │ → Returns CID (Content ID)
   ↓
10. Submit to AIOracle Contract
    │ - provideResolution()
    │ - outcome: bool
    │ - confidence: uint256
    │ - evidenceHash: string (IPFS CID)
    ↓
11. Contract Validates:
    │ - Agent authorized?
    │ - Confidence > MIN_CONFIDENCE (80%)?
    │ - Request not already resolved?
    ↓
12. Oracle Resolves Market
    │ → Triggers MarketResolved event
    ↓
13. Users Can Claim Winnings
```

### Data Validation Flow

```
For each data source:
  1. Fetch data
  2. Check response status (200 OK)
  3. Validate schema
  4. Check data freshness (< 5 min old)
  5. Compare with other sources (if available)
  6. Flag discrepancies
  7. Calculate source confidence
  
Aggregate:
  - Require 2+ sources for critical markets
  - Weight by source reliability
  - Apply consistency checks
  - Calculate final confidence
```

---

## 🔒 Security Model

### 1. Access Control

```solidity
// Smart Contract Level
- onlyOwner: Contract configuration
- authorizedOracles: AI agents that can submit resolutions
- aiAgents: Backend service addresses

// Backend Service Level
- API Key Authentication
- Rate limiting per endpoint
- IP whitelisting (optional)
```

### 2. Confidence Thresholds

```typescript
const CONFIDENCE_LEVELS = {
  MIN_CONFIDENCE: 8000,      // 80% - Required for auto-resolution
  MANUAL_REVIEW: 7000,       // 70-79% - Requires admin review
  INSUFFICIENT: 6999,        // <70% - Cannot resolve
};
```

### 3. Multi-Source Verification

```typescript
// Require multiple data sources for high-value markets
const verificationRules = {
  highValue: {
    minSources: 3,
    consensusRequired: true,
    manualReviewThreshold: 10000 * 1e18, // $10k+
  },
  standard: {
    minSources: 2,
    consensusRequired: false,
  },
  lowValue: {
    minSources: 1,
    consensusRequired: false,
  },
};
```

### 4. Evidence Immutability

```typescript
// All resolution evidence stored on IPFS
// - Cannot be modified after upload
// - Content-addressed (CID = hash of content)
// - Verifiable by anyone
// - Timestamp preserved
```

### 5. Manual Override

```typescript
// Admin can override AI resolution if:
- Evidence contradicts AI analysis
- Data sources were compromised
- Community dispute is filed
- Confidence below threshold
```

---

## 🔌 API Integration

### OpenAI GPT-4 Integration

```typescript
// src/services/ai-oracle/ai-analyzer.ts

interface AIAnalysisRequest {
  marketQuestion: string;
  marketCategory: string;
  sourceData: SourceData[];
  endTime: Date;
}

interface AIAnalysisResponse {
  outcome: boolean;          // YES = true, NO = false
  confidence: number;        // 0-10000 (0-100%)
  reasoning: string[];       // Step-by-step analysis
  dataPoints: string[];      // Key data used
  warnings: string[];        // Potential issues
}

// Function calling schema
const resolutionFunction = {
  name: "resolve_prediction_market",
  description: "Analyze data and resolve a prediction market question",
  parameters: {
    type: "object",
    properties: {
      outcome: { type: "boolean" },
      confidence: { type: "number", minimum: 0, maximum: 10000 },
      reasoning: { type: "array", items: { type: "string" } },
      dataPoints: { type: "array", items: { type: "string" } },
    },
  },
};
```

### CoinGecko API

```typescript
// src/services/ai-oracle/adapters/coingecko-adapter.ts

interface CoinGeckoAdapter {
  // Price data
  getPrice(coinId: string, vs_currency: string): Promise<number>;
  
  // Historical data
  getHistoricalPrice(coinId: string, date: Date): Promise<number>;
  
  // Market data
  getMarketData(coinId: string): Promise<MarketData>;
}

// Rate Limits: 50 calls/min (free tier)
// Caching: 60 seconds for price data
```

### Binance API

```typescript
// src/services/ai-oracle/adapters/binance-adapter.ts

interface BinanceAdapter {
  // Current price
  getTickerPrice(symbol: string): Promise<number>;
  
  // Historical klines
  getHistoricalKlines(symbol: string, interval: string, startTime: number): Promise<Kline[]>;
  
  // 24hr stats
  get24hrStats(symbol: string): Promise<Stats24hr>;
}

// Rate Limits: 1200 requests/min
// No API key required for public endpoints
```

### IPFS Integration (Pinata)

```typescript
// src/services/ai-oracle/evidence-storage.ts

interface IPFSUploader {
  uploadJSON(data: EvidencePackage): Promise<string>; // Returns CID
  uploadFile(file: Buffer, name: string): Promise<string>;
  pin(cid: string): Promise<void>;
}

// Evidence Package Structure
interface EvidencePackage {
  version: "1.0";
  marketId: number;
  resolution: {
    outcome: boolean;
    confidence: number;
    timestamp: number;
  };
  sources: SourceData[];
  aiAnalysis: AIAnalysisResponse;
  metadata: {
    oracleAgent: string;
    blockNumber: number;
    txHash: string;
  };
}
```

---

## 🛡️ Fallback Mechanisms

### 1. Data Source Failures

```typescript
// If primary source fails, try alternatives
const dataSourcePriority = {
  crypto: ["CoinGecko", "Binance", "CoinMarketCap"],
  sports: ["TheOddsAPI", "ESPN", "Manual"],
  weather: ["OpenWeather", "WeatherAPI", "NOAA"],
};

// Fallback strategy
async function fetchWithFallback(query: ResolutionQuery) {
  const sources = dataSourcePriority[query.category];
  
  for (const source of sources) {
    try {
      const data = await adapters[source].fetchData(query);
      if (validate(data)) return data;
    } catch (error) {
      logError(source, error);
      continue; // Try next source
    }
  }
  
  throw new Error("All data sources failed");
}
```

### 2. AI Analysis Failures

```typescript
// If GPT-4 fails or returns low confidence
if (confidence < MIN_CONFIDENCE) {
  // Option 1: Queue for manual review
  await queueManualReview(marketId, aiAnalysis);
  
  // Option 2: Try alternative AI model
  const fallbackAnalysis = await analyzeWithClaude(data);
  
  // Option 3: Use rule-based system for simple markets
  if (isSimpleMarket(market)) {
    return ruleBasedResolution(market, data);
  }
}
```

### 3. IPFS Upload Failures

```typescript
// If Pinata fails, try alternative IPFS providers
const ipfsProviders = ["pinata", "web3storage", "infura"];

async function uploadWithFallback(evidence: EvidencePackage) {
  for (const provider of ipfsProviders) {
    try {
      const cid = await ipfsClients[provider].upload(evidence);
      await verifyUpload(cid); // Verify it's retrievable
      return cid;
    } catch (error) {
      logError(provider, error);
      continue;
    }
  }
  
  // Last resort: Store in centralized backup
  return await backupStorage.save(evidence);
}
```

### 4. Blockchain Transaction Failures

```typescript
// Handle gas price spikes, network congestion
async function submitWithRetry(
  contract: AIOracle,
  method: string,
  params: any[],
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const tx = await contract[method](...params, {
        gasPrice: await getOptimalGasPrice(),
        gasLimit: estimatedGas * 1.2,
      });
      return await tx.wait();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(2000 * (i + 1)); // Exponential backoff
    }
  }
}
```

---

## 🔧 Maintenance

### Daily Operations

```bash
# Monitor oracle agent status
npm run oracle:status

# Check pending resolutions
npm run oracle:pending

# View resolution history
npm run oracle:history --days 7

# Check data source health
npm run oracle:health-check
```

### Weekly Tasks

- Review resolution accuracy
- Check data source success rates
- Monitor API usage and costs
- Review manual override cases
- Update confidence thresholds if needed

### Monthly Tasks

- Analyze AI performance metrics
- Review and update prompts
- Audit evidence storage usage
- Update data source adapters
- Review security logs

### API Key Management

```bash
# Rotate API keys quarterly
# Update in .env files
OPENAI_API_KEY=sk-...
COINGECKO_API_KEY=...
PINATA_API_KEY=...
PINATA_SECRET_KEY=...

# Test new keys before rotation
npm run test:api-keys
```

### Monitoring Alerts

```typescript
// Setup alerts for:
- Oracle agent downtime (> 5 min)
- Low resolution confidence (< 85% average)
- Data source failures (> 10% error rate)
- High gas costs (> $5 per resolution)
- IPFS upload failures (> 5% error rate)
- AI API errors (> 2% error rate)
```

---

## 📊 Performance Metrics

### Target Metrics

```
Resolution Speed: < 2 minutes from market end
Accuracy Rate: > 98% correct resolutions
Uptime: 99.9% oracle agent availability
Confidence Score: > 90% average
Data Source Reliability: > 95% success rate
Cost per Resolution: < $1 (including gas + APIs)
```

### Monitoring Dashboard

```
Real-time metrics:
- Pending resolutions
- Average confidence scores
- Data source status
- API quota usage
- Gas costs
- Error rates
- Resolution history
```

---

## 🚀 Future Enhancements

1. **Multi-AI Consensus**
   - Use GPT-4, Claude, and Gemini
   - Compare results
   - Higher confidence when models agree

2. **Decentralized Oracle Network**
   - Multiple independent oracle agents
   - Stake-based incentives
   - Slashing for incorrect resolutions

3. **Community Dispute Mechanism**
   - Users can challenge resolutions
   - Stake required to dispute
   - DAO voting for final decision

4. **Advanced ML Models**
   - Custom fine-tuned models for specific categories
   - Time-series prediction models
   - Sentiment analysis models

---

## 📚 Related Documentation

- [API Keys Guide](./AI_ORACLE_SETUP.md)
- [Deployment Guide](./guides/DEPLOYMENT_GUIDE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Smart Contract Docs](../contracts/README.md)

---

**Questions or Issues?**  
Open an issue on GitHub or contact the development team.
