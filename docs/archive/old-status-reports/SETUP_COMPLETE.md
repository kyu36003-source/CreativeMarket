# ✅ Setup Complete - Ready for Demo!

## 🎯 Current Status

### ✅ What's Working:
1. **Hardhat Node:** Running with Chain ID 97 (BSC Testnet)
2. **Smart Contracts:** Deployed with test markets
3. **Frontend:** Configured to connect to Chain ID 97
4. **Test Data:** 3 markets with existing bets

---

## 📋 Contract Addresses

```
PredictionMarket: 0x5FbDB2315678afecb367f032d93F642f64180aa3
AIOracle:         0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
GaslessRelayer:   0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

---

## 🔧 MetaMask Setup (CRITICAL!)

### Step 1: Add Custom Network

Click **Add Network** in MetaMask and enter these EXACT values:

```
Network Name:    BSC Testnet (Local)
RPC URL:         http://127.0.0.1:8545
Chain ID:        97
Currency Symbol: BNB
Block Explorer:  (leave empty)
```

**⚠️ IMPORTANT:** Chain ID MUST be **97** (not 1337, not 31337)

### Step 2: Import Test Account

1. Click account icon → **Import Account**
2. Select **Private Key**
3. Paste this private key:
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
4. Click **Import**

This account has **~10,000 ETH** (displayed as BNB in your network)

### Step 3: Switch Network

1. Click network dropdown at top
2. Select **"BSC Testnet (Local)"**
3. You should see your balance: **9999.99 BNB**

---

## 🧪 Test Markets Available

### Market #1: Bitcoin Price Prediction
- **Question:** "Will Bitcoin reach $100,000 by 2024?"
- **Pool:** 2.25 ETH
- **Odds:** 77.77% YES / 22.22% NO
- **Status:** Active

### Market #2: AGI Prediction  
- **Question:** "Will AGI be achieved by 2025?"
- **Pool:** 0.50 ETH
- **Status:** Active

### Market #3: Quick Test Market
- **Pool:** 0.30 ETH
- **Status:** Active (ends in 1 minute)

---

## 🚀 How to Test Betting

1. **Refresh your browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Connect MetaMask** - Click "Connect Wallet" button
3. **Navigate to any market** - Click on a market card
4. **Place a bet:**
   - Click on **YES** or **NO**
   - Enter amount (e.g., `0.1`)
   - Click **"Place Bet"**
5. **MetaMask popup should appear** - Click **Confirm**
6. **Wait for confirmation** - Transaction should complete in ~3 seconds
7. **See pool update** - Market odds will recalculate automatically

---

## 🐛 Troubleshooting

### Issue: MetaMask shows "0 ETH" balance
**Solution:** You're connected to the wrong network
- Switch to "BSC Testnet (Local)" with Chain ID **97**

### Issue: "Nothing happens" when clicking Place Bet
**Solutions:**
1. Make sure MetaMask is connected to Chain ID **97**
2. Refresh browser with Ctrl+Shift+R
3. Check browser console for errors (F12)

### Issue: Markets not loading
**Solutions:**
1. Check Hardhat node is running: `ps aux | grep hardhat`
2. Test RPC: `curl http://127.0.0.1:8545`
3. Verify Chain ID: Should return **0x61** (which is 97 in decimal)

### Issue: Transaction fails
**Solutions:**
1. Make sure you have enough balance (at least 0.01 BNB + gas)
2. Try a smaller bet amount
3. Check Hardhat terminal for error messages

---

## 🔍 Verification Commands

### Check if Hardhat is running:
```bash
ps aux | grep "hardhat node"
```

### Check Chain ID:
```bash
curl -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```
Should return: `{"jsonrpc":"2.0","id":1,"result":"0x61"}`

### Check account balance:
```bash
curl -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","latest"],"id":1}'
```

---

## 🎬 Demo Flow

1. **Show Homepage** - 3 markets with real data
2. **Click on Market #1** - Show detailed view
3. **Connect MetaMask** - Show wallet connection
4. **Place a bet** - Enter 0.1 BNB on YES
5. **Approve transaction** - MetaMask popup
6. **Wait for confirmation** - ~3 seconds
7. **Show updated pool** - Odds recalculate
8. **Show transaction in Hardhat logs** - Terminal output

---

## 📝 Key Changes Made

### 1. Fixed ABI Format
- Changed from human-readable strings to JSON objects
- Changed `placeBet` to `buyPosition` (matches contract)

### 2. Updated Chain ID Support
- Changed from Chain ID 31337 to 97
- Updated web3-config.ts with custom localhost chain
- Updated all contract addresses for Chain ID 97

### 3. Updated Contract Hooks
- Default to Chain ID 97 instead of 31337
- Added proper error handling

---

## ✅ Pre-Demo Checklist

- [ ] Hardhat node running (`ps aux | grep hardhat`)
- [ ] MetaMask connected to Chain ID **97**
- [ ] Test account imported (should show ~9999 BNB)
- [ ] Frontend loaded (localhost:3000)
- [ ] Browser refreshed (Ctrl+Shift+R)
- [ ] Can see 3 markets on homepage
- [ ] Can click and view market details
- [ ] Can connect wallet successfully

---

## 🎉 You're Ready!

Everything is configured for BSC Testnet (Chain ID 97). Your local Hardhat node is running as a BSC Testnet simulator with all contracts deployed and test markets created.

**Next Step:** Refresh your browser and try placing a bet!
