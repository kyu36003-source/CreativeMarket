/**
 * WBNB3009 Gasless Test - User pays bet, facilitator pays gas
 */
const { ethers } = require("hardhat");

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log(" WBNB3009 GASLESS TEST - User pays bet, Facilitator pays gas");
  console.log("=".repeat(70) + "\n");

  const [facilitator] = await ethers.getSigners();
  console.log("Facilitator:", facilitator.address);

  // Contract addresses
  const WBNB3009_ADDRESS = "0x70e4730A3b4aC6E6E395e8ED9c46B9c0f753A4fA";
  const X402_BETTING_ADDRESS = "0xCA983EF481b53Ee14E67278501DdC1De466999F9";

  const wbnb = await ethers.getContractAt("WBNB3009", WBNB3009_ADDRESS);
  const x402 = await ethers.getContractAt("X402BettingBNB", X402_BETTING_ADDRESS);

  // Check facilitator setup
  const contractFacilitator = await x402.facilitator();
  console.log("Contract facilitator:", contractFacilitator);
  console.log("Our facilitator:", facilitator.address);
  console.log("Match:", contractFacilitator.toLowerCase() === facilitator.address.toLowerCase());

  // Check facilitator BNB balance (for gas)
  const facilitatorBalance = await ethers.provider.getBalance(facilitator.address);
  console.log("\nFacilitator BNB (for gas):", ethers.formatEther(facilitatorBalance), "BNB");

  // Check facilitator WBNB3009 balance
  const wbnbBalance = await wbnb.balanceOf(facilitator.address);
  console.log("Facilitator WBNB3009:", ethers.formatEther(wbnbBalance), "WBNB");

  // If no WBNB, wrap some
  if (wbnbBalance < ethers.parseEther("0.01")) {
    console.log("\n Wrapping 0.02 BNB to WBNB3009...");
    const tx = await wbnb.deposit({ value: ethers.parseEther("0.02") });
    await tx.wait();
    console.log("Wrapped!");
    const newBalance = await wbnb.balanceOf(facilitator.address);
    console.log("New WBNB3009 balance:", ethers.formatEther(newBalance));
  }

  console.log("\n Flow Summary:");
  console.log("1. User wraps BNB -> WBNB3009 (one time, user pays gas)");
  console.log("2. User signs EIP-3009 authorization (free, off-chain)");
  console.log("3. Facilitator calls gaslessBetWithBNB (facilitator pays gas)");
  console.log("4. User's WBNB3009 is used for the bet");
  console.log("5. User pays: BET AMOUNT. Facilitator pays: GAS ONLY.");

  console.log("\n" + "=".repeat(70) + "\n");
}

main().catch(console.error);
