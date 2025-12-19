/**
 * Smart Contract ABIs
 * Generated from compiled contracts
 */

export const PREDICTION_MARKET_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: '_marketId', type: 'uint256' }],
    name: 'claimWinnings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: '_question', type: 'string' },
      { internalType: 'string', name: '_description', type: 'string' },
      { internalType: 'string', name: '_category', type: 'string' },
      { internalType: 'uint256', name: '_endTime', type: 'uint256' },
      { internalType: 'bool', name: '_aiOracleEnabled', type: 'bool' },
    ],
    name: 'createMarket',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'marketCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'markets',
    outputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'string', name: 'question', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'string', name: 'category', type: 'string' },
      { internalType: 'address', name: 'creator', type: 'address' },
      { internalType: 'uint256', name: 'endTime', type: 'uint256' },
      { internalType: 'uint256', name: 'totalYesAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'totalNoAmount', type: 'uint256' },
      { internalType: 'bool', name: 'resolved', type: 'bool' },
      { internalType: 'bool', name: 'outcome', type: 'bool' },
      { internalType: 'uint256', name: 'resolvedAt', type: 'uint256' },
      { internalType: 'bool', name: 'aiOracleEnabled', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_marketId', type: 'uint256' },
      { internalType: 'bool', name: '_position', type: 'bool' },
    ],
    name: 'buyPosition',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_marketId', type: 'uint256' },
      { internalType: 'bool', name: '_outcome', type: 'bool' },
    ],
    name: 'resolveMarket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'positions',
    outputs: [
      { internalType: 'uint256', name: 'yesAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'noAmount', type: 'uint256' },
      { internalType: 'bool', name: 'claimed', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const AI_ORACLE_ABI = [
  // View Functions
  'function resolutionRequests(uint256) external view returns (uint256 marketId, string dataSource, uint256 timestamp, bool resolved, bool outcome, uint256 confidence, string evidenceHash)',
  'function dataSources(string) external view returns (string name, string apiEndpoint, bool active, uint256 successRate)',
  'function aiAgents(address) external view returns (bool)',
  'function predictionMarketContract() external view returns (address)',
  'function requestCount() external view returns (uint256)',
  'function MIN_CONFIDENCE() external view returns (uint256)',

  // Write Functions
  'function requestResolution(uint256 _marketId, string memory _dataSource) external',
  'function provideResolution(uint256 _requestId, bool _outcome, uint256 _confidence, string memory _evidenceHash) external',
  'function addDataSource(string memory _name, string memory _apiEndpoint) external',
  'function setAIAgent(address _agent, bool _authorized) external',
  'function updateDataSource(string memory _name, bool _active, uint256 _successRate) external',

  // Events
  'event ResolutionRequested(uint256 indexed requestId, uint256 indexed marketId, string dataSource)',
  'event ResolutionProvided(uint256 indexed requestId, bool outcome, uint256 confidence)',
  'event DataSourceAdded(string name, string apiEndpoint)',
] as const;

export const TRADER_REPUTATION_ABI = [
  // View Functions
  'function reputations(address) external view returns (uint256 totalTrades, uint256 successfulTrades, uint256 totalVolume, uint256 totalProfit, int256 netProfit, uint256 lastTradeTime, bool isActive)',
  'function getReputation(address _trader) external view returns (uint256 totalTrades, uint256 successfulTrades, uint256 totalVolume, uint256 totalProfit, int256 netProfit, uint256 lastTradeTime, bool isActive)',
  'function getSuccessRate(address _trader) external view returns (uint256)',
  'function getROI(address _trader) external view returns (int256)',
  'function getTier(address _trader) external view returns (string memory)',
  'function canCopyTrade(address _trader, address _copier) external view returns (bool)',

  // Write Functions
  'function recordTrade(address _trader, uint256 _amount, bool _isYes) external',
  'function recordTradeOutcome(address _trader, uint256 _marketId, bool _won, uint256 _payout, uint256 _initialBet) external',
  'function enableCopyTrading() external',
  'function disableCopyTrading() external',

  // Copy Trading Functions
  'function followTrader(address trader, uint256 maxAmountPerTrade, uint256 copyPercentage) external',
  'function unfollowTrader(address trader) external',
  'function getFollowers(address trader) external view returns (address[] memory)',
  'function getFollowing(address follower) external view returns (address[] memory)',
  'function getTraderFollowerCount(address trader) external view returns (uint256)',

  // Events
  'event TradeRecorded(address indexed trader, uint256 amount, bool isYes)',
  'event TradeOutcomeRecorded(address indexed trader, uint256 indexed marketId, bool won, uint256 payout, int256 netProfit)',
  'event CopyTradingEnabled(address indexed trader)',
  'event CopyTradingDisabled(address indexed trader)',
  'event TraderFollowed(address indexed follower, address indexed trader, uint256 maxAmountPerTrade, uint256 copyPercentage)',
  'event TraderUnfollowed(address indexed follower, address indexed trader)',
] as const;

export const GASLESS_RELAYER_ABI = [
  // View Functions
  'function whitelistedContracts(address) external view returns (bool)',
  'function nonces(address) external view returns (uint256)',

  // Write Functions
  'function executeMetaTransaction(address _contract, bytes memory _data, uint256 _nonce, bytes memory _signature) external',
  'function setWhitelistedContract(address _contract, bool _whitelisted) external',

  // Events
  'event MetaTransactionExecuted(address indexed user, address indexed contract, bool success)',
] as const;
