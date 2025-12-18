#!/bin/bash

# 🚀 Quick Deployment Script for BNB Chain Testnet
# This script helps automate the deployment process

set -e  # Exit on error

echo "🚀 Starting Prediction Market Deployment..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo ""
    echo "Please create a .env file with the following variables:"
    echo ""
    cat << 'EOF'
# Blockchain
PRIVATE_KEY=your_testnet_wallet_private_key
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545

# AI Oracle
OPENAI_API_KEY=sk-...
PINATA_API_KEY=...
PINATA_SECRET_API_KEY=...

# Oracle Service
ORACLE_AGENT_ADDRESS=your_oracle_wallet_address
POLLING_INTERVAL=60000
EOF
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

# Load environment variables
source .env

# Check for required variables
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ PRIVATE_KEY not set in .env${NC}"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  Warning: OPENAI_API_KEY not set - AI Oracle won't work${NC}"
fi

if [ -z "$PINATA_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  Warning: PINATA_API_KEY not set - Evidence storage won't work${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Compiling smart contracts..."
cd contracts
npm install
npx hardhat compile
cd ..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Deploy Contracts:"
echo "   cd contracts"
echo "   npx hardhat run scripts/deploy.js --network bnbTestnet"
echo ""
echo "2. Update Contract Addresses:"
echo "   - Copy deployed addresses from output"
echo "   - Update .env with NEXT_PUBLIC_*_ADDRESS variables"
echo "   - Create src/lib/contracts/addresses.ts"
echo ""
echo "3. Authorize Oracle Agent:"
echo "   npx hardhat run scripts/authorize-oracle.js --network bnbTestnet"
echo ""
echo "4. Start Frontend:"
echo "   npm run dev"
echo ""
echo "5. Start Oracle Service:"
echo "   npm run oracle:start"
echo ""
echo "🎯 Full deployment guide: docs/COMPLETE_IMPLEMENTATION.md"
echo ""
