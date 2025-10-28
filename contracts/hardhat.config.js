require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// ============================================================================
// BNB Chain EXCLUSIVE Smart Contract Configuration
// ============================================================================
//
// 🟡 NETWORK SUPPORT: BNB CHAIN ONLY
// This project deploys smart contracts exclusively to BNB Chain (BSC).
//
// Supported Networks:
// ✅ BNB Chain Mainnet (Chain ID: 56)
// ✅ BNB Chain Testnet (Chain ID: 97)
// ✅ Hardhat Local Network (for testing only)
//
// NOT Supported:
// ❌ Ethereum, Polygon, Arbitrum, Optimism, Avalanche, etc.
//
// Why BNB Chain exclusive?
// - Ultra-low gas fees ($0.10-0.30 vs $5-50 on Ethereum)
// - Fast 3-second block times
// - 50M+ active wallets
// - Perfect for prediction market & gasless transactions
//
// See: /docs/BNB_CHAIN_EXCLUSIVE.md
// ============================================================================

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Local Hardhat Network
    hardhat: {
      chainId: 31337,
      mining: {
        auto: true,
        interval: 0,
      },
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 10,
        accountsBalance: "10000000000000000000000", // 10000 ETH
      },
    },
    // Local Network (for external testing)
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // BNB Chain Testnet
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 10000000000, // 10 gwei
    },
    // BNB Chain Mainnet
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 5000000000, // 5 gwei
    },
  },
  etherscan: {
    apiKey: {
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
