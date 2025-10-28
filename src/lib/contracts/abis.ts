/**
 * Smart Contract ABIs
 * Generated from compiled contracts
 */

export const PREDICTION_MARKET_ABI = [
  // View Functions
  'function markets(uint256) external view returns (uint256 id, string question, string description, string category, address creator, uint256 endTime, uint256 totalYesAmount, uint256 totalNoAmount, bool resolved, bool outcome, uint256 resolvedAt, bool aiOracleEnabled)',
  'function marketCount() external view returns (uint256)',
  'function positions(uint256 marketId, address user) external view returns (uint256 yesAmount, uint256 noAmount, bool claimed)',
  'function authorizedOracles(address) external view returns (bool)',
  'function reputationContract() external view returns (address)',
  'function PLATFORM_FEE() external view returns (uint256)',
  'function MIN_BET() external view returns (uint256)',

  // Write Functions
  'function createMarket(string memory _question, string memory _description, string memory _category, uint256 _endTime, bool _aiOracleEnabled) external returns (uint256)',
  'function placeBet(uint256 _marketId, bool _position) external payable',
  'function resolveMarket(uint256 _marketId, bool _outcome) external',
  'function claimWinnings(uint256 _marketId) external',

  // Events
  'event MarketCreated(uint256 indexed marketId, string question, uint256 endTime, address indexed creator)',
  'event PositionTaken(uint256 indexed marketId, address indexed user, bool position, uint256 amount)',
  'event MarketResolved(uint256 indexed marketId, bool outcome, uint256 resolvedAt)',
  'event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount)',
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

  // Events
  'event TradeRecorded(address indexed trader, uint256 amount, bool isYes)',
  'event TradeOutcomeRecorded(address indexed trader, uint256 indexed marketId, bool won, uint256 payout, int256 netProfit)',
  'event CopyTradingEnabled(address indexed trader)',
  'event CopyTradingDisabled(address indexed trader)',
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
