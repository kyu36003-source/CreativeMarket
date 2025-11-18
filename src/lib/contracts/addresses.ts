// Smart Contract Addresses on BNB Chain
export const CONTRACT_ADDRESSES = {
  // BSC Mainnet
  56: {
    PREDICTION_MARKET: '0x0000000000000000000000000000000000000000', // Deploy address here
    AI_ORACLE: '0x0000000000000000000000000000000000000000', // Deploy address here
    GASLESS_RELAYER: '0x0000000000000000000000000000000000000000', // Deploy address here
  },
  // BSC Testnet (also used for local Hardhat with Chain ID 97)
  97: {
    PREDICTION_MARKET: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    AI_ORACLE: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    GASLESS_RELAYER: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  },
  // Local Hardhat Network (for development) - Chain ID 31337
  31337: {
    PREDICTION_MARKET: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    AI_ORACLE: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    GASLESS_RELAYER: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  },
  // Local Hardhat Network (alternate) - Chain ID 1337
  1337: {
    PREDICTION_MARKET: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    AI_ORACLE: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    GASLESS_RELAYER: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  },
} as const;

export const getContractAddress = (
  chainId: number,
  contractName: keyof (typeof CONTRACT_ADDRESSES)[56]
) => {
  if (chainId !== 56 && chainId !== 97 && chainId !== 31337 && chainId !== 1337) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return CONTRACT_ADDRESSES[chainId as 56 | 97 | 31337 | 1337][contractName];
};
