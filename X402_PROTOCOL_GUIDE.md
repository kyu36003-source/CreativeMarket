# 🚀 x402 Protocol Integration - Revolutionary Gasless Betting

## What is x402?

**x402** is an open-source, HTTP-native payment protocol built on the HTTP 402 "Payment Required" status code. Created by Coinbase, it enables **truly gasless transactions** through a simple, elegant flow:

1. **Client requests a resource** (e.g., place bet)
2. **Server responds with 402 Payment Required** + payment requirements
3. **Client signs payment authorization** (EIP-3009 transferWithAuthorization)
4. **Facilitator executes transaction** and sponsors gas
5. **Server returns success** with settlement confirmation

### Why x402 > EIP-4337?

| Feature | x402 Protocol | EIP-4337 Account Abstraction |
|---------|---------------|------------------------------|
| **Purpose** | Micropayments (perfect for betting) | General smart contract wallets |
| **Gas Sponsorship** | Facilitator pays via HTTP flow | Paymaster contract |
| **Complexity** | Add HTTP headers | Deploy AA infrastructure |
| **BSC Compatibility** | ✅ Native EIP-3009 support | ⚠️ Requires bundler network |
| **Transaction Type** | EIP-3009 token transfer | UserOperation |
| **Integration** | Standard HTTP/REST APIs | Custom bundler clients |
| **Battle-tested** | Coinbase (5k+ stars) | Experimental (fewer wallets) |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PredictBNB x402 Flow                      │
└─────────────────────────────────────────────────────────────┘

1. User clicks "🚀 Buy YES" (gasless enabled)
   ↓
2. Frontend → POST /api/markets/1/bet
   ↓
3. Backend ← 402 Payment Required
   {
     "accepts": [{
       "scheme": "exact",
       "network": "eip155:56",
       "amount": "1000000", // 1 USDC
       "asset": "0x...",
       "payTo": "0xX402Betting...",
     }]
   }
   ↓
4. User signs EIP-3009 authorization (NO GAS!)
   - Wallet signs typed data (off-chain)
   - Signature proves user intent to pay
   ↓
5. Frontend → POST /api/markets/1/bet
   Headers: { "PAYMENT-SIGNATURE": "<base64>" }
   ↓
6. Backend calls Facilitator
   - Verifies signature validity
   - Checks user has sufficient balance
   - Executes on-chain transaction (FACILITATOR PAYS GAS)
   ↓
7. X402Betting.buyPositionWithAuthorization()
   - Validates EIP-3009 signature
   - Transfers tokens from user
   - Records bet in PredictionMarket
   ↓
8. Backend → 200 OK + Settlement Response
   Headers: { "PAYMENT-RESPONSE": "<transaction hash>" }
   ↓
9. User's bet is placed ✅ (paid $0 gas!)
```

## Smart Contracts

### 1. X402Betting.sol

Handles gasless betting via EIP-3009 `transferWithAuthorization`:

```solidity
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
    // Only facilitator can execute (gas sponsor)
    require(msg.sender == facilitator, "Only facilitator");
    
    // Replay protection
    require(!usedNonces[nonce], "Nonce used");
    usedNonces[nonce] = true;
    
    // Execute EIP-3009 transfer (token validates signature)
    bettingToken.transferWithAuthorization(
        from, address(predictionMarket), value,
        validAfter, validBefore, nonce, signature
    );
    
    // Record bet
    predictionMarket.buyPositionForUser{value: betAmount}(
        marketId, position, from
    );
    
    // Track gas sponsorship
    gasAllowances[from] += tx.gasprice * gasleft();
}
```

### 2. PredictionMarket.sol (Updated)

Added `buyPositionForUser()` to support facilitator-executed bets:

```solidity
function buyPositionForUser(
    uint256 _marketId,
    bool _position,
    address user
) external payable nonReentrant {
    require(authorizedOracles[msg.sender], "Not authorized");
    _buyPositionInternal(_marketId, _position, user, msg.value);
}
```

## Frontend Integration

### 1. x402Client Service

Handles HTTP 402 flow and EIP-3009 signature creation:

```typescript
// src/services/x402Client.ts
const result = await x402Client.betWithX402(
  marketId,
  position,
  amount,
  walletAddress,
  signTypedDataAsync,
  chainId
);
```

**Flow:**
1. Makes initial request (gets 402 response)
2. Decodes `PAYMENT-REQUIRED` header
3. Creates EIP-3009 signature (user signs typed data)
4. Retries request with `PAYMENT-SIGNATURE` header
5. Returns settlement response

### 2. x402Facilitator Service

Backend service that sponsors gas:

```typescript
// src/services/x402Facilitator.ts
const facilitator = getFacilitator(chainId);

// Verify payment (off-chain check)
const verification = await facilitator.verifyPayment({
  paymentPayload,
  paymentRequirements,
});

// Settle payment (on-chain execution)
const settlement = await facilitator.settlePayment(
  request,
  marketId,
  position
);
```

### 3. React Hook

```typescript
// src/hooks/useX402Bet.ts
const { placeBetGasless, isPending, error } = useX402Bet();

await placeBetGasless(marketId, position, amount);
```

## Setup Instructions

### 1. Deploy Smart Contracts

```bash
cd contracts

