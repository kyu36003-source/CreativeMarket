#!/bin/bash
echo "📝 Deploying contracts to local Hardhat network..."
cd contracts
npx hardhat run scripts/deploy.js --network localhost

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the contract addresses from above"
echo "2. Update src/lib/contracts/addresses.ts with local addresses"
echo "3. Update .env.local with the contract addresses"
echo "4. Run: npm run dev"
