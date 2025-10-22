const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying PredictBNB contracts to Local Hardhat Network...\n");

  const [deployer, oracle, user1, user2, user3] = await hre.ethers.getSigners();
  
  console.log("📋 Account Information:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("Oracle:", oracle.address);
  console.log("Test Users:", [user1.address, user2.address, user3.address]);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Deploy PredictionMarket
  console.log("📝 Deploying PredictionMarket contract...");
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy();
  await predictionMarket.waitForDeployment();
  const predictionMarketAddress = await predictionMarket.getAddress();
  console.log("✅ PredictionMarket deployed to:", predictionMarketAddress);

  // Deploy AIOracle
  console.log("\n📝 Deploying AIOracle contract...");
  const AIOracle = await hre.ethers.getContractFactory("AIOracle");
  const aiOracle = await AIOracle.deploy(predictionMarketAddress);
  await aiOracle.waitForDeployment();
  const aiOracleAddress = await aiOracle.getAddress();
  console.log("✅ AIOracle deployed to:", aiOracleAddress);

  // Deploy GaslessRelayer
  console.log("\n📝 Deploying GaslessRelayer contract...");
  const GaslessRelayer = await hre.ethers.getContractFactory("GaslessRelayer");
  const gaslessRelayer = await GaslessRelayer.deploy();
  await gaslessRelayer.waitForDeployment();
  const gaslessRelayerAddress = await gaslessRelayer.getAddress();
  console.log("✅ GaslessRelayer deployed to:", gaslessRelayerAddress);

  // Configure contracts
  console.log("\n⚙️  Configuring contracts...");
  
  // Authorize AIOracle in PredictionMarket
  await predictionMarket.setAuthorizedOracle(aiOracleAddress, true);
  console.log("✅ AIOracle authorized in PredictionMarket");

  // Authorize oracle address
  await predictionMarket.setAuthorizedOracle(oracle.address, true);
  console.log("✅ Oracle address authorized in PredictionMarket");

  // Whitelist PredictionMarket in GaslessRelayer
  await gaslessRelayer.setWhitelistedContract(predictionMarketAddress, true);
  console.log("✅ PredictionMarket whitelisted in GaslessRelayer");

  // Create sample markets for testing
  console.log("\n📊 Creating sample markets for testing...");
  
  const now = Math.floor(Date.now() / 1000);
  const oneDay = 24 * 60 * 60;
  const oneWeek = 7 * oneDay;
  
  // Market 1: Short-term crypto market
  const tx1 = await predictionMarket.createMarket(
    "Will Bitcoin reach $100,000 by end of 2025?",
    "This market resolves to YES if Bitcoin (BTC) reaches or exceeds $100,000 USD on any major exchange by December 31, 2025.",
    "crypto",
    now + oneWeek,
    true
  );
  await tx1.wait();
  console.log("✅ Market 1 created: Bitcoin price prediction");

  // Market 2: Tech market
  const tx2 = await predictionMarket.createMarket(
    "Will AI achieve AGI before 2030?",
    "This market resolves to YES if a credible institution confirms AGI capabilities before January 1, 2030.",
    "technology",
    now + (30 * oneDay),
    true
  );
  await tx2.wait();
  console.log("✅ Market 2 created: AGI prediction");

  // Market 3: Quick test market (ends in 1 minute for testing resolution)
  const tx3 = await predictionMarket.createMarket(
    "Test Market - Will this resolve YES?",
    "A quick test market that ends in 1 minute for testing resolution functionality.",
    "other",
    now + 60, // 1 minute
    true
  );
  await tx3.wait();
  console.log("✅ Market 3 created: Quick test market (ends in 1 minute)");

  // Add some test bets
  console.log("\n💰 Placing test bets...");
  
  // User 1 bets YES on market 1
  await predictionMarket.connect(user1).buyPosition(1, true, {
    value: hre.ethers.parseEther("1.0")
  });
  console.log("✅ User1 bet 1.0 ETH on YES for Market 1");

  // User 2 bets NO on market 1
  await predictionMarket.connect(user2).buyPosition(1, false, {
    value: hre.ethers.parseEther("0.5")
  });
  console.log("✅ User2 bet 0.5 ETH on NO for Market 1");

  // User 3 bets YES on market 1
  await predictionMarket.connect(user3).buyPosition(1, true, {
    value: hre.ethers.parseEther("0.75")
  });
  console.log("✅ User3 bet 0.75 ETH on YES for Market 1");

  // Get market odds
  const [yesOdds, noOdds] = await predictionMarket.getMarketOdds(1);
  console.log(`\n📊 Market 1 Current Odds:`);
  console.log(`   YES: ${(Number(yesOdds) / 100).toFixed(2)}%`);
  console.log(`   NO: ${(Number(noOdds) / 100).toFixed(2)}%`);

  console.log("\n🎉 Local deployment complete!");
  console.log("\n📋 Contract Addresses:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("PredictionMarket:", predictionMarketAddress);
  console.log("AIOracle:", aiOracleAddress);
  console.log("GaslessRelayer:", gaslessRelayerAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  console.log("\n🔧 Test Accounts:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Deployer/Owner:", deployer.address);
  console.log("Oracle:", oracle.address);
  console.log("User1:", user1.address);
  console.log("User2:", user2.address);
  console.log("User3:", user3.address);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log("\n📝 Save this configuration:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=${predictionMarketAddress}`);
  console.log(`NEXT_PUBLIC_AI_ORACLE_ADDRESS=${aiOracleAddress}`);
  console.log(`NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS=${gaslessRelayerAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log("\n💡 Usage Examples:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. Connect to local network in your frontend:");
  console.log("   - Network: Localhost");
  console.log("   - RPC URL: http://127.0.0.1:8545");
  console.log("   - Chain ID: 31337");
  console.log("\n2. Import test account to MetaMask:");
  console.log("   - Use the private key from one of the test accounts");
  console.log("\n3. Test market resolution (for Market 3):");
  console.log("   - Wait 1 minute");
  console.log("   - Run: npx hardhat console --network localhost");
  console.log(`   - Execute: await (await ethers.getContractAt("PredictionMarket", "${predictionMarketAddress}")).resolveMarket(3, true)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
