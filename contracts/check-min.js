const { ethers } = require("hardhat");
async function main() {
  const market = await ethers.getContractAt("PredictionMarket", "0x7F0335eC0157a113840D2dcB257BE971774F2226");
  const minBet = await market.MIN_BET();
  console.log("MIN_BET:", ethers.formatEther(minBet), "BNB");
}
main().catch(console.error);
