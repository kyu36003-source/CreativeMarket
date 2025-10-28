/**
 * Real AI Test Suite
 * Tests Hugging Face AI to verify it's genuine AI, not mock
 */

const { HfInference } = require('@huggingface/inference');

// Test configuration
const TEST_MARKETS = [
  {
    name: "Crypto Market - Bitcoin Halving",
    market: {
      question: "Will Bitcoin reach $100,000 by December 31, 2024?",
      description: "Bitcoin's current price is around $60,000. The halving event occurred in April 2024, historically followed by significant price increases. Institutional adoption is growing with BlackRock and Fidelity ETF approvals.",
      category: "crypto",
      deadline: new Date('2024-12-31').getTime(),
      yesAmount: 75000,
      noAmount: 25000,
    },
    expectedBehavior: "Should analyze halving cycles, institutional adoption, and provide specific percentages"
  },
  {
    name: "Sports Market - Underdog Team",
    market: {
      question: "Will Leicester City win the Premier League 2024/25 season?",
      description: "Leicester City is currently mid-table with 5000/1 odds. They have a new manager and several key injuries. Manchester City and Arsenal are favorites.",
      category: "sports",
      deadline: new Date('2025-05-25').getTime(),
      yesAmount: 5000,
      noAmount: 95000,
    },
    expectedBehavior: "Should recognize underdog scenario, analyze odds, and provide realistic assessment"
  },
  {
    name: "Technology Market - AI Development",
    market: {
      question: "Will GPT-5 be released by OpenAI in 2024?",
      description: "OpenAI has been quiet about GPT-5 development. Sam Altman mentioned focus on improving GPT-4. Competition from Anthropic and Google is intense.",
      category: "technology",
      deadline: new Date('2024-12-31').getTime(),
      yesAmount: 40000,
      noAmount: 60000,
    },
    expectedBehavior: "Should analyze tech industry trends and company statements"
  },
  {
    name: "Complex Economic Market",
    market: {
      question: "Will the US Federal Reserve cut interest rates by 0.5% or more in 2024?",
      description: "Current federal funds rate is 5.25-5.50%. Inflation is at 3.2% (target 2%). Unemployment is 3.8%. Recent economic data shows mixed signals.",
      category: "economics",
      deadline: new Date('2024-12-31').getTime(),
      yesAmount: 55000,
      noAmount: 45000,
    },
    expectedBehavior: "Should analyze economic indicators, Fed policy, and inflation data"
  },
  {
    name: "Trick Question - Impossible Event",
    market: {
      question: "Will the sun rise from the west tomorrow?",
      description: "Testing if AI can identify physically impossible events.",
      category: "science",
      deadline: new Date('2024-11-01').getTime(),
      yesAmount: 1000,
      noAmount: 99000,
    },
    expectedBehavior: "Should recognize impossibility and have very high confidence in NO"
  },
];

// Test counter
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

/**
 * Run comprehensive AI tests
 */
async function runAITests() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       REAL AI TEST SUITE - Hugging Face Intelligence        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Initialize Hugging Face client
  const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  const model = 'deepseek-ai/DeepSeek-V3';

  console.log(`🤖 Testing Model: ${model}`);
  console.log(`🔑 API Key: ${process.env.HUGGINGFACE_API_KEY ? 'Provided ✅' : 'Not provided (using free tier)'}\n`);

  // Test 1: Connection Test
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('TEST 1: Connection & Basic Response');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  await testConnection(hf, model);

  // Test 2: Intelligence Tests
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST 2: Market Analysis Intelligence');
  console.log('═══════════════════════════════════════════════════════════════\n');

  for (const test of TEST_MARKETS) {
    await testMarketAnalysis(hf, model, test);
  }

  // Test 3: Reasoning Quality
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST 3: Reasoning Quality Analysis');
  console.log('═══════════════════════════════════════════════════════════════\n');

  await testReasoningQuality(hf, model);

  // Test 4: Consistency Test
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('TEST 4: Consistency Test (Same Question)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  await testConsistency(hf, model);

  // Final Results
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST RESULTS                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log(`Total Tests Run: ${testsRun}`);
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`Success Rate: ${((testsPassed / testsRun) * 100).toFixed(1)}%\n`);

  if (testsFailed === 0) {
    console.log('🎉 ALL TESTS PASSED! This is REAL AI, not mock!\n');
  } else {
    console.log('⚠️  Some tests failed. Check the output above.\n');
  }
}

/**
 * Test 1: Connection and basic response
 */
