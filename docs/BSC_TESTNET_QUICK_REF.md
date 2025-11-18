# 🚀 BSC Testnet Quick Reference

## Essential Information

### Network Details
```
Network Name: BSC Testnet
Chain ID: 97
RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
Currency: tBNB (test BNB)
Block Explorer: https://testnet.bscscan.com
```

### Quick Links
- **Faucet:** https://testnet.bnbchain.org/faucet-smart (0.5 tBNB/day)
- **Add Network:** https://chainlist.org/?search=97
- **Explorer:** https://testnet.bscscan.com
- **Documentation:** https://docs.bnbchain.org

---

## 🎯 Quick Start (5 Minutes)

### 1. Add Network to MetaMask
```bash
# Option A: Automatic
Visit https://chainlist.org/chain/97 → Click "Add to MetaMask"

# Option B: Manual
Network Name: BSC Testnet
RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
Chain ID: 97
Symbol: tBNB
Block Explorer: https://testnet.bscscan.com
```

### 2. Get Test BNB
```bash
1. Go to https://testnet.bnbchain.org/faucet-smart
2. Paste your MetaMask address
3. Complete verification (Twitter/GitHub)
4. Receive 0.5 tBNB instantly
```

### 3. Deploy Contracts
```bash
cd contracts

# Set your private key in .env.local
echo "PRIVATE_KEY=your_metamask_private_key" >> .env.local

# Deploy to BSC Testnet
npx hardhat run scripts/deploy-bsc-testnet.js --network bscTestnet
```

### 4. Update Configuration
```bash
# Copy addresses from deployment output to .env.local
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x...
NEXT_PUBLIC_AI_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS=0x...
```

### 5. Start Frontend
```bash
npm run dev
# Frontend will connect to BSC Testnet automatically
```

---

## 📋 Commands Cheatsheet

### Deployment
```bash
# Deploy all contracts
npx hardhat run scripts/deploy-bsc-testnet.js --network bscTestnet

# Check balance
npx hardhat run scripts/check-balance.js --network bscTestnet

# Interact with contracts
npx hardhat console --network bscTestnet
```

### Contract Verification
```bash
# Verify on BscScan (after deployment)
npx hardhat verify --network bscTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Example
npx hardhat verify --network bscTestnet 0x1234... "0x5678..."
```

### Testing
```bash
# Run tests on testnet
npx hardhat test --network bscTestnet

# Run specific test
npx hardhat run test-bsc-testnet.js --network bscTestnet
```

---

## 💰 Cost Comparison

| Operation | Gas | Cost (10 gwei) | Mainnet Equivalent |
|-----------|-----|----------------|-------------------|
| Deploy All Contracts | ~5M | ~0.05 tBNB | ~$30 |
| Create Market | ~300k | ~0.003 tBNB | ~$1.80 |
| Place Bet | ~100k | ~0.001 tBNB | ~$0.60 |
| Resolve Market | ~80k | ~0.0008 tBNB | ~$0.48 |

**Total for full test:** ~0.06 tBNB (FREE from faucet!)

---

## 🔧 Troubleshooting

### "Insufficient funds"
→ Get more tBNB from faucet (0.5 tBNB/day)

### "Network timeout"
→ Try alternative RPC:
- https://data-seed-prebsc-2-s1.binance.org:8545/
- https://data-seed-prebsc-1-s2.binance.org:8545/

### "Nonce too high"
→ Reset MetaMask: Settings → Advanced → Reset Account

### "Transaction underpriced"
→ Increase gas price in hardhat.config.js to 15 gwei

### "Cannot find module"
→ Run: `npm install` or `cd contracts && npm install`

---

## 📊 Monitoring

### View Contract on BscScan
```
https://testnet.bscscan.com/address/YOUR_CONTRACT_ADDRESS

Features:
- View transactions
- Read contract state
- Write to contract (if verified)
- View events/logs
- Check token balances
```

### Monitor Transactions
```javascript
// In hardhat console
const tx = await contract.someFunction();
console.log('TX Hash:', tx.hash);
console.log('View:', `https://testnet.bscscan.com/tx/${tx.hash}`);
```

---

## 🎯 Testing Checklist

- [ ] Add BSC Testnet to MetaMask
- [ ] Get 0.5 tBNB from faucet
- [ ] Deploy contracts to testnet
- [ ] Verify contracts on BscScan
- [ ] Update .env.local with addresses
- [ ] Create test market
- [ ] Place test bets
- [ ] Test AI oracle resolution
- [ ] Test claim winnings
- [ ] Share with team for testing

---

## 🔐 Security Reminders

⚠️ **NEVER commit private keys to git!**

```bash
# Safe for testnet (has no real value)
PRIVATE_KEY=0x1234... # Testnet key only

# NEVER for mainnet
PRIVATE_KEY=0xabcd... # ❌ DANGER! Real funds!

# Use .gitignore
echo ".env.local" >> .gitignore
```

---

## 🚀 After Testing

When ready for mainnet:

1. **Get audit** - Smart contract security review
2. **Full testing** - Extensive testnet usage
3. **Community feedback** - Beta testers
4. **Deploy to mainnet** - Use `--network bsc`
5. **Monitor closely** - First 24-48 hours critical

---

## 📞 Support

- **BSC Discord:** https://discord.gg/bnbchain
- **Documentation:** https://docs.bnbchain.org
- **Telegram:** https://t.me/BNBchain
- **Forum:** https://forum.bnbchain.org

---

**BSC Testnet = Real blockchain + FREE testing! 🎉**
