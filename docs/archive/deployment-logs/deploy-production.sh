#!/bin/bash

# 🚀 Quick Deploy to Vercel - Production Demo Mode
# Run this script to deploy your app with static data fallback

echo "🎯 PredictBNB - Deploying Production Demo..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the project root?"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Add all changes
echo "📝 Adding changes..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "feat: production demo with static data fallback - ready for Vercel

- Added static market data (6 realistic markets)
- Updated wagmi config to use BSC Testnet
- Removed localhost dependency
- Added demo mode banner
- Faster loading (3s timeout)
- Production-ready UX

Markets include: NFT, Crypto, Entertainment, Technology, Fashion, Gaming
Ready for investor presentations and early users.

GTM Target: 50+ users, \$5K+ TVL, Q1 2026 mainnet"

# Push to GitHub (if remote exists)
if git remote | grep -q "origin"; then
    echo "🚀 Pushing to GitHub..."
    git push origin main
else
    echo ""
    echo "⚠️  No git remote found. Add your GitHub repo:"
    echo "    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "    git push -u origin main"
    echo ""
fi

echo ""
echo "✅ Code committed successfully!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. If you haven't already, connect your GitHub repo to Vercel:"
echo "   https://vercel.com/new"
echo ""
echo "2. Set these environment variables in Vercel (Settings → Environment Variables):"
echo "   NEXT_PUBLIC_USE_STATIC_DATA=true"
echo "   NEXT_PUBLIC_BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/"
echo "   NEXT_PUBLIC_CHAIN_ID=97"
echo ""
echo "3. Vercel will auto-deploy from GitHub!"
echo ""
echo "4. Test your production URL to verify:"
echo "   - Demo banner appears"
echo "   - 6 markets load instantly"
echo "   - No console errors"
echo ""
echo "🎉 Your app is ready to showcase!"
echo ""
