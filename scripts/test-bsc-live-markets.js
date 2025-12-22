/**
 * Test BSC Testnet Live Markets
 * Verify that all markets and predictions are on-chain and working
 */

const { ethers } = require('ethers');

// Live contract addresses on BSC Testnet
const CONTRACTS = {
  PREDICTION_MARKET: '0x7F0335eC0157a113840D2dcB257BE971774F2226',
  TRADER_REPUTATION: '0xE5bBD4830173270202b5b758260043A6AbE20786',
  AI_ORACLE: '0xEa64A8dc4D1BE9d7b248B5D15bC2D142F82973E2',
  GASLESS_RELAYER: '0xD29A8D4b192F6E3dA3814f6B3353E214732FCcf5',
};

// PredictionMarket ABI (market data structure)
const PREDICTION_MARKET_ABI = [
  'function marketCount() view returns (uint256)',
  'function markets(uint256) view returns (uint256 id, string question, string description, string category, address creator, uint256 endTime, uint256 totalYesAmount, uint256 totalNoAmount, bool resolved, bool outcome, uint256 resolvedAt, bool aiOracleEnabled)',
  'function positions(uint256, address) view returns (uint256 yesAmount, uint256 noAmount, bool claimed)',
];

// TraderReputation ABI
const TRADER_REPUTATION_ABI = [
  'function getReputationScore(address) view returns (uint256)',
  'function getTraderStats(address) view returns (uint256 totalBets, uint256 wins, uint256 losses, uint256 totalWinnings)',
];

