/**
 * Check WBNB3009 via fresh RPC connection
 */
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  // Use a fresh provider
  const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
  
  const wbnb3009Address = '0x70e4730A3b4aC6E6E395e8ED9c46B9c0f753A4fA';
  const userAddress = '0x3A67492c38d5D72749fD124cB4Daee2e883AF732';
  
  const abi = [
    'function balanceOf(address) view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function name() view returns (string)',
  ];
  
  const wbnb = new ethers.Contract(wbnb3009Address, abi, provider);
  
  console.log('📊 WBNB3009 State:');
  console.log('  Name:', await wbnb.name());
  console.log('  Total Supply:', ethers.formatEther(await wbnb.totalSupply()));
  console.log('  User Balance:', ethers.formatEther(await wbnb.balanceOf(userAddress)));
  
  // Check contract BNB balance (should match total supply)
  const contractBNB = await provider.getBalance(wbnb3009Address);
  console.log('  Contract BNB:', ethers.formatEther(contractBNB));
  
  // Try another RPC
  console.log('\n📊 Checking via second RPC...');
  const provider2 = new ethers.JsonRpcProvider('https://bsc-testnet.public.blastapi.io');
  const wbnb2 = new ethers.Contract(wbnb3009Address, abi, provider2);
  console.log('  User Balance:', ethers.formatEther(await wbnb2.balanceOf(userAddress)));
  console.log('  Total Supply:', ethers.formatEther(await wbnb2.totalSupply()));
}

main().catch(console.error);
