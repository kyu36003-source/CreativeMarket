// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PredictionMarket.sol";
import "./WBNB3009.sol";

/**
 * @title X402BettingBNB
 * @dev x402 protocol for 100% GASLESS BNB betting
 * @notice Users only need BNB, NO separate USDC needed!
 * 
 * REVOLUTIONARY APPROACH:
 * 1. User wraps BNB → WBNB3009 (one-time, pays gas once)
 * 2. User signs WBNB3009 authorization (EIP-3009, off-chain, FREE)
 * 3. Facilitator executes (pays gas)
 * 4. WBNB3009 auto-unwraps to BNB
 * 5. BNB used for betting
 * 
 * RESULT: After initial wrap, ALL bets are 100% GASLESS!
 */
contract X402BettingBNB is ReentrancyGuard, Ownable {
    
    PredictionMarket public predictionMarket;
    WBNB3009 public wbnb;
    
    // x402 payment tracking
    mapping(bytes32 => bool) public usedNonces;
    mapping(address => uint256) public gasCredits; // Sponsored gas tracking
    
    // Facilitator settings
    uint256 public facilitatorFee = 50; // 0.5% (50 basis points)
    address public facilitator;
    
    event GaslessBetPlaced(
        uint256 indexed marketId,
        address indexed user,
        bool position,
        uint256 bnbAmount,
        bytes32 nonce
    );
    
    event GasSponsored(
        address indexed user,
        uint256 gasUsed
    );
    
    event WBNBWrapped(
        address indexed user,
        uint256 amount
    );
    
    constructor(
        address _predictionMarket,
        address _wbnb
    ) Ownable(msg.sender) {
        predictionMarket = PredictionMarket(payable(_predictionMarket));
        wbnb = WBNB3009(payable(_wbnb));
        facilitator = msg.sender;
    }
    
    /**
     * @dev Helper: Wrap BNB to WBNB3009
     * @notice Users can call this directly on WBNB contract or use this helper
     */
    function wrapBNB() external payable {
        wbnb.deposit{value: msg.value}();
        require(wbnb.transfer(msg.sender, msg.value), "Transfer failed");
        emit WBNBWrapped(msg.sender, msg.value);
    }
    
    /**
     * @dev GASLESS BETTING with pure BNB!
     * @notice User signs WBNB3009 authorization, facilitator executes
     * 
     * Flow:
     * 1. User has WBNB3009 balance
     * 2. User signs EIP-3009 authorization (off-chain, no gas)
     * 3. Facilitator calls this function (pays gas)
     * 4. WBNB3009 transferred to contract
     * 5. WBNB3009 unwrapped to BNB
     * 6. BNB sent to PredictionMarket for bet
     * 7. User paid ZERO gas!
     */
    function gaslessBetWithBNB(
        uint256 marketId,
        bool position,
        address from,
        uint256 wbnbValue,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        bytes memory signature
    ) external nonReentrant {
        // Only facilitator can execute (gas sponsor)
        require(msg.sender == facilitator || msg.sender == owner(), "Only facilitator");
        
        // Check nonce not used
        require(!usedNonces[nonce], "Nonce already used");
        usedNonces[nonce] = true;
        
        uint256 gasStart = gasleft();
        
        // Calculate amounts
        uint256 feeAmount = (wbnbValue * facilitatorFee) / 10000;
        uint256 betAmount = wbnbValue - feeAmount;
        
        // Execute EIP-3009 transfer (WBNB3009 from user to contract)
        wbnb.transferWithAuthorization(
            from,
            address(this),
            wbnbValue,
            validAfter,
            validBefore,
            nonce,
            signature
        );
        
        // Unwrap WBNB3009 → BNB
        wbnb.withdraw(betAmount);
        
        // Place bet with native BNB
        predictionMarket.buyPositionForUser{value: betAmount}(
            marketId,
            position,
            from
        );
        
        // Track gas used (for analytics)
        uint256 gasUsed = (gasStart - gasleft()) * tx.gasprice;
        gasCredits[from] += gasUsed;
        
        emit GaslessBetPlaced(marketId, from, position, betAmount, nonce);
        emit GasSponsored(from, gasUsed);
    }
    
    /**
     * @dev Batch gasless bets (multiple bets in one tx)
     * @notice Even more efficient - spread gas cost across multiple bets!
     */
    function batchGaslessBets(
        uint256[] calldata marketIds,
        bool[] calldata positions,
        address[] calldata froms,
        uint256[] calldata wbnbValues,
        uint256[] calldata validAfters,
        uint256[] calldata validBefores,
        bytes32[] calldata nonces,
        bytes[] calldata signatures
    ) external nonReentrant {
        require(msg.sender == facilitator || msg.sender == owner(), "Only facilitator");
        require(
            marketIds.length == positions.length &&
            positions.length == froms.length &&
            froms.length == wbnbValues.length &&
            wbnbValues.length == nonces.length &&
            nonces.length == signatures.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < marketIds.length; i++) {
            // Check nonce
            require(!usedNonces[nonces[i]], "Nonce already used");
            usedNonces[nonces[i]] = true;
            
            uint256 feeAmount = (wbnbValues[i] * facilitatorFee) / 10000;
            uint256 betAmount = wbnbValues[i] - feeAmount;
            
            // Transfer WBNB3009
            wbnb.transferWithAuthorization(
                froms[i],
                address(this),
                wbnbValues[i],
                validAfters[i],
                validBefores[i],
                nonces[i],
                signatures[i]
            );
            
            // Unwrap and bet
            wbnb.withdraw(betAmount);
            predictionMarket.buyPositionForUser{value: betAmount}(
                marketIds[i],
                positions[i],
                froms[i]
            );
            
            emit GaslessBetPlaced(marketIds[i], froms[i], positions[i], betAmount, nonces[i]);
        }
    }
    
    /**
     * @dev GASLESS CLAIM with EIP-712 signature
     * @notice User signs claim authorization, facilitator executes
     * User receives BNB directly, pays ZERO gas!
     */
    function gaslessClaim(
        uint256 marketId,
        address user,
        bytes32 nonce,
        bytes memory signature
    ) external nonReentrant {
        require(msg.sender == facilitator || msg.sender == owner(), "Only facilitator");
        require(!usedNonces[nonce], "Nonce already used");
        
        // TODO: Verify EIP-712 signature for claim authorization
        // For now, trust facilitator (in production, add signature verification)
        
        usedNonces[nonce] = true;
        
        // Claim winnings to this contract
        uint256 balanceBefore = address(this).balance;
        predictionMarket.claimWinnings(marketId);
        uint256 winnings = address(this).balance - balanceBefore;
        
        // Transfer winnings to user
        (bool success, ) = user.call{value: winnings}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Set facilitator address
     */
    function setFacilitator(address _facilitator) external onlyOwner {
        facilitator = _facilitator;
    }
    
    /**
     * @dev Set facilitator fee (in basis points, e.g. 50 = 0.5%)
     */
    function setFacilitatorFee(uint256 _fee) external onlyOwner {
        require(_fee <= 500, "Fee too high"); // Max 5%
        facilitatorFee = _fee;
    }
    
    /**
     * @dev Emergency withdraw BNB (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Receive BNB from WBNB unwrapping
     */
    receive() external payable {}
}
