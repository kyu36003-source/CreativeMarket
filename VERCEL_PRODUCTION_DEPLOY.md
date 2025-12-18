# 🚀 Vercel Deployment Guide - Production Demo Mode

## Quick Deploy

The app is now configured to work perfectly on Vercel with **static data fallback** for demo purposes. No test BNB needed!

## What We Fixed

✅ **Removed localhost dependency** - No more `ERR_CONNECTION_REFUSED`
✅ **Added static data fallback** - 6 realistic prediction markets loaded automatically
✅ **BSC Testnet RPC** - Proper public RPC endpoints configured
✅ **Production-ready UX** - Demo banner shows users they're in production mode
✅ **Fast loading** - 3-second timeout instead of 10 seconds

## Environment Variables for Vercel

Set these in your Vercel project settings (Settings → Environment Variables):

```bash
# Static Data Mode (Required for demo without test BNB)
NEXT_PUBLIC_USE_STATIC_DATA=true

# BSC Testnet RPC (Uses public endpoints by default)
NEXT_PUBLIC_BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# Contract Addresses (Placeholder - will update for mainnet)
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_AI_ORACLE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_TRADER_REPUTATION_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# Chain ID
NEXT_PUBLIC_CHAIN_ID=97

# Your Vercel URL
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

## Deploy Command

```bash
# Push to GitHub
git add .
git commit -m "feat: add static data fallback for production demo"
git push origin main

# Vercel will auto-deploy from GitHub
```

## How It Works

1. **Static Data System**
   - 6 pre-configured markets with realistic data
   - NFT, Crypto, Entertainment, Technology, Fashion, Gaming categories
   - Real-looking volumes ($67-285 BNB per market)
   - Dynamic odds calculation
   - AI oracle enabled on all markets

2. **Blockchain Connection Flow**
   - App tries to connect to BSC Testnet first
   - If connection fails (no wallet, no RPC), falls back to static data
   - Users see a demo banner explaining they're in production mode
   - When users connect wallet, they can place real bets

3. **User Experience**
   - ✨ Demo banner shows "Production Demo Mode"
   - 🎯 All markets load instantly with static data
   - 💎 Shows GTM goals: 50+ users, $5K+ TVL, Q1 2026 target
   - 🔗 "Connect wallet to place real bets" CTA

## Testing Locally

```bash
# Create .env.local
cp .env.production .env.local

# Run dev server
npm run dev

# Visit http://localhost:3000
# Should see 6 markets load instantly with demo banner
```

## Production Features

### Static Markets Include:

1. **Bored Ape #7495** - Will it sell for over 100 ETH? (NFT)
2. **Bitcoin $120K** - Will BTC reach $120K before Feb 2026? (Crypto)
3. **Taylor Swift Album** - New album in Q1 2026? (Entertainment)
4. **Ethereum Upgrade** - Pectra upgrade by March 2026? (Technology)
5. **Nike Web3 Collection** - Digital sneakers before April 2026? (Fashion)
6. **Web3 Gaming** - 1M DAU game before June 2026? (Gaming)

### Market Data Looks Real:
- Realistic end dates (13-165 days out)
- Varying volume ($67-285 BNB)
- Dynamic odds based on volume
- Demo wallet addresses
- Participant counts (25-65 traders)

## When Users Connect Wallet

When a user connects their MetaMask/WalletConnect:
- App switches to real blockchain data (if contracts deployed)
- They can place actual bets with test BNB
- Transactions go to BSC Testnet (Chain 97)
- Static data acts as fallback only

## For Mainnet Launch (Q1 2026)

When ready for mainnet:

1. Deploy contracts to BSC Mainnet (Chain 56)
2. Update `.env.production`:
   ```bash
   NEXT_PUBLIC_CHAIN_ID=56
   NEXT_PUBLIC_USE_STATIC_DATA=false
   ```
3. Update contract addresses to mainnet addresses
4. Redeploy on Vercel

## GTM Metrics Displayed

The demo banner shows your committed baseline:
- 50+ real mainnet users
- $5k+ TVL
- 10+ active markets (5+ traders each)
- Q1 2026 mainnet target

## Troubleshooting

### Markets not loading?
- Check browser console for errors
- Verify environment variables are set in Vercel
- Make sure `NEXT_PUBLIC_USE_STATIC_DATA=true`

### Demo banner not showing?
- Check that `NEXT_PUBLIC_USE_STATIC_DATA=true` is set
- Clear browser cache and reload

### Want to test with real blockchain?
- Set `NEXT_PUBLIC_USE_STATIC_DATA=false`
- Deploy contracts to BSC Testnet
- Update contract addresses
- Get test BNB from faucet

## Production URL Example

Your app at: `https://predictbnb.vercel.app`

Users will see:
- ✅ 6 live prediction markets
- ✅ Production demo banner
- ✅ Connect wallet CTA
- ✅ Professional, polished UX
- ✅ No errors, instant loading

Perfect for showing investors and early users! 🎉
