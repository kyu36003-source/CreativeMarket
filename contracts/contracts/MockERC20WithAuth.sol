// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20WithAuth
 * @dev Mock ERC20 token with EIP-3009 transferWithAuthorization for testing
 */
contract MockERC20WithAuth is ERC20 {
    uint8 private _decimals;
    
    // EIP-3009 tracking
    mapping(address => mapping(bytes32 => bool)) public authorizationState;
    
    event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce);
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) {
        _decimals = decimals_;
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    /**
     * @dev EIP-3009 transferWithAuthorization
     * Simplified version for testing - real implementation would verify signature
     */
    function transferWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        bytes memory signature
    ) external {
        require(block.timestamp >= validAfter, "Authorization not yet valid");
        require(block.timestamp <= validBefore, "Authorization expired");
        require(!authorizationState[from][nonce], "Authorization already used");
        require(balanceOf(from) >= value, "Insufficient balance");
        
        // Mark nonce as used
        authorizationState[from][nonce] = true;
        emit AuthorizationUsed(from, nonce);
        
        // Execute transfer
        _transfer(from, to, value);
    }
}
