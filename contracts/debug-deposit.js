/**
 * Debug WBNB3009 deposit event
 */
const { ethers } = require('hardhat');

async function main() {
  const [user] = await ethers.getSigners();
  console.log('User address:', user.address);
  console.log('BNB balance:', ethers.formatEther(await user.provider.getBalance(user.address)));
  
  const wbnb3009Address = '0x70e4730A3b4aC6E6E395e8ED9c46B9c0f753A4fA';
  
  const abi = [
    'function balanceOf(address) view returns (uint256)',
    'function deposit() payable',
    'function totalSupply() view returns (uint256)',
    'event Deposit(address indexed account, uint256 amount)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
  ];
  
  const wbnb = new ethers.Contract(wbnb3009Address, abi, user);
  
  const balanceBefore = await wbnb.balanceOf(user.address);
  const supplyBefore = await wbnb.totalSupply();
  console.log('\n📊 Before:');
  console.log('  User WBNB3009:', ethers.formatEther(balanceBefore));
  console.log('  Total Supply:', ethers.formatEther(supplyBefore));
  
  console.log('\n🔄 Calling deposit() with 0.002 BNB...');
  const tx = await wbnb.deposit({ value: ethers.parseEther('0.002') });
  console.log('  TX:', tx.hash);
  
  const receipt = await tx.wait();
  console.log('  Gas used:', receipt.gasUsed.toString());
  console.log('  Status:', receipt.status);
  
  // Check events
  console.log('\n📋 Events:');
  for (const log of receipt.logs) {
    try {
      const parsed = wbnb.interface.parseLog(log);
      console.log('  -', parsed.name, parsed.args);
    } catch {
      console.log('  - Raw log:', log.topics[0]);
    }
  }
  
  const balanceAfter = await wbnb.balanceOf(user.address);
  const supplyAfter = await wbnb.totalSupply();
  console.log('\n📊 After:');
  console.log('  User WBNB3009:', ethers.formatEther(balanceAfter));
  console.log('  Total Supply:', ethers.formatEther(supplyAfter));
  console.log('  Balance diff:', ethers.formatEther(balanceAfter - balanceBefore));
  console.log('  Supply diff:', ethers.formatEther(supplyAfter - supplyBefore));
}

main()
  .then(() => process.exit(0))
  .catch(console.error);
