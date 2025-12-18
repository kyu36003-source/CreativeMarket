#!/bin/bash

# ============================================================================
# Pre-Deployment Checklist Script
# Run this to verify you're ready to deploy
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo -e "\n${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Pre-Deployment Checklist                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}\n"

PASS=0
FAIL=0
WARN=0

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    VERSION=$(node --version)
    check_pass "Node.js installed: $VERSION"
    PASS=$((PASS+1))
else
    check_fail "Node.js not installed"
    FAIL=$((FAIL+1))
fi

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    VERSION=$(npm --version)
    check_pass "npm installed: $VERSION"
    PASS=$((PASS+1))
else
    check_fail "npm not installed"
    FAIL=$((FAIL+1))
fi

# Check .env.local exists
echo "Checking .env.local..."
if [ -f ".env.local" ]; then
    check_pass ".env.local file exists"
    PASS=$((PASS+1))
    
    # Check critical vars
    if grep -q "PRIVATE_KEY=0x" .env.local; then
        check_pass "PRIVATE_KEY configured"
        PASS=$((PASS+1))
    elif grep -q "PRIVATE_KEY=your_" .env.local; then
        check_fail "PRIVATE_KEY not configured (still has placeholder)"
        FAIL=$((FAIL+1))
    else
        check_fail "PRIVATE_KEY not found"
        FAIL=$((FAIL+1))
    fi
    
    if grep -q "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=.*[a-zA-Z0-9]" .env.local && ! grep -q "your_walletconnect" .env.local; then
        check_pass "WalletConnect Project ID configured"
        PASS=$((PASS+1))
    else
        check_fail "WalletConnect Project ID not configured"
        FAIL=$((FAIL+1))
    fi
    
    if grep -q "OPENAI_API_KEY=sk-" .env.local; then
        check_pass "OpenAI API Key configured"
        PASS=$((PASS+1))
    else
        check_fail "OpenAI API Key not configured"
        FAIL=$((FAIL+1))
    fi
    
    if grep -q "PINATA_API_KEY=.*[a-zA-Z0-9]" .env.local && ! grep -q "your_pinata" .env.local; then
        check_pass "Pinata API Key configured"
        PASS=$((PASS+1))
    else
        check_fail "Pinata API Key not configured"
        FAIL=$((FAIL+1))
    fi
    
    if grep -q "PINATA_SECRET_KEY=.*[a-zA-Z0-9]" .env.local && ! grep -q "your_pinata" .env.local; then
        check_pass "Pinata Secret Key configured"
        PASS=$((PASS+1))
    else
        check_fail "Pinata Secret Key not configured"
        FAIL=$((FAIL+1))
    fi
else
    check_fail ".env.local file not found"
    FAIL=$((FAIL+1))
fi

# Check contracts/.env
echo "Checking contracts/.env..."
if [ -f "contracts/.env" ]; then
    check_pass "contracts/.env file exists"
    PASS=$((PASS+1))
    
    if grep -q "PRIVATE_KEY=0x" contracts/.env; then
        check_pass "Contract deployment key configured"
        PASS=$((PASS+1))
    else
        check_fail "Contract deployment key not configured"
        FAIL=$((FAIL+1))
    fi
else
    check_warn "contracts/.env not found (will be created)"
    WARN=$((WARN+1))
fi

# Check if node_modules exist
echo "Checking dependencies..."
if [ -d "node_modules" ]; then
    check_pass "Root dependencies installed"
    PASS=$((PASS+1))
else
    check_warn "Root dependencies not installed (run: npm install)"
    WARN=$((WARN+1))
fi

if [ -d "contracts/node_modules" ]; then
    check_pass "Contract dependencies installed"
    PASS=$((PASS+1))
else
    check_warn "Contract dependencies not installed (run: cd contracts && npm install)"
    WARN=$((WARN+1))
fi

# Check if contracts are compiled
echo "Checking contract compilation..."
if [ -d "contracts/artifacts" ]; then
    check_pass "Contracts already compiled"
    PASS=$((PASS+1))
else
    check_warn "Contracts not compiled (will be done during deployment)"
    WARN=$((WARN+1))
fi

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Summary:${NC}"
echo -e "${GREEN}Passed:  $PASS${NC}"
echo -e "${RED}Failed:  $FAIL${NC}"
echo -e "${YELLOW}Warnings: $WARN${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! You're ready to deploy.${NC}"
    echo -e "${BLUE}Run: ./deploy.sh${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
    echo ""
    echo "Quick fixes:"
    echo "1. Update .env.local with your API keys"
    echo "2. Get testnet BNB: https://testnet.bnbchain.org/faucet-smart"
    echo "3. Get WalletConnect ID: https://cloud.walletconnect.com/"
    echo "4. Get OpenAI key: https://platform.openai.com/api-keys"
    echo "5. Get Pinata keys: https://app.pinata.cloud/keys"
    echo ""
    exit 1
fi
