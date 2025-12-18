# Contributing to CreativeHead

Thank you for your interest in contributing to CreativeHead! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)

---

## 🤝 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:
- Be respectful and constructive in all interactions
- Focus on what is best for the community
- Show empathy towards other community members

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: Latest version
- **BNB Testnet Faucet**: Get test BNB from https://www.bnbchain.org/en/testnet-faucet

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/CreativeMarket.git
   cd CreativeMarket/someCreativity
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd contracts && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your values
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

---

## 🔄 Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### Branch Naming Conventions
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 2. Make Your Changes
- Write clean, readable code
- Follow the [coding standards](#coding-standards)
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes
```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Test smart contracts
cd contracts
npm test
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add new feature description"
```

#### Commit Message Format
```
<type>: <subject>

<body (optional)>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: add AI confidence scoring to markets
fix: resolve wallet connection timeout issue
docs: update deployment guide with testnet instructions
```

### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## 🏗️ Project Structure

```
someCreativity/
├── src/                              # Frontend source code
│   ├── app/                          # Next.js 15 App Router
│   │   ├── page.tsx                  # Homepage
│   │   ├── layout.tsx                # Root layout
│   │   ├── creative-markets/         # Creative markets showcase
│   │   ├── leaderboard/              # Trader rankings
│   │   ├── trader/[address]/         # Dynamic trader profiles
│   │   └── api/                      # API routes
│   │
│   ├── components/                   # React components
│   │   ├── copy-trading/             # Copy trading components
│   │   │   ├── CopyTradingDashboard.tsx
│   │   │   ├── TraderCard.tsx
│   │   │   └── FollowButton.tsx
│   │   ├── providers/                # Context providers
│   │   │   └── Web3Provider.tsx      # Web3 setup
│   │   └── ui/                       # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── ...
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useMarkets.ts             # Market data
│   │   ├── useReputation.ts          # Reputation system
│   │   └── useCopyTrading.ts         # Copy trading logic
│   │
│   ├── lib/                          # Core business logic
│   │   ├── ai-oracle.ts              # AI judging engine
│   │   ├── gasless-service.ts        # Gasless transactions
│   │   ├── liquidity-aggregator.ts   # AMM liquidity pools
│   │   ├── contracts.ts              # Contract instances
│   │   └── utils.ts                  # Utilities
│   │
│   ├── types/                        # TypeScript definitions
│   │   ├── market.ts
│   │   ├── trader.ts
│   │   └── contracts.ts
│   │
│   └── styles/                       # Global styles
│       └── globals.css
│
├── contracts/                        # Smart contracts
│   ├── contracts/                    # Solidity source
│   │   ├── PredictionMarket.sol      # Core market logic
│   │   ├── TraderReputation.sol      # Reputation system
│   │   ├── AIOracle.sol              # AI oracle integration
│   │   └── GaslessRelayer.sol        # Gasless transactions
│   │
│   ├── scripts/                      # Deployment scripts
│   │   ├── deploy.js                 # Main deployment
│   │   └── deploy-local.js           # Local deployment
│   │
│   └── test/                         # Contract tests
│       ├── PredictionMarket.test.js
│       └── TraderReputation.test.js
│
├── docs/                             # Documentation
│   ├── README.md                     # Documentation index
│   ├── guides/                       # User guides
│   ├── fixes/                        # Technical fixes
│   └── hackathon/                    # Hackathon materials
│
├── scripts/                          # Utility scripts
│   ├── setup.sh                      # Project setup
│   └── verify-features.sh            # Feature verification
│
└── public/                           # Static assets
```

---

## 💻 Coding Standards

### TypeScript/JavaScript

#### Style Guide
- Use **TypeScript** for all new files
- Use **functional components** with hooks
- Follow **camelCase** for variables and functions
- Follow **PascalCase** for components and types
- Use **UPPER_CASE** for constants

#### Example Component
```typescript
import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface MarketCardProps {
  marketId: string;
  question: string;
  deadline: Date;
}

export function MarketCard({ marketId, question, deadline }: MarketCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async () => {
    setIsLoading(true);
    try {
      // Your logic here
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h3>{question}</h3>
      <button onClick={handlePredict} disabled={isLoading}>
        Make Prediction
      </button>
    </Card>
  );
}
```

### Solidity

#### Smart Contract Guidelines
- Follow **Solidity 0.8.x** standards
- Use **OpenZeppelin** contracts when possible
- Add **NatSpec comments** for all public functions
- Include **comprehensive tests**

#### Example Contract
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PredictionMarket
 * @dev Manages prediction markets for creative outcomes
 */
contract PredictionMarket is Ownable {
    /// @notice Creates a new prediction market
    /// @param question The market question
    /// @param deadline Market resolution deadline
    /// @return marketId The ID of the created market
    function createMarket(
        string memory question,
        uint256 deadline
    ) external returns (uint256 marketId) {
        // Implementation
    }
}
```

### File Organization

#### Import Order
1. External packages (React, Next.js)
2. Internal components
3. Hooks
4. Types
5. Utilities
6. Styles

```typescript
// 1. External
import { useState } from 'react';
import Link from 'next/link';

// 2. Components
import { MarketCard } from '@/components/MarketCard';
import { Button } from '@/components/ui/button';

// 3. Hooks
import { useMarkets } from '@/hooks/useMarkets';

// 4. Types
import type { Market } from '@/types/market';

// 5. Utilities
import { formatDate } from '@/lib/utils';

// 6. Styles
import './styles.css';
```

---

## 🧪 Testing Guidelines

### Frontend Testing

#### What to Test
- Component rendering
- User interactions
- State management
- API calls
- Error handling

#### Running Tests
```bash
npm run lint              # Linting
npm run type-check        # Type checking
npm run format:check      # Code formatting
```

### Smart Contract Testing

#### What to Test
- Happy path scenarios
- Edge cases
- Error conditions
- Access control
- Gas optimization

#### Running Tests
```bash
cd contracts
npm test                  # Run all tests
npm test -- --grep "PredictionMarket"  # Specific test
```

#### Example Test
```javascript
describe("PredictionMarket", function() {
  it("Should create a new market", async function() {
    const { market } = await loadFixture(deployMarketFixture);
    
    const question = "Will this design be approved?";
    const deadline = Math.floor(Date.now() / 1000) + 86400;
    
    await expect(market.createMarket(question, deadline))
      .to.emit(market, "MarketCreated")
      .withArgs(0, question, deadline);
  });
});
```

---

## 🔍 Pull Request Process

### Before Submitting

1. ✅ All tests pass
2. ✅ Code is linted and formatted
3. ✅ Types are correct
4. ✅ Documentation is updated
5. ✅ Commit messages follow convention

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console warnings/errors
- [ ] Commits follow convention
```

### Review Process

1. **Automated Checks**: CI/CD runs tests
2. **Code Review**: Maintainer reviews code
3. **Feedback**: Address review comments
4. **Approval**: PR is approved
5. **Merge**: Maintainer merges PR

---

## 📝 Documentation

### When to Update Docs

- Adding new features
- Changing existing behavior
- Fixing bugs (add to fixes/)
- Deployment changes

### Documentation Structure

- **Guides** (`docs/guides/`): Step-by-step instructions
- **Fixes** (`docs/fixes/`): Technical fixes
- **Hackathon** (`docs/hackathon/`): Competition materials
- **README**: Overview and quick start

---

## 🐛 Reporting Bugs

### Before Reporting
1. Check existing issues
2. Check [Fix Documentation](docs/fixes/)
3. Try the latest version

### Bug Report Template
```markdown
**Description**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Ubuntu 22.04]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]
```

---

## 💡 Feature Requests

We welcome feature requests! Please:
1. Check if it already exists
2. Describe the problem it solves
3. Propose a solution
4. Consider implementation complexity

---

## 📞 Questions?

- **Documentation**: Check [docs/](docs/)
- **Issues**: Create a GitHub issue
- **Discussion**: Use GitHub Discussions

---

## 🙏 Thank You!

Your contributions make CreativeHead better for everyone. We appreciate your time and effort!

---

**Happy Coding! 🚀**
