const { ethers } = require("hardhat");
async function main() {
  const [facilitator] = await ethers.getSigners();
  const WBNB3009_ADDRESS = "0x70e4730A3b4aC6E6E395e8ED9c46B9c0f753A4fA";
  const wbnb = await ethers.getContractAt("WBNB3009", WBNB3009_ADDRESS);
  
  console.log("Before wrap:");
  const balBefore = await wbnb.balanceOf(facilitator.address);
  console.log("WBNB balance:", ethers.formatEther(balBefore));
  
  console.log("\nWrapping 0.02 BNB...");
  const tx = await wbnb.deposit({ value: ethers.parseEther("0.02") });
  const receipt = await tx.wait();
  console.log("TX:", receipt.hash);
  
  console.log("\nAfter wrap:");
  const balAfter = await wbnb.balanceOf(facilitator.address);
  console.log("WBNB balance:", ethers.formatEther(balAfter));
}
main().catch(console.error);
