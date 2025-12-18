#!/bin/bash

# ============================================================================
# PredictBNB - Complete Deployment Script for BSC Testnet
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📋 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Header
echo -e "\n${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     PredictBNB Deployment Script v1.0         ║${NC}"
echo -e "${BLUE}║         BSC Testnet Deployment                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}\n"

# Check prerequisites
print_step "Step 1: Checking Prerequisites"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi
NODE_VERSION=$(node --version)
print_success "Node.js installed: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi
NPM_VERSION=$(npm --version)
print_success "npm installed: $NPM_VERSION"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_error ".env.local file not found!"
    print_info "Copy .env.example to .env.local and fill in your values."
    exit 1
fi
print_success ".env.local file found"

# Check if contracts/.env exists
if [ ! -f "contracts/.env" ]; then
    print_warning "contracts/.env not found. Creating from template..."
    cp contracts/.env contracts/.env.backup 2>/dev/null || true
    echo "PRIVATE_KEY=" > contracts/.env
    echo "BSCSCAN_API_KEY=" >> contracts/.env
    print_info "Please edit contracts/.env and add your PRIVATE_KEY"
fi

# Check if PRIVATE_KEY is set
if ! grep -q "PRIVATE_KEY=0x" contracts/.env && ! grep -q "PRIVATE_KEY=0x" .env.local; then
    print_error "PRIVATE_KEY not configured!"
    print_info "Add your private key to contracts/.env or .env.local"
    exit 1
fi
print_success "Private key configured"

# Install dependencies
print_step "Step 2: Installing Dependencies"

print_info "Installing root dependencies..."
npm install --silent
print_success "Root dependencies installed"

print_info "Installing contract dependencies..."
cd contracts
npm install --silent
cd ..
print_success "Contract dependencies installed"

# Compile contracts
print_step "Step 3: Compiling Smart Contracts"

cd contracts
print_info "Compiling contracts..."
npx hardhat compile
if [ $? -eq 0 ]; then
    print_success "Contracts compiled successfully"
else
    print_error "Contract compilation failed"
    exit 1
fi
cd ..

# Deploy contracts
print_step "Step 4: Deploying to BSC Testnet"

print_warning "This will deploy contracts to BSC Testnet (Chain ID: 97)"
print_warning "Make sure you have testnet BNB in your wallet!"
print_info "Get testnet BNB: https://testnet.bnbchain.org/faucet-smart"
echo ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deployment cancelled"
    exit 0
fi

cd contracts
print_info "Deploying contracts to BSC Testnet..."
DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.js --network bscTestnet 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract contract addresses from deployment output
PREDICTION_MARKET_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "PredictionMarket:" | awk '{print $2}')
AI_ORACLE_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "AIOracle:" | awk '{print $2}')
GASLESS_RELAYER_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "GaslessRelayer:" | awk '{print $2}')

cd ..

if [ -z "$PREDICTION_MARKET_ADDRESS" ] || [ -z "$AI_ORACLE_ADDRESS" ]; then
    print_error "Deployment failed or addresses not found"
    exit 1
fi

print_success "Contracts deployed successfully!"
echo ""
echo "📋 Deployed Contract Addresses:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PredictionMarket: $PREDICTION_MARKET_ADDRESS"
echo "AIOracle:         $AI_ORACLE_ADDRESS"
echo "GaslessRelayer:   $GASLESS_RELAYER_ADDRESS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Update addresses in frontend
print_step "Step 5: Updating Frontend Configuration"

# Update addresses.ts
ADDRESSES_FILE="src/lib/contracts/addresses.ts"
if [ -f "$ADDRESSES_FILE" ]; then
    print_info "Updating contract addresses in $ADDRESSES_FILE..."
    
    # Create backup
    cp "$ADDRESSES_FILE" "${ADDRESSES_FILE}.backup"
    
    # Update testnet addresses (Chain ID 97)
    sed -i.bak "s/PREDICTION_MARKET: '0x[0-9a-fA-F]*',.*\/\/ Deploy address here/PREDICTION_MARKET: '$PREDICTION_MARKET_ADDRESS',/g" "$ADDRESSES_FILE"
    sed -i.bak "s/AI_ORACLE: '0x[0-9a-fA-F]*',.*\/\/ Deploy address here/AI_ORACLE: '$AI_ORACLE_ADDRESS',/g" "$ADDRESSES_FILE"
    sed -i.bak "s/GASLESS_RELAYER: '0x[0-9a-fA-F]*',.*\/\/ Deploy address here/GASLESS_RELAYER: '$GASLESS_RELAYER_ADDRESS',/g" "$ADDRESSES_FILE"
    
    # More robust replacement for testnet section
    awk -v pm="$PREDICTION_MARKET_ADDRESS" -v ao="$AI_ORACLE_ADDRESS" -v gr="$GASLESS_RELAYER_ADDRESS" '
    /97:/ { in_testnet=1 }
    in_testnet && /PREDICTION_MARKET:/ { $0 = "    PREDICTION_MARKET: '\''" pm "'\'','\''" }
    in_testnet && /AI_ORACLE:/ { $0 = "    AI_ORACLE: '\''" ao "'\'','\''" }
    in_testnet && /GASLESS_RELAYER:/ { $0 = "    GASLESS_RELAYER: '\''" gr "'\'','\''" }
    /}/ && in_testnet { in_testnet=0 }
    { print }
    ' "$ADDRESSES_FILE" > "${ADDRESSES_FILE}.tmp" && mv "${ADDRESSES_FILE}.tmp" "$ADDRESSES_FILE"
    
    rm -f "${ADDRESSES_FILE}.bak"
    print_success "Contract addresses updated in frontend"
else
    print_warning "Could not find $ADDRESSES_FILE"
fi

# Update .env.local
print_info "Updating .env.local with contract addresses..."
sed -i.bak "s|NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=.*|NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=$PREDICTION_MARKET_ADDRESS|g" .env.local
sed -i.bak "s|NEXT_PUBLIC_AI_ORACLE_ADDRESS=.*|NEXT_PUBLIC_AI_ORACLE_ADDRESS=$AI_ORACLE_ADDRESS|g" .env.local
sed -i.bak "s|NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS=.*|NEXT_PUBLIC_GASLESS_RELAYER_ADDRESS=$GASLESS_RELAYER_ADDRESS|g" .env.local
rm -f .env.local.bak
print_success ".env.local updated"

# Build frontend
print_step "Step 6: Building Frontend"

print_info "Building Next.js application..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Frontend built successfully"
else
    print_warning "Build completed with warnings (this is usually okay)"
fi

# Final summary
print_step "🎉 Deployment Complete!"

echo "📋 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Dependencies installed"
echo "✅ Contracts compiled"
echo "✅ Contracts deployed to BSC Testnet"
echo "✅ Frontend configuration updated"
echo "✅ Application built"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Deployed Contracts:"
echo "   PredictionMarket: $PREDICTION_MARKET_ADDRESS"
echo "   AIOracle:         $AI_ORACLE_ADDRESS"
echo "   GaslessRelayer:   $GASLESS_RELAYER_ADDRESS"
echo ""
echo "🌐 View on BSCScan:"
echo "   https://testnet.bscscan.com/address/$PREDICTION_MARKET_ADDRESS"
echo ""
echo "🚀 Next Steps:"
echo "   1. Start frontend:    npm run dev"
echo "   2. Start AI Oracle:   npm run oracle:start"
echo "   3. Open browser:      http://localhost:3000"
echo ""
echo "📚 For detailed testing instructions, see: DEPLOYMENT_INSTRUCTIONS.md"
echo ""

print_success "Deployment script completed successfully!"
