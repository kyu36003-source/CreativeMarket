// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PredictionMarket.sol";

/**
 * @title X402Betting
 * @dev Implements x402 protocol for gasless betting via EIP-3009 transferWithAuthorization
 * @notice Enables truly gasless betting - users sign payment authorization, facilitator executes
 * @notice This contract handles ERC20 token payments and converts to BNB for PredictionMarket
 */
interface IERC20TransferWithAuth is IERC20 {
    function transferWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        bytes memory signature
    ) external;
}

contract X402Betting is ReentrancyGuard, Ownable {
    PredictionMarket public predictionMarket;
    IERC20TransferWithAuth public bettingToken;
    
    // x402 payment tracking
    mapping(bytes32 => bool) public usedNonces;
    mapping(address => uint256) public gasAllowances; // Sponsored gas per user
    
    // Facilitator settings
    uint256 public facilitatorFee = 50; // 0.5% fee for gas sponsorship
    address public facilitator;
    
    // Token to BNB conversion (simplified - in production use DEX oracle)
    uint256 public tokenToBnbRate = 1e18; // 1 token = 1 BNB (1:1 rate for testing)
    
    event GaslessPositionTaken(
        uint256 indexed marketId,
        address indexed user,
        bool position,
        uint256 amount,
        bytes32 nonce
    );
    
    event GasSponsored(
        address indexed user,
        uint256 amount,
        uint256 newAllowance
    );
    
    constructor(
        address _predictionMarket,
        address _bettingToken
    ) Ownable(msg.sender) {
        predictionMarket = PredictionMarket(payable(_predictionMarket));
        bettingToken = IERC20TransferWithAuth(_bettingToken);
        facilitator = msg.sender;
    }
    
    /**
     * @dev Place bet using x402 protocol (EIP-3009 transferWithAuthorization)
     * @notice Gasless betting - user signs authorization, facilitator executes
     */
    function buyPositionWithAuthorization(
        uint256 marketId,
        bool position,
        address from,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        bytes memory signature
    ) external nonReentrant {
        // Verify caller is facilitator (gas sponsor)
        require(msg.sender == facilitator || msg.sender == owner(), "Only facilitator can execute");
        
        // Check nonce not used (replay protection)
        require(!usedNonces[nonce], "Authorization already used");
        usedNonces[nonce] = true;
        
        // Check time validity
        require(block.timestamp >= validAfter, "Authorization not yet valid");
        require(block.timestamp <= validBefore, "Authorization expired");
        
        // Calculate amounts
        uint256 feeAmount = (value * facilitatorFee) / 10000;
        uint256 betTokenAmount = value - feeAmount;
        
        // Execute EIP-3009 transfer from user to this contract
        bettingToken.transferWithAuthorization(
            from,
            address(this),
            value,
            validAfter,
            validBefore,
            nonce,
            signature
        );
        
        // Convert token amount to BNB equivalent for PredictionMarket
        // Note: Uses tokenToBnbRate conversion (1:1 for simplicity in testnet)
        uint256 betBnbAmount = (betTokenAmount * tokenToBnbRate) / 1e18;
        
        // Ensure contract has enough BNB to cover the bet
        // Facilitator must keep this contract funded with BNB
        require(address(this).balance >= betBnbAmount, "Insufficient BNB balance");
        
        // Place bet in PredictionMarket using BNB
        predictionMarket.buyPositionForUser{value: betBnbAmount}(marketId, position, from);
        
        // Track gas sponsorship
        uint256 gasUsed = tx.gasprice * gasleft();
        gasAllowances[from] += gasUsed;
        
        emit GaslessPositionTaken(marketId, from, position, betBnbAmount, nonce);
        emit GasSponsored(from, gasUsed, gasAllowances[from]);
    }
    
    /**
     * @dev Verify payment authorization (for x402 /verify endpoint)
     * @notice Off-chain verification before settlement
     */
    function verifyAuthorization(
        address from,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        bytes memory /* signature */
    ) external view returns (bool valid, string memory reason) {
        // Check nonce
        if (usedNonces[nonce]) {
            return (false, "nonce_already_used");
        }
        
        // Check time window
        if (block.timestamp < validAfter) {
            return (false, "authorization_not_yet_valid");
        }
        if (block.timestamp > validBefore) {
            return (false, "authorization_expired");
        }
        
        // Check balance
        if (bettingToken.balanceOf(from) < value) {
            return (false, "insufficient_balance");
        }
        
        // All checks passed
        return (true, "");
    }
    
    /**
     * @dev Set facilitator address (gas sponsor)
     */
    function setFacilitator(address _facilitator) external onlyOwner {
        facilitator = _facilitator;
    }
    
    /**
     * @dev Set facilitator fee (basis points)
     */
    function setFacilitatorFee(uint256 _fee) external onlyOwner {
        require(_fee <= 500, "Fee too high"); // Max 5%
        facilitatorFee = _fee;
    }
    
    /**
     * @dev Set token to BNB conversion rate
     * @param _rate Rate in wei (1e18 = 1:1 ratio)
     */
    function setTokenToBnbRate(uint256 _rate) external onlyOwner {
        require(_rate > 0, "Rate must be positive");
        tokenToBnbRate = _rate;
    }
    
    /**
     * @dev Set betting token contract
     */
    function setBettingToken(address _token) external onlyOwner {
        bettingToken = IERC20TransferWithAuth(_token);
    }
    
    /**
     * @dev Withdraw collected token fees
     */
    function withdrawTokenFees() external onlyOwner {
        uint256 tokenBalance = bettingToken.balanceOf(address(this));
        require(tokenBalance > 0, "No token fees to withdraw");
        require(bettingToken.transfer(owner(), tokenBalance), "Transfer failed");
    }
    
    /**
     * @dev Withdraw BNB (in case of overfunding)
     */
    function withdrawBnb() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No BNB to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Receive BNB to fund gasless operations
     * @notice Facilitator funds this contract with BNB for bet execution
     */
    receive() external payable {}
}
