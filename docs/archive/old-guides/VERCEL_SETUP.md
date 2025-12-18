# 🚀 Vercel Deployment Setup Guide

## Quick Setup (3 minutes)

### Step 1: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository: `kyu36003-source/CreativeMarket`
4. Vercel will auto-detect Next.js framework
5. **Don't click Deploy yet!** - We need to set environment variables first

### Step 2: Set Environment Variables

In your Vercel project settings, go to **Settings → Environment Variables** and add the following:

#### ✅ Required Variables (Minimum to Deploy)

```bash
# WalletConnect (Required for wallet connections)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id_here

# Smart Contract Addresses (Use your deployed addresses)
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_AI_ORACLE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# Network Configuration
NEXT_PUBLIC_ENABLE_TESTNET=true
NEXT_PUBLIC_DEFAULT_CHAIN_ID=97

# Site Configuration
NEXT_PUBLIC_SITE_NAME=PredictBNB
NEXT_PUBLIC_SITE_URL=https://your-vercel-app.vercel.app
```

#### 🔑 Get WalletConnect Project ID

1. Go to https://cloud.walletconnect.com/
2. Sign up/Login
3. Create a new project
4. Copy your **Project ID**
5. Paste it in Vercel as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

#### 📝 Optional but Recommended

```bash
# AI Oracle Service (if using AI features)
OPENAI_API_KEY=sk-your-openai-key-here
HUGGINGFACE_API_KEY=hf_your-huggingface-key-here

# BSCScan (for contract verification)
BSCSCAN_API_KEY=your-bscscan-key

# IPFS Storage (for evidence)
PINATA_API_KEY=your-pinata-key
PINATA_SECRET_KEY=your-pinata-secret

# Blockchain Operations
PRIVATE_KEY=your-wallet-private-key-for-oracle
```

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your app will be live at `https://your-project.vercel.app`

---

## 🎯 Quick Commands to Set Variables via Vercel CLI

If you prefer CLI, install Vercel CLI and run:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link your project
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
vercel env add NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS
vercel env add NEXT_PUBLIC_AI_ORACLE_ADDRESS
vercel env add NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS
vercel env add NEXT_PUBLIC_DEFAULT_CHAIN_ID
vercel env add NEXT_PUBLIC_ENABLE_TESTNET

# Deploy
vercel --prod
```

---

## 🔄 Update Contract Addresses After Deployment

When you deploy contracts to BSC Testnet or Mainnet:

### Via Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Update the contract addresses:
   - `NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS`
   - `NEXT_PUBLIC_AI_ORACLE_ADDRESS`
   - `NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS`
3. Redeploy (Deployments → ... → Redeploy)

### Via CLI:
```bash
# Update production environment
vercel env rm NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS production
vercel env add NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS production
# Enter: 0xYourNewContractAddress

# Redeploy
vercel --prod
```

---

## 🌐 Network Configuration

### For BSC Testnet (Chain ID 97):
```bash
NEXT_PUBLIC_DEFAULT_CHAIN_ID=97
NEXT_PUBLIC_ENABLE_TESTNET=true
NEXT_PUBLIC_BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
```

### For BSC Mainnet (Chain ID 56):
```bash
NEXT_PUBLIC_DEFAULT_CHAIN_ID=56
NEXT_PUBLIC_ENABLE_TESTNET=false
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org/
```

---

## 📱 Current Contract Addresses (Local Hardhat)

These are your **local development** addresses. Update these when deploying to testnet/mainnet:

```bash
# Local Hardhat (Chain ID 97 simulation)
PredictionMarket: 0x5FbDB2315678afecb367f032d93F642f64180aa3
AIOracle: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
GaslessRelayer: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

**⚠️ Important:** These addresses only work with your local Hardhat node. For production:
1. Deploy contracts to BSC Testnet/Mainnet
2. Update environment variables in Vercel
3. Redeploy your app

---

