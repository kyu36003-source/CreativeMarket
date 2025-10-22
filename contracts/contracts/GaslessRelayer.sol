// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GaslessRelayer
 * @dev Meta-transaction relayer for gasless user experience
 * @notice Implements YZi Labs track: account abstraction and gasless UX
 */
contract GaslessRelayer is Ownable, ReentrancyGuard {
    struct MetaTransaction {
        address from;
        address to;
        uint256 value;
        bytes data;
        uint256 nonce;
        uint256 deadline;
    }

    mapping(address => uint256) public nonces;
    mapping(address => bool) public whitelistedContracts;
    mapping(address => uint256) public userGasCredits;
    
    uint256 public constant GAS_CREDIT_PER_USER = 10; // Free transactions per user
    
    event MetaTransactionExecuted(
        address indexed user,
        address indexed target,
        bool success
    );
    
    event GasCreditsAdded(address indexed user, uint256 credits);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Execute a meta-transaction (gasless for user)
     */
    function executeMetaTransaction(
        address _from,
        address _to,
        uint256 _value,
        bytes memory _data,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external nonReentrant returns (bool) {
        require(block.timestamp <= _deadline, "Transaction expired");
        require(whitelistedContracts[_to], "Contract not whitelisted");
        require(
            userGasCredits[_from] > 0,
            "No gas credits remaining"
        );

        // Verify signature
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                _from,
                _to,
                _value,
                _data,
                nonces[_from],
                _deadline
            )
        );
        
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        
        address signer = ecrecover(ethSignedHash, _v, _r, _s);
        require(signer == _from, "Invalid signature");
        
        // Increment nonce
        nonces[_from]++;
        
        // Deduct gas credit
        userGasCredits[_from]--;
        
        // Execute transaction
        (bool success, ) = _to.call{value: _value}(_data);
        
        emit MetaTransactionExecuted(_from, _to, success);
        return success;
    }

    /**
     * @dev Add gas credits for a user (sponsor can pay)
     */
    function addGasCredits(address _user, uint256 _credits) 
        external 
        onlyOwner 
    {
        userGasCredits[_user] += _credits;
        emit GasCreditsAdded(_user, _credits);
    }

    /**
     * @dev Whitelist a contract for gasless interactions
     */
    function setWhitelistedContract(address _contract, bool _whitelisted) 
        external 
        onlyOwner 
    {
        whitelistedContracts[_contract] = _whitelisted;
    }

    /**
     * @dev Initialize new users with free gas credits
     */
    function initializeUser(address _user) external {
        if (userGasCredits[_user] == 0) {
            userGasCredits[_user] = GAS_CREDIT_PER_USER;
            emit GasCreditsAdded(_user, GAS_CREDIT_PER_USER);
        }
    }

    /**
     * @dev Fund the relayer (for gas costs)
     */
    receive() external payable {}

    /**
     * @dev Withdraw funds (only owner)
     */
    function withdraw(uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Insufficient balance");
        (bool success, ) = owner().call{value: _amount}("");
        require(success, "Withdrawal failed");
    }
}