# Deploy X402Betting contract
npx hardhat run scripts/deploy-x402.ts --network bscTestnet

# Update PredictionMarket to authorize X402Betting
npx hardhat run scripts/authorize-x402.ts --network bscTestnet
```

### 2. Configure Environment

Add to `.env`:

```bash
# x402 Configuration
NEXT_PUBLIC_X402_BETTING_ADDRESS=0x... # Deployed X402Betting address
NEXT_PUBLIC_BETTING_TOKEN_ADDRESS=0x... # USDC or betting token
FACILITATOR_PRIVATE_KEY=0x... # Facilitator wallet (sponsors gas)
NEXT_PUBLIC_CHAIN_ID=97 # BSC Testnet
```

### 3. Run Facilitator

The facilitator is built into the Next.js API:

```typescript
// app/api/x402/route.ts
import { getFacilitator } from '@/services/x402Facilitator';

export async function POST(request: Request) {
  const facilitator = getFacilitator();
  const result = await facilitator.settlePayment(...);
  return Response.json(result);
}
```

### 4. Test Gasless Betting

```bash
# Start dev server
npm run dev

# Navigate to a market
open http://localhost:3000/markets/1

# Toggle x402 gasless betting ON
# Click "🚀 Buy YES"
# Sign the message (no gas cost!)
# ✅ Bet placed gaslessly!
```

## API Endpoints

### POST /api/markets/:id/bet

**First Request (no payment):**
```http
POST /api/markets/1/bet
Content-Type: application/json

{
  "position": true,
  "amount": "1000000",
  "address": "0x..."
}
```

**Response:**
```http
HTTP/1.1 402 Payment Required
PAYMENT-REQUIRED: <base64 encoded PaymentRequirements>
```

**Second Request (with payment):**
```http
POST /api/markets/1/bet
Content-Type: application/json
PAYMENT-SIGNATURE: <base64 encoded PaymentPayload>

{
  "position": true,
  "amount": "1000000",
  "address": "0x..."
}
```

**Response:**
```http
HTTP/1.1 200 OK
PAYMENT-RESPONSE: <base64 encoded SettlementResponse>

{
  "success": true,
  "transactionHash": "0x..."
}
```

## Security Considerations

### 1. Replay Protection
- Each payment uses unique `nonce` (keccak256(address, marketId, timestamp))
- Contract tracks `usedNonces` mapping
- Nonces cannot be reused

### 2. Time-bounded Authorizations
- `validAfter`: Authorization not valid before this timestamp
- `validBefore`: Authorization expires after this timestamp
- Typical window: 5 minutes (300 seconds)

### 3. Signature Verification
- EIP-3009 signature verified by token contract
- Invalid signatures revert transaction
- Facilitator pre-verifies before spending gas

### 4. Facilitator Trust
- Facilitator can only execute user-signed authorizations
- Cannot move funds without valid signature
- Users always in control of their tokens

## Cost Analysis

### Traditional Bet (User Pays Gas)
- Transaction: ~150,000 gas
- Gas price: 3 Gwei
- Cost: 0.00045 BNB (~$0.27 @ $600 BNB)

### x402 Gasless Bet (Facilitator Pays Gas)
- **User cost: $0** ✅
- User only signs message (off-chain)
- Facilitator pays 0.00045 BNB
- Facilitator recovers via 0.5% fee

### For 100 Bets:
- Traditional: $27 in gas fees ⛽
- x402: $0 in gas fees 🚀
- **Savings: 100%**

## Why This is Revolutionary

1. **HTTP-Native**: Works with any HTTP client (fetch, axios, curl)
2. **No Infrastructure**: No bundlers, no AA wallets, just HTTP
3. **Open Standard**: Coinbase-backed, 5k+ stars on GitHub
4. **Production Ready**: Used by Coinbase, Google, and major platforms
5. **Truly Gasless**: Users NEVER pay gas for bets
6. **Simple Integration**: Add HTTP headers, done!

## Comparison with Other Solutions

### vs EIP-4337 Account Abstraction
- **x402**: HTTP headers + EIP-3009 signatures
- **EIP-4337**: UserOperations + Bundlers + Paymasters
- **Winner**: x402 (simpler, native to payments)

### vs Meta-Transactions
- **x402**: Standard HTTP 402 + EIP-3009
- **Meta-Tx**: Custom relayer infrastructure
- **Winner**: x402 (open standard, better DX)

### vs Gasless Relayers
- **x402**: Protocol-level solution with verification
- **Relayers**: Custom implementation per app
- **Winner**: x402 (interoperable across apps)

## Resources

- **x402 Protocol**: https://github.com/coinbase/x402
- **EIP-3009**: https://eips.ethereum.org/EIPS/eip-3009
- **HTTP 402**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402
- **Demo**: https://x402.org

## Future Enhancements

1. **Automatic Allowances**: Give users daily gasless allowances
2. **Premium Tiers**: Higher allowances for frequent traders
3. **Multi-Token Support**: Support multiple betting tokens
4. **Cross-Chain**: Extend to Ethereum, Polygon, etc.
5. **AI Agent Integration**: Enable AI bots to pay for API access

---

**Built with ❤️ for Seedify Hackathon 2025**

*Making prediction markets accessible to everyone, one gasless bet at a time.* 🚀
