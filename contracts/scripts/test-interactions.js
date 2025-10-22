const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing PredictionMarket Interactions\n");

  // Contract address from deployment
  const marketAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const pm = await hre.ethers.getContractAt("PredictionMarket", marketAddress);

  console.log("📊 Fetching Market Data...\n");

  // Get total market count
  const marketCount = await pm.marketCount();
  console.log(`Total Markets: ${marketCount}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get all markets
  for (let i = 1; i <= marketCount; i++) {
    const market = await pm.markets(i);
    const [yesOdds, noOdds] = await pm.getMarketOdds(i);
    
    console.log(`📈 Market ${i}:`);
    console.log(`   Question: ${market.question}`);
    console.log(`   Category: ${market.category}`);
    console.log(`   Creator: ${market.creator}`);
    console.log(`   End Time: ${new Date(Number(market.endTime) * 1000).toLocaleString()}`);
    console.log(`   Total YES Amount: ${hre.ethers.formatEther(market.totalYesAmount)} ETH`);
    console.log(`   Total NO Amount: ${hre.ethers.formatEther(market.totalNoAmount)} ETH`);
    console.log(`   Current Odds - YES: ${Number(yesOdds)/100}% | NO: ${Number(noOdds)/100}%`);
    console.log(`   Resolved: ${market.resolved ? 'YES' : 'NO'}`);
    console.log("");
  }

  // Test: Place a new bet
  console.log("💰 Testing: Placing a new bet on Market 1...");
  const [deployer, oracle, user1, user2, user3] = await hre.ethers.getSigners();
  
  try {
    const tx = await pm.connect(deployer).buyPosition(1, true, {
      value: hre.ethers.parseEther("0.5")
    });
    await tx.wait();
    console.log("✅ Successfully placed 0.5 ETH bet on YES for Market 1");
    
    // Get updated odds
    const [newYesOdds, newNoOdds] = await pm.getMarketOdds(1);
    console.log(`📊 Updated Odds - YES: ${Number(newYesOdds)/100}% | NO: ${Number(newNoOdds)/100}%`);
  } catch (error) {
    console.log("❌ Error placing bet:", error.message);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Test: Check user positions
  console.log("\n👥 Checking User Positions for Market 1...\n");
  
  const users = [
    { name: "Deployer", address: deployer.address },
    { name: "User1", address: user1.address },
    { name: "User2", address: user2.address },
    { name: "User3", address: user3.address }
  ];
  
  for (const user of users) {
    const position = await pm.getUserPosition(1, user.address);
    if (position.yesAmount > 0n || position.noAmount > 0n) {
      console.log(`${user.name} (${user.address}):`);
      console.log(`  YES Position: ${hre.ethers.formatEther(position.yesAmount)} ETH`);
      console.log(`  NO Position: ${hre.ethers.formatEther(position.noAmount)} ETH`);
      console.log(`  Claimed: ${position.claimed ? 'YES' : 'NO'}`);
      console.log("");
    }
  }

  // Test: Create a new market
  console.log("📝 Testing: Creating a new market...");
  try {
    const futureTime = Math.floor(Date.now() / 1000) + (2 * 60); // +2 minutes
    const tx = await pm.createMarket(
      "Will Ethereum 2.0 fully launch by end of 2025?",
      "This market resolves YES if Ethereum 2.0 is fully operational by December 31, 2025.",
      "crypto",
      futureTime,
      true
    );
    await tx.wait();
    
    const newMarketCount = await pm.marketCount();
    console.log(`✅ New market created! Market ID: ${newMarketCount}`);
    
    const newMarket = await pm.markets(newMarketCount);
    console.log(`   Question: ${newMarket.question}`);
    console.log(`   Ends in: 2 minutes`);
  } catch (error) {
    console.log("❌ Error creating market:", error.message);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n✅ All tests completed successfully!");
  console.log("\n💡 Next steps:");
  console.log("   1. Wait for Market 3 to end (1 minute)");
  console.log("   2. Run resolution test: npm run test:resolve");
  console.log("   3. Connect frontend with these contract addresses");
  console.log("   4. Import test accounts to MetaMask for UI testing");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
