# AI Oracle Deployment Guide

**Date:** October 28, 2025  
**Network:** BNB Chain Testnet (Chain ID: 97)  
**Status:** Ready for Deployment

---

## 📋 Prerequisites

### 1. Get BNB Testnet Tokens

Visit the BNB Chain testnet faucet:
- **URL:** https://testnet.bnbchain.org/faucet-smart
- Request testnet BNB (needed for gas fees)
- You'll need at least 0.5 BNB for deployment

### 2. Obtain API Keys

#### Required (for basic operation):
1. **OpenAI API Key** (for AI analysis)
   - Visit: https://platform.openai.com/api-keys
   - Create new API key
   - Cost: ~$0.10-0.30 per resolution

2. **Pinata API Keys** (for IPFS evidence storage)
   - Visit: https://app.pinata.cloud/keys
   - Create API Key + Secret Key
   - Free tier: 1GB storage, sufficient for testing

#### Optional (for better data):
3. **CoinGecko API Key** (better rate limits)
   - Visit: https://www.coingecko.com/en/api/pricing
   - Free tier available (50 calls/min)

4. **BSCScan API Key** (for contract verification)
   - Visit: https://bscscan.com/myapikey
   - Free registration required

---

## 🚀 Step-by-Step Deployment

### Step 1: Configure Environment

Create `.env.local` file in the root directory:

```bash
# Copy from example
cp .env.example .env.local

# Edit with your values
nano .env.local
```

**Required variables:**
```bash
# Blockchain
PRIVATE_KEY=your_wallet_private_key_here
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# AI Oracle
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
MIN_CONFIDENCE_THRESHOLD=8000

# IPFS Storage
PINATA_API_KEY=...
PINATA_SECRET_KEY=...

# Optional
COINGECKO_API_KEY=...
BSCSCAN_API_KEY=...
```

### Step 2: Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 10 Solidity files successfully
```

### Step 3: Deploy to BNB Testnet

```bash
npm run deploy:testnet
```

This will deploy:
1. **TraderReputation** contract
2. **PredictionMarket** contract (with TraderReputation)
3. **AIOracle** contract (linked to PredictionMarket)
4. **GaslessRelayer** contract (for future gasless transactions)

Expected output:
```
🚀 Deploying PredictBNB contracts to BNB Chain...

📝 Deploying PredictionMarket contract...
✅ PredictionMarket deployed to: 0x...

📝 Deploying AIOracle contract...
✅ AIOracle deployed to: 0x...

📝 Deploying GaslessRelayer contract...
✅ GaslessRelayer deployed to: 0x...

⚙️  Configuring contracts...
✅ AIOracle authorized in PredictionMarket
✅ PredictionMarket whitelisted in GaslessRelayer

🎉 Deployment complete!

📋 Contract Addresses:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PredictionMarket: 0x...
AIOracle: 0x...
TraderReputation: 0x...
GaslessRelayer: 0x...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Important:** Save these addresses! You'll need them in the next step.

### Step 4: Update Frontend Configuration

Edit `src/lib/contracts/addresses.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  97: { // BNB Testnet
    predictionMarket: "0x...", // From deployment output
    aiOracle: "0x...",         // From deployment output
    traderReputation: "0x...", // From deployment output
    gaslessRelayer: "0x...",   // From deployment output
  },
  56: { // BNB Mainnet (for future)
    predictionMarket: "0x0000000000000000000000000000000000000000",
    aiOracle: "0x0000000000000000000000000000000000000000",
    traderReputation: "0x0000000000000000000000000000000000000000",
    gaslessRelayer: "0x0000000000000000000000000000000000000000",
  },
};
```

Update `.env.local` with contract addresses:

```bash
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x...
NEXT_PUBLIC_AI_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_TRADER_REPUTATION_ADDRESS=0x...
NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS=0x...
```

### Step 5: Authorize Oracle Agent

The oracle service needs to be authorized to submit resolutions.

**Option A: Using Hardhat Console**

```bash
cd contracts
npx hardhat console --network bscTestnet
```

In the console:
```javascript
const AIOracle = await ethers.getContractFactory("AIOracle");
const oracle = await AIOracle.attach("0x..."); // Your AIOracle address

// Authorize your wallet address
await oracle.setAIAgent("0x...", true); // Your wallet address from PRIVATE_KEY

// Verify
await oracle.aiAgents("0x...");
// Should return: true
```

**Option B: Using Etherscan**

1. Go to: https://testnet.bscscan.com/address/YOUR_ORACLE_ADDRESS#writeContract
2. Click "Connect to Web3"
3. Find `setAIAgent` function
4. Enter your wallet address and `true`
5. Click "Write"

### Step 6: Verify Contracts on BSCScan (Optional but Recommended)

```bash
cd contracts

# Verify PredictionMarket
npx hardhat verify --network bscTestnet 0x...

# Verify AIOracle (needs constructor argument)
npx hardhat verify --network bscTestnet 0x... 0x... # AIOracle address, PredictionMarket address

# Verify GaslessRelayer
npx hardhat verify --network bscTestnet 0x...
```

### Step 7: Start Oracle Service

```bash
# Check status
npm run oracle:status

# Start the service
npm run oracle:start
```

