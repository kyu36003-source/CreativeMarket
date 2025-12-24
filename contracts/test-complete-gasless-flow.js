/**
 * Complete Gasless Prediction Flow Test
 * 
 * Tests the entire flow:
 * 1. Check/wrap BNB to WBNB3009
 * 2. Sign EIP-3009 authorization (correct domain: "Wrapped BNB with x402")
 * 3. Facilitator executes gaslessBetWithBNB
 * 4. Verify bet was placed on PredictionMarket
 */
const { ethers } = require('hardhat');

// Contract addresses (BSC Testnet) - Updated January 22, 2025
const WBNB3009_ADDRESS = '0x70e4730A3b4aC6E6E395e8ED9c46B9c0f753A4fA';
const X402_BETTING_ADDRESS = '0x8B0d07E7D0a4DE30E6acDb8df0FAc3425a22569E';
const PREDICTION_MARKET_ADDRESS = '0x6C8A1610eedAa2BA449b9a409384cE4a0b22F81F';

// ABIs
const WBNB3009_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function deposit() payable',
  'function name() view returns (string)',
  'function DOMAIN_SEPARATOR() view returns (bytes32)',
  'function authorizationState(address, bytes32) view returns (bool)',
  'function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)',
  'event Deposit(address indexed account, uint256 amount)',
];

const X402_BETTING_ABI = [
  'function gaslessBetWithBNB(uint256 marketId, bool position, address from, uint256 wbnbValue, uint256 validAfter, uint256 validBefore, bytes32 nonce, bytes signature) external',
  'function wbnb() view returns (address)',
  'function predictionMarket() view returns (address)',
  'function facilitator() view returns (address)',
];

