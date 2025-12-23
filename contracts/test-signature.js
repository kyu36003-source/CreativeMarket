/**
 * Test EIP-3009 signature verification
 */
const { ethers } = require('hardhat');

const WBNB3009_ADDRESS = '0x70e4730A3b4aC6E6E395e8ED9c46B9c0f753A4fA';

async function main() {
  const [user] = await ethers.getSigners();
  console.log('User:', user.address);
  
  const wbnbAbi = [
    'function balanceOf(address) view returns (uint256)',
    'function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, bytes signature) external',
    'function authorizationState(address, bytes32) view returns (bool)',
    'function DOMAIN_SEPARATOR() view returns (bytes32)',
    'function name() view returns (string)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce)',
  ];
  
  const wbnb = new ethers.Contract(WBNB3009_ADDRESS, wbnbAbi, user);
  
  // Get contract info
  const name = await wbnb.name();
  const domainSep = await wbnb.DOMAIN_SEPARATOR();
  console.log('\n📝 Contract Info:');
  console.log('  Name:', name);
  console.log('  DOMAIN_SEPARATOR:', domainSep);
  
  // Check balance
  const balance = await wbnb.balanceOf(user.address);
  console.log('\n💰 User WBNB3009 balance:', ethers.formatEther(balance));
  
  // EIP-712 domain (must match contract's DOMAIN_SEPARATOR)
  const domain = {
    name: 'Wrapped BNB with x402',
    version: '1',
    chainId: 97,
    verifyingContract: WBNB3009_ADDRESS,
  };
  
  // Compute expected domain separator
  const computedDomainSep = ethers.TypedDataEncoder.hashDomain(domain);
  console.log('\n🔐 Domain Separator:');
  console.log('  Contract:', domainSep);
  console.log('  Computed:', computedDomainSep);
  console.log('  Match:', domainSep === computedDomainSep ? '✅ YES' : '❌ NO');
  
  if (domainSep !== computedDomainSep) {
    console.log('\n⚠️  Domain separator mismatch! The signature will be invalid.');
    return;
  }
  
  // Test transfer to self (just to verify signature)
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
  
  const now = Math.floor(Date.now() / 1000);
  const nonce = ethers.hexlify(ethers.randomBytes(32));
  const testValue = ethers.parseEther('0.0001'); // Small test amount
  
  const message = {
    from: user.address,
    to: user.address, // Transfer to self
    value: testValue,
    validAfter: now - 60,
    validBefore: now + 3600,
    nonce: nonce,
  };
  
  console.log('\n📄 Message to sign:');
  console.log('  From:', message.from);
  console.log('  To:', message.to);
  console.log('  Value:', ethers.formatEther(testValue), 'WBNB3009');
  console.log('  Nonce:', nonce);
  
  // Sign
  const signature = await user.signTypedData(domain, types, message);
  console.log('\n✍️  Signature:', signature);
  console.log('  Length:', signature.length, 'chars (should be 132 = 0x + 130 hex chars = 65 bytes)');
  
  // Check nonce
  const nonceUsed = await wbnb.authorizationState(user.address, nonce);
  console.log('\n🔢 Nonce used:', nonceUsed);
  
  // Try the transfer
  console.log('\n🚀 Executing transferWithAuthorization...');
  try {
    const tx = await wbnb.transferWithAuthorization(
      message.from,
      message.to,
      message.value,
      message.validAfter,
      message.validBefore,
      nonce,
      signature,
      { gasLimit: 200000 }
    );
    console.log('  TX:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('  ✅ Success! Gas used:', receipt.gasUsed.toString());
    
    // Check events
    for (const log of receipt.logs) {
      try {
        const parsed = wbnb.interface.parseLog(log);
        console.log('  Event:', parsed.name, parsed.args);
      } catch {}
    }
    
  } catch (error) {
    console.log('  ❌ Failed:', error.message);
    
    // Try to parse revert reason
    if (error.reason) {
      console.log('  Reason:', error.reason);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(console.error);
