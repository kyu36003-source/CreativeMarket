# CreativeHead Smart Contracts

> Solidity smart contracts for AI-powered prediction markets

## 📋 Overview

This directory contains the smart contracts powering CreativeHead's prediction markets on BNB Chain.

## 🏗️ Contracts

### Core Contracts

#### `PredictionMarket.sol`
**Purpose**: Main prediction market logic
- Create creative markets (logo approvals, music virality, etc.)
- Place predictions with liquidity pooling
- Resolve markets via AI oracle
- Distribute winnings automatically

**Key Functions**:
```solidity
createMarket(question, category, deadline) // Create new market
placePrediction(marketId, outcome, amount)  // Make prediction
resolveMarket(marketId, outcome, evidence)  // AI oracle resolution
claimWinnings(marketId)                     // Claim rewards
```

#### `TraderReputation.sol`
**Purpose**: On-chain reputation system for traders
- Track prediction accuracy
- Calculate trader scores
- Enable copy trading based on reputation
- Reward top performers

**Key Functions**:
```solidity
recordPrediction(trader, marketId, outcome) // Record prediction
updateReputation(trader, wasCorrect)        // Update score
getTraderScore(trader)                      // Get reputation
getTopTraders(count)                        // Leaderboard
```

#### `AIOracle.sol`
**Purpose**: AI-powered market resolution
- Verify creative outcomes
- Store IPFS evidence
- Provide confidence scores
- Handle disputes

**Key Functions**:
```solidity
requestResolution(marketId)                 // Trigger AI analysis
submitResolution(marketId, outcome, proof)  // Submit AI result
disputeResolution(marketId)                 // Challenge outcome
```

#### `GaslessRelayer.sol`
**Purpose**: Gasless transactions for users
- Meta-transaction support
- Sponsored gas fees
- EIP-4337 style abstraction
- Zero-friction onboarding

**Key Functions**:
```solidity
executeMetaTransaction(signature, data)     // Gasless execution
sponsorUser(user)                           // Add to whitelist
```

---

## 🚀 Quick Start

### Installation

```bash
cd contracts
npm install
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/PredictionMarket.test.js

# Run with coverage
npx hardhat coverage

# Run with gas reporter
REPORT_GAS=true npx hardhat test
```

### Deploy to Testnet

```bash
# Set up environment
cp .env.example .env
# Edit .env with your keys

# Deploy to BNB Testnet
npx hardhat run scripts/deploy.js --network bscTestnet

# Verify on BscScan
npx hardhat verify --network bscTestnet DEPLOYED_ADDRESS
```

### Local Development

```bash
# Start local node
npx hardhat node

# Deploy to local network (in another terminal)
npx hardhat run scripts/deploy-local.js --network localhost

# Run test interactions
npx hardhat run scripts/test-interactions.js --network localhost
```

---

## 🧪 Testing

### Test Structure

```
test/
├── PredictionMarket.test.js              # Core market tests
├── PredictionMarket.advanced.test.js     # Advanced scenarios
├── PredictionMarket.comprehensive.test.js # Full coverage
└── TraderReputation.test.js              # Reputation tests
```

### Test Coverage

- ✅ Market creation and validation
- ✅ Prediction placement and liquidity
- ✅ Market resolution (AI oracle)
- ✅ Winnings distribution
- ✅ Reputation tracking
- ✅ Gasless transactions
- ✅ Edge cases and errors
- ✅ Access control

### Running Tests

```bash
# All tests
npm test

# Specific test suite
npx hardhat test test/PredictionMarket.test.js

# Watch mode (for development)
npx hardhat test --watch

# With gas reporting
REPORT_GAS=true npm test
```

### Test Reports

See [TEST_SUMMARY.md](TEST_SUMMARY.md) for detailed test results.

---

## 📦 Deployment

### Networks

#### BNB Testnet (Chain ID: 97)
- **RPC**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **Explorer**: https://testnet.bscscan.com
- **Faucet**: https://www.bnbchain.org/en/testnet-faucet

#### BNB Mainnet (Chain ID: 56)
- **RPC**: https://bsc-dataseed1.binance.org/
- **Explorer**: https://bscscan.com

### Deployment Script

