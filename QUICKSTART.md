# 🎯 QUICK START GUIDE - Deploy in 30 Minutes

## ✅ Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] Testnet wallet with BNB
- [ ] OpenAI API key
- [ ] Pinata API key

---

## 🚀 5-Step Deployment

### **Step 1: Get Testnet BNB** (5 min)
```
1. Visit: https://testnet.bnbchain.org/faucet-smart
2. Enter your wallet address
3. Verify and receive BNB
4. Wait for confirmation
```

### **Step 2: Get API Keys** (5 min)
```
OpenAI: https://platform.openai.com/api-keys
Pinata: https://app.pinata.cloud/keys
```

### **Step 3: Configure & Setup** (5 min)
```bash
# Clone/navigate to project
cd someCreativity

# Create .env file
cat > .env << EOF
PRIVATE_KEY=your_private_key_here
OPENAI_API_KEY=sk-your_key_here
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_API_KEY=your_pinata_secret
ORACLE_AGENT_ADDRESS=your_wallet_address
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
EOF

# Run setup script
./deploy-setup.sh
```

### **Step 4: Deploy Contracts** (10 min)
```bash
cd contracts

# Deploy all contracts
npx hardhat run scripts/deploy.js --network bnbTestnet

# Copy the output addresses like:
# PredictionMarket: 0x...
# AIOracle: 0x...
# TraderReputation: 0x...

# Update .env with addresses
# Add these lines to .env:
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x...
NEXT_PUBLIC_AI_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_TRADER_REPUTATION_ADDRESS=0x...

# Authorize oracle agent
npx hardhat run scripts/authorize-oracle.js --network bnbTestnet

cd ..
```

### **Step 5: Launch** (5 min)
```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start oracle
npm run oracle:start

# Visit: http://localhost:3000
```

---

## 🧪 Test Flow (10 min)

### **1. Create Market**
```
1. Go to http://localhost:3000
2. Connect wallet (top right)
3. Click "Create Market"
4. Fill form:
   - Question: "Will BTC reach $50K in 1 hour?"
   - Category: Crypto
   - End time: +1 hour
   - Enable AI Oracle: YES
5. Submit transaction
6. Wait for confirmation
```

### **2. Place Bets**
```
1. Go to "Markets" page
2. Click on your market
3. Choose YES or NO
4. Enter amount: 0.1 BNB
5. Submit bet
6. Check "Your Position" updates
```

### **3. Wait for Resolution**
```
1. Wait for market end time (1 hour)
2. Oracle service auto-detects
3. Fetches data from CoinGecko/Binance
4. GPT-4 analyzes and decides
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
