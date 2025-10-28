# 🚀 Complete Deployment Instructions - BSC Testnet

This guide will help you deploy the PredictBNB project to BSC Testnet and get it fully working.

## ✅ Prerequisites Checklist

Before starting, you need:

### 1. **Testnet BNB Tokens**
- Visit: https://testnet.bnbchain.org/faucet-smart
- Request 0.5 BNB (free)
- You'll need this for deploying contracts (~0.02 BNB) and oracle operations

### 2. **WalletConnect Project ID** (Free)
- Visit: https://cloud.walletconnect.com/
- Sign up and create a new project
- Copy the Project ID

### 3. **OpenAI API Key** (Required for AI Oracle)
- Visit: https://platform.openai.com/api-keys
- Create an API key
- Cost: ~$0.10-0.30 per market resolution
- Add $5-10 credit to your account

### 4. **Pinata API Keys** (Free tier available)
- Visit: https://app.pinata.cloud/keys
- Sign up and create API key + Secret key
- Free tier: 1GB storage (sufficient for testing)

### 5. **Node.js & NPM**
```bash
node --version  # Should be v18 or higher
npm --version   # Should be v9 or higher
```

---

## 📋 Step-by-Step Deployment

### **Step 1: Configure Environment Variables**

Edit `.env.local` in the root directory:

```bash
nano .env.local
```

Update these REQUIRED values:

```bash
# 1. WalletConnect (from cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id

# 2. Your wallet private key (get from MetaMask: Account Details > Export Private Key)
# ⚠️ IMPORTANT: Use a NEW testnet-only wallet, NEVER your mainnet wallet!
PRIVATE_KEY=0xYourPrivateKeyHere

# 3. OpenAI API Key (from platform.openai.com)
OPENAI_API_KEY=sk-yourkey...

# 4. Pinata API Keys (from app.pinata.cloud)
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret
```

Also update `contracts/.env`:

```bash
cd contracts
nano .env
```

```bash
PRIVATE_KEY=0xYourPrivateKeyHere  # Same as above
BSCSCAN_API_KEY=                   # Optional, for verification
```

### **Step 2: Install Dependencies**

```bash
# Root directory
npm install

# Contracts directory
cd contracts
npm install
cd ..
```

### **Step 3: Compile Smart Contracts**

```bash
cd contracts
npx hardhat compile
```

Expected output:
```
Compiled 4 Solidity files successfully
```

### **Step 4: Deploy to BSC Testnet**

```bash
# Still in contracts directory
npx hardhat run scripts/deploy.js --network bscTestnet
```

Expected output:
```
🚀 Deploying PredictBNB contracts to BNB Chain...

📝 Deploying PredictionMarket contract...
✅ PredictionMarket deployed to: 0xABC...123

📝 Deploying AIOracle contract...
✅ AIOracle deployed to: 0xDEF...456

📝 Deploying GaslessRelayer contract...
✅ GaslessRelayer deployed to: 0xGHI...789

⚙️  Configuring contracts...
✅ AIOracle authorized in PredictionMarket
✅ PredictionMarket whitelisted in GaslessRelayer

🎉 Deployment complete!

📋 Contract Addresses:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PredictionMarket: 0xABC...123
AIOracle: 0xDEF...456
GaslessRelayer: 0xGHI...789
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**⚠️ IMPORTANT: Copy these addresses!** You'll need them in the next step.

### **Step 5: Update Contract Addresses**

Edit `src/lib/contracts/addresses.ts`:

```bash
cd ..  # Back to root
nano src/lib/contracts/addresses.ts
```

Update the addresses for **testnet (97)**:

```typescript
export const CONTRACT_ADDRESSES = {
  // BSC Mainnet
  56: {
    PREDICTION_MARKET: '0x0000000000000000000000000000000000000000',
    AI_ORACLE: '0x0000000000000000000000000000000000000000',
    GASLESS_RELAYER: '0x0000000000000000000000000000000000000000',
  },
  // BSC Testnet - UPDATE THESE WITH YOUR DEPLOYED ADDRESSES
  97: {
    PREDICTION_MARKET: '0xABC...123',  // ← Paste from deployment output
    AI_ORACLE: '0xDEF...456',          // ← Paste from deployment output
    GASLESS_RELAYER: '0xGHI...789',    // ← Paste from deployment output
  },
} as const;
```

Also update `.env.local`:

```bash
nano .env.local
```

```bash
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0xABC...123
NEXT_PUBLIC_AI_ORACLE_ADDRESS=0xDEF...456
NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS=0xGHI...789
```

### **Step 6: Verify Build Works**

```bash
npm run build
```

This should complete successfully with no errors.

### **Step 7: Start the Application**

Open **TWO terminals**:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - AI Oracle Service:**
```bash
npm run oracle:start
```

The app should now be running at: http://localhost:3000

---

## 🧪 Testing the Complete Flow

### **Test 1: Connect Wallet**

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Select MetaMask
4. Make sure you're on **BSC Testnet** (Chain ID: 97)
5. If prompted, allow the app to switch networks

### **Test 2: Create a Market**

1. Click "Create Market" or go to `/create`
2. Fill in:
   - **Question**: "Will Bitcoin reach $100k by December 2025?"
   - **Description**: "Market resolves YES if BTC price >= $100,000"
   - **Category**: Crypto
   - **End Date**: Pick a date 2-3 days from now
   - **AI Oracle**: Enable
3. Click "Create Market"
4. Confirm transaction in MetaMask
5. Wait for confirmation (~3 seconds on BSC)

### **Test 3: Place a Bet**

1. Go to "Markets" page
2. Find your market
3. Click "Predict"
4. Choose YES or NO
5. Enter amount: 0.01 BNB
6. Click "Place Prediction"
7. Confirm in MetaMask

### **Test 4: Check Oracle Service**

In Terminal 2, you should see:
```
🔮 AI Oracle Service Started
📊 Checking for markets to resolve...
⏰ Found 1 pending market(s)
```

### **Test 5: Manual Resolution (For Testing)**

To test immediately without waiting for market deadline:

```bash
cd contracts
npx hardhat console --network bscTestnet
```

In the console:
```javascript
const market = await ethers.getContractAt("PredictionMarket", "0xYourMarketAddress");
await market.resolveMarket(1, true); // Resolve market ID 1 as YES
```

### **Test 6: Claim Winnings**

1. Go back to the market page
2. Click "Claim Winnings"
3. Confirm transaction
4. Check your wallet - you should receive your payout!

---

## 🔍 Verification & Monitoring

### **Verify Contracts on BSCScan**

```bash
cd contracts

