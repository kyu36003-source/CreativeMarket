// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title WBNB3009
 * @dev Wrapped BNB with EIP-3009 transferWithAuthorization for x402 gasless transactions
 * @notice This allows users to interact with BNB in a gasless way!
 * 
 * How it works:
 * 1. User wraps BNB → gets WBNB3009 tokens
 * 2. User signs EIP-3009 authorization (off-chain, FREE)
 * 3. Facilitator executes authorization (pays gas)
 * 4. WBNB3009 transferred to contract
 * 5. Contract unwraps to native BNB
 * 6. BNB used for betting
 * 
 * Result: User only needs BNB once (to wrap), then ALL future transactions are gasless!
 */
contract WBNB3009 is ERC20, ReentrancyGuard {
    
    // EIP-712 Domain
    bytes32 public DOMAIN_SEPARATOR;
    
    // EIP-3009 typehashes
    bytes32 public constant TRANSFER_WITH_AUTHORIZATION_TYPEHASH = 
        keccak256("TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)");
    
    bytes32 public constant RECEIVE_WITH_AUTHORIZATION_TYPEHASH =
        keccak256("ReceiveWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)");
    
    // Nonce tracking for replay protection
    mapping(address => mapping(bytes32 => bool)) public authorizationState;
    
    // Events
    event Deposit(address indexed account, uint256 amount);
    event Withdrawal(address indexed account, uint256 amount);
    event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce);
    
    constructor() ERC20("Wrapped BNB with x402", "WBNB3009") {
        // Create EIP-712 domain separator
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("Wrapped BNB with x402")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }
    
    /**
     * @dev Wrap BNB to WBNB3009 (1:1)
     */
    function deposit() external payable {
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @dev Unwrap WBNB3009 back to BNB (1:1)
     */
    function withdraw(uint256 amount) external nonReentrant {
        _burn(msg.sender, amount);
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "BNB transfer failed");
        emit Withdrawal(msg.sender, amount);
    }
    
    /**
     * @dev Allow contract to receive BNB for wrapping
     */
    receive() external payable {
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @dev EIP-3009 transferWithAuthorization
     * @notice This is the KEY function for gasless x402 transactions!
     * User signs this off-chain, facilitator executes and pays gas
     */
    function transferWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        bytes memory signature
    ) external nonReentrant {
        // Check time validity
        require(block.timestamp >= validAfter, "Authorization not yet valid");
        require(block.timestamp <= validBefore, "Authorization expired");
        
        // Check nonce not used (replay protection)
        require(!authorizationState[from][nonce], "Authorization already used");
        
        // Verify EIP-712 signature
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        TRANSFER_WITH_AUTHORIZATION_TYPEHASH,
                        from,
                        to,
                        value,
                        validAfter,
                        validBefore,
                        nonce
                    )
                )
            )
        );
        
        address signer = _recoverSigner(digest, signature);
        require(signer == from, "Invalid signature");
        
        // Mark nonce as used
        authorizationState[from][nonce] = true;
        emit AuthorizationUsed(from, nonce);
        
        // Execute transfer
        _transfer(from, to, value);
    }
    
    /**
     * @dev EIP-3009 receiveWithAuthorization
     * @notice Safer version that ensures msg.sender is the recipient
     * Prevents front-running attacks
     */
    function receiveWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        bytes memory signature
    ) external nonReentrant {
        // IMPORTANT: msg.sender must be the recipient (prevents front-running)
        require(to == msg.sender, "Caller must be the payee");
        
        // Check time validity
        require(block.timestamp >= validAfter, "Authorization not yet valid");
        require(block.timestamp <= validBefore, "Authorization expired");
        
        // Check nonce not used
        require(!authorizationState[from][nonce], "Authorization already used");
        
        // Verify EIP-712 signature
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        RECEIVE_WITH_AUTHORIZATION_TYPEHASH,
                        from,
                        to,
                        value,
                        validAfter,
                        validBefore,
                        nonce
                    )
                )
            )
        );
        
        address signer = _recoverSigner(digest, signature);
        require(signer == from, "Invalid signature");
        
        // Mark nonce as used
        authorizationState[from][nonce] = true;
        emit AuthorizationUsed(from, nonce);
        
        // Execute transfer
        _transfer(from, to, value);
    }
    
    /**
     * @dev Recover signer from signature
     */
    function _recoverSigner(bytes32 digest, bytes memory signature) 
        internal 
        pure 
        returns (address) 
    {
        require(signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        // Adjust v if needed
        if (v < 27) {
            v += 27;
        }
        
        require(v == 27 || v == 28, "Invalid signature v value");
        
        address signer = ecrecover(digest, v, r, s);
        require(signer != address(0), "Invalid signature");
        
        return signer;
    }
}
