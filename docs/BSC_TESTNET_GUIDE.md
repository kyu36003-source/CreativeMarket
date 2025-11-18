# 🧪 BSC Testnet Deployment Guide

## BSC Testnet Overview

**BSC Testnet** is Binance Smart Chain's equivalent to Ethereum's Sepolia/Goerli testnet.

### Network Details
```
Network Name: BSC Testnet
Chain ID: 97
RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
Block Explorer: https://testnet.bscscan.com
Symbol: tBNB (test BNB)
```

---

## 🎯 Why Use BSC Testnet?

✅ **Real blockchain environment** (not local Hardhat)  
✅ **FREE test BNB** from faucet  
✅ **Public block explorer** (verify transactions)  
✅ **Same gas costs** as mainnet (test economics)  
✅ **Deploy once, test everywhere** (accessible to all users)  
✅ **Closer to production** than local network  

---

## 📋 Setup Steps

### Step 1: Add BSC Testnet to MetaMask

**Option A: Automatic (Chainlist)**
1. Go to https://chainlist.org/
2. Search for "BSC Testnet" (Chain ID: 97)
3. Click "Add to MetaMask"

**Option B: Manual**
1. Open MetaMask
2. Click Network dropdown
3. Click "Add Network"
4. Enter details:
   - **Network Name:** BSC Testnet
   - **RPC URL:** https://data-seed-prebsc-1-s1.binance.org:8545/
   - **Chain ID:** 97
   - **Symbol:** tBNB
   - **Block Explorer:** https://testnet.bscscan.com

### Step 2: Get Test BNB

**Faucet Options:**

1. **Official BSC Faucet**
   - URL: https://testnet.bnbchain.org/faucet-smart
   - Amount: 0.5 tBNB per day
   - Requirements: Twitter/GitHub account

2. **Alternative Faucets**
   - https://testnet.binance.org/faucet-smart
   - https://www.bnbchain.org/en/testnet-faucet

3. **Steps:**
   ```
   1. Copy your MetaMask address
   2. Go to faucet website
   3. Paste address
   4. Complete captcha/social verification
   5. Receive 0.5 tBNB (~$150 testnet value)
   ```

### Step 3: Configure Hardhat for BSC Testnet

Update `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 10000000000, // 10 gwei
      gas: 5000000,
      timeout: 60000
    }
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY || ""
    }
  }
};
```

### Step 4: Update Environment Variables

Add to `.env.local`:

```bash
# ============================================================================
# BSC Testnet Configuration
# ============================================================================

# Your MetaMask private key (NEVER commit this to git!)
# Export from MetaMask: Account Details → Export Private Key
PRIVATE_KEY=your_private_key_here

# BSC Testnet Configuration
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
NEXT_PUBLIC_BLOCK_EXPLORER=https://testnet.bscscan.com

# BscScan API Key (for contract verification)
# Get from: https://bscscan.com/myapikey
BSCSCAN_API_KEY=your_bscscan_api_key_here

# Real APIs (already configured)
HUGGINGFACE_API_KEY=YOUR_HF_API_KEY_HERE
PINATA_API_KEY=a66f9ca024634e10db54
```

⚠️ **IMPORTANT:** Never commit your private key to GitHub!

---

## 🚀 Deployment

### Deploy Contracts to BSC Testnet

```bash
cd contracts

# Deploy all contracts
npx hardhat run scripts/deploy.js --network bscTestnet

# Or deploy locally first, then to testnet
npx hardhat run scripts/deploy-local.js --network bscTestnet
```

**Expected Output:**
```
Deploying contracts to BSC Testnet (Chain ID: 97)...
Deployer: 0xYourAddress
Balance: 0.5 tBNB

Deploying PredictionMarket...
✅ PredictionMarket deployed to: 0x1234...

Deploying AIOracle...
✅ AIOracle deployed to: 0x5678...

Deploying GaslessRelayer...
✅ GaslessRelayer deployed to: 0x9abc...

Configuring contracts...
✅ AIOracle authorized in PredictionMarket
✅ Oracle address authorized
✅ GaslessRelayer whitelisted

Total deployment cost: ~0.02 tBNB
```

### Update Contract Addresses

After deployment, update `.env.local`:

```bash
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x1234...
NEXT_PUBLIC_AI_ORACLE_ADDRESS=0x5678...
NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS=0x9abc...
```

---

## ✅ Verify Contracts on BscScan

### Why Verify?
- Users can read your contract code
- Transparency and trust
- Enables direct interaction on BscScan
- Professional appearance

### Verification Command

```bash
npx hardhat verify --network bscTestnet \
  0x1234... \
  "constructor_arg_1" "constructor_arg_2"
```

### Example: Verify PredictionMarket

```bash
npx hardhat verify --network bscTestnet \
  0x1234abcd... \
  "0x5678efgh..." \
  "0x9abcijkl..."
```

**Expected Output:**
```
Verifying contract on BscScan...
✅ Successfully verified contract PredictionMarket
   https://testnet.bscscan.com/address/0x1234.../code
```

---

## 🧪 Testing on BSC Testnet

### Run Integration Tests

Create `test-bsc-testnet.js`:

```javascript
const { ethers } = require('hardhat');

async function main() {
  console.log('Testing on BSC Testnet...\n');
  
  const PREDICTION_MARKET = '0x1234...'; // Your deployed address
  
  const predictionMarket = await ethers.getContractAt(
    'PredictionMarket',
    PREDICTION_MARKET
  );
  
  // Test 1: Read market count
  const count = await predictionMarket.marketCount();
  console.log('✅ Market count:', count.toString());
  
  // Test 2: Create market
  const tx = await predictionMarket.createMarket(
    "Test market on BSC Testnet",
    "Testing deployment",
    "test",
    Math.floor(Date.now() / 1000) + 3600,
    true
  );
  await tx.wait();
  console.log('✅ Market created:', tx.hash);
  
  // Test 3: Place bet
  const betTx = await predictionMarket.buyPosition(1, true, {
    value: ethers.parseEther('0.01')
  });
  await betTx.wait();
  console.log('✅ Bet placed:', betTx.hash);
  
  console.log('\n🎉 All tests passed!');
  console.log('View transactions: https://testnet.bscscan.com');
}

main();
```

Run the test:
```bash
npx hardhat run test-bsc-testnet.js --network bscTestnet
```

---

## 🌐 Frontend Configuration

Update `src/lib/web3-config.ts`:

```typescript
export const BSC_TESTNET = {
  id: 97,
  name: 'BSC Testnet',
  network: 'bsc-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Test BNB',
    symbol: 'tBNB',
  },
  rpcUrls: {
    default: {
      http: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    },
    public: {
      http: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BscScan',
      url: 'https://testnet.bscscan.com',
    },
  },
  testnet: true,
};

// Add to supported chains
export const SUPPORTED_CHAINS = [
  BSC_TESTNET,
  // ... other chains
];
```

---

## 📊 Cost Estimates

### BSC Testnet Gas Costs (Similar to Mainnet)

| Operation | Gas Used | Cost (10 gwei) | Cost (tBNB) |
|-----------|----------|----------------|-------------|
| Deploy PredictionMarket | ~3,000,000 | ~0.03 tBNB | FREE |
| Deploy AIOracle | ~1,500,000 | ~0.015 tBNB | FREE |
| Create Market | ~300,000 | ~0.003 tBNB | FREE |
| Place Bet | ~100,000 | ~0.001 tBNB | FREE |
| Resolve Market | ~80,000 | ~0.0008 tBNB | FREE |

**Total deployment cost:** ~0.05 tBNB (FREE from faucet!)

---

## 🔍 Monitoring & Debugging

### Check Contract on BscScan

1. Go to https://testnet.bscscan.com
2. Search for your contract address
3. View:
   - Transactions
   - Internal transactions
   - Events/logs
   - Contract code (if verified)
   - Read/Write contract functions

### Useful Commands

```bash
# Check deployer balance
npx hardhat run scripts/check-balance.js --network bscTestnet

# Get network info
npx hardhat run scripts/network-info.js --network bscTestnet

# Interact with contract
npx hardhat console --network bscTestnet
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Insufficient funds for gas"
**Solution:** Get more tBNB from faucet

### Issue 2: "Network timeout"
**Solution:** Try alternative RPC:
- https://data-seed-prebsc-2-s1.binance.org:8545/
- https://data-seed-prebsc-1-s2.binance.org:8545/

### Issue 3: "Nonce too high"
**Solution:** Reset MetaMask:
Settings → Advanced → Reset Account

### Issue 4: "Contract verification failed"
**Solution:** 
- Check compiler version matches deployment
- Verify constructor arguments
- Get BscScan API key

---

## 🎯 Complete Deployment Checklist

- [ ] Add BSC Testnet to MetaMask
- [ ] Get 0.5 tBNB from faucet
- [ ] Update `hardhat.config.js` with BSC testnet config
- [ ] Add `PRIVATE_KEY` to `.env.local`
- [ ] Deploy contracts: `npx hardhat run scripts/deploy.js --network bscTestnet`
- [ ] Update contract addresses in `.env.local`
- [ ] Verify contracts on BscScan
- [ ] Test contract interactions
- [ ] Update frontend configuration
- [ ] Test frontend with testnet
- [ ] Share testnet deployment with team/users

---

## 📚 Resources

**Official Documentation:**
- BSC Testnet: https://docs.bnbchain.org/docs/getting-started
- Faucet: https://testnet.bnbchain.org/faucet-smart
- BscScan: https://testnet.bscscan.com
- RPC Endpoints: https://docs.bnbchain.org/docs/rpc

**Community Resources:**
- Chainlist: https://chainlist.org/chain/97
- BSC Discord: https://discord.gg/bnbchain
- BSC Telegram: https://t.me/BNBchain

---

## 🚀 Next: Mainnet Deployment

After testing on BSC Testnet, you can deploy to **BSC Mainnet**:

```javascript
bscMainnet: {
  url: "https://bsc-dataseed1.binance.org/",
  chainId: 56,
  accounts: [process.env.MAINNET_PRIVATE_KEY],
  gasPrice: 5000000000, // 5 gwei
}
```

**Requirements for Mainnet:**
- Smart contract audit
- Thorough testing on testnet
- Real BNB for deployment (~$10-20)
- Community feedback
- Security review

---

## 🎉 Benefits of BSC Testnet Testing

✅ **Real blockchain environment**  
✅ **Public accessibility** (anyone can test)  
✅ **Free forever** (no cost)  
✅ **Production-like** conditions  
✅ **Block explorer** verification  
✅ **Gas optimization** testing  
✅ **Multi-user** testing  
✅ **Frontend integration** testing  

---

**Ready to deploy to real blockchain? Let's go! 🚀**