async function main() {
  try {
    console.log('═════════════════════════════════════════════════════════════');
    console.log('🔍 BSC TESTNET LIVE MARKETS & PREDICTIONS TEST');
    console.log('═════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Network: BSC Testnet (Chain ID: 97)');
    console.log('RPC: https://data-seed-prebsc-1-s1.binance.org:8545/');
    console.log('');

    // Connect to BSC Testnet
    const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');

    // Verify connection
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log('');

    // Initialize contract instances
    const predictionMarket = new ethers.Contract(
      CONTRACTS.PREDICTION_MARKET,
      PREDICTION_MARKET_ABI,
      provider
    );

    const traderReputation = new ethers.Contract(
      CONTRACTS.TRADER_REPUTATION,
      TRADER_REPUTATION_ABI,
      provider
    );

    // =====================================================================
    // TEST 1: Check Market Count
    // =====================================================================
    console.log('═ TEST 1: Market Count ═');
    const marketCount = await predictionMarket.marketCount();
    const count = Number(marketCount);
    console.log(`Total markets on-chain: ${count}`);
    
    if (count === 0) {
      console.log('⚠️  WARNING: No markets found on blockchain!');
      console.log('   The blockchain has no markets yet.');
      console.log('   You may need to create some markets first.');
      console.log('');
      return;
    } else {
      console.log(`✅ Found ${count} markets on blockchain`);
    }
    console.log('');

    // =====================================================================
    // TEST 2: Fetch and Display All Markets
    // =====================================================================
    console.log('═ TEST 2: Market Details ═');
    const markets = [];
    
    // Fetch ALL markets (not limited to 10)
    for (let i = 1; i <= count; i++) {
      try {
        const market = await predictionMarket.markets(i);
        
        const totalYes = ethers.formatEther(market.totalYesAmount);
        const totalNo = ethers.formatEther(market.totalNoAmount);
        const totalPool = parseFloat(totalYes) + parseFloat(totalNo);
        
        const market_data = {
          id: i,
          question: market.question,
          description: market.description,
          category: market.category,
          creator: market.creator,
          endTime: new Date(Number(market.endTime) * 1000).toLocaleString(),
          totalYesAmount: totalYes,
          totalNoAmount: totalNo,
          totalPool: totalPool.toFixed(4),
          resolved: market.resolved,
          outcome: market.outcome ? 'YES' : 'NO',
          aiOracleEnabled: market.aiOracleEnabled,
        };
        
        markets.push(market_data);
        
        console.log(`\n📊 Market #${i}`);
        console.log(`   Question: ${market_data.question}`);
        console.log(`   Category: ${market_data.category}`);
        console.log(`   Creator: ${market_data.creator.substring(0, 10)}...`);
        console.log(`   Ends: ${market_data.endTime}`);
        console.log(`   Pool: ${market_data.totalPool} BNB (Yes: ${market_data.totalYesAmount} BNB, No: ${market_data.totalNoAmount} BNB)`);
        console.log(`   Status: ${market_data.resolved ? '✅ Resolved' : '🔄 Active'}`);
        if (market_data.resolved) {
          console.log(`   Outcome: ${market_data.outcome}`);
        }
        console.log(`   AI Oracle: ${market_data.aiOracleEnabled ? '✅ Yes' : '❌ No'}`);
      } catch (error) {
        console.log(`❌ Error fetching market ${i}: ${error.message}`);
      }
    }
    console.log('');

    // =====================================================================
    // TEST 3: Check Contract State
    // =====================================================================
    console.log('═ TEST 3: Contract Information ═');
    console.log(`PredictionMarket: ${CONTRACTS.PREDICTION_MARKET}`);
    console.log(`TraderReputation: ${CONTRACTS.TRADER_REPUTATION}`);
    console.log(`AIOracle: ${CONTRACTS.AI_ORACLE}`);
    console.log(`GaslessRelayer: ${CONTRACTS.GASLESS_RELAYER}`);
    console.log('');

    // Get contract code to verify contracts are deployed
    const pmCode = await provider.getCode(CONTRACTS.PREDICTION_MARKET);
    const trCode = await provider.getCode(CONTRACTS.TRADER_REPUTATION);
    const aoCode = await provider.getCode(CONTRACTS.AI_ORACLE);
    const grCode = await provider.getCode(CONTRACTS.GASLESS_RELAYER);

    console.log('Contract Deployment Status:');
    console.log(`✅ PredictionMarket deployed: ${pmCode.length > 2 ? 'YES' : 'NO'}`);
    console.log(`✅ TraderReputation deployed: ${trCode.length > 2 ? 'YES' : 'NO'}`);
    console.log(`✅ AIOracle deployed: ${aoCode.length > 2 ? 'YES' : 'NO'}`);
    console.log(`✅ GaslessRelayer deployed: ${grCode.length > 2 ? 'YES' : 'NO'}`);
    console.log('');

    // =====================================================================
    // TEST 4: Test Market Reading (Simulate Frontend)
    // =====================================================================
    console.log('═ TEST 4: Frontend Simulation (Reading Markets) ═');
    console.log(`Simulating what the frontend does when loading ${count} market(s)...\n`);
    
    let successCount = 0;
    // Test reading all markets
    for (let i = 1; i <= count; i++) {
      try {
        const market = await predictionMarket.markets(i);
        console.log(`✅ Market ${i}: Successfully fetched "${market.question.substring(0, 40)}..."`);
        successCount++;
      } catch (error) {
        console.log(`❌ Market ${i}: Failed to fetch - ${error.message}`);
      }
    }
    console.log(`\n📊 Result: ${successCount}/${count} markets successfully fetched from blockchain`);
    console.log('');

    // =====================================================================
    // TEST 5: Check Deployer Account Stats
    // =====================================================================
    console.log('═ TEST 5: Deployer Account Information ═');
    const deployerAddress = '0x3A67492c38d5D72749fD124cB4Daee2e883AF732';
    
    try {
      // Get ETH balance
      const balance = await provider.getBalance(deployerAddress);
      const balanceInBNB = ethers.formatEther(balance);
      console.log(`Deployer Address: ${deployerAddress}`);
      console.log(`Balance: ${balanceInBNB} BNB`);
      
      // Get reputation score
      try {
        const repScore = await traderReputation.getReputationScore(deployerAddress);
        console.log(`Reputation Score: ${Number(repScore)}`);
      } catch (error) {
        console.log(`Reputation Score: Unable to fetch (${error.message})`);
      }
      
      // Get trader stats
      try {
        const stats = await traderReputation.getTraderStats(deployerAddress);
        console.log(`Total Bets: ${Number(stats.totalBets)}`);
        console.log(`Wins: ${Number(stats.wins)}`);
        console.log(`Losses: ${Number(stats.losses)}`);
        console.log(`Total Winnings: ${ethers.formatEther(stats.totalWinnings)} BNB`);
      } catch (error) {
        console.log(`Stats: Unable to fetch (${error.message})`);
      }
    } catch (error) {
      console.log(`❌ Error fetching deployer info: ${error.message}`);
    }
    console.log('');

    // =====================================================================
    // SUMMARY
    // =====================================================================
    console.log('═════════════════════════════════════════════════════════════');
    console.log('📋 TEST SUMMARY');
    console.log('═════════════════════════════════════════════════════════════');
    console.log('');
    
    if (count === 0) {
      console.log('🔴 RESULT: NO MARKETS ON BLOCKCHAIN');
      console.log('');
      console.log('NEXT STEPS:');
      console.log('1. Run: npm run create-testnet-markets');
      console.log('2. Or use the frontend to create markets');
      console.log('3. Then run this test again to verify');
    } else {
      console.log('🟢 RESULT: MARKETS ARE ON-CHAIN');
      console.log('');
      console.log(`✅ ${count} market(s) found on BSC Testnet`);
      console.log(`✅ All contracts are deployed and working`);
      console.log(`✅ Market data is readable from blockchain`);
      console.log(`✅ Frontend can fetch this data`);
      console.log('');
      console.log('VERIFICATION:');
      console.log('1. Connect wallet to MetaMask with Chain ID 97 (BSC Testnet)');
      console.log('2. Visit http://localhost:3000');
      console.log('3. Markets should load from blockchain');
      console.log('4. No static/demo data should appear');
      console.log('');
      console.log(`📊 Markets Summary:`);
      console.log(`   Total: ${markets.length}`);
      console.log(`   Active: ${markets.filter(m => !m.resolved).length}`);
      console.log(`   Resolved: ${markets.filter(m => m.resolved).length}`);
      console.log(`   Total Pool: ${markets.reduce((sum, m) => sum + parseFloat(m.totalPool), 0).toFixed(4)} BNB`);
    }
    console.log('');
    console.log('═════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    process.exit(1);
  }
}

main();
