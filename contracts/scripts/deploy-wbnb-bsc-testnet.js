/**
 * Deploy PredictionMarket + X402BettingBNB to BSC Testnet
 * Reuses existing WBNB3009 contract
 * 
 * Run: npx hardhat run scripts/deploy-wbnb-bsc-testnet.js --network bscTestnet
 */

const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// Existing WBNB3009 contract on BSC Testnet - already deployed
const EXISTING_WBNB3009 = "0x70e4730A3b4aC6E6E395e8ED9c46B9c0f753A4fA";

// Facilitator address for gasless transactions
const FACILITATOR_ADDRESS = "0x3A67492c38d5D72749fD124cB4Daee2e883AF732";

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 DEPLOYING TO BSC TESTNET (Chain ID: 97)");
  console.log("=".repeat(70) + "\n");

  const [deployer] = await hre.ethers.getSigners();

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("📍 Deployment Info:");
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Balance:  ${hre.ethers.formatEther(balance)} tBNB`);
  console.log(`   Network:  BSC Testnet`);
  console.log(`   Chain ID: ${(await hre.ethers.provider.getNetwork()).chainId}`);
  console.log();

  if (Number(hre.ethers.formatEther(balance)) < 0.05) {
    console.log("⚠️  WARNING: Low balance! Get more tBNB from:");
    console.log("   https://testnet.bnbchain.org/faucet-smart\n");
  }

  // ============================================================================
  // 1. Deploy PredictionMarket (with new MIN_BET = 0.001 BNB)
  // ============================================================================
  console.log("📦 [1/2] Deploying PredictionMarket (MIN_BET = 0.001 BNB)...");
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const market = await PredictionMarket.deploy();
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log(`   ✅ PredictionMarket: ${marketAddress}`);

  // Verify MIN_BET
  const minBet = await market.MIN_BET();
  console.log(`   ✅ MIN_BET verified: ${hre.ethers.formatEther(minBet)} BNB\n`);

  // ============================================================================
  // 2. Deploy X402BettingBNB (pointing to new market + existing WBNB3009)
  // ============================================================================
  console.log("📦 [2/2] Deploying X402BettingBNB...");
  console.log(`   Using existing WBNB3009: ${EXISTING_WBNB3009}`);
  
  const X402BettingBNB = await hre.ethers.getContractFactory("X402BettingBNB");
  const x402 = await X402BettingBNB.deploy(marketAddress, EXISTING_WBNB3009);
  await x402.waitForDeployment();
  const x402Address = await x402.getAddress();
  console.log(`   ✅ X402BettingBNB: ${x402Address}\n`);

  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  console.log("⚙️  Configuring contracts...\n");

  // Authorize deployer as oracle (for testing/admin purposes)
  console.log("   Authorizing deployer as oracle...");
  let tx = await market.setAuthorizedOracle(deployer.address, true);
  await tx.wait();
  console.log(`   ✅ Deployer authorized as oracle`);

  // Authorize X402BettingBNB to place bets on behalf of users
  console.log("   Authorizing X402BettingBNB in PredictionMarket...");
  tx = await market.setAuthorizedOracle(x402Address, true);
  await tx.wait();
  console.log(`   ✅ X402BettingBNB authorized`);

  // Set facilitator for X402BettingBNB
  console.log(`   Setting facilitator: ${FACILITATOR_ADDRESS}...`);
  tx = await x402.setFacilitator(FACILITATOR_ADDRESS);
  await tx.wait();
  console.log(`   ✅ Facilitator set\n`);

  // ============================================================================
  // DEPLOYMENT SUMMARY
  // ============================================================================
  console.log("=".repeat(70));
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("=".repeat(70) + "\n");

  console.log("📋 CONTRACT ADDRESSES (save these!):");
  console.log("─".repeat(50));
  console.log(`   PredictionMarket:  ${marketAddress}`);
  console.log(`   X402BettingBNB:    ${x402Address}`);
  console.log(`   WBNB3009:          ${EXISTING_WBNB3009} (reused)`);
  console.log(`   Facilitator:       ${FACILITATOR_ADDRESS}\n`);

  console.log("🔗 View on BSCScan:");
  console.log(`   https://testnet.bscscan.com/address/${marketAddress}`);
  console.log(`   https://testnet.bscscan.com/address/${x402Address}\n`);

  console.log("📝 UPDATE VERCEL ENVIRONMENT VARIABLES:");
  console.log("─".repeat(50));
  console.log(`NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=${marketAddress}`);
  console.log(`NEXT_PUBLIC_X402_BETTING_ADDRESS=${x402Address}`);
  console.log(`NEXT_PUBLIC_WBNB_ADDRESS=${EXISTING_WBNB3009}`);
  console.log();

  console.log("📝 UPDATE FRONTEND CODE:");
  console.log("─".repeat(50));
  console.log("MIN_BET = 0.001");
  console.log("MIN_BET_GASLESS = 0.00101 (includes 0.5% fee buffer)");
  console.log();

  // Get deployment cost
  const finalBalance = await hre.ethers.provider.getBalance(deployer.address);
  const cost = balance - finalBalance;
  console.log("💰 Deployment Cost:");
  console.log(`   ${hre.ethers.formatEther(cost)} tBNB\n`);

  console.log("=".repeat(70) + "\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