## 🔒 Security Best Practices

### ✅ Safe to Expose (NEXT_PUBLIC_ prefix):
- WalletConnect Project ID
- Contract addresses
- Chain IDs
- RPC URLs
- Site URLs

### ❌ Never Expose (Server-side only):
- `PRIVATE_KEY` (wallet private key)
- `OPENAI_API_KEY`
- `HUGGINGFACE_API_KEY`
- `PINATA_SECRET_KEY`
- `BSCSCAN_API_KEY`

**Note:** In Vercel, server-side variables (without `NEXT_PUBLIC_` prefix) are only accessible in API routes and server components. They're never exposed to the browser.

---

## 🧪 Testing Your Deployment

After deploying:

1. **Check Wallet Connection:**
   - Visit your Vercel URL
   - Click "Connect Wallet"
   - Should see MetaMask/WalletConnect popup

2. **Check Contract Connection:**
   - Browse Markets page
   - Should see "Loading markets..." then display markets
   - If using local contracts, it won't work (need to deploy to testnet)

3. **Check Network:**
   - MetaMask should prompt to switch to BSC Testnet
   - Check network badge shows "BNB Chain Testnet"

---

## 🐛 Troubleshooting

### "Contract not deployed" error
- Your contracts are still on local Hardhat
- Deploy contracts to BSC Testnet first
- Update contract addresses in Vercel
- Redeploy

### "WalletConnect error"
- Missing or invalid `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- Get a new one from https://cloud.walletconnect.com/

### "Network not supported"
- Wrong `NEXT_PUBLIC_DEFAULT_CHAIN_ID`
- Should be `97` for testnet, `56` for mainnet

### Build fails in Vercel
- Check build logs
- Usually TypeScript errors or missing dependencies
- Fix locally first, then push

---

## 📊 Environment Variable Checklist

Copy this checklist when setting up Vercel:

```bash
# Required (Minimum)
✅ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
✅ NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS
✅ NEXT_PUBLIC_AI_ORACLE_ADDRESS  
✅ NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS
✅ NEXT_PUBLIC_DEFAULT_CHAIN_ID=97
✅ NEXT_PUBLIC_ENABLE_TESTNET=true

# Recommended
☐ OPENAI_API_KEY (for AI features)
☐ HUGGINGFACE_API_KEY (alternative AI)
☐ BSCSCAN_API_KEY (for contract verification)
☐ PINATA_API_KEY (for evidence storage)
☐ PINATA_SECRET_KEY

# Optional
☐ NEXT_PUBLIC_BSC_TESTNET_RPC_URL
☐ NEXT_PUBLIC_SITE_NAME
☐ NEXT_PUBLIC_SITE_URL
☐ PRIVATE_KEY (for oracle service)
```

---

## 🚀 Quick Deploy Script

Save this as a reference:

```bash
#!/bin/bash
# Quick Vercel deployment with all variables set

# Set your values here
WALLETCONNECT_ID="your_id_here"
PREDICTION_MARKET="0x5FbDB2315678afecb367f032d93F642f64180aa3"
AI_ORACLE="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
GASLESS_RELAYER="0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

# Deploy to Vercel
vercel --prod \
  -e NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="$WALLETCONNECT_ID" \
  -e NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS="$PREDICTION_MARKET" \
  -e NEXT_PUBLIC_AI_ORACLE_ADDRESS="$AI_ORACLE" \
  -e NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS="$GASLESS_RELAYER" \
  -e NEXT_PUBLIC_DEFAULT_CHAIN_ID="97" \
  -e NEXT_PUBLIC_ENABLE_TESTNET="true"
```

---

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs/concepts/projects/environment-variables
- WalletConnect: https://cloud.walletconnect.com/
- BSC Testnet Faucet: https://testnet.bnbchain.org/faucet-smart

---

**Ready to deploy?** Go to https://vercel.com and click "New Project"! 🎉
