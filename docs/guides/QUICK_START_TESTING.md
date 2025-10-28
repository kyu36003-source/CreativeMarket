# 🚀 Quick Start: Local Blockchain Testing

## ✅ Status Summary

**What We've Completed:**
- ✅ Contracts compiled successfully  
- ✅ All 24 unit tests passing
- ✅ Dependencies installed
- ✅ OpenZeppelin imports fixed for v5

## 🎯 Next: Test Locally (Step-by-Step)

### Step 1: Start Blockchain Node (Terminal 1)

Open Terminal 1 and run:

```bash
cd /home/gen-g/Documents/CreativeHead/someCreativity/contracts
npx hardhat node
```

**What to expect:**
- Server starts at http://127.0.0.1:8545
- Shows 10 test accounts with 10000 ETH each
- Keep this terminal running (don't close it!)

**Example Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

### Step 2: Deploy Contracts (Terminal 2)

Open a **NEW terminal** (Terminal 2) and run:

```bash
cd /home/gen-g/Documents/CreativeHead/someCreativity/contracts
npx hardhat run scripts/deploy-local.js --network localhost
```

**What happens:**
- Deploys PredictionMarket, AIOracle, and GaslessRelayer contracts
- Configures permissions
- Creates 3 sample markets
- Places test bets
- Shows contract addresses

**Save the contract addresses** from the output!

### Step 3: Test Interactions (Terminal 3 - Optional)

Open a **third terminal** for testing:

```bash
cd /home/gen-g/Documents/CreativeHead/someCreativity/contracts
npx hardhat console --network localhost
```

Example interactions in console:

```javascript
// Get contract instance (use address from your deployment)
const pm = await ethers.getContractAt(
  "PredictionMarket", 
  "0x5FbDB2315678afecb367f032d93F642f64180aa3" // Replace with your address
);

// Check market count
const count = await pm.marketCount();
console.log("Total markets:", count.toString());

// Get market details
const market = await pm.markets(1);
console.log("Market 1:", market);

// Get market odds
const [yes, no] = await pm.getMarketOdds(1);
console.log(`YES: ${yes/100}%, NO: ${no/100}%`);

// Get all market IDs
const ids = await pm.getAllMarkets();
console.log("Market IDs:", ids.map(n => n.toString()));

// Place a bet
const [signer] = await ethers.getSigners();
await pm.buyPosition(1, true, { value: ethers.parseEther("1.0") });
console.log("Bet placed!");
```

## 📱 Frontend Integration

### 1. Update Environment Variables

Create or update `.env.local` in project root:

```bash
# Use addresses from your deployment
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_AI_ORACLE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# Local network
NEXT_PUBLIC_BSC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_DEFAULT_CHAIN_ID=31337
```

### 2. Configure MetaMask

Add Local Network in MetaMask:
- **Network Name:** Localhost 8545
- **RPC URL:** http://127.0.0.1:8545
- **Chain ID:** 31337
- **Currency Symbol:** ETH

### 3. Import Test Account

Copy a private key from Terminal 1 and import to MetaMask:
```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

⚠️ **WARNING:** Only use test accounts! Never use real funds!

### 4. Start Frontend

```bash
cd /home/gen-g/Documents/CreativeHead/someCreativity
npm run dev
```

Visit: http://localhost:3000

## 🧪 Common Test Scenarios

### Scenario 1: View Market Data

```javascript
// In Hardhat console
const pm = await ethers.getContractAt("PredictionMarket", "YOUR_ADDRESS");

// Get all markets
const count = await pm.marketCount();
for (let i = 1; i <= count; i++) {
  const market = await pm.markets(i);
  console.log(`\nMarket ${i}:`);
  console.log("  Question:", market.question);
  console.log("  Category:", market.category);
  console.log("  Total YES:", ethers.formatEther(market.totalYesAmount), "ETH");
  console.log("  Total NO:", ethers.formatEther(market.totalNoAmount), "ETH");
}
```

### Scenario 2: Place Multiple Bets

```javascript
const [owner, oracle, u1, u2, u3] = await ethers.getSigners();

// User 1 bets YES
await pm.connect(u1).buyPosition(1, true, {
  value: ethers.parseEther("2.0")
});

// User 2 bets NO
await pm.connect(u2).buyPosition(1, false, {
  value: ethers.parseEther("1.5")
});

// Check updated odds
const [yes, no] = await pm.getMarketOdds(1);
console.log(`Updated odds - YES: ${yes/100}%, NO: ${no/100}%`);
```

### Scenario 3: Resolve Market & Claim

```javascript
// Fast forward time (for markets that haven't ended)
await network.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // +7 days
await network.provider.send("evm_mine");

// Resolve market (needs authorized oracle)
await pm.resolveMarket(1, true); // YES wins

// Calculate winnings
const [owner, oracle, u1] = await ethers.getSigners();
const winnings = await pm.calculateWinnings(1, u1.address);
console.log("User1 winnings:", ethers.formatEther(winnings), "ETH");

// Claim winnings
await pm.connect(u1).claimWinnings(1);
console.log("Winnings claimed!");
```

## 🔄 Restart Process

If you need to restart:

1. **Stop the node** in Terminal 1: `Ctrl+C`
2. **Restart node:** `npx hardhat node`
3. **Redeploy contracts** in Terminal 2
4. **Reset MetaMask:** Settings → Advanced → Clear activity tab data

## ✨ Summary of What's Working

- ✅ **Smart Contracts:** All compiled and tested
- ✅ **Unit Tests:** 24 tests passing
- ✅ **Local Blockchain:** Ready to start with `npx hardhat node`
- ✅ **Deployment Script:** Creates 3 sample markets with bets
- ✅ **Test Accounts:** 10 accounts with 10000 ETH each
- ✅ **Documentation:** Complete guides created

## 📚 Available Documentation

- `LOCAL_TESTING_GUIDE.md` - Comprehensive testing guide
- `API_IMPLEMENTATION_GUIDE.md` - API specs for frontend
- `REFACTORING_SUMMARY.md` - Summary of static content removal
- `QUICK_START_TESTING.md` - This file!

## 🎯 Next Steps

1. **Start the local blockchain** (Terminal 1)
2. **Deploy contracts** (Terminal 2)
3. **Test interactions** via Hardhat console
4. **Connect frontend** with MetaMask
5. **Deploy to testnet** when ready: `npm run deploy:testnet`

## 🐛 Troubleshooting

**Node won't start:**
- Check if port 8545 is already in use
- Try: `lsof -i :8545` and kill the process

**Deployment fails:**
- Make sure node is running in Terminal 1
- Check you're using `--network localhost`

**MetaMask errors:**
- Clear activity tab data in settings
- Make sure you're on Localhost 8545 network
- Check you imported a test account

**Frontend can't connect:**
- Verify contract addresses in `.env.local`
- Verify RPC URL is http://127.0.0.1:8545
- Check MetaMask is on correct network

## 🎉 Success!

You now have a fully functional local blockchain environment for testing PredictBNB!

Start with Terminal 1, then Terminal 2, and you're ready to test! 🚀
