# 🚀 COMPLETE SETUP GUIDE - Step by Step

## Overview

This guide will walk you through the COMPLETE setup process. Choose your path:

- **Path A: Full Testnet Deployment** (Requires API keys, ~30 mins)
- **Path B: Local Development Mode** (No API keys needed, ~10 mins)

---

## 📋 PATH A: Full Testnet Deployment

### Prerequisites

You need to obtain these API keys/resources:

#### 1. **Create a New Test Wallet** (5 mins)
- Open MetaMask
- Click profile icon → "Create Account" 
- Name it "BSC Testnet"
- Go to "Account Details" → "Export Private Key"
- Copy the private key (starts with 0x)
- ⚠️ **IMPORTANT:** Only use this wallet for testnet, never for mainnet funds!

#### 2. **Get Testnet BNB** (2 mins - FREE)
- Visit: https://testnet.bnbchain.org/faucet-smart
- Paste your test wallet address
- Click "Give me BNB"
- Wait 1-2 minutes for 0.5 BNB

#### 3. **Get WalletConnect Project ID** (3 mins - FREE)
- Visit: https://cloud.walletconnect.com/
- Sign up (free account)
- Create new project
- Copy the "Project ID"

#### 4. **Get OpenAI API Key** (5 mins - Paid)
- Visit: https://platform.openai.com/api-keys
- Sign up/login
- Click "Create new secret key"
- Copy the key (starts with sk-)
- Add $5-10 credit to your account at https://platform.openai.com/settings/organization/billing

#### 5. **Get Pinata API Keys** (3 mins - FREE)
- Visit: https://app.pinata.cloud/
- Sign up (free account - 1GB storage)
- Go to "API Keys" → "New Key"
- Enable "pinFileToIPFS" permission
- Copy both "API Key" and "API Secret"

---

### Configuration

#### Step 1: Configure Root Environment

Edit `.env.local`:
```bash
nano .env.local
```

Update these values:
```bash
# WalletConnect Project ID (from cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123your-project-id

# Your testnet wallet private key (from MetaMask)
PRIVATE_KEY=0xYourPrivateKeyHere123456789abcdef

# OpenAI API Key (from platform.openai.com)
OPENAI_API_KEY=sk-proj-yourkeyherexxxxxxxxxxxxxxxxx

# Pinata API Keys (from app.pinata.cloud)
PINATA_API_KEY=your_pinata_api_key_12345
PINATA_SECRET_KEY=your_pinata_secret_key_67890
```

Save and exit (Ctrl+X, Y, Enter)

#### Step 2: Configure Contract Deployment

Edit `contracts/.env`:
```bash
nano contracts/.env
```

Update:
```bash
# Same private key as above
PRIVATE_KEY=0xYourPrivateKeyHere123456789abcdef

# Optional: BSCScan API key for verification
BSCSCAN_API_KEY=
```

Save and exit

#### Step 3: Verify Configuration

```bash
./check-ready.sh
```

You should see all ✅ checks pass!

#### Step 4: Deploy

```bash
./deploy.sh
```

This will:
1. Install dependencies (if needed)
2. Compile contracts
3. Deploy to BSC Testnet
4. Update contract addresses
5. Build frontend