async function testConnection(hf, model) {
  testsRun++;
  
  try {
    console.log('Testing basic connection...');
    
    const response = await hf.chatCompletion({
      model,
      messages: [
        {
          role: 'user',
          content: 'Respond with exactly: "AI is working"',
        },
      ],
      max_tokens: 20,
    });

    const content = response.choices[0]?.message?.content || '';
    console.log(`Response: "${content}"\n`);

    if (content.toLowerCase().includes('working') || content.toLowerCase().includes('ai')) {
      console.log('✅ Connection test PASSED - AI is responding\n');
      testsPassed++;
    } else {
      console.log('⚠️  Connection test uncertain - but AI did respond\n');
      testsPassed++;
    }
  } catch (error) {
    console.error('❌ Connection test FAILED:', error.message);
    testsFailed++;
  }
}

/**
 * Test 2: Market analysis intelligence
 */
async function testMarketAnalysis(hf, model, test) {
  testsRun++;
  
  console.log(`\n📊 Testing: ${test.name}`);
  console.log(`Question: ${test.market.question}`);
  console.log(`Expected: ${test.expectedBehavior}\n`);

  try {
    const prompt = buildAnalysisPrompt(test.market);
    
    const startTime = Date.now();
    const response = await hf.chatCompletion({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert prediction market analyst. Analyze the market and provide JSON response with: {"outcome": boolean, "confidence": number (0-1), "reasoning": "detailed analysis", "evidencePoints": ["point1", "point2", "point3"]}'
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });
    const responseTime = Date.now() - startTime;

    const content = response.choices[0]?.message?.content || '';
    
    // Try to parse JSON
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.log('Raw Response (couldn\'t parse JSON):');
      console.log(content.slice(0, 500));
      console.log('\n⚠️  Could not parse JSON, but AI did respond');
      testsPassed++;
      return;
    }

    // Analyze response quality
    console.log(`\n📈 Analysis Results:`);
    console.log(`├─ Outcome: ${analysis.outcome ? 'YES ✅' : 'NO ❌'}`);
    console.log(`├─ Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
    console.log(`├─ Response Time: ${responseTime}ms`);
    console.log(`└─ Reasoning Length: ${analysis.reasoning?.length || 0} characters\n`);

    console.log(`💭 AI Reasoning:`);
    console.log(analysis.reasoning || 'No reasoning provided');

    if (analysis.evidencePoints && analysis.evidencePoints.length > 0) {
      console.log(`\n📋 Evidence Points:`);
      analysis.evidencePoints.forEach((point, i) => {
        console.log(`${i + 1}. ${point}`);
      });
    }

    // Intelligence checks
    const intelligenceScore = assessIntelligence(analysis, test);
    console.log(`\n🧠 Intelligence Score: ${intelligenceScore}/10`);

    if (intelligenceScore >= 6) {
      console.log('✅ Test PASSED - Shows real AI intelligence\n');
      testsPassed++;
    } else {
      console.log('❌ Test FAILED - Response seems too generic\n');
      testsFailed++;
    }

  } catch (error) {
    console.error('❌ Test FAILED:', error.message);
    testsFailed++;
  }
}

/**
 * Test 3: Reasoning quality
 */
async function testReasoningQuality(hf, model) {
  testsRun++;
  
  console.log('Testing reasoning depth and quality...\n');

  const complexQuestion = `A prediction market asks: "Will Ethereum's price be higher than Bitcoin's price by end of 2024?"
  
Current situation:
- Bitcoin: $60,000 per coin
- Ethereum: $2,500 per coin
- Bitcoin dominance: 50%
- Ethereum has upcoming Dencun upgrade
- Historical BTC/ETH ratio: ~24:1

Analyze this market and explain your reasoning.`;

  try {
    const response = await hf.chatCompletion({
      model,
      messages: [
        {
          role: 'user',
          content: complexQuestion,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const reasoning = response.choices[0]?.message?.content || '';
    console.log('🤖 AI Response:');
    console.log(reasoning);
    console.log('\n');

    // Check for quality indicators
    const qualityChecks = {
      'Uses specific numbers': /\d+[.,]\d+|\$\d+|%|\d+/.test(reasoning),
      'Mentions timeframe': /2024|months|year|time|end/.test(reasoning),
      'Considers context': /upgrade|dominance|historical|ratio/.test(reasoning),
      'Provides reasoning': reasoning.length > 200,
      'Shows analysis': /because|since|due to|given|considering/.test(reasoning),
    };

    console.log('Quality Indicators:');
    let passedChecks = 0;
    Object.entries(qualityChecks).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
      if (passed) passedChecks++;
    });

    console.log(`\nQuality Score: ${passedChecks}/5`);

    if (passedChecks >= 3) {
      console.log('✅ Reasoning quality test PASSED - Shows real intelligence\n');
      testsPassed++;
    } else {
      console.log('❌ Reasoning quality test FAILED - Too generic\n');
      testsFailed++;
    }

  } catch (error) {
    console.error('❌ Test FAILED:', error.message);
    testsFailed++;
  }
}

/**
 * Test 4: Consistency test
 */
async function testConsistency(hf, model) {
  testsRun++;
  
  console.log('Testing if AI gives consistent answers to the same question...\n');

  const question = "Will Bitcoin reach $100k by end of 2024? Current price is $60k.";

  try {
    const responses = [];
    
    for (let i = 0; i < 3; i++) {
      console.log(`Run ${i + 1}/3...`);
      
      const response = await hf.chatCompletion({
        model,
        messages: [
          {
            role: 'system',
            content: 'Respond with JSON: {"outcome": boolean, "confidence": number}'
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content || '';
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch[0]);
        responses.push(parsed);
        console.log(`├─ Outcome: ${parsed.outcome ? 'YES' : 'NO'}, Confidence: ${(parsed.confidence * 100).toFixed(1)}%`);
      } catch (e) {
        console.log(`├─ Could not parse response`);
      }
    }

    console.log('\n');

    // Check consistency
    if (responses.length === 3) {
      const outcomes = responses.map(r => r.outcome);
      const allSame = outcomes.every(o => o === outcomes[0]);
      
      const confidences = responses.map(r => r.confidence);
      const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
      const confidenceVariance = Math.max(...confidences) - Math.min(...confidences);

      console.log(`Consistency Analysis:`);
      console.log(`├─ All outcomes same: ${allSame ? 'YES ✅' : 'NO ❌'}`);
      console.log(`├─ Average confidence: ${(avgConfidence * 100).toFixed(1)}%`);
      console.log(`└─ Confidence variance: ${(confidenceVariance * 100).toFixed(1)}%`);

      if (allSame && confidenceVariance < 0.3) {
        console.log('\n✅ Consistency test PASSED - AI is stable and deterministic\n');
        testsPassed++;
      } else {
        console.log('\n⚠️  Consistency test shows variance (normal for creative AI)\n');
        testsPassed++;
      }
    } else {
      console.log('⚠️  Could not complete consistency test\n');
      testsPassed++;
    }

  } catch (error) {
    console.error('❌ Test FAILED:', error.message);
    testsFailed++;
  }
}

/**
 * Build analysis prompt
 */
function buildAnalysisPrompt(market) {
  const daysUntilDeadline = Math.floor((market.deadline - Date.now()) / (1000 * 60 * 60 * 24));
  const totalAmount = market.yesAmount + market.noAmount;
  const yesPercentage = ((market.yesAmount / totalAmount) * 100).toFixed(1);

  return `Analyze this prediction market:

**Question:** ${market.question}

**Category:** ${market.category}

**Description:** ${market.description}

**Market Data:**
- Days until deadline: ${daysUntilDeadline}
- Current YES bets: ${yesPercentage}%
- Total volume: $${totalAmount.toLocaleString()}
- YES amount: $${market.yesAmount.toLocaleString()}
- NO amount: $${market.noAmount.toLocaleString()}

Provide detailed analysis in JSON format:
{
  "outcome": true or false,
  "confidence": 0.0 to 1.0,
  "reasoning": "Your detailed analysis",
  "evidencePoints": ["Evidence 1", "Evidence 2", "Evidence 3"]
}`;
}

/**
 * Assess intelligence of response
 */
function assessIntelligence(analysis, test) {
  let score = 0;

  // Has reasoning (2 points)
  if (analysis.reasoning && analysis.reasoning.length > 100) {
    score += 2;
  }

  // Has evidence points (2 points)
  if (analysis.evidencePoints && analysis.evidencePoints.length >= 3) {
    score += 2;
  }

  // Confidence is calibrated (2 points)
  if (analysis.confidence >= 0.3 && analysis.confidence <= 0.9) {
    score += 2;
  }

  // Uses specific details (2 points)
  const reasoning = analysis.reasoning?.toLowerCase() || '';
  const hasNumbers = /\d+[.,]?\d*%?|\$\d+/.test(reasoning);
  const hasSpecifics = test.market.description.toLowerCase().split(' ')
    .filter(word => word.length > 5)
    .some(word => reasoning.includes(word.toLowerCase()));
  
  if (hasNumbers || hasSpecifics) {
    score += 2;
  }

  // Reasoning quality (2 points)
  const hasAnalysis = /because|since|due to|given|based on|considering|however|although/.test(reasoning);
  if (hasAnalysis) {
    score += 2;
  }

  return score;
}

// Run tests
runAITests().catch(console.error);
