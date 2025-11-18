# 🎯 DEMO QUICK REFERENCE CARD

## Pre-Demo Checklist (2 minutes before)
```bash
# Terminal 1: Start Hardhat
cd /home/gen-g/Documents/CreativeHead/someCreativity/contracts
npm exec hardhat node

# Terminal 2: Start Frontend  
cd /home/gen-g/Documents/CreativeHead/someCreativity
npm run dev
```

## URLs to Open
- Homepage: `http://localhost:3000`
- Markets: `http://localhost:3000/markets`
- Market Detail: `http://localhost:3000/markets/1`
- Create Market: `http://localhost:3000/create`
- Leaderboard: `http://localhost:3000/leaderboard`
- Creative Markets: `http://localhost:3000/creative-markets`
- AI Oracle: `http://localhost:3000/admin/oracle`

## Contract Addresses (Localhost)
- PredictionMarket: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- AIOracle: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- GaslessRelayer: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`

## Key Numbers to Mention
- **4** Smart Contracts deployed
- **5** Unique Features (AI, Reputation, Gasless, Creative, Copy Trading)
- **$500M+** Market size
- **ZERO** gas fees for users
- **2.25 ETH** in Market #1 pool

## Demo Flow (6 minutes)
1. **Hook** (30s) - Problem & Solution
2. **User Flow** (2m) - Connect wallet → Place bet → Show transaction modal
3. **Features** (2.5m) - AI Oracle, Reputation, Creative, Gasless, Copy Trading
4. **Technical** (1m) - Smart contracts, tests
5. **Close** (30s) - Impact statement

## Transaction Modal - YOUR KILLER FEATURE!
When placing a bet, point out:
- ✅ Real-time status updates
- ✅ Transaction hash display
- ✅ Copy button
- ✅ Block explorer link
- ✅ Smooth animations
- ✅ Error handling

## Backup Commands (If needed)
```bash
# Check markets
cd contracts
npx hardhat console --network localhost

# In console:
const market = await ethers.getContractAt("PredictionMarket", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
const count = await market.marketCount();
console.log("Markets:", count.toString());

# Check contract balance
const balance = await ethers.provider.getBalance("0x5FbDB2315678afecb367f032d93F642f64180aa3");
console.log("Pool:", ethers.formatEther(balance));
```

## If Something Breaks
- **Stay calm** - "This is blockchain, real finality matters"
- **Show code** - Open the smart contracts
- **Explain architecture** - Draw on whiteboard
- **Have screenshots** - Backup visuals ready

## Closing Lines
"This isn't a prototype. This is ready for users TODAY. The prediction market space is $500M and growing. We're building the FUTURE of decentralized predictions. Thank you!"

## Questions You Might Get

**Q: How is this different from Polymarket?**
A: We have AI oracles for automatic resolution, gasless transactions for mass adoption, on-chain reputation as tradeable NFTs, and creative markets for the creator economy.

**Q: How do gasless transactions work?**
A: Our GaslessRelayer contract acts as a meta-transaction relayer. Users sign messages off-chain, and we submit transactions on their behalf, subsidizing gas costs.

**Q: How does the AI Oracle work?**
A: The AIOracle contract can fetch data from HuggingFace models or other APIs, analyze outcomes, and resolve markets automatically with full on-chain auditability.

**Q: What's the business model?**
A: 2% platform fee on winning positions. With $500M market size and 2% fee, that's $10M potential revenue. Plus premium features for traders.

**Q: How do you ensure AI Oracle accuracy?**
A: Multiple verification layers, dispute periods, and manual override capabilities. Plus, the AI decision-making process is fully auditable on-chain.

**Q: Security audits?**
A: Comprehensive test coverage (show test results), OpenZeppelin battle-tested libraries, and ready for professional audit before mainnet launch.

---

**YOU'VE GOT THIS! 🚀 GO WIN!**
