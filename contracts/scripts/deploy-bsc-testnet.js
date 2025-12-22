/**
 * BSC Testnet Deployment Script
 * 
 * Prerequisites:
 * 1. Add BSC Testnet to MetaMask (Chain ID: 97)
 * 2. Get free tBNB from: https://testnet.bnbchain.org/faucet-smart
 * 3. Export your private key from MetaMask
 * 4. Add to .env: PRIVATE_KEY=your_private_key_here
 * 
 * Deploy:
 * npx hardhat run scripts/deploy-bsc-testnet.js --network bscTestnet
 */

const { ethers } = require('hardhat');

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║          Deploying to BSC Testnet (Chain ID: 97)            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  console.log('📋 Deployment Information:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} tBNB`);
  console.log(`Network: BSC Testnet`);
  console.log(`Chain ID: ${(await ethers.provider.getNetwork()).chainId}`);
  console.log(`Block Explorer: https://testnet.bscscan.com\n`);

  if (Number(ethers.formatEther(balance)) < 0.05) {
    console.log('⚠️  WARNING: Low balance! Get more tBNB from faucet:');
    console.log('   https://testnet.bnbchain.org/faucet-smart\n');
  }

  // Deploy PredictionMarket (creates reputation contract internally)
  console.log('📝 Deploying PredictionMarket...');
  const PredictionMarket = await ethers.getContractFactory('PredictionMarket');
  const predictionMarket = await PredictionMarket.deploy();
  await predictionMarket.waitForDeployment();
  const marketAddress = await predictionMarket.getAddress();
  console.log(`✅ PredictionMarket: ${marketAddress}\n`);

  // Get reputation contract address from PredictionMarket
  const reputationAddress = await predictionMarket.reputationContract();
  console.log(`✅ TraderReputation: ${reputationAddress}\n`);

  // Deploy AIOracle
  console.log('📝 Deploying AIOracle...');
  const AIOracle = await ethers.getContractFactory('AIOracle');
  const aiOracle = await AIOracle.deploy(marketAddress);
  await aiOracle.waitForDeployment();
  const oracleAddress = await aiOracle.getAddress();
  console.log(`✅ AIOracle: ${oracleAddress}\n`);

  // Deploy GaslessRelayer
  console.log('📝 Deploying GaslessRelayer...');
  const GaslessRelayer = await ethers.getContractFactory('GaslessRelayer');
  const gaslessRelayer = await GaslessRelayer.deploy();
  await gaslessRelayer.waitForDeployment();
  const relayerAddress = await gaslessRelayer.getAddress();
  console.log(`✅ GaslessRelayer: ${relayerAddress}\n`);

  // Configuration
  console.log('⚙️  Configuring contracts...');
  
  // Set reputation contract in PredictionMarket
  let tx = await predictionMarket.setReputationContract(reputationAddress);
  await tx.wait();
  console.log('✅ Reputation contract set');

  // Set deployer as authorized oracle
  tx = await predictionMarket.setAuthorizedOracle(deployer.address, true);
  await tx.wait();
  console.log('✅ Oracle address authorized');

  // Whitelist gasless relayer as authorized oracle
  tx = await predictionMarket.setAuthorizedOracle(relayerAddress, true);
  await tx.wait();
  console.log('✅ Gasless relayer whitelisted\n');

  // Summary
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    DEPLOYMENT COMPLETE!                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log('📜 Contract Addresses:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`PredictionMarket:  ${marketAddress}`);
  console.log(`AIOracle:          ${oracleAddress}`);
  console.log(`GaslessRelayer:    ${relayerAddress}`);
  console.log(`TraderReputation:  ${reputationAddress}\n`);

  console.log('🔍 View on BscScan:');
  console.log(`https://testnet.bscscan.com/address/${marketAddress}\n`);

  console.log('📝 Update .env.local with:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`NEXT_PUBLIC_CHAIN_ID=97`);
  console.log(`NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=${marketAddress}`);
  console.log(`NEXT_PUBLIC_AI_ORACLE_ADDRESS=${oracleAddress}`);
  console.log(`NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS=${relayerAddress}\n`);

  console.log('✅ Verify contracts on BscScan:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`npx hardhat verify --network bscTestnet ${marketAddress} ${reputationAddress}`);
  console.log(`npx hardhat verify --network bscTestnet ${oracleAddress} ${marketAddress}`);
  console.log(`npx hardhat verify --network bscTestnet ${relayerAddress} ${marketAddress}\n`);

  // Get final balance
  const finalBalance = await ethers.provider.getBalance(deployer.address);
  const cost = balance - finalBalance;
  
  console.log('💰 Deployment Cost:');
  console.log(`Cost: ${ethers.formatEther(cost)} tBNB (~$${(Number(ethers.formatEther(cost)) * 600).toFixed(2)} if mainnet)`);
  console.log(`Remaining: ${ethers.formatEther(finalBalance)} tBNB\n`);

  console.log('🚀 Next Steps:');
  console.log('1. Update .env.local with contract addresses (see above)');
  console.log('2. Verify contracts on BscScan (commands above)');
  console.log('3. Start frontend: npm run dev');
  console.log('4. Connect MetaMask to BSC Testnet');
  console.log('5. Test your dApp on real blockchain!\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
