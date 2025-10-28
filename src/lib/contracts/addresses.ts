// Smart Contract Addresses on BNB Chain
export const CONTRACT_ADDRESSES = {
  // BSC Mainnet
  56: {
    PREDICTION_MARKET: '0x0000000000000000000000000000000000000000', // Deploy address here
    AI_ORACLE: '0x0000000000000000000000000000000000000000', // Deploy address here
    GASLESS_RELAYER: '0x0000000000000000000000000000000000000000', // Deploy address here
  },
  // BSC Testnet
  97: {
    PREDICTION_MARKET: '0x0000000000000000000000000000000000000000', // Deploy address here
    AI_ORACLE: '0x0000000000000000000000000000000000000000', // Deploy address here
    GASLESS_RELAYER: '0x0000000000000000000000000000000000000000', // Deploy address here
  },
  // Local Hardhat Network (for development)
  31337: {
    PREDICTION_MARKET: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
    AI_ORACLE: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
    GASLESS_RELAYER: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
  },
} as const;

export const getContractAddress = (
  chainId: number,
  contractName: keyof (typeof CONTRACT_ADDRESSES)[56]
) => {
  if (chainId !== 56 && chainId !== 97 && chainId !== 31337) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return CONTRACT_ADDRESSES[chainId as 56 | 97 | 31337][contractName];
};
