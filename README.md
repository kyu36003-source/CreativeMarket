# PredictBNB

**First gasless prediction market. x402 protocol on BNB Chain. 0 gas fees, forever.**

17/17 tests passing. 18 live markets. $10-100 saved per 100-1000 bets. 42% gas savings with batching.

[![Built for Seedify Hackathon](https://img.shields.io/badge/Seedify-Hackathon%202025-orange)](https://seedify.fund)
[![BNB Chain Exclusive](https://img.shields.io/badge/BNB%20Chain-EXCLUSIVE-yellow?style=for-the-badge&logo=binance)](https://www.bnbchain.org)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Demo Live](https://img.shields.io/badge/Demo-Live-green?style=for-the-badge)](https://creative-market-six.vercel.app/)

---

## Core Tech

**x402 Protocol (Gasless On-Chain):**
- **You:** Sign authorization (free)
- **Facilitator:** Pays $0.10 gas to execute on-chain
- **Facilitator:** Earns 0.5% fee per transaction
- **Result:** You pay 0 gas, everything recorded on BNB Chain

**Why BNB Chain?** Facilitator pays $0.10 gas, earns 0.5% fee → profitable with volume. On Ethereum, $5-20 gas would kill this model.

**Batch Processing (42% Gas Savings):**
- Single transaction: 28,930 gas (~$0.052)
- Batch of 3: 16,730 gas/bet (~$0.030)
- **Facilitator profit:** $0.030 gas + $0.05 fee (0.5% of $10 bet) = $0.02 net profit/bet
- **At scale (1000 bets):** $30 gas vs $52 gas = $22 saved with batching
- See [batch test results](contracts/test/test-x402-batch.js) - 5/5 tests passing

**On-Chain Everything:**
- Reputation: TraderReputation.sol (+10/bet, +20/win)
- Markets: PredictionMarket.sol (18 active)
- Gasless Handler: X402BettingBNB.sol (WBNB3009 + EIP-3009 + batching)

**Tests:** 12/12 gasless + 5/5 batching = 17/17 passing (100%). [See proof](contracts/test/test-wbnb-gasless.js)

---

## Gas Savings (Real Numbers)

| Bets | Traditional Cost | x402 Cost | Savings |
|------|-----------------|-----------|----------|
| 10   | 0.00032 BNB ($0.10) | 0 BNB | $0.10 |
| 100  | 0.0032 BNB ($1) | 0 BNB | $1 |
| 1000 | 0.032 BNB ($10) | 0 BNB | $10 |

## Reputation System

**TraderReputation.sol** (on-chain, immutable):
- First bet: +100 points
- Per bet: +10 points
- Per win: +20 bonus
- Create markets: Requires 50 reputation (anti-spam)

## Features

**✅ Live (17/17 tests passing):**
- x402 gasless betting (WBNB3009 + X402BettingBNB.sol)
- Batch processing: 42% gas savings for facilitators
- 18 active markets (crypto, DeFi, entertainment)
- On-chain reputation system (TraderReputation.sol)
- 50+ market templates

**🚧 In Development:**
- AI oracle: 3-LLM consensus (DeepSeek-V3, Llama 3.3, Qwen 2.5)
- Copy trading: Follow top traders
- Target: 30min resolution, 95% accuracy

**Market Rules (Required):**
- Data source specified (CoinGecko, DeFiLlama, Billboard)
- UTC deadline (no ambiguity)
- Objective criteria (verifiable on-chain)



## Quick Start

Get it running locally in 2 minutes:

1. **Add BNB Chain to MetaMask** (happens automatically when you connect)
2. **Get testnet BNB** from the [BNB Faucet](https://www.bnbchain.org/en/testnet-faucet)
3. **Clone and install**:
   ```bash
   git clone [repo-url]
   cd CreativeMarket
   npm install
   ```
4. **Start dev server**:
   ```bash
   npm run dev
   ```
5. **Open** `http://localhost:3000`

Note: This only works on BNB Chain (testnet ID 97, mainnet ID 56). Everything on-chain, everything on BNB.

---

## How It Works

**Create Market:** Category → Template → Rules (data source + UTC deadline) → Submitted on-chain  
**Place Bet:** Connect wallet → x402 gasless (0 gas) → Executed on-chain  
**Resolution:** Check data source at deadline → 2/3 LLM agreement → On-chain resolution  
**Claim:** Winners claim on-chain (0 gas)

---

**Crypto/DeFi (12):** BTC $150K, ETH $6K, Aave TVL, Uniswap volume  
**NFT/Gaming (2):** Azuki floor, Illuvium users  
**Entertainment (4):** Beyoncé album, Drake #1, Dune 3, Taylor Swift

*All markets: Specified data source + UTC deadline + objective criteria*

---

## Tech Stack

**Frontend:** Next.js 14, TypeScript, Wagmi v2, RainbowKit  
**Contracts:** Solidity 0.8.x, Hardhat, OpenZeppelin, EIP-3009  
**Blockchain:** BNB Chain (Testnet 97, Mainnet 56)  
**Gasless:** WBNB3009 + X402BettingBNB.sol  
**AI:** DeepSeek-V3, Llama 3.3, Qwen 2.5 (in dev)  
**Hosting:** Vercel, GitHub Actions

---

## Project Structure

```
PredictBNB/
├── src/app/              Next.js 14 pages
├── src/components/       React components
├── src/hooks/            Custom Web3 hooks
├── contracts/            5 Solidity contracts
│   ├── PredictionMarket.sol      # Core betting logic
│   ├── WBNB3009.sol              # Wrapped BNB (EIP-3009)
│   ├── X402BettingBNB.sol        # x402 gasless handler
│   ├── AIOracle.sol              # AI resolution (in dev)
│   └── TraderReputation.sol      # On-chain reputation
├── contracts/test/       Test suite (17/17 passing)
├── docs/                 Complete documentation
└── scripts/              Utility scripts
```

**Status:** 5 contracts, 17/17 tests (12 gasless + 5 batching), 18 markets, 50+ templates

## Deployed Contracts

```
PredictionMarket:   0x998abeb3E57409262aE5b751f60747921B33613E
WBNB3009:          0x70e0bA845a1A0F2DA3359C97E0285013525FFC49
X402BettingBNB:    0x4826533B4897376654Bb4d4AD88B7faFD0C98528
```

**Tests:** 17/17 passing (100%). See [gasless test](contracts/test/test-wbnb-gasless.js) and [batch test](contracts/test/test-x402-batch.js)

---

## Development

**Setup:**
```bash
npm install
cd contracts && npm install && cd ..
cp .env.local.example .env.local
# Edit .env.local with your values
npm run dev
```

**Test gasless betting:**
```bash
cd contracts
npx hardhat node  # Terminal 1
npx hardhat run scripts/deploy-wbnb-solution.js --network localhost  # Terminal 2
node test/test-wbnb-gasless.js  # 12/12 tests
node test/test-x402-batch.js     # 5/5 batch tests (42% gas savings)
```

---

## Links

**Try it:** [Live Demo](https://creative-market-six.vercel.app)  
**Code:** [GitHub](https://github.com/kyu36003-source/CreativeMarket)  
**Need testnet BNB:** [Faucet](https://www.bnbchain.org/en/testnet-faucet)

**Docs:**
- [WBNB3009 Solution](contracts/docs/X402_PURE_BNB_SOLUTION.md) - How gasless betting works (12/12 tests passing)
- [Quick Start](QUICKSTART.md) - Get running in 5 minutes
- [Contributing](CONTRIBUTING.md) - Want to help build this?

**Issues/Questions:** Open an issue on GitHub

---

**Built for Seedify Hackathon 2025** • **BNB Chain Exclusive** • **Apache 2.0 License**
