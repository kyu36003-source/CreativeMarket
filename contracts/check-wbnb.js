const { ethers } = require("hardhat");
async function main() {
  const WBNB3009_ADDRESS = "0x70e4730A3b4aC6E6E395e8ED9c46B9c0f753A4fA";
  const wbnb = await ethers.getContractAt("WBNB3009", WBNB3009_ADDRESS);
  
  const totalSupply = await wbnb.totalSupply();
  console.log("WBNB3009 Total Supply:", ethers.formatEther(totalSupply));
  
  const name = await wbnb.name();
  console.log("Name:", name);
  
  const symbol = await wbnb.symbol();
  console.log("Symbol:", symbol);
}
main().catch(console.error);
