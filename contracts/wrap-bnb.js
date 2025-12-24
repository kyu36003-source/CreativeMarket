/**
 * Wrap BNB to WBNB3009 for the facilitator
 */
const { ethers } = require('hardhat');

async function main() {
  const [signer] = await ethers.getSigners();
  console.log('Signer:', signer.address);
  
  const wbnb = await ethers.getContractAt('WBNB3009', '0x70e4730A3b4aC6E6E395e8ED9c46B9c0f753A4fA');
  
  // Check current balance
  const beforeBal = await wbnb.balanceOf(signer.address);
  console.log('WBNB3009 balance before:', ethers.formatEther(beforeBal));
  
  // Wrap 0.1 BNB
  const wrapAmount = ethers.parseEther('0.1');
  console.log('\nWrapping 0.1 BNB...');
  
  const tx = await wbnb.deposit({ value: wrapAmount });
  console.log('Tx:', tx.hash);
  await tx.wait();
  
  // Check new balance
  const afterBal = await wbnb.balanceOf(signer.address);
  console.log('WBNB3009 balance after:', ethers.formatEther(afterBal));
  console.log('\n✅ Wrapped successfully!');
}

main().catch(console.error);
