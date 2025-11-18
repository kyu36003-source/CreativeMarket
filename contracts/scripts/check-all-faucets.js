/**
 * Check All BSC Testnet Faucets (No Mainnet Required)
 * Shows alternatives to official faucet that don't need mainnet BNB
 */

const { ethers } = require('hardhat');
const { exec } = require('child_process');

const FAUCETS = [
  {
    name: 'Alchemy (RECOMMENDED)',
    url: 'https://www.alchemy.com/faucets/binance-smart-chain-testnet',
    amount: '0.5 tBNB',
    requirements: 'Email only',
    mainnet: false,
    difficulty: 'Easy',
    description: 'Best option - instant delivery, no mainnet needed'
  },
  {
    name: 'QuickNode',
    url: 'https://faucet.quicknode.com/binance-smart-chain/bnb-testnet',
    amount: '0.1 tBNB',
    requirements: 'Email only',
    mainnet: false,
    difficulty: 'Easy',
    description: 'Fast and reliable'
  },
  {
    name: 'BNB Chain Discord',
    url: 'https://discord.gg/bnbchain',
    amount: '0.5 tBNB',
    requirements: 'Discord account',
    mainnet: false,
    difficulty: 'Easy',
    description: 'Use /faucet command in #testnet-faucet channel'
  },
  {
    name: 'ChainLink',
    url: 'https://faucets.chain.link/bnb-chain-testnet',
    amount: '0.1 tBNB',
    requirements: 'GitHub or Twitter',
    mainnet: false,
    difficulty: 'Easy',
    description: 'Trusted and fast'
  },
  {
    name: 'All That Node',
    url: 'https://www.allthatnode.com/faucet/bsc.dsrv',
    amount: '0.5 tBNB',
    requirements: 'Email only',
    mainnet: false,
    difficulty: 'Easy',
    description: 'High amount, quick delivery'
  }
];

async function openURL(url) {
  const start = process.platform === 'darwin' ? 'open' :
                process.platform === 'win32' ? 'start' : 'xdg-open';
  
  exec(`${start} ${url}`, (error) => {
    if (error) {
      console.log(`   (Manual: ${url})`);
    }
  });
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║        BSC Testnet Faucets - NO MAINNET REQUIRED! 🎁                ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  // Check current balance
  const [signer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(signer.address);
  const balanceInEth = Number(ethers.formatEther(balance));
  
  console.log('📊 Current Status:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Account: ${signer.address}`);
  console.log(`Balance: ${balanceInEth.toFixed(4)} tBNB\n`);

  // Calculate needs
  const deploymentCost = 0.05;
  const testingCost = 0.01;
  const totalNeeded = deploymentCost + testingCost;
  const needed = Math.max(0, totalNeeded - balanceInEth);
  
  if (balanceInEth >= totalNeeded) {
    console.log('✅ You have enough tBNB to deploy and test!');
    console.log(`   Required: ${totalNeeded} tBNB`);
    console.log(`   Available: ${balanceInEth.toFixed(4)} tBNB\n`);
    console.log('🚀 Ready to deploy! Run:');
    console.log('   npx hardhat run scripts/deploy-bsc-testnet.js --network bscTestnet\n');
    return;
  }

  console.log('📋 You need more tBNB:');
  console.log(`├─ Current: ${balanceInEth.toFixed(4)} tBNB`);
  console.log(`├─ Needed: ${totalNeeded} tBNB (${deploymentCost} deploy + ${testingCost} testing)`);
  console.log(`└─ Required: ${needed.toFixed(4)} tBNB\n`);

  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🎁 AVAILABLE FAUCETS (NO MAINNET REQUIRED)');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  FAUCETS.forEach((faucet, index) => {
    console.log(`${index + 1}. ${faucet.name}`);
    console.log(`   ├─ Amount: ${faucet.amount}`);
    console.log(`   ├─ Requirements: ${faucet.requirements}`);
    console.log(`   ├─ Mainnet BNB: ${faucet.mainnet ? '✅ Required' : '❌ NOT Required'}`);
    console.log(`   ├─ Difficulty: ${faucet.difficulty}`);
    console.log(`   ├─ Description: ${faucet.description}`);
    console.log(`   └─ URL: ${faucet.url}\n`);
  });

  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('💡 RECOMMENDATIONS');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  console.log('⭐ BEST OPTION: Alchemy (0.5 tBNB)');
  console.log('   Why: Instant, email only, no mainnet needed');
  console.log('   1. Visit: https://www.alchemy.com/faucets/binance-smart-chain-testnet');
  console.log('   2. Sign up with email (2 minutes)');
  console.log(`   3. Enter address: ${signer.address}`);
  console.log('   4. Receive 0.5 tBNB instantly!\n');

  console.log('🔄 ALTERNATIVE: Discord Bot (0.5 tBNB)');
  console.log('   1. Join Discord: https://discord.gg/bnbchain');
  console.log('   2. Go to #testnet-faucet channel');
  console.log(`   3. Type: /faucet ${signer.address}`);
  console.log('   4. Receive 0.5 tBNB\n');

  console.log('💰 MAXIMIZE: Use Multiple Faucets!');
  console.log('   Each faucet has separate daily limits:');
  console.log('   ├─ Alchemy: 0.5 tBNB');
  console.log('   ├─ QuickNode: 0.1 tBNB');
  console.log('   ├─ ChainLink: 0.1 tBNB');
  console.log('   └─ Total: 0.7 tBNB per day!\n');

  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🚀 OPENING RECOMMENDED FAUCET');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  console.log('Opening Alchemy faucet in your browser...\n');
  await openURL(FAUCETS[0].url);

  console.log('✅ Browser opened! Follow the steps above to get tBNB.\n');
  console.log('📝 After receiving tBNB, run:');
  console.log('   npx hardhat run scripts/check-all-faucets.js --network bscTestnet\n');
  console.log('   (to verify balance and deploy)\n');

  console.log('💡 Pro Tip: Bookmark these faucet links for daily refills!');
  console.log('   You can claim from each faucet once per day.\n');

  // Save faucets info
  console.log('📄 Full documentation saved to: docs/ALTERNATIVE_FAUCETS.md\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
