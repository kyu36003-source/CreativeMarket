# 🚀 PredictBNB Deployment Guide

## Prerequisites

Before deploying to BSC Testnet, ensure you have:

1. **MetaMask Wallet** with BSC Testnet configured
2. **Test BNB** in your wallet (get from [BSC Testnet Faucet](https://testnet.bnbchain.org/faucet-smart))
3. **BscScan API Key** (get from [BscScan](https://bscscan.com/myapikey))

---

## Quick Start

### 1. Configure Environment Variables

Edit `contracts/.env` and add:

```bash
# Your wallet private key (from MetaMask)
PRIVATE_KEY=your_private_key_here

# Your BscScan API key
BSCSCAN_API_KEY=your_api_key_here
```

**⚠️ SECURITY WARNING:**
- NEVER share your private key
- NEVER commit `.env` to git
- Use a separate wallet for development/testing

---

### 2. Get Test BNB

1. Go to [BSC Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
2. Connect your MetaMask wallet
3. Request test BNB (you'll need ~0.5 BNB for deployment)

---

### 3. Deploy to BSC Testnet

From the project root:

```bash
npm run deploy:testnet
```

Or from the contracts directory:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network bscTestnet
```

---

## Deployment Output

You should see output like:

```
Deploying PredictBNB to BSC Testnet...

Deploying contracts with account: 0x1234...5678
Account balance: 10.0 BNB

Deploying PredictionMarket...
PredictionMarket deployed to: 0xABCD...1234
Gas used: 2,500,000

Deploying AIOracle...
AIOracle deployed to: 0xEFGH...5678
Gas used: 1,800,000

Authorizing AIOracle...
✅ AIOracle authorized

Deployment Summary:
- PredictionMarket: 0xABCD...1234
- AIOracle: 0xEFGH...5678
- Network: BSC Testnet (97)
- Deployer: 0x1234...5678
```

**Save these contract addresses!** You'll need them for:
- Frontend configuration
- Contract verification
- Testing

---

## Verify Contracts on BscScan

After deployment, verify your contracts:

```bash
cd contracts

# Verify PredictionMarket
npx hardhat verify --network bscTestnet <PREDICTION_MARKET_ADDRESS> <OWNER_ADDRESS>

# Verify AIOracle
npx hardhat verify --network bscTestnet <AI_ORACLE_ADDRESS> <PREDICTION_MARKET_ADDRESS>
```

Example:
```bash
npx hardhat verify --network bscTestnet 0xABCD...1234 0x1234...5678
npx hardhat verify --network bscTestnet 0xEFGH...5678 0xABCD...1234
```

---

## Update Frontend Configuration

After deployment, update the frontend with your contract addresses:

### 1. Update Contract Addresses

Edit `src/lib/contracts/addresses.ts`:

```typescript
export const CONTRACTS = {
  PREDICTION_MARKET: '0xYOUR_PREDICTION_MARKET_ADDRESS',
  AI_ORACLE: '0xYOUR_AI_ORACLE_ADDRESS',
} as const;

export const NETWORK_CONFIG = {
  chainId: 97, // BSC Testnet
  name: 'BSC Testnet',
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  blockExplorer: 'https://testnet.bscscan.com',
} as const;
```

### 2. Test Frontend Connection

```bash
npm run dev
```

Visit `http://localhost:3000` and:
1. Connect your MetaMask wallet
2. Switch to BSC Testnet
3. Try creating a test market
4. Place a test bet

---

## Troubleshooting

### Error: "insufficient funds"

**Solution:** Get more test BNB from the [faucet](https://testnet.bnbchain.org/faucet-smart)

### Error: "invalid private key"

**Solution:** 
1. Export your private key from MetaMask:
   - Click account icon → Account Details → Export Private Key
2. Copy the key (without 0x prefix if present)
3. Paste into `.env` file

### Error: "network not found"

**Solution:** Check that BSC Testnet is configured in `hardhat.config.js`:
```javascript
bscTestnet: {
  url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  chainId: 97,
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
}
```

### Error: "cannot verify contract"

**Solution:**
1. Ensure `BSCSCAN_API_KEY` is set in `.env`
2. Wait ~30 seconds after deployment before verifying
3. Use correct constructor arguments

---

## Post-Deployment Testing

### 1. Test on BscScan

Visit your contract on [BscScan Testnet](https://testnet.bscscan.com):

```
https://testnet.bscscan.com/address/<YOUR_CONTRACT_ADDRESS>
```

Try these functions:
- `createMarket()` - Create a test market
- `buyPosition()` - Place a bet (send test BNB)
- `getMarketOdds()` - Check odds
- `markets()` - View market details

### 2. Test with Frontend

1. Start development server: `npm run dev`
2. Connect MetaMask to BSC Testnet
3. Create a test market
4. Place bets with multiple accounts
5. Simulate market resolution

### 3. Test Oracle Resolution

```bash
cd contracts
npx hardhat console --network bscTestnet
```

Then in the console:
```javascript
const market = await ethers.getContractAt("PredictionMarket", "YOUR_ADDRESS");
await market.resolveMarket(1, true); // Resolve market 1 to YES
```

---

## Deployment Checklist

Before deploying to mainnet:

- [ ] All tests passing (38/38 ✅)
- [ ] Testnet deployment successful
- [ ] Contracts verified on BscScan
- [ ] Frontend integration tested
- [ ] Multiple test transactions completed
- [ ] Oracle resolution tested
- [ ] Winnings claiming tested
- [ ] Fee withdrawal tested
- [ ] Security audit completed (recommended)
- [ ] Emergency procedures documented
- [ ] Monitoring setup ready

---

## Mainnet Deployment

⚠️ **WARNING:** Only deploy to mainnet after thorough testing!

### Prerequisites

1. Real BNB in your wallet (~2 BNB for deployment + gas)
2. Security audit completed
3. All testnet testing successful
4. Team approval

### Deploy to Mainnet

```bash
npm run deploy:mainnet
```

Or:
```bash
cd contracts
npx hardhat run scripts/deploy.js --network bsc
```

### Mainnet Verification

```bash
npx hardhat verify --network bsc <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## Gas Cost Estimates

Based on testing (gas price: 5 gwei, BNB: $600):

| Operation | Gas | BNB Cost | USD Cost |
|-----------|-----|----------|----------|
| Deploy PredictionMarket | ~2,500,000 | ~0.0125 | ~$7.50 |
| Deploy AIOracle | ~1,800,000 | ~0.009 | ~$5.40 |
| Create Market | ~195,000 | ~0.001 | ~$0.58 |
| Buy Position | ~77,000 | ~0.0004 | ~$0.23 |
| Resolve Market | ~77,000 | ~0.0004 | ~$0.23 |
| Claim Winnings | ~65,000 | ~0.0003 | ~$0.19 |

**Total Deployment Cost:** ~0.02 BNB (~$12-15)

---

## Network Information

### BSC Testnet
- **Chain ID:** 97
- **RPC URL:** https://data-seed-prebsc-1-s1.binance.org:8545/
- **Explorer:** https://testnet.bscscan.com
- **Faucet:** https://testnet.bnbchain.org/faucet-smart
- **Symbol:** tBNB

### BSC Mainnet
- **Chain ID:** 56
- **RPC URL:** https://bsc-dataseed.binance.org/
- **Explorer:** https://bscscan.com
- **Symbol:** BNB

---

## Support & Resources

### Documentation
- [Hardhat Docs](https://hardhat.org/docs)
- [BNB Chain Docs](https://docs.bnbchain.org/)
- [BscScan API](https://docs.bscscan.com/)

### Community
- [BNB Chain Discord](https://discord.gg/bnbchain)
- [Hardhat Discord](https://discord.gg/hardhat)

### Tools
- [BSC Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
- [BscScan Testnet](https://testnet.bscscan.com)
- [MetaMask](https://metamask.io/)
- [Hardhat](https://hardhat.org/)

---

## Next Steps After Deployment

1. **Update Frontend**
   - Configure contract addresses
   - Test all user flows
   - Deploy frontend to Vercel/Netlify

2. **Set Up Monitoring**
   - Monitor contract events
   - Track gas usage
   - Set up alerts

3. **Marketing & Launch**
   - Announce on social media
   - Create tutorial videos
   - Build community

4. **Continuous Improvement**
   - Gather user feedback
   - Monitor for issues
   - Plan future upgrades

---

**Good luck with your deployment! 🚀**

For questions or issues, refer to the test documentation or check the contract code.
