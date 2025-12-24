const { ethers } = require('hardhat');

async function main() {
  const pm = await ethers.getContractAt('PredictionMarket', '0x6C8A1610eedAa2BA449b9a409384cE4a0b22F81F');
  const x402 = await ethers.getContractAt('X402BettingBNB', '0x8B0d07E7D0a4DE30E6acDb8df0FAc3425a22569E');
  
  console.log('=== Market 14 Status ===');
  const m = await pm.markets(14);
  console.log('Question:', m.question);
  console.log('Yes Pool:', ethers.formatEther(m.totalYesAmount), 'BNB');
  console.log('No Pool:', ethers.formatEther(m.totalNoAmount), 'BNB');
  
  console.log('\n=== X402 Contract Status ===');
  const pmAddr = await x402.predictionMarket();
  const wbnbAddr = await x402.wbnb();
  const facilitator = await x402.facilitator();
  console.log('PredictionMarket:', pmAddr);
  console.log('WBNB:', wbnbAddr);
  console.log('Facilitator:', facilitator);
  
  // Check facilitator BNB balance
  const [signer] = await ethers.getSigners();
  const facBalance = await ethers.provider.getBalance(facilitator);
  console.log('Facilitator BNB:', ethers.formatEther(facBalance));
}

main().catch(console.error);
