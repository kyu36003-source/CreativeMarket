/**
 * Create Additional Markets on BSC Testnet
 * Add more predictions/markets to the blockchain
 */

const { ethers } = require('ethers');
require('dotenv').config();

const PREDICTION_MARKET_ADDRESS = '0x7F0335eC0157a113840D2dcB257BE971774F2226';

const PREDICTION_MARKET_ABI = [
  'function createMarket(string question, string description, string category, uint256 endTime, bool aiOracleEnabled) public payable returns (uint256)',
  'function markets(uint256) view returns (uint256 id, string question, string description, string category, address creator, uint256 endTime, uint256 totalYesAmount, uint256 totalNoAmount, bool resolved, bool outcome, uint256 resolvedAt, bool aiOracleEnabled)',
  'function marketCount() view returns (uint256)',
];

// Markets to create
const MARKETS_TO_CREATE = [
  {
    question: 'Will Ethereum reach $5000 by Q2 2025?',
    description: 'Will Ethereum trading price reach $5000 USD or higher by Q2 2025 (April 1 - June 30)',
    category: 'Cryptocurrency',
    daysFromNow: 7,
    aiOracleEnabled: true,
  },
  {
    question: 'Will XRP surpass $3 by end of Q1 2025?',
    description: 'Will Ripple (XRP) token price reach $3 USD or higher by end of Q1 2025',
    category: 'Cryptocurrency',
    daysFromNow: 7,
    aiOracleEnabled: true,
  },
  {
    question: 'Will DeFi TVL exceed $500B by Q2 2025?',
    description: 'Will Total Value Locked in DeFi protocols exceed $500 billion by June 30, 2025?',
    category: 'DeFi',
    daysFromNow: 7,
    aiOracleEnabled: true,
  },
  {
    question: 'Will NFT market volume exceed $50B in 2025?',
    description: 'Will total NFT market trading volume reach $50 billion USD in calendar year 2025?',
    category: 'NFT',
    daysFromNow: 365,
    aiOracleEnabled: true,
  },
  {
    question: 'Will Cardano reach $2 by end of 2025?',
    description: 'Will Cardano (ADA) token price reach $2 USD or higher by December 31, 2025?',
    category: 'Cryptocurrency',
    daysFromNow: 7,
    aiOracleEnabled: true,
  },
  {
    question: 'Will Polygon transaction volume exceed 500M daily?',
    description: 'Will Polygon network process 500 million or more transactions in a single day by Q2 2025?',
    category: 'Blockchain',
    daysFromNow: 7,
    aiOracleEnabled: false,
  },
  {
    question: 'Will Dogecoin reach $1 by Q3 2025?',
    description: 'Will Dogecoin (DOGE) token price reach $1 USD or higher by September 30, 2025?',
    category: 'Cryptocurrency',
    daysFromNow: 7,
    aiOracleEnabled: true,
  },
  {
    question: 'Will a new AI breakthrough occur in 2025?',
    description: 'Will there be a significant AI breakthrough announcement from major tech companies in 2025?',
    category: 'Technology',
    daysFromNow: 365,
    aiOracleEnabled: true,
  },
  {
    question: 'Will Bitcoin reach $200,000 by end of 2025?',
    description: 'Will Bitcoin (BTC) price reach $200,000 USD or higher by December 31, 2025?',
    category: 'Cryptocurrency',
    daysFromNow: 7,
    aiOracleEnabled: true,
  },
  {
    question: 'Will Layer 2 solutions dominate Ethereum activity?',
    description: 'Will Layer 2 solutions account for more than 80% of Ethereum transaction volume by Q3 2025?',
    category: 'DeFi',
    daysFromNow: 7,
    aiOracleEnabled: true,
  },
];

async function main() {
  try {
    console.log('═════════════════════════════════════════════════════════════');
    console.log('📝 CREATE ADDITIONAL MARKETS ON BSC TESTNET');
    console.log('═════════════════════════════════════════════════════════════');
    console.log('');

    // Get private key from environment
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error('❌ ERROR: PRIVATE_KEY not found in .env file');
      console.error('Please set PRIVATE_KEY in your .env file');
      process.exit(1);
    }

    // Connect to BSC Testnet
    const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`✅ Connected with account: ${wallet.address}`);

    // Get balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInBNB = ethers.formatEther(balance);
    console.log(`💰 Balance: ${balanceInBNB} BNB`);
    console.log('');

    // Initialize contract
    const contract = new ethers.Contract(PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI, wallet);

    // Get current market count
    const currentCount = await contract.marketCount();
    console.log(`📊 Current market count: ${currentCount}`);
    console.log(`➕ Will add ${MARKETS_TO_CREATE.length} new markets`);
    console.log('');

    let successCount = 0;
    let failureCount = 0;

    // Create each market
    for (let i = 0; i < MARKETS_TO_CREATE.length; i++) {
      const market = MARKETS_TO_CREATE[i];
      const endTime = Math.floor(Date.now() / 1000) + (market.daysFromNow * 86400); // Add days
      
      try {
        console.log(`\n[${i + 1}/${MARKETS_TO_CREATE.length}] Creating market: "${market.question}"`);
        
        // Create market with 0 value (or very small amount for testing)
        const tx = await contract.createMarket(
          market.question,
          market.description,
          market.category,
          endTime,
          market.aiOracleEnabled,
          { value: ethers.parseEther('0') } // No initial bet
        );

        console.log(`   ⏳ Transaction sent: ${tx.hash}`);
        console.log(`   ⏳ Waiting for confirmation...`);

        const receipt = await tx.wait();
        
        if (receipt && receipt.status === 1) {
          console.log(`   ✅ Market created successfully!`);
          successCount++;
        } else {
          console.log(`   ❌ Transaction failed`);
          failureCount++;
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        failureCount++;
      }
    }

    console.log('');
    console.log('═════════════════════════════════════════════════════════════');
    console.log('📋 CREATION SUMMARY');
    console.log('═════════════════════════════════════════════════════════════');
    console.log(`✅ Successfully created: ${successCount} markets`);
    console.log(`❌ Failed: ${failureCount} markets`);
    console.log('');

    // Get new count
    const newCount = await contract.marketCount();
    console.log(`📊 New total market count: ${newCount}`);
    console.log(`📈 Added: ${Number(newCount) - Number(currentCount)} markets`);
    console.log('');
    console.log('Run this command to verify all markets:');
    console.log('  node scripts/test-bsc-live-markets.js');
    console.log('');

  } catch (error) {
    console.error('❌ FATAL ERROR:', error);
    process.exit(1);
  }
}

main();
