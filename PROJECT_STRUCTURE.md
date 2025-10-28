# Project Structure & Organization

> Complete guide to CreativeHead's codebase organization

## 📁 Directory Structure

```
someCreativity/
│
├── 📄 Configuration Files (Root Level)
│   ├── package.json                      # Frontend dependencies & scripts
│   ├── tsconfig.json                     # TypeScript configuration
│   ├── next.config.js                    # Next.js configuration
│   ├── tailwind.config.ts                # Tailwind CSS configuration
│   ├── postcss.config.js                 # PostCSS configuration
│   ├── .eslintrc.json                    # ESLint rules
│   ├── .prettierrc.json                  # Prettier formatting
│   ├── .gitignore                        # Git ignore patterns
│   ├── .env.local.example                # Environment template
│   └── vercel.json                       # Vercel deployment config
│
├── 📄 Documentation (Root Level)
│   ├── README.md                         # Main project README
│   ├── CONTRIBUTING.md                   # Contribution guidelines
│   └── PROJECT_STRUCTURE.md              # This file
│
├── 📂 src/ - Frontend Application
│   ├── 📂 app/                           # Next.js 15 App Router
│   │   ├── page.tsx                      # Homepage
│   │   ├── layout.tsx                    # Root layout with providers
│   │   ├── globals.css                   # Global styles
│   │   ├── copy-trading-home.tsx         # Copy trading landing page
│   │   │
│   │   ├── 📂 creative-markets/          # Creative markets showcase
│   │   │   └── page.tsx                  # Markets listing page
│   │   │
│   │   ├── 📂 leaderboard/               # Trader rankings
│   │   │   └── page.tsx                  # Leaderboard page
│   │   │
│   │   ├── 📂 trader/[address]/          # Dynamic trader profiles
│   │   │   └── page.tsx                  # Individual trader page
│   │   │
│   │   ├── 📂 test-wallet/               # Wallet testing utilities
│   │   │   └── page.tsx                  # Wallet debug page
│   │   │
│   │   └── 📂 api/                       # API routes (if any)
│   │
│   ├── 📂 components/                    # React Components
│   │   ├── AIMarketAnalytics.tsx         # AI analytics display
│   │   ├── CreativeMarketCard.tsx        # Market card component
│   │   ├── MarketCard.tsx                # Generic market card
│   │   ├── PredictionModal.tsx           # Prediction interface
│   │   ├── RainbowKitButton.tsx          # Wallet connection button
│   │   ├── WalletConnect.tsx             # Wallet connection logic
│   │   ├── Web3ErrorBoundary.tsx         # Error handling
│   │   │
│   │   ├── 📂 copy-trading/              # Copy trading components
│   │   │   ├── CopyTradingDashboard.tsx  # Dashboard view
│   │   │   ├── TraderCard.tsx            # Trader profile card
│   │   │   ├── FollowButton.tsx          # Follow/unfollow button
│   │   │   └── ...                       # Other copy trading UI
│   │   │
│   │   ├── 📂 providers/                 # Context providers
│   │   │   └── Web3Provider.tsx          # Web3 setup & configuration
│   │   │
│   │   └── 📂 ui/                        # Reusable UI components
│   │       ├── button.tsx                # Button component
│   │       ├── card.tsx                  # Card component
│   │       ├── input.tsx                 # Input component
│   │       └── ...                       # Other UI primitives
│   │
│   ├── 📂 hooks/                         # Custom React Hooks
│   │   ├── index.ts                      # Hook exports
│   │   ├── useMarkets.ts                 # Market data fetching
│   │   ├── useReputation.ts              # Reputation data
│   │   ├── useCopyTrading.ts             # Copy trading logic
│   │   ├── useContract.ts                # Contract interactions
│   │   └── ...                           # Other custom hooks
│   │
│   ├── 📂 lib/                           # Core Business Logic
│   │   ├── ai-oracle.ts                  # AI judging engine
│   │   ├── gasless-service.ts            # Gasless transactions
│   │   ├── liquidity-aggregator.ts       # AMM liquidity pools
│   │   ├── contracts.ts                  # Contract instances
│   │   ├── utils.ts                      # Utility functions
│   │   └── ...                           # Other utilities
│   │
│   ├── 📂 types/                         # TypeScript Definitions
│   │   ├── market.ts                     # Market types
│   │   ├── trader.ts                     # Trader types
│   │   ├── contracts.ts                  # Contract types
│   │   └── ...                           # Other type definitions
│   │
│   └── 📂 styles/                        # Additional Styles
│       └── globals.css                   # Global CSS (if separate)
│
├── 📂 contracts/ - Smart Contracts
│   ├── 📂 contracts/                     # Solidity Source Files
│   │   ├── PredictionMarket.sol          # Core market logic
│   │   ├── TraderReputation.sol          # Reputation system
│   │   ├── AIOracle.sol                  # AI oracle integration
│   │   └── GaslessRelayer.sol            # Gasless transactions
│   │
│   ├── 📂 scripts/                       # Deployment Scripts
│   │   ├── deploy.js                     # Main deployment
│   │   ├── deploy-local.js               # Local deployment
│   │   ├── test-complete.js              # Complete test suite
│   │   └── test-interactions.js          # Interaction tests
│   │
│   ├── 📂 test/                          # Contract Tests
│   │   ├── PredictionMarket.test.js              # Core tests
│   │   ├── PredictionMarket.advanced.test.js     # Advanced tests
│   │   ├── PredictionMarket.comprehensive.test.js # Full coverage
│   │   └── TraderReputation.test.js              # Reputation tests
│   │
│   ├── 📂 artifacts/                     # Compiled contracts (gitignored)
│   ├── 📂 cache/                         # Hardhat cache (gitignored)
│   │
│   ├── hardhat.config.js                 # Hardhat configuration
│   ├── package.json                      # Contract dependencies
│   ├── README.md                         # Contract documentation
│   ├── TEST_SUMMARY.md                   # Test results
│   └── setup-local.sh                    # Local setup script
│
├── 📂 docs/ - Documentation
│   ├── README.md                         # Documentation index
│   │
│   ├── 📂 guides/                        # User Guides
│   │   ├── DEPLOYMENT_GUIDE.md           # Deployment instructions
│   │   ├── LOCAL_TESTING_GUIDE.md        # Local testing guide
│   │   ├── QUICK_START_TESTING.md        # Quick test guide
│   │   ├── QUICKSTART.md                 # Getting started
│   │   ├── QUICK_TEST_REFERENCE.md       # Test commands
│   │   └── WALLET_DEBUG_GUIDE.md         # Wallet debugging
│   │
│   ├── 📂 fixes/                         # Technical Fixes
│   │   ├── API_FIXES.md                  # API bug fixes
│   │   ├── API_IMPLEMENTATION_GUIDE.md   # API implementation
│   │   ├── CONNECTION_FIX_REFERENCE.md   # Connection issues
│   │   ├── ERROR_FIXES_COMPLETE.md       # Error resolutions
│   │   ├── FIX_SUMMARY.md                # Fix summary
│   │   ├── QUICK_FIX_CARD.md             # Quick fixes
│   │   ├── RAINBOWKIT_SETUP.md           # RainbowKit config
│   │   ├── WALLET_FIXED.md               # Wallet fixes
│   │   ├── WALLETCONNECT_FIX_COMPLETE.md # WalletConnect fixes
│   │   ├── WEB3_CONNECTION_FIX.md        # Web3 connection
│   │   └── WEBSOCKET_ERROR_COMPLETE_FIX.md # WebSocket fixes
│   │
│   ├── 📂 hackathon/                     # Hackathon Materials
│   │   ├── HACKATHON_SUBMISSION.md       # Official submission
│   │   ├── HACKATHON_FEATURES_COMPLETE.md # Feature list
│   │   ├── DEMO_VIDEO_SCRIPT.md          # Demo script
│   │   ├── WINNING_STRATEGY.md           # Strategy doc
│   │   └── COPY_TRADING_USP.md           # USP document
│   │
│   ├── 📂 archive/                       # Old Documentation
│   │   ├── README.backup.md              # Old README
│   │   ├── README_OPTIMIZATION.md        # Optimization notes
│   │   └── README_UPDATE_SUMMARY.md      # Update history
│   │
│   └── 📄 Status Documents               # Project Status
│       ├── DEPLOYMENT_READY.md           # Deployment status
│       ├── DOCUMENTATION_INDEX.md        # Doc index (old)
│       ├── FRONTEND_COMPLETE.md          # Frontend status
│       ├── IMPLEMENTATION_SUMMARY.md     # Implementation status
│       ├── ONCHAIN_REPUTATION.md         # Reputation details
│       ├── PROJECT_SUMMARY.md            # Project summary
│       ├── REFACTORING_SUMMARY.md        # Refactoring notes
│       ├── REPUTATION_SUMMARY.md         # Reputation summary
│       ├── TESTING_COMPLETE.md           # Testing status
│       ├── TESTING_SUCCESS.md            # Test results
│       └── TEST_REPORT.md                # Test report
│
├── 📂 scripts/ - Utility Scripts
│   ├── README.md                         # Scripts documentation
│   ├── setup.sh                          # Project setup script
│   └── verify-features.sh                # Feature verification
│
├── 📂 public/ - Static Assets
│   ├── next.svg                          # Next.js logo
│   └── vercel.svg                        # Vercel logo
│
└── 📂 .vscode/ - Editor Configuration
    └── settings.json                     # VS Code settings
```