Expected output:
```
🎉 Deployment complete!

📋 Contract Addresses:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PredictionMarket: 0xABC...123
AIOracle: 0xDEF...456
GaslessRelayer: 0xGHI...789
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Step 5: Start the App

Open two terminals:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - AI Oracle:**
```bash
npm run oracle:start
```

#### Step 6: Test

1. Open http://localhost:3000
2. Connect MetaMask
3. Switch to BSC Testnet (Chain ID: 97)
4. Create a market
5. Place a bet
6. Wait for resolution
7. Claim winnings!

---

## 📋 PATH B: Local Development Mode

If you don't want to get API keys right now, you can run in local development mode:

### Step 1: Deploy to Local Hardhat Network

```bash
# Terminal 1 - Start local blockchain
cd contracts
npx hardhat node
```

Keep this running. You'll see 20 test accounts with private keys.

### Step 2: Deploy Contracts Locally

In a new terminal:
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract addresses.

### Step 3: Update Local Addresses

Edit `src/lib/contracts/addresses.ts`:

Add a local network section:
```typescript
export const CONTRACT_ADDRESSES = {
  // ... existing code ...
  
  // Local Hardhat Network
  31337: {
    PREDICTION_MARKET: '0xYourLocalAddress1',
    AI_ORACLE: '0xYourLocalAddress2',
    GASLESS_RELAYER: '0xYourLocalAddress3',
  },
} as const;
```

Update the function:
```typescript
export const getContractAddress = (
  chainId: number,
  contractName: keyof (typeof CONTRACT_ADDRESSES)[56],
) => {
  if (chainId !== 56 && chainId !== 97 && chainId !== 31337) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return CONTRACT_ADDRESSES[chainId as 56 | 97 | 31337][contractName];
};
```

### Step 4: Configure for Local

Edit `.env.local`:
```bash
# Minimal config for local testing
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=dummy_id_for_local
NEXT_PUBLIC_DEFAULT_CHAIN_ID=31337
NEXT_PUBLIC_ENABLE_TESTNET=true
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
# This is the first test account from Hardhat (safe for local testing)
```

### Step 5: Import Test Account to MetaMask

1. In MetaMask → Import Account
2. Paste private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3. Add Local Network in MetaMask:
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

### Step 6: Run App in Local Mode

```bash
npm run dev
```

AI Oracle will use mock mode automatically when no OpenAI key is configured.

### Step 7: Test Locally

1. Open http://localhost:3000
2. Connect MetaMask to Localhost network
3. Create markets and test!

---

## 🔍 Verification Steps

### Verify Build Works
```bash
npm run build
```
Should complete successfully (warnings are okay).

### Verify Contracts Compile
```bash
cd contracts
npx hardhat compile
```
Should show: "Compiled 4 Solidity files successfully"

### Verify Environment
```bash
./check-ready.sh
```
Should show all ✅ for the path you chose.

---

## 🐛 Troubleshooting

### Issue: "Insufficient funds for gas"
**Solution:** 
- Testnet: Get more BNB from faucet
- Local: Make sure Hardhat node is running

### Issue: "Cannot find module"
**Solution:**
```bash
rm -rf node_modules package-lock.json
rm -rf contracts/node_modules contracts/package-lock.json
npm install
cd contracts && npm install
```

### Issue: "Network error" or "Chain not supported"
**Solution:**
- Check MetaMask is on correct network
- For testnet: BSC Testnet (97)
- For local: Localhost 8545 (31337)

### Issue: "Transaction failed"
**Solution:**
- Check you have enough BNB/ETH for gas
- Verify contract addresses are correct
- Check network matches deployed contracts

### Issue: "OpenAI API error"
**Solution:**
- Verify API key is correct
- Check you have credits: https://platform.openai.com/settings/organization/billing
- Or use Local mode without OpenAI

---

## 📊 What to Expect

### Testnet Deployment Costs:
- Gas for deployment: ~0.02 BNB (FREE from faucet)
- Gas for transactions: ~0.001 BNB per tx (FREE from faucet)
- OpenAI API: ~$0.10-0.30 per market resolution
- Pinata IPFS: FREE (1GB free tier)

### Local Development Costs:
- **$0 - Completely free!**
- Perfect for testing and development

---

## ✅ Success Criteria

You've successfully set up when:

- [ ] App builds without errors
- [ ] Can connect wallet
- [ ] Can create markets
- [ ] Can place bets
- [ ] Markets resolve (either via AI or manually)
- [ ] Can claim winnings
- [ ] Balance updates correctly

---

## 🎯 Next Steps After Setup

1. **Test thoroughly** - Create multiple markets, test edge cases
2. **Customize** - Update UI, add features
3. **Security audit** - Review contracts before mainnet
4. **Mainnet deployment** - When ready for production

---

## 📚 Additional Resources

- **Testnet Faucet:** https://testnet.bnbchain.org/faucet-smart
- **BSCScan Testnet:** https://testnet.bscscan.com
- **Hardhat Docs:** https://hardhat.org/docs
- **OpenAI API Docs:** https://platform.openai.com/docs
- **Pinata Docs:** https://docs.pinata.cloud

---

## 🆘 Still Having Issues?

1. Read the error message carefully
2. Check all environment variables are set correctly
3. Verify you're on the correct network
4. Make sure all dependencies are installed
5. Try the Local Development path first to verify setup

**Choose your path and follow the steps above!** 🚀
