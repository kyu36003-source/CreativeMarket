# 🚀 PredictBNB Quick Start Guide - Get Running in 30 Minutes

**PredictBNB** revolutionizes prediction markets with **30-minute AI resolution** (vs 48+ hours), **gasless trading via x402**, and **copy trading**. Built exclusively on **BNB Chain** for optimal economics.

## ✅ Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] Git installed
- [ ] Testnet wallet (MetaMask/WalletConnect)
- [ ] Testnet BNB (free from faucet)
- [ ] Hugging Face API key (FREE) or OpenAI API key

---

## 🚀 5-Step Quick Deploy

### **Step 1: Get Testnet BNB** (5 min)
```
1. Visit BNB Chain Faucet: https://www.bnbchain.org/en/testnet-faucet
2. Connect your wallet
3. Complete verification
4. Receive 0.5 BNB (testnet)
5. Verify in wallet (should see balance)
```

### **Step 2: Get API Keys** (5 min)

**Option A: Hugging Face (FREE & Recommended)**
```
1. Visit: https://huggingface.co/settings/tokens
2. Create new token with "Read" permissions
3. Copy token (starts with hf_...)
4. FREE tier: 1000 requests/day (enough for testing)
```

**Option B: OpenAI (Paid)**
```
1. Visit: https://platform.openai.com/api-keys
2. Create new secret key
3. Copy key (starts with sk-...)
4. Costs: ~$0.01 per AI resolution
```

### **Step 3: Clone & Configure** (5 min)
```bash
# Clone repository
git clone https://github.com/kyu36003-source/CreativeMarket.git
cd CreativeMarket

# Install dependencies
npm install
cd contracts && npm install && cd ..

# Create .env.local (frontend)
cat > .env.local << EOF
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_AI_ORACLE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_TRADER_REPUTATION_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
EOF

# Create contracts/.env (blockchain)
cat > contracts/.env << EOF
PRIVATE_KEY=your_private_key_here
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
HUGGINGFACE_API_KEY=hf_your_key_here
OPENAI_API_KEY=sk_your_key_here
ORACLE_AGENT_ADDRESS=your_wallet_address
EOF
```

### **Step 4: Deploy Smart Contracts** (10 min)
```bash
cd contracts

# Compile contracts
npm run compile

# Run tests (optional but recommended)
npm test

# Deploy to BNB Testnet
npx hardhat run scripts/deploy.js --network bnbTestnet

# Output will show:
# ✅ PredictionMarket deployed: 0x...
# ✅ AIOracle deployed: 0x...
# ✅ TraderReputation deployed: 0x...
# ✅ GaslessRelayer deployed: 0x...

# Copy addresses and update .env.local in root directory

# Authorize oracle to resolve markets
npx hardhat run scripts/authorize-oracle.js --network bnbTestnet

cd ..
```

### **Step 5: Launch Application** (5 min)
```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000

# Test the platform:
# 1. Connect wallet (MetaMask)
# 2. Browse markets or create one
# 3. Place a bet (gasless!)
# 4. Wait for AI resolution (~30 min)
# 5. Claim winnings (also gasless!)
```

---

## 🧪 Complete Test Flow (15 min)

### **1. Create Your First Market**
```
1. Visit http://localhost:3000
2. Click "Connect Wallet" (top right)
3. Select MetaMask/WalletConnect
4. Switch to BNB Testnet (97) if needed
5. Click "Create Market" button
6. Fill market details:
   - Question: "Will BTC reach $50K today?"
   - Category: Cryptocurrency
   - End time: +1 hour (or set custom)
   - Initial liquidity: 0.1 BNB (optional)
7. Confirm transaction
8. Market created! Copy market ID
```

### **2. Place Gasless Bets**
```
1. Navigate to Markets page
2. Click on your market card
3. See Polymarket-style interface:
   - YES odds on left
   - NO odds on right
4. Choose position (YES or NO)
5. Enter amount: 0.01 BNB (min)
6. See preview: "Cost: X BNB, Potential Win: Y BNB"
7. Click "Buy YES" or "Buy NO"
8. Sign meta-transaction (FREE!)
9. Relayer submits (you pay $0 gas)
10. Position updated instantly
```

