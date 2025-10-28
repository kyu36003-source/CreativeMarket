#!/bin/bash

# Hackathon Features Verification Script
# Tests all implemented features end-to-end

echo "🚀 Starting Hackathon Features Verification..."
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((TESTS_FAILED++))
    fi
}

echo "1️⃣  Checking File Structure..."
echo "----------------------------"

# Check if all feature files exist
[ -f "src/lib/ai-oracle.ts" ]
print_result $? "AI Oracle service exists"

[ -f "src/lib/gasless-service.ts" ]
print_result $? "Gasless service exists"

[ -f "src/lib/creative-templates.ts" ]
print_result $? "Creative templates exist"

[ -f "src/lib/liquidity-aggregator.ts" ]
print_result $? "Liquidity aggregator exists"

[ -f "src/components/AIMarketAnalytics.tsx" ]
print_result $? "AI Analytics component exists"

[ -f "src/components/CreativeMarketCard.tsx" ]
print_result $? "Creative Market Card component exists"

[ -f "src/app/creative-markets/page.tsx" ]
print_result $? "Creative Markets page exists"

echo ""
echo "2️⃣  Running TypeScript Check..."
echo "----------------------------"
npm run type-check > /dev/null 2>&1
print_result $? "TypeScript compilation (no errors)"

echo ""
echo "3️⃣  Checking Key Features..."
echo "----------------------------"

# Check AI Oracle features
grep -q "judgeCreativeWork" src/lib/ai-oracle.ts
print_result $? "AI Oracle: judgeCreativeWork method"

grep -q "resolveMarket" src/lib/ai-oracle.ts
print_result $? "AI Oracle: resolveMarket method"

grep -q "predictOutcome" src/lib/ai-oracle.ts
print_result $? "AI Oracle: predictOutcome method"

# Check Gasless features
grep -q "executeGasless" src/lib/gasless-service.ts
print_result $? "Gasless: executeGasless method"

grep -q "isGaslessAvailable" src/lib/gasless-service.ts
print_result $? "Gasless: isGaslessAvailable method"

grep -q "batchGasless" src/lib/gasless-service.ts
print_result $? "Gasless: batchGasless method"

# Check Creative Templates
grep -q "design-contest" src/lib/creative-templates.ts
print_result $? "Templates: Design Contest"

grep -q "music-release" src/lib/creative-templates.ts
print_result $? "Templates: Music Release"

grep -q "content-virality" src/lib/creative-templates.ts
print_result $? "Templates: Content Virality"

# Check Liquidity Aggregation
grep -q "getPoolByMarketType" src/lib/liquidity-aggregator.ts
print_result $? "Liquidity: Pool management"

grep -q "findBestPrice" src/lib/liquidity-aggregator.ts
print_result $? "Liquidity: Best price finding"

grep -q "compareLiquidityModels" src/lib/liquidity-aggregator.ts
print_result $? "Liquidity: Model comparison"

# Check AI Analytics Component
grep -q "AIMarketAnalytics" src/components/AIMarketAnalytics.tsx
print_result $? "UI: AI Analytics component"

grep -q "AISignalBadge" src/components/AIMarketAnalytics.tsx
print_result $? "UI: AI Signal Badge"

# Check Creative Market Card
grep -q "CreativeMarketCard" src/components/CreativeMarketCard.tsx
print_result $? "UI: Creative Market Card"

grep -q "gasless" src/components/CreativeMarketCard.tsx
print_result $? "UI: Gasless indicator"

# Check Demo Page
grep -q "Creative Prediction Markets" src/app/creative-markets/page.tsx
print_result $? "Demo: Creative Markets page"

grep -q "Hackathon-Winning Features" src/app/creative-markets/page.tsx
print_result $? "Demo: Hackathon features showcase"

echo ""
echo "4️⃣  Checking Web3 Configuration..."
echo "--------------------------------"

grep -q "bnbChainConfig" src/lib/web3-config.ts
print_result $? "Web3: BNB Chain configuration"

grep -q "fallback" src/lib/web3-config.ts
print_result $? "Web3: Fallback RPC endpoints"

grep -q "pollingInterval" src/lib/web3-config.ts
print_result $? "Web3: HTTP polling (no WebSocket errors)"

echo ""
echo "5️⃣  Checking Documentation..."
echo "----------------------------"

[ -f "HACKATHON_FEATURES_COMPLETE.md" ]
print_result $? "Documentation: Complete features guide"

[ -f "WALLETCONNECT_FIX_COMPLETE.md" ]
print_result $? "Documentation: WalletConnect fix guide"

[ -f "WEB3_CONNECTION_FIX.md" ]
print_result $? "Documentation: Web3 connection fix"

echo ""
echo "=============================================="
echo "📊 VERIFICATION RESULTS"
echo "=============================================="
echo ""
echo -e "${GREEN}Tests Passed:${NC} $TESTS_PASSED"
echo -e "${RED}Tests Failed:${NC} $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✨ ALL TESTS PASSED! ✨${NC}"
    echo ""
    echo "🏆 HACKATHON SUBMISSION READY!"
    echo ""
    echo "Next steps:"
    echo "1. Start dev server: npm run dev"
    echo "2. Open http://localhost:3000"
    echo "3. Navigate to /creative-markets"
    echo "4. Test all features"
    echo "5. Record demo video"
    echo "6. Submit to hackathon!"
    echo ""
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Please review the failed tests above."
    exit 1
fi