```javascript
// scripts/deploy.js
async function main() {
  // 1. Deploy PredictionMarket
  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
  const market = await PredictionMarket.deploy();
  await market.deployed();
  
  // 2. Deploy TraderReputation
  const TraderReputation = await ethers.getContractFactory("TraderReputation");
  const reputation = await TraderReputation.deploy(market.address);
  
  // 3. Deploy AIOracle
  const AIOracle = await ethers.getContractFactory("AIOracle");
  const oracle = await AIOracle.deploy(market.address);
  
  // 4. Deploy GaslessRelayer
  const GaslessRelayer = await ethers.getContractFactory("GaslessRelayer");
  const relayer = await GaslessRelayer.deploy(market.address);
  
  console.log("Deployed contracts:");
  console.log("- PredictionMarket:", market.address);
  console.log("- TraderReputation:", reputation.address);
  console.log("- AIOracle:", oracle.address);
  console.log("- GaslessRelayer:", relayer.address);
}
```

### Deployment Commands

```bash
# Testnet
npm run deploy:testnet

# Mainnet (use with caution)
npm run deploy:mainnet

# Local
npx hardhat run scripts/deploy-local.js --network localhost
```

---

## 🔧 Configuration

### Hardhat Config

```javascript
// hardhat.config.js
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 97
    },
    bsc: {
      url: process.env.BSC_MAINNET_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 56
    }
  }
};
```

### Environment Variables

```bash
# .env
PRIVATE_KEY=your_wallet_private_key
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
BSC_MAINNET_RPC=https://bsc-dataseed1.binance.org/
BSCSCAN_API_KEY=your_bscscan_api_key
```

---

## 📊 Gas Optimization

### Current Gas Costs (Testnet)

| Function | Gas Used | Cost (BNB @ 3 Gwei) |
|----------|----------|---------------------|
| Create Market | ~150,000 | ~0.00045 BNB |
| Place Prediction | ~100,000 | ~0.0003 BNB |
| Resolve Market | ~80,000 | ~0.00024 BNB |
| Claim Winnings | ~60,000 | ~0.00018 BNB |

### Optimization Techniques

1. **Packed Storage**: Using `uint96` instead of `uint256` where possible
2. **Batch Operations**: Combine multiple calls
3. **Efficient Loops**: Minimize storage reads
4. **Events Over Storage**: Use events for historical data

---

## 🔐 Security

### Audit Checklist

- ✅ Reentrancy guards on all external calls
- ✅ Access control with OpenZeppelin Ownable
- ✅ Input validation on all functions
- ✅ SafeMath operations (Solidity 0.8+)
- ✅ No delegatecall vulnerabilities
- ✅ Proper event emissions
- ✅ Tested edge cases

### Security Best Practices

- Use OpenZeppelin contracts
- Follow Checks-Effects-Interactions pattern
- Implement circuit breakers for emergencies
- Regular security audits
- Bug bounty program

---

## 📝 Contract ABIs

ABIs are generated after compilation:
```
artifacts/contracts/PredictionMarket.sol/PredictionMarket.json
artifacts/contracts/TraderReputation.sol/TraderReputation.json
artifacts/contracts/AIOracle.sol/AIOracle.json
artifacts/contracts/GaslessRelayer.sol/GaslessRelayer.json
```

Import in frontend:
```typescript
import PredictionMarketABI from '@/contracts/artifacts/contracts/PredictionMarket.sol/PredictionMarket.json';
```

---

## 🛠️ Development Tools

### Hardhat Commands

```bash
npx hardhat compile          # Compile contracts
npx hardhat test             # Run tests
npx hardhat node             # Start local node
npx hardhat clean            # Clean artifacts
npx hardhat size-contracts   # Check contract sizes
npx hardhat coverage         # Test coverage
```

### Useful Scripts

```bash
npm run compile              # Compile contracts
npm run test                 # Run all tests
npm run deploy:testnet       # Deploy to testnet
npm run deploy:mainnet       # Deploy to mainnet
```

---

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [BNB Chain Documentation](https://docs.bnbchain.org/)

---

## 🐛 Troubleshooting

### Common Issues

**Problem**: Nonce too low error
```bash
# Solution: Reset Hardhat network
npx hardhat clean
rm -rf cache artifacts
```

**Problem**: Gas estimation failed
```bash
# Solution: Check contract state and inputs
npx hardhat console --network bscTestnet
```

**Problem**: Contract verification fails
```bash
# Solution: Ensure exact compiler settings
npx hardhat verify --network bscTestnet ADDRESS --constructor-args args.js
```

---

## 📞 Support

- **Issues**: Check [../docs/fixes/](../docs/fixes/)
- **Questions**: See [../docs/guides/](../docs/guides/)
- **Contributing**: Read [../CONTRIBUTING.md](../CONTRIBUTING.md)

---

## 📜 License

Apache License 2.0 - Built for Seedify Hackathon 2025

See [LICENSE](../LICENSE) for full details.

---

**Last Updated**: October 2025  
**Solidity Version**: 0.8.19  
**Network**: BNB Chain (Testnet & Mainnet)