### **3. Watch AI Oracle Resolve**
```
1. Wait for market end time
2. AI oracle triggers automatically
3. Resolution process (30 minutes):
   ├─ Fetch data (CoinGecko, Binance, etc.)
   ├─ DeepSeek-V3 analyzes (reasoning)
   ├─ Llama 3.3 70B analyzes (data)
   ├─ Qwen 2.5 72B verifies (consensus)
   ├─ 2/3 agreement required
   └─ Evidence stored on IPFS
4. Market resolves to YES or NO
5. Winners can claim immediately
5. Uploads evidence to IPFS
6. Resolves on blockchain
7. You'll see "Market Resolved" badge
```

### **4. Claim Winnings**
```
1. Go back to market page
2. See "You Won! 🎉" if you picked correctly
3. Click "Claim Winnings"
4. Confirm transaction
5. Check your reputation at /reputation
```

---

## 📋 Verification Checklist

After deployment, verify:

- [ ] Frontend loads at localhost:3000
- [ ] Wallet connects successfully
- [ ] Can create market
- [ ] Market shows in /markets
- [ ] Can place bet
- [ ] Oracle service shows "Running"
- [ ] Can view /reputation page
- [ ] Can access /admin/oracle

---

## 🔧 Troubleshooting

### **"Insufficient funds"**
```
Solution: Get more testnet BNB from faucet
```

### **"Oracle agent not authorized"**
```
Solution: Run authorize-oracle.js script again
```

### **"API key invalid"**
```
Solution: Check .env file, regenerate keys if needed
```

### **"Transaction failed"**
```
Solution: Check gas price, wallet balance, contract address
```

---

## 📊 What To Check

### **Frontend Health**
```
✓ Home page loads
✓ Markets page shows list
✓ Create page form works
✓ Wallet connects
✓ Transactions confirm
```

### **Oracle Health**
```
✓ Service starts without errors
✓ Shows "Listening for events"
✓ Detects market creation
✓ Resolves markets automatically
✓ No API errors in logs
```

### **Contract Health**
```
✓ Deployed to testnet
✓ Verified on BscScan
✓ Oracle agent authorized
✓ Can create markets
✓ Can place bets
✓ Can claim winnings
```

---

## 💡 Pro Tips

### **Faster Testing**
```bash
# Use 5-minute markets for quick testing
End Time: Current time + 5 minutes

# Test with small amounts
Bet Amount: 0.01 BNB minimum
```

### **Monitor Everything**
```bash
# Terminal 1: Frontend logs
npm run dev

# Terminal 2: Oracle logs
npm run oracle:start

# Terminal 3: Watch events
cd contracts
npx hardhat console --network bnbTestnet

# Terminal 4: Watch transactions
# Visit: https://testnet.bscscan.com
```

### **Debug Issues**
```bash
# Check oracle status
npm run oracle:status

# View recent resolutions
# Go to: http://localhost:3000/admin/oracle

# Check contract on explorer
# Visit: https://testnet.bscscan.com/address/YOUR_CONTRACT
```

---

## 🎯 Success Metrics

After 1 hour of testing:

- ✅ Created 2+ markets
- ✅ Placed 5+ bets
- ✅ 1+ market resolved by AI
- ✅ 1+ winning claimed
- ✅ Reputation updated
- ✅ All features working

---

## 📞 Quick Commands

```bash
# Deploy everything
./deploy-setup.sh

# Start frontend
npm run dev

# Start oracle
npm run oracle:start

# Deploy contracts
cd contracts && npx hardhat run scripts/deploy.js --network bnbTestnet

# Authorize oracle
npx hardhat run scripts/authorize-oracle.js --network bnbTestnet

# Check status
npm run oracle:status
```

---

## 🎉 You're Ready!

**Total time: 30-45 minutes**

1. ✅ Get testnet BNB & API keys (10 min)
2. ✅ Run setup script (5 min)
3. ✅ Deploy contracts (10 min)
4. ✅ Launch services (5 min)
5. ✅ Test complete flow (10 min)

**Everything is implemented and ready to go! 🚀**

---

## 📚 Full Documentation

- **Complete Guide**: `docs/COMPLETE_IMPLEMENTATION.md`
- **Oracle Architecture**: `docs/AI_ORACLE_ARCHITECTURE.md`
- **Deployment Details**: `docs/AI_ORACLE_DEPLOYMENT.md`
- **All Features List**: `docs/ALL_FEATURES_COMPLETE.md`

**Need help? Check the docs or ask questions! 💪**