Expected output:
```
🚀 Starting AI Oracle Service...
📡 Network: BNB Chain Testnet
👛 Wallet: 0x...
🔮 Oracle Contract: 0x...
📊 Market Contract: 0x...
✅ Oracle agent authorized

👂 Listening for events...
```

### Step 8: Start Frontend

In a new terminal:

```bash
npm run dev
```

Open http://localhost:3000

---

## ✅ Testing the Complete Flow

### Test 1: Create a Market

1. Connect your wallet to the frontend
2. Go to "Create Market"
3. Create a test market:
   - **Question:** "Will BTC be above $50,000 on November 1, 2025?"
   - **Category:** Crypto
   - **End Date:** Tomorrow (for quick testing)
   - **Initial Bet:** 0.01 BNB

4. Wait for transaction confirmation

### Test 2: Place Bets

1. Other users can place bets YES or NO
2. Test with multiple wallets if possible
3. Each bet should update the odds

### Test 3: Wait for Market to End

- Market automatically becomes resolvable after end time
- Oracle service should detect this

### Test 4: Oracle Resolution

The oracle service will automatically:
1. Detect market has ended
2. Fetch BTC price from CoinGecko and Binance
3. Analyze data with GPT-4
4. Upload evidence to IPFS
5. Submit resolution to blockchain

Monitor oracle service logs for:
```
🔔 Resolution Requested: Market #1
[Resolution] Fetching data for market 1...
[Resolution] Running AI analysis...
[Resolution] Compiling evidence package...
[Resolution] Uploading evidence to IPFS...
[Resolution] Evidence uploaded: https://gateway.pinata.cloud/ipfs/...
[Resolution] Submitting to blockchain...
[Resolution] Transaction submitted: 0x...
[Resolution] ✅ Market 1 resolved successfully!
  Outcome: YES
  Confidence: 95.00%
  Evidence: https://gateway.pinata.cloud/ipfs/...
  Transaction: 0x...
  Duration: 12.34s
  Cost: $0.15
```

### Test 5: Claim Winnings

1. Winners can claim their payouts from the frontend
2. Losers see their loss
3. Reputation scores are updated

---

## 🐛 Troubleshooting

### Issue: "Oracle agent not authorized"

**Solution:**
```bash
# Check authorization
npm run oracle:status

# If not authorized, run Step 5 again
```

### Issue: "Insufficient balance"

**Solution:**
```bash
# Get more testnet BNB
# Visit: https://testnet.bnbchain.org/faucet-smart
```

### Issue: "AI analysis failed"

**Solution:**
- Check OpenAI API key is valid
- Check you have API credits
- Review error message in oracle logs

### Issue: "IPFS upload failed"

**Solution:**
- Check Pinata API keys are correct
- Verify Pinata account is active
- Check internet connection

### Issue: "Data source unavailable"

**Solution:**
- Check CoinGecko/Binance APIs are working
- Try manual resolution if needed
- Check if market question can be parsed

---

## 📊 Monitoring

### Check Oracle Status

```bash
npm run oracle:status
```

Output:
```
📊 AI Oracle Service Status

Wallet Address: 0x...
Balance: 0.45 BNB
Authorized: ✅ Yes
Total Markets: 3
```

### Resolve Specific Market

```bash
npm run oracle:resolve 1
```

### View Logs

Oracle service logs show:
- Market detection
- Data fetching progress
- AI analysis results
- Evidence upload
- Blockchain submission
- Costs and duration

---

## 💰 Cost Estimates

**Per Resolution:**
- OpenAI API: $0.10-0.30
- Gas costs: ~$0.05 (testnet, higher on mainnet)
- IPFS storage: $0.00 (free tier)
- **Total: ~$0.15-0.35 per resolution**

**Monthly (100 resolutions):**
- OpenAI: $10-30
- Gas: $5 (testnet) / $50-100 (mainnet)
- IPFS: $0-5
- **Total: $15-135/month**

---

## 🔐 Security Checklist

- [ ] Never commit `.env.local` to git
- [ ] Store private keys securely
- [ ] Use different wallets for testnet/mainnet
- [ ] Monitor oracle wallet balance
- [ ] Review AI resolutions periodically
- [ ] Set up alerts for failures
- [ ] Backup contract addresses
- [ ] Document deployment details

---

## 📚 Next Steps

1. **Test thoroughly on testnet**
   - Create multiple market types
   - Test edge cases
   - Verify evidence accuracy

2. **Monitor performance**
   - Resolution speed
   - AI confidence scores
   - Cost per resolution

3. **Optimize if needed**
   - Adjust confidence thresholds
   - Fine-tune prompts
   - Implement caching

4. **Prepare for mainnet**
   - Security audit
   - Load testing
   - User documentation

---

## 🆘 Support

If you encounter issues:

1. Check oracle service logs
2. Verify environment variables
3. Check blockchain explorer (BSCScan)
4. Review IPFS evidence
5. Test API keys separately

**Common Resources:**
- BNB Testnet Faucet: https://testnet.bnbchain.org/faucet-smart
- BSCScan Testnet: https://testnet.bscscan.com/
- Pinata Dashboard: https://app.pinata.cloud/
- OpenAI Usage: https://platform.openai.com/usage

---

**Deployment complete! 🎉**

Your AI Oracle system is now ready to automatically resolve prediction markets on BNB Chain Testnet.
