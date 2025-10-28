# Quick Reference: Project Organization

> Fast lookup guide for navigating the CreativeHead project

## 📍 Where Do I Find...?

### 🚀 Getting Started
| Need | Location |
|------|----------|
| Project overview | `README.md` |
| Quick start guide | `docs/guides/QUICKSTART.md` |
| Setup script | `scripts/setup.sh` |
| Testing guide | `docs/guides/LOCAL_TESTING_GUIDE.md` |

### 📝 Documentation
| Type | Location |
|------|----------|
| All documentation | `docs/README.md` ← **START HERE** |
| User guides | `docs/guides/` |
| Technical fixes | `docs/fixes/` |
| Hackathon materials | `docs/hackathon/` |
| Old versions | `docs/archive/` |

### 💻 Code
| Component | Location |
|-----------|----------|
| Frontend pages | `src/app/` |
| React components | `src/components/` |
| Custom hooks | `src/hooks/` |
| Business logic | `src/lib/` |
| Type definitions | `src/types/` |
| Smart contracts | `contracts/contracts/` |

### 🔧 Development
| Need | Location |
|------|----------|
| Structure guide | `PROJECT_STRUCTURE.md` |
| Contributing rules | `CONTRIBUTING.md` |
| Contract docs | `contracts/README.md` |
| Scripts docs | `scripts/README.md` |

### 🐛 Troubleshooting
| Issue | Location |
|-------|----------|
| Wallet problems | `docs/guides/WALLET_DEBUG_GUIDE.md` |
| API issues | `docs/fixes/API_FIXES.md` |
| Connection issues | `docs/fixes/WEB3_CONNECTION_FIX.md` |
| All fixes | `docs/fixes/` |

---

## 🗂️ Directory Cheat Sheet

```
someCreativity/
├── 📄 README.md                    # START: Project overview
├── 📄 CONTRIBUTING.md              # How to contribute
├── 📄 PROJECT_STRUCTURE.md         # Detailed structure
│
├── 📂 src/                         # Frontend code
│   ├── app/                        # Next.js pages
│   ├── components/                 # React components
│   ├── hooks/                      # Custom hooks
│   ├── lib/                        # Business logic
│   └── types/                      # TypeScript types
│
├── 📂 contracts/                   # Blockchain
│   ├── README.md                   # Contract docs
│   ├── contracts/                  # Solidity files
│   ├── scripts/                    # Deploy scripts
│   └── test/                       # Contract tests
│
├── 📂 docs/                        # Documentation
│   ├── README.md                   # Doc hub ⭐
│   ├── guides/                     # How-to guides
│   ├── fixes/                      # Solutions
│   ├── hackathon/                  # Competition
│   └── archive/                    # Historical
│
├── 📂 scripts/                     # Utilities
│   ├── README.md                   # Scripts guide
│   ├── setup.sh                    # Setup project
│   └── verify-features.sh          # Verify install
│
└── 📂 public/                      # Static files
```

---

## 🎯 Common Tasks

### I want to...

#### **Start development**
```bash
./scripts/setup.sh
npm run dev
```
📖 See: `docs/guides/QUICKSTART.md`

#### **Deploy contracts**
```bash
cd contracts
npm run deploy:testnet
```
📖 See: `contracts/README.md`

#### **Add a new feature**
1. Read: `CONTRIBUTING.md`
2. Understand: `PROJECT_STRUCTURE.md`
3. Create branch
4. Make changes
5. Update docs

#### **Fix a bug**
1. Check: `docs/fixes/` for existing solutions
2. Search: Known issues in documentation
3. Test: `npm run test`
4. Document: Add to `docs/fixes/` if new

#### **Add documentation**
| Type | Add to |
|------|--------|
| User guide | `docs/guides/` |
| Fix/solution | `docs/fixes/` |
| Project update | `docs/` |
| Script | `scripts/` + update README |

#### **Run tests**
```bash
# Frontend
npm run lint
npm run type-check

# Contracts
cd contracts && npm test
```

---

## 📚 Documentation Flow

```
1. README.md
   └─> Overview & quick start
       
2. docs/README.md
   └─> Documentation hub
       ├─> docs/guides/      (How to use)
       ├─> docs/fixes/       (How to fix)
       └─> docs/hackathon/   (Competition)

3. PROJECT_STRUCTURE.md
   └─> Detailed codebase layout

4. CONTRIBUTING.md
   └─> How to contribute
```

---

## 🔍 Search Strategies

### By File Type
```bash
# Find all documentation
ls docs/**/*.md

# Find all components
ls src/components/**/*.tsx

# Find all contracts
ls contracts/contracts/*.sol
```

### By Topic
| Topic | Search in |
|-------|-----------|
| Setup/installation | `docs/guides/` |
| Bugs/issues | `docs/fixes/` |
| Features | `docs/hackathon/` |
| Code patterns | `CONTRIBUTING.md` |

---

## ⚡ Quick Commands

```bash
# Setup
./scripts/setup.sh

# Develop
npm run dev

# Test
npm run lint && npm run type-check

# Deploy
npm run deploy:testnet

# Verify
./scripts/verify-features.sh
```

---

## 🎓 Learning Path

### New to Project
1. `README.md` - Overview
2. `docs/guides/QUICKSTART.md` - Get started
3. `PROJECT_STRUCTURE.md` - Understand layout

### Ready to Contribute
1. `CONTRIBUTING.md` - Guidelines
2. `PROJECT_STRUCTURE.md` - Structure details
3. `docs/fixes/` - Common issues

### Want to Deploy
1. `docs/guides/DEPLOYMENT_GUIDE.md`
2. `contracts/README.md`
3. Test locally first!

---

## 📞 Still Lost?

1. **Check**: `docs/README.md` - Documentation hub
2. **Search**: `docs/fixes/` - Known solutions
3. **Read**: `PROJECT_STRUCTURE.md` - Full details
4. **Ask**: Create GitHub issue

---

## 🎯 Remember

- **Documentation**: `docs/README.md`
- **Structure**: `PROJECT_STRUCTURE.md`
- **Contributing**: `CONTRIBUTING.md`
- **Contracts**: `contracts/README.md`
- **Scripts**: `scripts/README.md`

---

**Last Updated**: October 2025  
**Status**: ✅ Fully Organized
