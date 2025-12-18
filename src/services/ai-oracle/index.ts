#!/usr/bin/env node
/**
 * AI Oracle Service
 * Main entry point for the AI Oracle resolution service
 *
 * Usage:
 *   npm run oracle:start
 *   npm run oracle:resolve <marketId>
 *   npm run oracle:status
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { CoinGeckoAdapter, BinanceAdapter } from './adapters';
import { AIAnalyzer } from './ai-analyzer';
import { EvidenceStorage } from './evidence-storage';
import { ResolutionEngine } from './resolution-engine';
import { Market, MarketCategory } from './types';

// Load environment variables
dotenv.config();

// Contract ABIs (simplified for oracle interaction)
const AI_ORACLE_ABI = [
  'function provideResolution(uint256 requestId, bool outcome, uint256 confidence, string memory evidenceHash) external',
  'function resolutionRequests(uint256) external view returns (uint256 marketId, string dataSource, uint256 timestamp, bool resolved, bool outcome, uint256 confidence, string evidenceHash)',
  'function aiAgents(address) external view returns (bool)',
  'event ResolutionRequested(uint256 indexed requestId, uint256 indexed marketId, string dataSource)',
  'event ResolutionProvided(uint256 indexed requestId, bool outcome, uint256 confidence)',
];

const PREDICTION_MARKET_ABI = [
  'function markets(uint256) external view returns (uint256 id, string question, string description, string category, address creator, uint256 endTime, uint256 totalYesAmount, uint256 totalNoAmount, bool resolved, bool outcome, uint256 resolvedAt, bool aiOracleEnabled)',
  'function marketCount() external view returns (uint256)',
  'event MarketCreated(uint256 indexed marketId, string question, uint256 endTime, address indexed creator)',
  'event MarketResolved(uint256 indexed marketId, bool outcome, uint256 resolvedAt)',
];

class OracleService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private oracleContract: ethers.Contract;
  private marketContract: ethers.Contract;
  private resolutionEngine: ResolutionEngine;
  private isRunning: boolean = false;

  constructor() {
    // Initialize provider and wallet
    const rpcUrl =
      process.env.BSC_TESTNET_RPC_URL ||
      'https://data-seed-prebsc-1-s1.binance.org:8545/';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY not found in environment variables');
    }

    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);

    // Initialize contracts
    const oracleAddress =
      process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS ||
      '0x0000000000000000000000000000000000000000';
    const marketAddress =
      process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS ||
      '0x0000000000000000000000000000000000000000';

    this.oracleContract = new ethers.Contract(
      oracleAddress,
      AI_ORACLE_ABI,
      this.wallet
    );

    this.marketContract = new ethers.Contract(
      marketAddress,
      PREDICTION_MARKET_ABI,
      this.wallet
    );

    // Initialize data source adapters
    const adapters = [
      new CoinGeckoAdapter(process.env.COINGECKO_API_KEY),
      new BinanceAdapter(
        process.env.BINANCE_API_KEY,
        process.env.BINANCE_SECRET_KEY
      ),
    ];

    // Initialize AI analyzer
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }

    const aiAnalyzer = new AIAnalyzer({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      minConfidence: parseInt(process.env.MIN_CONFIDENCE_THRESHOLD || '8000'),
    });

    // Initialize evidence storage
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_KEY) {
      throw new Error(
        'PINATA_API_KEY and PINATA_SECRET_KEY not found in environment variables'
      );
    }

    const evidenceStorage = new EvidenceStorage({
      provider: 'pinata',
      apiKey: process.env.PINATA_API_KEY,
      secretKey: process.env.PINATA_SECRET_KEY,
    });

    // Initialize resolution engine
    this.resolutionEngine = new ResolutionEngine({
      adapters,
      aiAnalyzer,
      evidenceStorage,
      oracleContract: this.oracleContract,
      signer: this.wallet,
      minConfidence: parseInt(process.env.MIN_CONFIDENCE_THRESHOLD || '8000'),
      maxGasPrice: ethers.parseUnits(
        process.env.MAX_GAS_PRICE_GWEI || '10',
        'gwei'
      ),
    });
  }

  /**
   * Start the oracle service (listen for events)
   */
  async start(): Promise<void> {
    console.log('🚀 Starting AI Oracle Service...');
    console.log(`📡 Network: BNB Chain Testnet`);
    console.log(`👛 Wallet: ${await this.wallet.getAddress()}`);
    console.log(
      `🔮 Oracle Contract: ${await this.oracleContract.getAddress()}`
    );
    console.log(
      `📊 Market Contract: ${await this.marketContract.getAddress()}`
    );

    // Verify agent is authorized
    const isAuthorized = await this.oracleContract.aiAgents(
      await this.wallet.getAddress()
    );
    if (!isAuthorized) {
      console.error('❌ Oracle agent not authorized!');
      console.error('   Run: contract.setAIAgent(yourAddress, true)');
      process.exit(1);
    }

    console.log('✅ Oracle agent authorized');
    console.log('\n👂 Listening for events...\n');

    this.isRunning = true;

    // Listen for MarketCreated events (to track new markets)
    this.marketContract.on(
      'MarketCreated',
      async (marketId, question, endTime) => {
        console.log(`📢 New Market Created: #${marketId}`);
        console.log(`   Question: ${question}`);
        console.log(
          `   End Time: ${new Date(Number(endTime) * 1000).toISOString()}`
        );
      }
    );

    // Listen for ResolutionRequested events
    this.oracleContract.on(
      'ResolutionRequested',
      async (requestId, marketId) => {
        console.log(
          `\n🔔 Resolution Requested: Request #${requestId}, Market #${marketId}`
        );

        try {
          // Fetch market details
          const market = await this.fetchMarket(marketId);

          // Check if market has ended
          if (market.endTime.getTime() > Date.now()) {
            console.log(`⏰ Market has not ended yet. Skipping...`);
            return;
          }

          // Resolve the market
          await this.resolutionEngine.resolveMarket(market);
        } catch (error) {
          console.error(`❌ Resolution failed:`, error);
        }
      }
    );

    // Keep the process running
    await new Promise(() => {}); // Run indefinitely
  }

  /**
   * Resolve a specific market by ID
   */
  async resolveMarket(marketId: number): Promise<void> {
    console.log(`🎯 Resolving Market #${marketId}...`);

    try {
      const market = await this.fetchMarket(marketId);

      if (market.resolved) {
        console.log(`✅ Market already resolved`);
        return;
      }

      if (market.endTime.getTime() > Date.now()) {
        console.log(`⏰ Market has not ended yet`);
        console.log(`   End Time: ${market.endTime.toISOString()}`);
        return;
      }

      const result = await this.resolutionEngine.resolveMarket(market);

      console.log(`\n✅ Resolution Complete!`);
      console.log(`   Result: ${result.outcome ? 'YES' : 'NO'}`);
      console.log(`   Confidence: ${result.confidence / 100}%`);
      console.log(
        `   Evidence: https://gateway.pinata.cloud/ipfs/${result.evidenceCid}`
      );
      console.log(
        `   Transaction: https://testnet.bscscan.com/tx/${result.txHash}`
      );
    } catch (error) {
      console.error(`❌ Resolution failed:`, error);
      process.exit(1);
    }
  }

  /**
   * Show service status
   */
  async status(): Promise<void> {
    console.log('📊 AI Oracle Service Status\n');

    const address = await this.wallet.getAddress();
    const balance = await this.provider.getBalance(address);
    const isAuthorized = await this.oracleContract.aiAgents(address);
    const marketCount = await this.marketContract.marketCount();

    console.log(`Wallet Address: ${address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} BNB`);
    console.log(`Authorized: ${isAuthorized ? '✅ Yes' : '❌ No'}`);
    console.log(`Total Markets: ${marketCount}`);

    if (!isAuthorized) {
      console.log('\n⚠️  Agent not authorized. Cannot submit resolutions.');
    }

    if (parseFloat(ethers.formatEther(balance)) < 0.1) {
      console.log('\n⚠️  Low balance. Get testnet BNB from:');
      console.log('   https://testnet.bnbchain.org/faucet-smart');
    }
  }

  /**
   * Fetch market details from contract
   */
  private async fetchMarket(marketId: number): Promise<Market> {
    const marketData = await this.marketContract.markets(marketId);

    return {
      id: Number(marketData.id),
      question: marketData.question,
      description: marketData.description,
      category: this.parseCategory(marketData.category),
      creator: marketData.creator,
      endTime: new Date(Number(marketData.endTime) * 1000),
      totalYesAmount: BigInt(marketData.totalYesAmount.toString()),
      totalNoAmount: BigInt(marketData.totalNoAmount.toString()),
      resolved: marketData.resolved,
      outcome: marketData.outcome,
      resolvedAt: marketData.resolvedAt
        ? new Date(Number(marketData.resolvedAt) * 1000)
        : undefined,
      aiOracleEnabled: marketData.aiOracleEnabled,
    };
  }

  /**
   * Parse category string to enum
   */
  private parseCategory(category: string): MarketCategory {
    const normalized = category.toLowerCase();
    if (normalized.includes('crypto')) return MarketCategory.CRYPTO;
    if (normalized.includes('sport')) return MarketCategory.SPORTS;
    if (normalized.includes('politic')) return MarketCategory.POLITICS;
    if (normalized.includes('weather')) return MarketCategory.WEATHER;
    if (normalized.includes('entertainment'))
      return MarketCategory.ENTERTAINMENT;
    if (normalized.includes('tech')) return MarketCategory.TECHNOLOGY;
    if (normalized.includes('finance')) return MarketCategory.FINANCE;
    return MarketCategory.OTHER;
  }

  /**
   * Stop the service
   */
  stop(): void {
    console.log('\n🛑 Stopping oracle service...');
    this.isRunning = false;
    this.marketContract.removeAllListeners();
    this.oracleContract.removeAllListeners();
    process.exit(0);
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const service = new OracleService();

  // Handle graceful shutdown
  process.on('SIGINT', () => service.stop());
  process.on('SIGTERM', () => service.stop());

  try {
    switch (command) {
      case 'start':
        await service.start();
        break;

      case 'resolve':
        const marketId = parseInt(process.argv[3]);
        if (isNaN(marketId)) {
          console.error('Usage: npm run oracle:resolve <marketId>');
          process.exit(1);
        }
        await service.resolveMarket(marketId);
        process.exit(0);
        break;

      case 'status':
        await service.status();
        process.exit(0);
        break;

      default:
        console.log('AI Oracle Service\n');
        console.log('Commands:');
        console.log('  start          Start the oracle service');
        console.log('  resolve <id>   Resolve a specific market');
        console.log('  status         Show service status');
        console.log('\nExamples:');
        console.log('  npm run oracle:start');
        console.log('  npm run oracle:resolve 1');
        console.log('  npm run oracle:status');
        process.exit(0);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { OracleService };
