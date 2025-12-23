const { ethers } = require("hardhat");
async function main() {
  const market = await ethers.getContractAt("PredictionMarket", "0x7F0335eC0157a113840D2dcB257BE971774F2226");
  const facilitator = "0x3A67492c38d5D72749fD124cB4Daee2e883AF732";
  const isAuthorized = await market.authorizedOracles(facilitator);
  console.log("Facilitator authorized:", isAuthorized);
  
  // Check owner
  const owner = await market.owner();
  console.log("Contract owner:", owner);
}
main().catch(console.error);
