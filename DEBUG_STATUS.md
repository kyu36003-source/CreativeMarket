# 🔍 Debug Checklist - "Loading Markets" Issue

## Current Status:
- ✅ Hardhat node: RUNNING (port 8545)
- ✅ Contracts deployed: YES (new addresses)
- ✅ Next.js server: RUNNING (port 3000)  
- ✅ Contract addresses: UPDATED in code
- ❌ Markets: NOT LOADING (stuck on "Loading markets...")

## Possible Issues:

### 1. Browser Still Has Old Cached Code
**Symptom**: Browser still trying to use old contract addresses
**Solution**:
```bash
# Hard refresh browser
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# OR open incognito window
Ctrl + Shift + N
```

### 2. Chain ID Mismatch
**Symptom**: `useChainId()` returns unexpected value
**Check**: Open browser console (F12) and look for:
- "Unsupported chain ID" errors
- "undefined" chain ID
- Wallet not connected (chainId might be undefined)

**Solution**: 
- Frontend reads from blockchain WITHOUT wallet connection
- Check if wagmi is defaulting to wrong chain
- Verify localhost chain is in config

### 3. RPC Connection Issue
**Symptom**: Can't connect to http://127.0.0.1:8545
**Check**: 
```bash
# Test RPC directly
curl -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Should return**: Block number (e.g., `{"jsonrpc":"2.0","id":1,"result":"0xc"}`)

### 4. Contract ABI Mismatch
**Symptom**: Contract calls fail silently
**Check**: Ensure `PREDICTION_MARKET_ABI` has `markets` and `marketCount` functions

### 5. Market IDs Start at 0, Not 1
**Symptom**: Calling `useMarket(1)` but markets start at index 0
**Solution**: Try fetching `useMarket(0)`, `useMarket(1)`, `useMarket(2)`

---

## Quick Diagnostic Steps:

### Step 1: Open Browser Console (F12)
Look for errors related to:
- ❌ RPC calls failing
- ❌ "Cannot read contract"
- ❌ Chain ID issues
- ❌ Network errors

### Step 2: Check Network Tab
Filter by "8545" - should see requests to:
- `http://127.0.0.1:8545`
- Response should be JSON-RPC

### Step 3: Test Hardhat Node
```bash
cd contracts
npx hardhat console --network localhost
```

Then in console:
```javascript
const PredictionMarket = await ethers.getContractAt("PredictionMarket", "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318");
await PredictionMarket.marketCount(); // Should return 3n
await PredictionMarket.markets(1); // Should return market data
```

### Step 4: Check Contract Addresses in Browser
Add temporary console.log in `useMarket`:
```typescript
export function useMarket(marketId: number) {
  const chainId = useChainId();
  console.log('🔍 DEBUG - chainId:', chainId);
  console.log('🔍 DEBUG - marketId:', marketId);
  console.log('🔍 DEBUG - address:', getContractAddress(chainId, 'PREDICTION_MARKET'));
  
  return useReadContract({
    address: getContractAddress(chainId, 'PREDICTION_MARKET') as \`0x\${string}\`,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'markets',
    args: [BigInt(marketId)],
  });
}
```

---

## Most Likely Issues (In Order):

### 1. 🥇 Browser Cache (90% probability)
- Old JavaScript still loaded
- Using old contract addresses
- **Fix**: Hard refresh or incognito window

### 2. 🥈 Chain ID Issue (5% probability)
- wagmi defaulting to wrong chain
- useChainId() returning undefined when not connected
- **Fix**: Check web3-config.ts, ensure localhost is default

### 3. 🥉 Market ID Offset (3% probability)
- Markets might start at ID 0, not 1
- **Fix**: Try fetching market 0, 1, 2 instead of 1, 2, 3

### 4. RPC Connection (2% probability)
- Hardhat node not responding
- Port blocked
- **Fix**: Check with curl, restart node

---

## Immediate Action Plan:

1. **Hard refresh browser** (`Ctrl+Shift+R`)
2. **Open console** (F12) and screenshot any errors
3. **Check if you see**:
   ```
   🔍 DEBUG - chainId: 31337
   🔍 DEBUG - marketId: 1
   🔍 DEBUG - address: 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318
   ```
4. **If NO console logs appear**: React hooks not executing (bigger issue)
5. **If you see "undefined chainId"**: Wagmi not initializing properly

---

## Nuclear Option (If Nothing Works):

```bash
# Kill everything
pkill -f "hardhat node"
pkill -f "next dev"

# Clear all caches
cd /home/gen-g/Documents/CreativeHead/someCreativity
rm -rf .next
rm -rf node_modules/.cache

# Restart Hardhat
cd contracts
npx hardhat node &

# Deploy contracts (wait 5 seconds after node starts)
sleep 5
npx hardhat run scripts/deploy-local.js --network localhost

# Update addresses in code with NEW addresses from output

# Restart frontend
cd ..
npm run dev

# Open INCOGNITO browser window
# Navigate to http://localhost:3000
```

---

## Expected Console Output (When Working):

```
🔍 DEBUG - chainId: 31337
🔍 DEBUG - marketId: 1  
🔍 DEBUG - address: 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318
✅ Market data loaded: {id: 1n, question: "Will Bitcoin reach $100,000...", ...}
```

## Expected Network Tab (When Working):

```
POST http://127.0.0.1:8545
Request: {"jsonrpc":"2.0","method":"eth_call","params":[{...}],"id":1}
Response: {"jsonrpc":"2.0","id":1,"result":"0x..."}
Status: 200 OK
```

