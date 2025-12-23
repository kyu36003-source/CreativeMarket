/**
 * Create a test market for gasless flow testing
 */
const { ethers } = require('hardhat');

const PREDICTION_MARKET_ADDRESS = '0x7F0335eC0157a113840D2dcB257BE971774F2226';

const PREDICTION_MARKET_ABI = [
  'function createMarket(string memory _question, string memory _description, string memory _category, uint256 _endTime, bool _aiOracleEnabled) external returns (uint256)',
  'function marketCount() view returns (uint256)',
  'function getMarket(uint256 marketId) view returns (tuple(uint256 id, string question, string description, string category, address creator, uint256 endTime, uint256 totalYesAmount, uint256 totalNoAmount, bool resolved, bool outcome, bool aiOracleEnabled))',
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Creating market with:', deployer.address);
  
  const predictionMarket = new ethers.Contract(
    PREDICTION_MARKET_ADDRESS,
    PREDICTION_MARKET_ABI,
    deployer
  );
  
  // Check current market count
  const countBefore = await predictionMarket.marketCount();
  console.log('Current market count:', countBefore.toString());
  
  // Create a test market
  const question = 'Will this gasless betting test succeed?';
  const description = 'Test market for gasless flow verification - ' + Date.now();
  const category = 'Test';
  const endTime = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days from now
  const aiOracleEnabled = false;
  
  console.log('\nCreating market:');
  console.log('  Question:', question);
  console.log('  End Time:', new Date(endTime * 1000).toISOString());
  
  const tx = await predictionMarket.createMarket(
    question,
    description,
    category,
    endTime,
    aiOracleEnabled
  );
  
  console.log('  TX:', tx.hash);
  const receipt = await tx.wait();
  console.log('  Confirmed! Gas used:', receipt.gasUsed.toString());
  
  // Get new market count
  const countAfter = await predictionMarket.marketCount();
  const newMarketId = Number(countAfter) - 1;
  console.log('\n✅ Market created! ID:', newMarketId);
  
  // Get market details
  const market = await predictionMarket.getMarket(newMarketId);
  console.log('  Question:', market.question);
  console.log('  End Time:', new Date(Number(market.endTime) * 1000).toISOString());
  console.log('  YES Amount:', ethers.formatEther(market.totalYesAmount), 'BNB');
  console.log('  NO Amount:', ethers.formatEther(market.totalNoAmount), 'BNB');
}

main()
  .then(() => process.exit(0))
  .catch(console.error);
