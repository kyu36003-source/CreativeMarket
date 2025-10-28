/**
 * Resolve Market #3 using Real AI Analysis
 */

const { ethers } = require('hardhat');
const { HfInference } = require('@huggingface/inference');

const PREDICTION_MARKET_ADDRESS = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318';
const HF_API_KEY = 'YOUR_HF_API_KEY_HERE';

async function main() {
  const [deployer, oracle] = await ethers.getSigners();
  
  console.log('\n🔮 Resolving Market #3 with Real AI\n');
  console.log('Oracle:', oracle.address);
  
  const predictionMarket = await ethers.getContractAt('PredictionMarket', PREDICTION_MARKET_ADDRESS);
  
  // Read market
  const market = await predictionMarket.markets(3);
  console.log('📊 Market:', market.question);
  console.log('   YES bets:', ethers.formatEther(market.totalYesAmount), 'ETH');
  console.log('   NO bets:', ethers.formatEther(market.totalNoAmount), 'ETH\n');
  
  // Ask AI
  console.log('🤖 Analyzing with DeepSeek-V3...');
  const hf = new HfInference(HF_API_KEY);
  
  const prompt = `Analyze: ${market.question}
Current bets: ${ethers.formatEther(market.totalYesAmount)} ETH on YES, ${ethers.formatEther(market.totalNoAmount)} ETH on NO

Respond with JSON:
{
  "outcome": true or false,
  "confidence": 0.0 to 1.0,
  "reasoning": "Your analysis"
}`;

  const response = await hf.chatCompletion({
    model: 'deepseek-ai/DeepSeek-V3',
    messages: [
      { role: 'system', content: 'You are a prediction market oracle. Respond with JSON only.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  const aiResponse = response.choices[0]?.message?.content || '';
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  const analysis = JSON.parse(jsonMatch[0]);
  
  console.log('✅ AI Decision:', analysis.outcome ? 'YES' : 'NO');
  console.log('   Confidence:', (analysis.confidence * 100).toFixed(1) + '%');
  console.log('   Reasoning:', analysis.reasoning, '\n');
  
  // Resolve on-chain
  console.log('📝 Submitting resolution to blockchain...');
  const tx = await predictionMarket.connect(oracle).resolveMarket(
    3,
    analysis.outcome
  );
  
  await tx.wait();
  console.log('✅ Transaction:', tx.hash);
  
  // Verify
  const resolvedMarket = await predictionMarket.markets(3);
  console.log('\n✨ Market Resolution Complete!');
  console.log('   Resolved:', resolvedMarket.resolved);
  console.log('   Outcome:', resolvedMarket.outcome ? 'YES' : 'NO');
  console.log('   AI Confidence:', (analysis.confidence * 100).toFixed(1) + '%\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
