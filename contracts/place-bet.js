/**
 * Quick Bet Script - Place a bet from command line
 * Usage: node place-bet.js <marketId> <yes|no> <amount>
 * Example: node place-bet.js 1 yes 0.1
 */

require('dotenv').config({ path: '../.env.local' });
const { ethers } = require('ethers');
const PredictionMarketABI = require('./artifacts/contracts/PredictionMarket.sol/PredictionMarket.json').abi;

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('\n❌ Usage: node place-bet.js <marketId> <yes|no> <amount>');
    console.log('Example: node place-bet.js 1 yes 0.1\n');
    process.exit(1);
  }

  const marketId = parseInt(args[0]);
  const position = args[1].toLowerCase() === 'yes';
  const amount = args[2];

  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                      PLACE BET ON-CHAIN                          ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  // Connect to localhost RPC
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const marketAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  // Use test account #1
  const privateKey = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
  const wallet = new ethers.Wallet(privateKey, provider);
  
  const market = new ethers.Contract(marketAddress, PredictionMarketABI, wallet);

  console.log(`👤 Your Address: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Your Balance: ${ethers.formatEther(balance)} ETH\n`);

  // Get market info
  const m = await market.markets(marketId);
  console.log(`📊 Market #${marketId}: ${m.question}`);
  console.log(`📂 Category: ${m.category}`);
  
  const totalPool = Number(ethers.formatEther(m.totalYesAmount + m.totalNoAmount));
  const yesPercent = totalPool > 0 
    ? (Number(ethers.formatEther(m.totalYesAmount)) / totalPool * 100).toFixed(1)
    : '50.0';
  
  console.log(`💰 Current Pool: ${totalPool.toFixed(4)} ETH`);
  console.log(`   ├─ YES: ${ethers.formatEther(m.totalYesAmount)} ETH (${yesPercent}%)`);
  console.log(`   └─ NO:  ${ethers.formatEther(m.totalNoAmount)} ETH (${(100 - parseFloat(yesPercent)).toFixed(1)}%)\n`);

  console.log(`🎲 Your Bet: ${amount} ETH on ${position ? 'YES' : 'NO'}`);
  console.log(`\n⏳ Placing bet...`);

  try {
    const tx = await market.buyPosition(marketId, position, {
      value: ethers.parseEther(amount)
    });
    
    console.log(`📝 Transaction sent: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);
    
    const receipt = await tx.wait();
    
    console.log(`✅ Bet placed successfully!`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}\n`);

    // Get updated market info
    const updatedMarket = await market.markets(marketId);
    const newTotalPool = Number(ethers.formatEther(updatedMarket.totalYesAmount + updatedMarket.totalNoAmount));
    const newYesPercent = newTotalPool > 0 
      ? (Number(ethers.formatEther(updatedMarket.totalYesAmount)) / newTotalPool * 100).toFixed(1)
      : '50.0';
    
    console.log(`📊 Updated Odds:`);
    console.log(`   ├─ YES: ${newYesPercent}%`);
    console.log(`   └─ NO:  ${(100 - parseFloat(newYesPercent)).toFixed(1)}%`);
    console.log(`💰 New Pool: ${newTotalPool.toFixed(4)} ETH\n`);

    console.log(`🎉 Your bet is now on-chain!`);
    console.log(`View in frontend: http://localhost:3000/markets/${marketId}\n`);

  } catch (error) {
    console.log(`\n❌ Error placing bet:`);
    console.log(error.message);
    if (error.message.includes('MIN_BET')) {
      console.log('\n💡 Tip: Minimum bet is 0.01 ETH');
    }
    if (error.message.includes('ended')) {
      console.log('\n💡 Tip: This market has already ended');
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
