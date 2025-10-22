// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TraderReputation.sol";

/**
 * @title PredictionMarket
 * @dev Decentralized prediction market on BNB Chain with AI-assisted oracle integration
 * @notice Built for Seedify Hackathon 2025 - Now with on-chain reputation and copy trading
 */
contract PredictionMarket is ReentrancyGuard, Ownable {
    struct Market {
        uint256 id;
        string question;
        string description;
        string category;
        address creator;
        uint256 endTime;
        uint256 totalYesAmount;
        uint256 totalNoAmount;
        bool resolved;
        bool outcome;
        uint256 resolvedAt;
        bool aiOracleEnabled;
    }

    struct Position {
        uint256 yesAmount;
        uint256 noAmount;
        bool claimed;
    }

    // State variables
    uint256 public marketCount;
    uint256 public constant PLATFORM_FEE = 200; // 2% fee (in basis points)
    uint256 public constant MIN_BET = 0.01 ether;
    
    TraderReputation public reputationContract;
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Position)) public positions;
    mapping(address => bool) public authorizedOracles;
    
    // Events
    event MarketCreated(
        uint256 indexed marketId,
        string question,
        uint256 endTime,
        address indexed creator
    );
    
    event PositionTaken(
        uint256 indexed marketId,
        address indexed user,
        bool position,
        uint256 amount
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        bool outcome,
        uint256 resolvedAt
    );
    
    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );

    constructor() Ownable(msg.sender) {
        // Initialize with deployer as authorized oracle
        authorizedOracles[msg.sender] = true;
        
        // Deploy reputation contract with this contract as owner
        reputationContract = new TraderReputation(address(this));
    }
    
    /**
     * @dev Set reputation contract address (for existing deployments)
     */
    function setReputationContract(address _reputationContract) external onlyOwner {
        reputationContract = TraderReputation(_reputationContract);
    }

    /**
     * @dev Create a new prediction market
     */
    function createMarket(
        string memory _question,
        string memory _description,
        string memory _category,
        uint256 _endTime,
        bool _aiOracleEnabled
    ) external returns (uint256) {
        require(_endTime > block.timestamp, "End time must be in the future");
        require(bytes(_question).length > 0, "Question cannot be empty");

        marketCount++;
        uint256 marketId = marketCount;

        markets[marketId] = Market({
            id: marketId,
            question: _question,
            description: _description,
            category: _category,
            creator: msg.sender,
            endTime: _endTime,
            totalYesAmount: 0,
            totalNoAmount: 0,
            resolved: false,
            outcome: false,
            resolvedAt: 0,
            aiOracleEnabled: _aiOracleEnabled
        });

        emit MarketCreated(marketId, _question, _endTime, msg.sender);
        return marketId;
    }

    /**
     * @dev Buy a position in a market (YES or NO)
     */
    function buyPosition(uint256 _marketId, bool _position) 
        external 
        payable 
        nonReentrant 
    {
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        require(block.timestamp < market.endTime, "Market has ended");
        require(msg.value >= MIN_BET, "Bet amount too low");

        Position storage userPosition = positions[_marketId][msg.sender];

        if (_position) {
            userPosition.yesAmount += msg.value;
            market.totalYesAmount += msg.value;
        } else {
            userPosition.noAmount += msg.value;
            market.totalNoAmount += msg.value;
        }

        emit PositionTaken(_marketId, msg.sender, _position, msg.value);
        
        // Record bet in reputation contract
        if (address(reputationContract) != address(0)) {
            reputationContract.recordBet(msg.sender, _marketId, msg.value, _position);
            
            // Check for copy traders and execute copy trades
            _executeCopyTrades(_marketId, msg.sender, _position, msg.value);
        }
    }
    
    /**
     * @dev Execute copy trades for followers
     */
    function _executeCopyTrades(
        uint256 _marketId,
        address trader,
        bool _position,
        uint256 amount
    ) internal {
        address[] memory traderFollowers = reputationContract.getFollowers(trader);
        
        for (uint256 i = 0; i < traderFollowers.length; i++) {
            address follower = traderFollowers[i];
            
            // Get copy trade settings
            (
                uint256 maxAmountPerTrade,
                uint256 copyPercentage,
                bool active,
                ,
                
            ) = reputationContract.getCopyTradeSettings(follower, trader);
            
            if (!active) continue;
            
            // Calculate copy amount
            uint256 copyAmount = (amount * copyPercentage) / 100;
            if (copyAmount > maxAmountPerTrade) {
                copyAmount = maxAmountPerTrade;
            }
            
            // Check follower has enough balance (simplified - in production use escrow)
            if (copyAmount < MIN_BET) continue;
            
            // Record copy trade position
            Position storage followerPosition = positions[_marketId][follower];
            if (_position) {
                followerPosition.yesAmount += copyAmount;
                markets[_marketId].totalYesAmount += copyAmount;
            } else {
                followerPosition.noAmount += copyAmount;
                markets[_marketId].totalNoAmount += copyAmount;
            }
            
            // Record in reputation contract
            reputationContract.recordCopyTrade(follower, trader, _marketId, copyAmount);
        }
    }

    /**
     * @dev Resolve a market (only authorized oracles)
     */
    function resolveMarket(uint256 _marketId, bool _outcome) 
        external 
        nonReentrant 
    {
        require(authorizedOracles[msg.sender], "Not authorized oracle");
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        require(block.timestamp >= market.endTime, "Market has not ended");

        market.resolved = true;
        market.outcome = _outcome;
        market.resolvedAt = block.timestamp;

        emit MarketResolved(_marketId, _outcome, block.timestamp);
        
        // Update reputation for all participants
        if (address(reputationContract) != address(0)) {
            _updateParticipantReputation(_marketId, _outcome);
        }
    }
    
    /**
     * @dev Update reputation for all market participants after resolution
     * @dev Note: In production, process this in batches or off-chain to avoid gas limits
     * @dev For this implementation, reputation updates happen on claim instead
     */
    function _updateParticipantReputation(uint256 /* _marketId */, bool /* outcome */) internal pure {
        // Placeholder - reputation updates happen on claimWinnings instead
        // This prevents hitting gas limits when processing large markets
    }

    /**
     * @dev Claim winnings from a resolved market
     */
    function claimWinnings(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved");
        
        Position storage userPosition = positions[_marketId][msg.sender];
        require(!userPosition.claimed, "Already claimed");
        
        uint256 winningAmount = calculateWinnings(_marketId, msg.sender);
        require(winningAmount > 0, "No winnings to claim");
        
        userPosition.claimed = true;
        
        // Deduct platform fee
        uint256 fee = (winningAmount * PLATFORM_FEE) / 10000;
        uint256 payout = winningAmount - fee;
        
        // Determine if user won or lost
        bool won = false;
        uint256 userBet = 0;
        if (market.outcome) {
            userBet = userPosition.yesAmount;
            won = userBet > 0;
        } else {
            userBet = userPosition.noAmount;
            won = userBet > 0;
        }
        
        // Update reputation
        if (address(reputationContract) != address(0) && userBet > 0) {
            uint256 profit = won ? (payout > userBet ? payout - userBet : 0) : 0;
            reputationContract.settleBet(msg.sender, _marketId, won, profit);
        }
        
        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Transfer failed");
        
        emit WinningsClaimed(_marketId, msg.sender, payout);
    }

    /**
     * @dev Calculate potential winnings for a user
     */
    function calculateWinnings(uint256 _marketId, address _user) 
        public 
        view 
        returns (uint256) 
    {
        Market storage market = markets[_marketId];
        if (!market.resolved) return 0;
        
        Position storage userPosition = positions[_marketId][_user];
        if (userPosition.claimed) return 0;
        
        uint256 userBet;
        uint256 totalWinningBets;
        uint256 totalLosingBets;
        
        if (market.outcome) {
            // YES won
            userBet = userPosition.yesAmount;
            totalWinningBets = market.totalYesAmount;
            totalLosingBets = market.totalNoAmount;
        } else {
            // NO won
            userBet = userPosition.noAmount;
            totalWinningBets = market.totalNoAmount;
            totalLosingBets = market.totalYesAmount;
        }
        
        if (userBet == 0 || totalWinningBets == 0) return 0;
        
        // Calculate proportional share of losing bets
        uint256 share = (userBet * totalLosingBets) / totalWinningBets;
        return userBet + share;
    }

    /**
     * @dev Get market odds (in percentage)
     */
    function getMarketOdds(uint256 _marketId) 
        external 
        view 
        returns (uint256 yesOdds, uint256 noOdds) 
    {
        Market storage market = markets[_marketId];
        uint256 total = market.totalYesAmount + market.totalNoAmount;
        
        if (total == 0) {
            return (5000, 5000); // 50/50 if no bets
        }
        
        yesOdds = (market.totalYesAmount * 10000) / total;
        noOdds = (market.totalNoAmount * 10000) / total;
    }

    /**
     * @dev Add or remove authorized oracle
     */
    function setAuthorizedOracle(address _oracle, bool _authorized) 
        external 
        onlyOwner 
    {
        authorizedOracles[_oracle] = _authorized;
    }

    /**
     * @dev Get all market IDs
     */
    function getAllMarkets() external view returns (uint256[] memory) {
        uint256[] memory marketIds = new uint256[](marketCount);
        for (uint256 i = 1; i <= marketCount; i++) {
            marketIds[i - 1] = i;
        }
        return marketIds;
    }

    /**
     * @dev Get user position in a market
     */
    function getUserPosition(uint256 _marketId, address _user) 
        external 
        view 
        returns (uint256 yesAmount, uint256 noAmount, bool claimed) 
    {
        Position storage pos = positions[_marketId][_user];
        return (pos.yesAmount, pos.noAmount, pos.claimed);
    }

    /**
     * @dev Withdraw platform fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    receive() external payable {}
}
