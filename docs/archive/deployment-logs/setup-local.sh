#!/bin/bash

# ============================================================================
# Local Development Setup - No API Keys Required!
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📋 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

echo -e "\n${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Local Development Setup (No API Keys!)      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}\n"

print_info "This will set up the project for local development using Hardhat"
print_info "No external API keys required!"
echo ""

# Install dependencies
print_step "Step 1: Installing Dependencies"

print_info "Installing root dependencies..."
npm install --silent
print_success "Root dependencies installed"

print_info "Installing contract dependencies..."
cd contracts
npm install --silent
cd ..
print_success "Contract dependencies installed"

# Compile contracts
print_step "Step 2: Compiling Contracts"

cd contracts
npx hardhat compile > /dev/null 2>&1
print_success "Contracts compiled"
cd ..

# Configure for local development
print_step "Step 3: Configuring for Local Development"

# Backup existing .env.local if it exists
if [ -f ".env.local" ]; then
    cp .env.local .env.local.backup
    print_info "Backed up existing .env.local to .env.local.backup"
fi

# Create local development .env.local
cat > .env.local << 'EOF'
# ============================================================================
# Local Development Configuration (No External APIs Required)
# ============================================================================

# Frontend Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=local_dev_mode
NEXT_PUBLIC_SITE_NAME=PredictBNB
NEXT_PUBLIC_SITE_DESCRIPTION=AI-Powered Prediction Markets
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Local Hardhat Network Configuration
NEXT_PUBLIC_ENABLE_TESTNET=true
NEXT_PUBLIC_DEFAULT_CHAIN_ID=31337

# Contract addresses will be updated after deployment
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_AI_ORACLE_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS=0x0000000000000000000000000000000000000000

# Hardhat test account #0 private key (safe for local development)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Local development mode - AI will use mock data
NODE_ENV=development
DEBUG=false

# Note: OpenAI and Pinata keys not needed for local development
# AI Oracle will automatically use mock mode
EOF

print_success "Created .env.local for local development"

# Update contracts/.env
cat > contracts/.env << 'EOF'
# Local Development - Hardhat Test Account
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
EOF

print_success "Configured contracts/.env"

# Create a helper script to start local blockchain
cat > start-local-chain.sh << 'EOF'
#!/bin/bash
echo "🔗 Starting local Hardhat blockchain..."
echo "Keep this terminal running!"
echo ""
cd contracts
npx hardhat node
EOF

chmod +x start-local-chain.sh
print_success "Created start-local-chain.sh helper script"

# Create deploy-local script
cat > deploy-local.sh << 'EOF'
#!/bin/bash
echo "📝 Deploying contracts to local Hardhat network..."
cd contracts
npx hardhat run scripts/deploy.js --network localhost

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the contract addresses from above"
echo "2. Update src/lib/contracts/addresses.ts with local addresses"
echo "3. Update .env.local with the contract addresses"
echo "4. Run: npm run dev"
EOF

chmod +x deploy-local.sh
print_success "Created deploy-local.sh helper script"

# Update addresses.ts to support localhost
print_info "Updating addresses.ts to support local network..."

if [ -f "src/lib/contracts/addresses.ts" ]; then
    # Check if 31337 already exists
    if ! grep -q "31337:" src/lib/contracts/addresses.ts; then
        # Add localhost configuration
        cp src/lib/contracts/addresses.ts src/lib/contracts/addresses.ts.backup
        
        # Add after the 97 section, before the closing brace
        awk '/97:.*{/,/},/ {print; if (/},/) {
            print "  // Local Hardhat Network (for development)"
            print "  31337: {"
            print "    PREDICTION_MARKET: '\''0x0000000000000000000000000000000000000000'\'',"
            print "    AI_ORACLE: '\''0x0000000000000000000000000000000000000000'\'',"
            print "    GASLESS_RELAYER: '\''0x0000000000000000000000000000000000000000'\'',"
            print "  },"
        } next} 1' src/lib/contracts/addresses.ts.backup > src/lib/contracts/addresses.ts.tmp
        
        mv src/lib/contracts/addresses.ts.tmp src/lib/contracts/addresses.ts
        
        # Update the function to support 31337
        sed -i 's/chainId !== 56 && chainId !== 97/chainId !== 56 \&\& chainId !== 97 \&\& chainId !== 31337/g' src/lib/contracts/addresses.ts
        sed -i 's/chainId as 56 | 97/chainId as 56 | 97 | 31337/g' src/lib/contracts/addresses.ts
        
        print_success "Updated addresses.ts to support local network (Chain ID: 31337)"
    else
        print_success "addresses.ts already supports local network"
    fi
fi

# Summary
print_step "🎉 Local Development Setup Complete!"

echo "📋 What was configured:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Dependencies installed"
echo "✅ Contracts compiled"
echo "✅ Local development environment configured"
echo "✅ Helper scripts created"
echo "✅ Ready for local testing (no external APIs needed)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1️⃣  Start local blockchain (Terminal 1):"
echo "   ./start-local-chain.sh"
echo ""
echo "2️⃣  Deploy contracts (Terminal 2):"
echo "   ./deploy-local.sh"
echo ""
echo "3️⃣  Update contract addresses in:"
echo "   - src/lib/contracts/addresses.ts (Chain ID 31337 section)"
echo "   - .env.local (NEXT_PUBLIC_*_ADDRESS variables)"
echo ""
echo "4️⃣  Start the app:"
echo "   npm run dev"
echo ""
echo "5️⃣  Configure MetaMask:"
echo "   - Network: Localhost 8545"
echo "   - RPC URL: http://127.0.0.1:8545"
echo "   - Chain ID: 31337"
echo "   - Import Account with key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
echo ""
echo "📚 For detailed instructions, see: COMPLETE_SETUP_GUIDE.md"
echo ""
print_success "Setup complete! Start with ./start-local-chain.sh"