---

## 🎯 Key Principles

### 1. **Separation of Concerns**
- **Frontend** (`src/`): User interface and interactions
- **Smart Contracts** (`contracts/`): Blockchain logic
- **Documentation** (`docs/`): All project documentation
- **Scripts** (`scripts/`): Utility and automation

### 2. **Clear Naming Conventions**
- **Components**: PascalCase (e.g., `MarketCard.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_CASE (e.g., `API_BASE_URL`)
- **Types**: PascalCase with `Type` suffix (e.g., `MarketType`)

### 3. **Modular Architecture**
- Small, focused files
- Single responsibility principle
- Easy to test and maintain
- Clear dependencies

### 4. **Documentation First**
- Every major feature has documentation
- READMEs in key directories
- Inline code comments for complex logic
- Comprehensive guides for users

---

## 📝 File Responsibilities

### Frontend (`src/`)

#### `app/` - Next.js Pages
- **Purpose**: Route handling and page rendering
- **Contains**: Page components, layouts, route groups
- **Naming**: `page.tsx` for routes, `layout.tsx` for layouts

#### `components/` - React Components
- **Purpose**: Reusable UI components
- **Contains**: Presentational and container components
- **Organization**: By feature or type

#### `hooks/` - Custom Hooks
- **Purpose**: Reusable stateful logic
- **Contains**: Custom React hooks
- **Naming**: `use` prefix (e.g., `useMarkets`)

#### `lib/` - Business Logic
- **Purpose**: Core application logic
- **Contains**: Services, utilities, helpers
- **No React**: Pure TypeScript/JavaScript

#### `types/` - TypeScript Types
- **Purpose**: Type definitions
- **Contains**: Interfaces, types, enums
- **Export**: All types for reuse

### Smart Contracts (`contracts/`)

#### `contracts/` - Solidity Files
- **Purpose**: Smart contract source code
- **Contains**: Solidity contracts (`.sol`)
- **Naming**: PascalCase (e.g., `PredictionMarket.sol`)

#### `scripts/` - Deployment
- **Purpose**: Contract deployment and testing
- **Contains**: JavaScript deployment scripts
- **Usage**: Run with Hardhat

#### `test/` - Contract Tests
- **Purpose**: Smart contract testing
- **Contains**: JavaScript/TypeScript test files
- **Naming**: `*.test.js` pattern

### Documentation (`docs/`)

#### `guides/` - User Guides
- **Purpose**: Step-by-step instructions
- **Audience**: Developers, users, contributors
- **Format**: Markdown with code examples

#### `fixes/` - Technical Fixes
- **Purpose**: Problem resolution documentation
- **Audience**: Developers encountering issues
- **Format**: Problem → Solution → Prevention

#### `hackathon/` - Competition Materials
- **Purpose**: Hackathon-specific documents
- **Audience**: Judges, competitors
- **Format**: Pitch decks, feature lists, demos

---

## 🔍 Finding What You Need

### "I want to..."

#### **Add a new page**
→ Create in `src/app/[route]/page.tsx`

#### **Create a new component**
→ Add to `src/components/` (organized by feature)

#### **Add business logic**
→ Create in `src/lib/` (keep it separate from UI)

#### **Define types**
→ Add to `src/types/` (one file per domain)

#### **Create a hook**
→ Add to `src/hooks/` (start with `use`)

#### **Modify smart contracts**
→ Edit in `contracts/contracts/` (remember to test!)

#### **Add a test**
→ Create in `contracts/test/` (match contract name)

#### **Write documentation**
→ Add to `docs/` (categorize appropriately)

#### **Create a utility script**
→ Add to `scripts/` (make it executable)

---

## 🚀 Development Workflow

### Starting Development

```bash
# 1. Set up the project
./scripts/setup.sh

# 2. Start development server
npm run dev

# 3. In another terminal, start local blockchain
cd contracts && npx hardhat node

# 4. Deploy contracts locally
cd contracts && npx hardhat run scripts/deploy-local.js --network localhost
```

### Making Changes

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# - Edit files in src/ for frontend
# - Edit files in contracts/ for blockchain
# - Update docs/ as needed

# 3. Test changes
npm run lint                    # Frontend linting
npm run type-check              # Type checking
cd contracts && npm test        # Contract tests

# 4. Commit
git add .
git commit -m "feat: add my feature"

# 5. Push and create PR
git push origin feature/my-feature
```

---

## 📦 Build Output

### Development
```
.next/                          # Next.js build cache (gitignored)
contracts/artifacts/            # Compiled contracts (gitignored)
contracts/cache/                # Hardhat cache (gitignored)
node_modules/                   # Dependencies (gitignored)
```

### Production
```
.next/                          # Optimized Next.js build
contracts/artifacts/            # Production contract ABIs
```

---

## 🔒 What's Ignored (.gitignore)

- `node_modules/` - Dependencies
- `.next/` - Next.js build cache
- `*.log` - Log files
- `.env*.local` - Environment variables
- `artifacts/` - Compiled contracts
- `cache/` - Build caches
- `*.tsbuildinfo` - TypeScript build info

---

## 📊 Metrics

### Project Size
- **Total Files**: ~200
- **Lines of Code**: ~15,000
- **Components**: ~40
- **Smart Contracts**: 4
- **Test Files**: 5+
- **Documentation Pages**: 40+

### Organization Quality
- ✅ Clear structure
- ✅ Consistent naming
- ✅ Well documented
- ✅ Easy to navigate
- ✅ Maintainable

---

## 🤝 Contributing

When adding new files:
1. **Choose the right directory** (use this guide)
2. **Follow naming conventions**
3. **Add documentation** if needed
4. **Update this file** if structure changes

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.

---

## 📞 Questions?

- **Structure unclear?** Check [docs/README.md](../docs/README.md)
- **Need help?** See [guides/QUICKSTART.md](../docs/guides/QUICKSTART.md)
- **Want to contribute?** Read [CONTRIBUTING.md](../CONTRIBUTING.md)

---

**Maintained By**: CreativeHead Team  
**Last Updated**: October 2025  
**Version**: 1.0.0
