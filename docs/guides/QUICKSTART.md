# 🎉 Quick Start Guide

Welcome to **PredictBNB**! Get up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- MetaMask or compatible Web3 wallet
- Git

## Installation

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/predictbnb.git
cd predictbnb

# Run automated setup
npm run setup

# Start development server
npm run dev
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your API keys
nano .env.local  # or use your preferred editor

# Start development server
npm run dev
```

## Configuration

### 1. Get WalletConnect Project ID

1. Go to https://cloud.walletconnect.com/
2. Create a new project
3. Copy the Project ID
4. Add to `.env.local`: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id`

### 2. (Optional) Add API Keys for AI Features

```env
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
NEXT_PUBLIC_COINGECKO_API_KEY=CG-...
```

### 3. Get BNB Testnet Tokens

1. Visit https://testnet.bnbchain.org/faucet-smart
2. Connect your wallet
3. Request testnet BNB
4. Use for testing predictions

## Usage

### Browse Markets

```bash
npm run dev
# Open http://localhost:3000
```

1. Connect your wallet (top right)
2. Browse available prediction markets
3. Click on any market to see details

### Make a Prediction

1. Click "Make Prediction" on any market
2. Choose YES or NO
3. Enter investment amount (minimum 0.01 BNB)
4. View AI analysis (confidence score & factors)
5. Click "Confirm Prediction"
6. Approve gasless transaction (no gas fees!)

### View Your Positions

1. Click your wallet address (top right)
2. Select "My Positions" from dropdown
3. View all active predictions
4. See potential winnings

## Smart Contract Deployment

### Deploy to BSC Testnet

```bash
# Install contract dependencies
npm run contracts:install

# Compile contracts
npm run contracts:compile

# Add your deployer private key to .env.local
echo "PRIVATE_KEY=your_private_key" >> .env.local

# Deploy to testnet
npm run contracts:deploy:testnet
```

### Update Frontend with Contract Addresses

After deployment, update `src/lib/contracts/addresses.ts` with your deployed contract addresses.

## Testing

### Run Frontend Tests

```bash
npm run type-check  # TypeScript checks
npm run lint        # ESLint checks
```

### Run Smart Contract Tests

```bash
cd contracts
npx hardhat test
```

## Common Issues

### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Wallet not connecting

**Solution:**
1. Make sure you have BNB Testnet added to MetaMask
2. Network: BNB Smart Chain Testnet
3. RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
4. Chain ID: 97

### Issue: Transaction fails

**Solution:**
1. Check you have enough testnet BNB
2. Try increasing gas limit
3. Refresh page and reconnect wallet

## Development Tips

### Hot Reload

The dev server supports hot reload. Changes to `.tsx` files will update instantly.

### Environment Variables

Changes to `.env.local` require a server restart:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Add New Markets

Edit `src/lib/market-data.ts` and add to `SAMPLE_MARKETS` array.

### Customize Styling

Tailwind classes are in `tailwind.config.ts`. Global styles in `src/app/globals.css`.

## Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Deploy to Vercel
vercel deploy
```

## Additional Resources

- [Full Documentation](./README.md)
- [Hackathon Submission](./HACKATHON_SUBMISSION.md)
- [Winning Strategy](./WINNING_STRATEGY.md)
- [Smart Contract Docs](./contracts/README.md)

## Support

- **Issues:** https://github.com/predictbnb/predictbnb/issues
- **Telegram:** https://t.me/predictbnb
- **Email:** team@predictbnb.io

## Next Steps

1. ✅ Connect wallet and explore demo markets
2. ✅ Make your first prediction (it's gasless!)
3. ✅ Check out the AI analysis feature
4. ✅ Read the full README for technical details
5. ✅ Join our Telegram for updates

**Happy predicting! 🚀**
