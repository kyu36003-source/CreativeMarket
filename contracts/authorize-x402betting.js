const { ethers } = require("hardhat");
async function main() {
  const market = await ethers.getContractAt("PredictionMarket", "0x7F0335eC0157a113840D2dcB257BE971774F2226");
  const x402BettingAddress = "0xCA983EF481b53Ee14E67278501DdC1De466999F9";
  
  console.log("Checking X402BettingBNB authorization...");
  console.log("X402BettingBNB address:", x402BettingAddress);
  
  const isAuthorized = await market.authorizedOracles(x402BettingAddress);
  console.log("X402BettingBNB authorized:", isAuthorized);
  
  if (!isAuthorized) {
    console.log("\n⚠️ X402BettingBNB is NOT authorized! Authorizing now...");
    const tx = await market.setAuthorizedOracle(x402BettingAddress, true);
    await tx.wait();
    console.log("✅ X402BettingBNB authorized successfully!");
    
    // Verify
    const isAuthorizedNow = await market.authorizedOracles(x402BettingAddress);
    console.log("Verified authorization:", isAuthorizedNow);
  }
}
main().then(() => process.exit(0)).catch(console.error);