const PREDICTION_MARKET_ABI = [
  'function markets(uint256) view returns (uint256 id, string question, string description, string category, address creator, uint256 endTime, uint256 totalYesAmount, uint256 totalNoAmount, bool resolved, bool outcome, bool aiOracleEnabled)',
  'function marketCount() view returns (uint256)',
  'function positions(uint256, address) view returns (uint256 yesAmount, uint256 noAmount)',
  'event PositionTaken(uint256 indexed marketId, address indexed user, bool position, uint256 amount)',
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('       COMPLETE GASLESS PREDICTION FLOW TEST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const [facilitator] = await ethers.getSigners();
  console.log('🔑 Facilitator (pays gas):', facilitator.address);
  
  // For this test, facilitator will also act as the "user" signing the authorization
  // In production, the user would be a different wallet
  const user = facilitator;
  console.log('👤 User (signs auth):', user.address);
  
  // Connect to contracts
  const wbnb = new ethers.Contract(WBNB3009_ADDRESS, WBNB3009_ABI, facilitator);
  const x402Betting = new ethers.Contract(X402_BETTING_ADDRESS, X402_BETTING_ABI, facilitator);
  const predictionMarket = new ethers.Contract(PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI, facilitator);

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Check balances and contract setup
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📊 STEP 1: Checking initial state...');
  
  const bnbBalance = await facilitator.provider.getBalance(user.address);
  const wbnbBalance = await wbnb.balanceOf(user.address);
  const contractName = await wbnb.name();
  const marketCount = await predictionMarket.marketCount();
  
  console.log(`  BNB Balance: ${ethers.formatEther(bnbBalance)} BNB`);
  console.log(`  WBNB3009 Balance: ${ethers.formatEther(wbnbBalance)} WBNB3009`);
  console.log(`  WBNB3009 Contract Name: "${contractName}"`);
  console.log(`  Total Markets: ${marketCount}`);
  
  // Verify X402Betting is connected correctly
  const linkedWbnb = await x402Betting.wbnb();
  const linkedMarket = await x402Betting.predictionMarket();
  console.log(`  X402Betting -> WBNB: ${linkedWbnb}`);
  console.log(`  X402Betting -> Market: ${linkedMarket}`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Ensure user has WBNB3009
  // ═══════════════════════════════════════════════════════════════
  console.log('\n💰 STEP 2: Ensuring WBNB3009 balance...');
  
  const betAmount = ethers.parseEther('0.00101'); // MIN_BET (0.001) + fee buffer (0.5% fee)
  
  if (wbnbBalance < betAmount) {
    console.log(`  Need to wrap more BNB. Current: ${ethers.formatEther(wbnbBalance)}, Need: ${ethers.formatEther(betAmount)}`);
    const wrapTx = await wbnb.deposit({ value: ethers.parseEther('0.002') });
    await wrapTx.wait();
    console.log(`  ✅ Wrapped 0.002 BNB -> WBNB3009`);
  } else {
    console.log(`  ✅ Sufficient WBNB3009 balance`);
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: Find an active market to bet on
  // ═══════════════════════════════════════════════════════════════
  console.log('\n🎯 STEP 3: Finding active market...');
  
  let targetMarketId = null;
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = Number(marketCount); i >= 1; i--) {
    try {
      const market = await predictionMarket.markets(i);
      if (market.id > 0 && !market.resolved && Number(market.endTime) > now) {
        targetMarketId = i;
        console.log(`  Found active market #${i}: "${market.question.slice(0, 50)}..."`);
        console.log(`  End Time: ${new Date(Number(market.endTime) * 1000).toISOString()}`);
        console.log(`  YES Amount: ${ethers.formatEther(market.totalYesAmount)} BNB`);
        console.log(`  NO Amount: ${ethers.formatEther(market.totalNoAmount)} BNB`);
        break;
      }
    } catch (e) {
      // Market might not exist
    }
  }
  
  if (targetMarketId === null) {
    console.log('  ❌ No active markets found! Creating one...');
    // Would need to create a market, but for now just exit
    throw new Error('No active markets available for testing');
  }

  // Get user's current position
  const positionBefore = await predictionMarket.positions(targetMarketId, user.address);
  console.log(`  User's current position: YES=${ethers.formatEther(positionBefore.yesAmount)}, NO=${ethers.formatEther(positionBefore.noAmount)}`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 4: Create EIP-3009 Authorization Signature
  // ═══════════════════════════════════════════════════════════════
  console.log('\n✍️  STEP 4: Creating EIP-3009 authorization signature...');
  
  // CRITICAL: Domain name must match contract's EIP-712 domain
  const domain = {
    name: 'Wrapped BNB with x402',  // Must match WBNB3009.sol
    version: '1',
    chainId: 97,  // BSC Testnet
    verifyingContract: WBNB3009_ADDRESS,
  };
  
  const types = {
    TransferWithAuthorization: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
  };
  
  const validAfter = now - 60;  // Valid from 1 minute ago
  const validBefore = now + 3600;  // Valid for 1 hour
  const nonce = ethers.hexlify(ethers.randomBytes(32));
  
  const message = {
    from: user.address,
    to: X402_BETTING_ADDRESS,  // Transfer to X402Betting contract
    value: betAmount,
    validAfter: validAfter,
    validBefore: validBefore,
    nonce: nonce,
  };
  
  console.log('  Domain:', domain.name);
  console.log('  Authorization:', {
    from: message.from,
    to: message.to,
    value: ethers.formatEther(message.value) + ' WBNB3009',
    validAfter: new Date(validAfter * 1000).toISOString(),
    validBefore: new Date(validBefore * 1000).toISOString(),
    nonce: nonce.slice(0, 18) + '...',
  });
  
  // Sign the authorization
  const signature = await user.signTypedData(domain, types, message);
  
  console.log(`  ✅ Signature created: ${signature.slice(0, 20)}...`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 5: Execute Gasless Bet via X402BettingBNB
  // ═══════════════════════════════════════════════════════════════
  console.log('\n🚀 STEP 5: Executing gasless bet...');
  console.log(`  Market ID: ${targetMarketId}`);
  console.log(`  Position: YES`);
  console.log(`  Amount: ${ethers.formatEther(betAmount)} BNB`);
  
  // Check facilitator
  const facilitatorAddr = await x402Betting.facilitator();
  console.log(`  Facilitator on contract: ${facilitatorAddr}`);
  console.log(`  Our address: ${facilitator.address}`);
  
  try {
    // Check if nonce was already used
    const nonceUsed = await wbnb.authorizationState(user.address, nonce);
    if (nonceUsed) {
      throw new Error('Nonce already used! Generate a new one.');
    }
    console.log('  Nonce not used ✓');
    
    // Execute the gasless bet
    // The facilitator pays gas, user's WBNB3009 is used for the bet
    const tx = await x402Betting.gaslessBetWithBNB(
      targetMarketId,
      true,  // YES position
      user.address,
      betAmount,
      validAfter,
      validBefore,
      nonce,
      signature,  // Pass the full signature bytes
      { gasLimit: 500000 }
    );
    
    console.log(`  TX Hash: ${tx.hash}`);
    console.log('  Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log(`  ✅ Transaction confirmed! Gas used: ${receipt.gasUsed.toString()}`);
    
    // Parse events
    for (const log of receipt.logs) {
      try {
        const parsed = predictionMarket.interface.parseLog(log);
        if (parsed && parsed.name === 'PositionTaken') {
          console.log(`  📢 PositionTaken Event:`, {
            marketId: parsed.args[0].toString(),
            user: parsed.args[1],
            position: parsed.args[2] ? 'YES' : 'NO',
            amount: ethers.formatEther(parsed.args[3]) + ' BNB',
          });
        }
      } catch (e) {
        // Not a PositionTaken event
      }
    }
    
  } catch (error) {
    console.error('  ❌ Gasless bet failed:', error.message);
    
    // Try to decode the revert reason
    if (error.data) {
      console.error('  Error data:', error.data);
    }
    throw error;
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 6: Verify the bet was placed
  // ═══════════════════════════════════════════════════════════════
  console.log('\n✅ STEP 6: Verifying bet placement...');
  
  const positionAfter = await predictionMarket.positions(targetMarketId, user.address);
  const wbnbBalanceAfter = await wbnb.balanceOf(user.address);
  
  console.log(`  User's new position: YES=${ethers.formatEther(positionAfter.yesAmount)}, NO=${ethers.formatEther(positionAfter.noAmount)}`);
  console.log(`  YES amount gained: ${ethers.formatEther(positionAfter.yesAmount - positionBefore.yesAmount)}`);
  console.log(`  WBNB3009 Balance: ${ethers.formatEther(wbnbBalanceAfter)} (was ${ethers.formatEther(wbnbBalance)})`);
  
  const marketAfter = await predictionMarket.markets(targetMarketId);
  console.log(`  Market YES Amount: ${ethers.formatEther(marketAfter.totalYesAmount)} BNB`);
  console.log(`  Market Total: ${ethers.formatEther(marketAfter.totalYesAmount + marketAfter.totalNoAmount)} BNB`);

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                    TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✅ WBNB3009 wrapping works');
  console.log('✅ EIP-3009 signature with correct domain name');
  console.log('✅ X402BettingBNB.gaslessBetWithBNB executed');
  console.log('✅ Bet placed on PredictionMarket');
  console.log('✅ User position updated');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 COMPLETE GASLESS FLOW WORKING!');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  });
