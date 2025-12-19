/**
 * Deploy WBNB3009 + X402BettingBNB
 * Pure BNB gasless solution
 */

const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 DEPLOYING PURE BNB GASLESS SOLUTION");
  console.log("=".repeat(70) + "\n");

  const [deployer, facilitator, oracle, user1, user2] = await hre.ethers.getSigners();

  console.log("📍 Accounts:");
  console.log(`   Deployer:    ${deployer.address}`);
  console.log(`   Facilitator: ${facilitator.address}`);
  console.log(`   Oracle:      ${oracle.address}`);
  console.log(`   User1:       ${user1.address}`);
  console.log(`   User2:       ${user2.address}\n`);

  // ============================================================================
  // 1. Deploy PredictionMarket
  // ============================================================================
  console.log("📦 [1/3] Deploying PredictionMarket...");
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const market = await PredictionMarket.deploy();
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log(`   ✅ PredictionMarket: ${marketAddress}\n`);

  // ============================================================================
  // 2. Deploy WBNB3009 (Wrapped BNB with EIP-3009)
  // ============================================================================
  console.log("📦 [2/3] Deploying WBNB3009 (Wrapped BNB with gasless support)...");
  const WBNB3009 = await hre.ethers.getContractFactory("WBNB3009");
  const wbnb = await WBNB3009.deploy();
  await wbnb.waitForDeployment();
  const wbnbAddress = await wbnb.getAddress();
  console.log(`   ✅ WBNB3009: ${wbnbAddress}\n`);

  // ============================================================================
  // 3. Deploy X402BettingBNB (Gasless betting with WBNB3009)
  // ============================================================================
  console.log("📦 [3/3] Deploying X402BettingBNB...");
  const X402BettingBNB = await hre.ethers.getContractFactory("X402BettingBNB");
  const x402 = await X402BettingBNB.deploy(marketAddress, wbnbAddress);
  await x402.waitForDeployment();
  const x402Address = await x402.getAddress();
  console.log(`   ✅ X402BettingBNB: ${x402Address}\n`);

  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  console.log("⚙️  Configuring contracts...\n");

  // Authorize oracle
  console.log("   Authorizing oracle...");
  let tx = await market.setAuthorizedOracle(oracle.address, true);
  await tx.wait();
  console.log(`   ✅ Oracle authorized: ${oracle.address}`);

  // Authorize x402 contract to place bets for users
  console.log("   Authorizing X402BettingBNB...");
  tx = await market.setAuthorizedOracle(x402Address, true);
  await tx.wait();
  console.log(`   ✅ X402BettingBNB authorized`);

  // Set facilitator
  console.log("   Setting facilitator...");
  tx = await x402.setFacilitator(facilitator.address);
  await tx.wait();
  console.log(`   ✅ Facilitator set: ${facilitator.address}\n`);

  // ============================================================================
  // SAVE DEPLOYMENT
  // ============================================================================
  const deployment = {
    network: "localhost",
    timestamp: new Date().toISOString(),
    contracts: {
      PredictionMarket: marketAddress,
      WBNB3009: wbnbAddress,
      X402BettingBNB: x402Address
    },
    accounts: {
      deployer: deployer.address,
      facilitator: facilitator.address,
      oracle: oracle.address,
      user1: user1.address,
      user2: user2.address
    }
  };

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(deploymentsDir, 'wbnb-local.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));

  console.log("=".repeat(70));
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("=".repeat(70) + "\n");

  console.log("📋 CONTRACT ADDRESSES:");
  console.log(`   PredictionMarket: ${marketAddress}`);
  console.log(`   WBNB3009:         ${wbnbAddress}`);
  console.log(`   X402BettingBNB:   ${x402Address}\n`);

  console.log("📁 SAVED: deployments/wbnb-local.json\n");

  console.log("🎯 NEXT: Run end-to-end test:");
  console.log("   node test-wbnb-gasless.js\n");

  console.log("=".repeat(70) + "\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