# Verify PredictionMarket
npx hardhat verify --network bscTestnet 0xYourPredictionMarketAddress

# Verify AIOracle
npx hardhat verify --network bscTestnet 0xYourAIOracleAddress "0xYourPredictionMarketAddress"

# Verify GaslessRelayer
npx hardhat verify --network bscTestnet 0xYourGaslessRelayerAddress
```

### **Check Contract on BSCScan**

Visit: https://testnet.bscscan.com/address/0xYourContractAddress

You can:
- View transactions
- Read contract state
- Write to contract (if connected)

### **Monitor Oracle Service**

The oracle service logs to Terminal 2:
- Market resolutions
- AI analysis results
- IPFS evidence uploads
- Gas costs

---

## 🐛 Troubleshooting

### **Build Error: Cannot find module**
```bash
rm -rf node_modules package-lock.json
npm install
```

### **Deployment Error: Insufficient funds**
- Get more testnet BNB from faucet
- Check your wallet has BNB on BSC Testnet

### **MetaMask: Wrong Network**
- Click network dropdown
- Select "BSC Testnet"
- If not visible, add manually:
  - Network Name: BSC Testnet
  - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
  - Chain ID: 97
  - Symbol: BNB
  - Block Explorer: https://testnet.bscscan.com

### **OpenAI Error: 429 Rate Limit**
- Add more credits to your OpenAI account
- Check API key is valid

### **Oracle Not Resolving**
- Check Terminal 2 for errors
- Verify OPENAI_API_KEY is set correctly
- Check PRIVATE_KEY has BNB for gas

---

## 💰 Cost Estimates

**Testnet Deployment:**
- Contract deployment: ~0.02 BNB (FREE from faucet)
- Market creation: ~0.001 BNB (FREE from faucet)
- Placing bets: ~0.0005 BNB (FREE from faucet)
- Resolution: ~0.001 BNB (FREE from faucet)

**API Costs:**
- OpenAI: ~$0.10-0.30 per resolution
- Pinata: FREE (1GB on free tier)
- BSCScan verification: FREE

**Total for testing: ~$5-10 in OpenAI credits**

---

## ✅ Success Checklist

- [ ] Got testnet BNB from faucet
- [ ] Configured all environment variables
- [ ] Compiled contracts successfully
- [ ] Deployed contracts to BSC Testnet
- [ ] Updated contract addresses in code
- [ ] Frontend builds without errors
- [ ] Can connect wallet to app
- [ ] Created a test market
- [ ] Placed a test bet
- [ ] Oracle service running
- [ ] Market resolved correctly
- [ ] Claimed winnings successfully

---

## 🎉 Next Steps

Once everything works on testnet:

1. **Test thoroughly** - Create multiple markets, different outcomes
2. **Monitor costs** - Track OpenAI API usage
3. **Optimize** - Reduce gas costs, improve UX
4. **Security audit** - Review contracts before mainnet
5. **Mainnet deployment** - Same process, use mainnet RPC

---

## 📚 Additional Resources

- BSC Testnet Faucet: https://testnet.bnbchain.org/faucet-smart
- BSCScan Testnet: https://testnet.bscscan.com
- OpenAI Platform: https://platform.openai.com
- Hardhat Docs: https://hardhat.org/docs

---

## 🆘 Need Help?

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Review contract deployment logs
3. Check BSCScan for transaction details
4. Verify environment variables are correct

**You're now ready to deploy! 🚀**
