# PredictBNB Creative Market - Project Structure

## 📁 Directory Organization

### Root Level (Clean)
```
├── src/                          # Source code
├── contracts/                    # Smart contracts
├── public/                       # Static assets
├── docs/                         # Documentation
│   ├── archive/                  # Historical docs
│   │   ├── old-status-reports/   # Status & completion docs
│   │   ├── old-guides/           # Deprecated setup guides
│   │   └── deployment-logs/      # Old deployment scripts
│   ├── guides/                   # Current guides
│   └── CONTRIBUTING.md           # Contribution guidelines
├── scripts/                      # Active utility scripts
├── .env.local                    # Local environment (not committed)
├── .env.example                  # Environment template
├── AI_ORACLE_FAIRNESS_ANALYSIS.md # AI oracle documentation
├── CHECKLIST.md                  # Project checklist
├── QUICKSTART.md                 # Quick start guide
├── README.md                     # Main documentation
└── package.json                  # Dependencies
```

### Source Structure (`src/`)
```
src/
├── app/                          # Next.js app router pages
│   ├── page.tsx                  # Home (main markets page)
│   ├── markets/[id]/page.tsx     # Market detail & trading
│   ├── create/page.tsx           # Create market
│   ├── leaderboard/page.tsx      # Trader rankings
│   ├── reputation/page.tsx       # Reputation system
│   ├── admin/page.tsx            # Admin dashboard
│   ├── api/                      # API routes
│   └── creative-markets/         # Creative markets showcase (demo)
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── providers/                # Context providers
│   ├── MarketCard.tsx            # Main market card (used on homepage)
│   ├── CreativeMarketCard.tsx    # Creative market card (demo page only)
│   ├── WalletConnect.tsx         # Wallet connection
│   ├── NetworkGuard.tsx          # Network validation
│   └── ...
├── hooks/                        # Custom React hooks
│   ├── useContracts.ts           # Smart contract interactions
│   ├── use-web3-connection.ts    # Web3 connection management
│   └── index.ts                  # Hook utilities
├── lib/                          # Utility libraries
│   ├── static-markets.ts         # 15 real creator economy markets
│   ├── creative-templates.ts     # Market templates (for demos)
│   ├── ai-oracle.ts              # AI oracle integration
│   ├── huggingface-oracle.ts     # Hugging Face AI
│   ├── market-data.ts            # Market utilities
│   └── wagmi-config.ts           # Web3 configuration
├── services/                     # External services
│   └── ai-oracle/                # AI oracle service (backend)
│       ├── index.ts              # Oracle service entry
│       ├── ai-analyzer.ts        # GPT-4 analysis
│       ├── resolution-engine.ts  # Resolution workflow
│       ├── evidence-storage.ts   # IPFS evidence
│       └── types/                # TypeScript types
├── types/                        # TypeScript type definitions
└── styles/                       # Global styles
```

## 📊 Key Files & Purpose

### Main Application
- **`src/app/page.tsx`** - Homepage with 15 static creative markets + blockchain integration
- **`src/app/markets/[id]/page.tsx`** - Trading interface (Polymarket-style)
- **`src/lib/static-markets.ts`** - 15 curated markets (Moonbirds, Nike .SWOOSH, CryptoPunks, etc.)

### Trading System
- **`src/hooks/useContracts.ts`** - Smart contract hooks (place bet, claim winnings, etc.)
- **`src/lib/wagmi-config.ts`** - BSC Testnet configuration

### AI Oracle
- **`src/services/ai-oracle/`** - Complete resolution system with GPT-4 + IPFS
- **`AI_ORACLE_FAIRNESS_ANALYSIS.md`** - Comprehensive oracle documentation

### Demo Features
- **`src/app/creative-markets/page.tsx`** - Showcase page for hackathon (AI judging, gasless, etc.)
- **`src/lib/creative-templates.ts`** - Market templates for demos

## 🗑️ Cleaned Up (Archived)

### Status Reports (50+ files → archived)
Moved to `docs/archive/old-status-reports/`:
- BLOCKCHAIN_INTEGRATION_COMPLETE.md
- CLEANUP_COMPLETE.md
- DEBUG_STATUS.md
- EVERYTHING_WORKING.md
- FIXES_SUMMARY.md
- FREE_MODE_COMPLETE.md
- FRONTEND_FIXED.md
- PROJECT_FIX_SUMMARY.md
- PROJECT_STATUS_FINAL.md
- REAL_AI_COMPLETE.md
- SETUP_COMPLETE.md
- STATUS.md
- SYSTEM_READY.md
- TRANSACTION_UX_IMPROVED.md
- PRODUCTION_DEMO_FIX_SUMMARY.md

### Old Guides (20+ files → archived)
Moved to `docs/archive/old-guides/`:
- Multiple QUICKSTART variations
- Multiple VERCEL setup guides
- Old deployment instructions
- Browser cache fixes
- Setup guides (now in QUICKSTART.md)

### Deployment Scripts (15+ files → archived)
Moved to `docs/archive/deployment-logs/`:
- check-ready.sh
- CONTRACTS_DEPLOYED.sh
- deploy-*.sh scripts
- test-*.js files
- demo-smart-mock.js

## 🎯 Active Documentation

### Root Level
1. **README.md** - Main project documentation
2. **QUICKSTART.md** - Quick setup guide
3. **AI_ORACLE_FAIRNESS_ANALYSIS.md** - AI oracle detailed analysis
4. **CHECKLIST.md** - Project checklist

### Docs Folder
1. **docs/CONTRIBUTING.md** - Contribution guidelines
2. **docs/guides/** - Active setup guides
3. **docs/archive/** - Historical reference

## 🔄 Redundancy Removed

### Before Cleanup
- 40 markdown files in root
- 11 shell scripts
- 15+ deployment scripts
- Multiple duplicate guides
- Redundant README files

### After Cleanup
- 6 essential files in root
- All historical docs archived
- Single source of truth for each topic
- Clear structure and organization

## 📝 Notes

- **Keep `/creative-markets` page**: Demo showcase for hackathon features
- **`CreativeMarketCard.tsx`**: Used only by creative-markets demo page
- **`MarketCard.tsx`**: Main card component for homepage
- Both card components serve different purposes and should be kept

## 🚀 Next Steps

1. Consider consolidating card components if creative-markets page is not needed for production
2. Review `src/lib/creative-templates.ts` usage - may be demo-only
3. Ensure all environment variables documented in `.env.example`
4. Update README.md with simplified structure
