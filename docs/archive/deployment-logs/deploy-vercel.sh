#!/bin/bash

# ============================================================================
# Vercel CLI Deployment Script
# ============================================================================

set -e

echo "🚀 PredictBNB - Vercel CLI Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

echo "✅ Vercel CLI found"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 REQUIRED ENVIRONMENT VARIABLES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get WalletConnect Project ID
echo "🔑 WalletConnect Project ID"
echo "   Get from: https://cloud.walletconnect.com/"
echo ""
read -p "Enter NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: " WALLETCONNECT_ID

if [ -z "$WALLETCONNECT_ID" ]; then
    echo ""
    echo "${RED}❌ WalletConnect Project ID is required!${NC}"
    echo "   1. Go to https://cloud.walletconnect.com/"
    echo "   2. Sign up/Login"
    echo "   3. Create New Project"
    echo "   4. Copy your Project ID"
    echo "   5. Run this script again"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Smart Contract Addresses"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Current addresses (from your local Hardhat):"
echo "PredictionMarket: 0x5FbDB2315678afecb367f032d93F642f64180aa3"
echo "AIOracle:         0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
echo "GaslessRelayer:   0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
echo ""
echo "${YELLOW}⚠️  Note: These are LOCAL addresses. Update after deploying to BSC Testnet!${NC}"
echo ""
read -p "Press Enter to use these addresses, or Ctrl+C to exit and deploy contracts first... "

# Default values
PREDICTION_MARKET="0x5FbDB2315678afecb367f032d93F642f64180aa3"
AI_ORACLE="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
GASLESS_RELAYER="0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
CHAIN_ID="97"
ENABLE_TESTNET="true"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Optional: AI & Storage Keys"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Do you want to add AI oracle keys? (y/n): " ADD_AI_KEYS

EXTRA_ENV_FLAGS=""

if [[ $ADD_AI_KEYS == "y" || $ADD_AI_KEYS == "Y" ]]; then
    echo ""
    echo "🤖 Hugging Face API Key (recommended - it's free!)"
    echo "   Get from: https://huggingface.co/settings/tokens"
    read -p "Enter HUGGINGFACE_API_KEY (or press Enter to skip): " HF_KEY
    
    if [ -n "$HF_KEY" ]; then
        EXTRA_ENV_FLAGS="$EXTRA_ENV_FLAGS -e HUGGINGFACE_API_KEY=$HF_KEY"
    fi
    
    echo ""
    echo "🤖 OpenAI API Key (optional alternative)"
    echo "   Get from: https://platform.openai.com/api-keys"
    read -p "Enter OPENAI_API_KEY (or press Enter to skip): " OPENAI_KEY
    
    if [ -n "$OPENAI_KEY" ]; then
        EXTRA_ENV_FLAGS="$EXTRA_ENV_FLAGS -e OPENAI_API_KEY=$OPENAI_KEY"
    fi
    
    echo ""
    echo "📦 Pinata IPFS Keys (for evidence storage)"
    echo "   Get from: https://app.pinata.cloud/keys"
    read -p "Enter PINATA_API_KEY (or press Enter to skip): " PINATA_KEY
    
    if [ -n "$PINATA_KEY" ]; then
        EXTRA_ENV_FLAGS="$EXTRA_ENV_FLAGS -e PINATA_API_KEY=$PINATA_KEY"
        
        read -p "Enter PINATA_SECRET_KEY: " PINATA_SECRET
        if [ -n "$PINATA_SECRET" ]; then
            EXTRA_ENV_FLAGS="$EXTRA_ENV_FLAGS -e PINATA_SECRET_KEY=$PINATA_SECRET"
        fi
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Ready to Deploy!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will deploy your app with the following settings:"
echo ""
echo "${GREEN}✓${NC} WalletConnect Project ID: ${WALLETCONNECT_ID:0:20}..."
echo "${GREEN}✓${NC} PredictionMarket: $PREDICTION_MARKET"
echo "${GREEN}✓${NC} AIOracle: $AI_ORACLE"
echo "${GREEN}✓${NC} GaslessRelayer: $GASLESS_RELAYER"
echo "${GREEN}✓${NC} Chain ID: $CHAIN_ID (BSC Testnet)"
echo "${GREEN}✓${NC} Testnet Mode: $ENABLE_TESTNET"

if [ -n "$HF_KEY" ]; then
    echo "${GREEN}✓${NC} Hugging Face API: Configured"
fi
if [ -n "$OPENAI_KEY" ]; then
    echo "${GREEN}✓${NC} OpenAI API: Configured"
fi
if [ -n "$PINATA_KEY" ]; then
    echo "${GREEN}✓${NC} Pinata IPFS: Configured"
fi

echo ""
read -p "Continue with deployment? (y/n): " CONFIRM

if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏗️  Deploying to Vercel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Build the vercel command
VERCEL_CMD="vercel --prod \
  -e NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$WALLETCONNECT_ID \
  -e NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=$PREDICTION_MARKET \
  -e NEXT_PUBLIC_AI_ORACLE_ADDRESS=$AI_ORACLE \
  -e NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS=$GASLESS_RELAYER \
  -e NEXT_PUBLIC_DEFAULT_CHAIN_ID=$CHAIN_ID \
  -e NEXT_PUBLIC_ENABLE_TESTNET=$ENABLE_TESTNET \
  -e NEXT_PUBLIC_SITE_NAME=PredictBNB \
  $EXTRA_ENV_FLAGS"

echo "Executing deployment..."
echo ""

# Run the deployment
eval $VERCEL_CMD

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}✅ Deployment Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. ${YELLOW}Update Contract Addresses${NC} (when you deploy to BSC Testnet):"
echo "   vercel env rm NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS production"
echo "   vercel env add NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS production"
echo ""
echo "2. ${YELLOW}Test Your Deployment:${NC}"
echo "   - Visit your Vercel URL"
echo "   - Connect wallet"
echo "   - Check if network shows 'BNB Chain Testnet'"
echo ""
echo "3. ${YELLOW}Deploy Contracts to BSC Testnet:${NC}"
echo "   cd contracts"
echo "   npx hardhat run scripts/deploy-bsc-testnet.js --network bscTestnet"
echo ""
echo "4. ${YELLOW}Update Vercel with Real Contract Addresses${NC}"
echo ""
echo "🎉 Happy deploying!"
echo ""
