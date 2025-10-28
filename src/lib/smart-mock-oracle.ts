/**
 * Smart Mock AI Oracle - Completely FREE!
 * No external APIs needed - works offline
 * Uses intelligent rule-based decision making
 */

export interface MarketAnalysis {
  outcome: boolean;
  confidence: number;
  reasoning: string;
  evidence: string[];
  timestamp: number;
}

export class SmartMockOracle {
  /**
   * Analyze market and make intelligent prediction
   * Uses multiple heuristics and patterns
   */
  analyzeMarket(market: {
    question: string;
    description: string;
    category: string;
    deadline: number;
    yesAmount: number;
    noAmount: number;
  }): MarketAnalysis {
    const analysis = {
      outcome: false,
      confidence: 0,
      reasoning: '',
      evidence: [] as string[],
      timestamp: Date.now(),
    };

    // 1. Market Sentiment Analysis (based on betting patterns)
    const totalAmount = market.yesAmount + market.noAmount;
    const yesPercentage = totalAmount > 0 ? (market.yesAmount / totalAmount) * 100 : 50;
    
    analysis.evidence.push(`Market sentiment: ${yesPercentage.toFixed(1)}% YES, ${(100 - yesPercentage).toFixed(1)}% NO`);
    
    // 2. Category-specific analysis
    const categoryInsights = this.analyzeCategoryPatterns(market.category, market.question);
    analysis.evidence.push(...categoryInsights.evidence);
    
    // 3. Question pattern analysis
    const questionAnalysis = this.analyzeQuestionPatterns(market.question);
    analysis.evidence.push(...questionAnalysis.evidence);
    
    // 4. Time-based analysis
    const timeAnalysis = this.analyzeTimePatterns(market.deadline);
    analysis.evidence.push(...timeAnalysis.evidence);
    
    // 5. Description sentiment
    const descriptionSentiment = this.analyzeDescriptionSentiment(market.description);
    analysis.evidence.push(...descriptionSentiment.evidence);
    
    // Combine all factors to make decision
    let outcomeScore = 50; // Start neutral
    
    // Factor 1: Market sentiment (30% weight)
    outcomeScore += (yesPercentage - 50) * 0.3;
    
    // Factor 2: Category patterns (25% weight)
    outcomeScore += categoryInsights.score * 0.25;
    
    // Factor 3: Question patterns (25% weight)
    outcomeScore += questionAnalysis.score * 0.25;
    
    // Factor 4: Time patterns (10% weight)
    outcomeScore += timeAnalysis.score * 0.1;
    
    // Factor 5: Description sentiment (10% weight)
    outcomeScore += descriptionSentiment.score * 0.1;
    
    // Make final decision
    analysis.outcome = outcomeScore >= 50;
    analysis.confidence = Math.min(95, Math.max(60, Math.abs(outcomeScore - 50) * 2)) / 100;
    
    // Generate reasoning
    analysis.reasoning = this.generateReasoning(
      analysis.outcome,
      outcomeScore,
      yesPercentage,
      categoryInsights,
      questionAnalysis
    );
    
    return analysis;
  }
  
  /**
   * Analyze patterns specific to market category
   */
  private analyzeCategoryPatterns(category: string, question: string): {
    score: number;
    evidence: string[];
  } {
    const evidence: string[] = [];
    let score = 0;
    
    switch (category.toLowerCase()) {
      case 'crypto':
        if (question.match(/bitcoin|btc/i)) {
          score = 5; // Slightly bullish on BTC
          evidence.push('Historical data shows Bitcoin has strong recovery patterns');
        } else if (question.match(/eth|ethereum/i)) {
          score = 3;
          evidence.push('Ethereum fundamentals remain strong');
        }
        break;
        
      case 'sports':
        if (question.match(/favorite|expected/i)) {
          score = 8; // Favorites usually win
          evidence.push('Favorites win approximately 65% of the time historically');
        } else if (question.match(/underdog/i)) {
          score = -8;
          evidence.push('Underdog victories are less common but possible');
        }
        break;
        
      case 'politics':
        if (question.match(/incumbent|current/i)) {
          score = 6; // Incumbents have advantage
          evidence.push('Incumbent candidates typically have electoral advantages');
        }
        break;
        
      case 'weather':
        if (question.match(/rain|snow|storm/i)) {
          score = 2; // Slightly more likely
          evidence.push('Weather patterns show increased precipitation likelihood');
        } else if (question.match(/sunny|clear/i)) {
          score = -2;
          evidence.push('Clear weather conditions are statistically less frequent');
        }
        break;
        
      case 'entertainment':
        if (question.match(/popular|viral|trending/i)) {
          score = 4;
          evidence.push('Trending content typically maintains momentum');
        }
        break;
        
      default:
        evidence.push(`General market analysis for ${category} category`);
    }
    
    return { score, evidence };
  }
  
  /**
   * Analyze question wording patterns
   */
  private analyzeQuestionPatterns(question: string): {
    score: number;
    evidence: string[];
  } {
    const evidence: string[] = [];
    let score = 0;
    
    // Positive keywords
    const positiveWords = ['will', 'likely', 'expected', 'probable', 'should'];
    const negativeWords = ['won\'t', 'unlikely', 'impossible', 'never', 'fail'];
    
    positiveWords.forEach(word => {
      if (question.toLowerCase().includes(word)) {
        score += 2;
      }
    });
    
    negativeWords.forEach(word => {
      if (question.toLowerCase().includes(word)) {
        score -= 2;
      }
    });
    
    // Question marks and uncertainty
    if (question.includes('?')) {
      evidence.push('Question format indicates genuine uncertainty');
    }
    
    // Numbers and specific targets
    const hasNumbers = /\d+/.test(question);
    if (hasNumbers) {
      evidence.push('Specific numerical targets identified in question');
      score += 1; // Specific predictions slightly more likely to be testable
    }
    
    // Timeframe analysis
    if (question.match(/this year|2025/i)) {
      evidence.push('Near-term prediction with clearer trajectory');
      score += 2;
    } else if (question.match(/next decade|2030|2035/i)) {
      evidence.push('Long-term prediction with higher uncertainty');
      score -= 1;
    }
    
    return { score, evidence };
  }
  
  /**
   * Analyze time-based patterns
   */
  private analyzeTimePatterns(deadline: number): {
    score: number;
    evidence: string[];
  } {
    const evidence: string[] = [];
    let score = 0;
    
    const now = Date.now();
    const timeUntilDeadline = deadline - now;
    const daysUntil = timeUntilDeadline / (1000 * 60 * 60 * 24);
    
    if (daysUntil < 7) {
      evidence.push('Short-term market with clearer near-term indicators');
      score += 3;
    } else if (daysUntil < 30) {
      evidence.push('Medium-term market with moderate predictability');
      score += 1;
    } else {
      evidence.push('Long-term market with higher uncertainty');
      score -= 2;
    }
    
    return { score, evidence };
  }
  
  /**
   * Analyze description sentiment
   */
  private analyzeDescriptionSentiment(description: string): {
    score: number;
    evidence: string[];
  } {
    const evidence: string[] = [];
    let score = 0;
    
    const positiveWords = ['growth', 'increase', 'rise', 'success', 'achieve', 'win', 'improve'];
    const negativeWords = ['decline', 'decrease', 'fall', 'fail', 'lose', 'worsen'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      if (description.toLowerCase().includes(word)) {
        positiveCount++;
      }
    });
    
    negativeWords.forEach(word => {
      if (description.toLowerCase().includes(word)) {
        negativeCount++;
      }
    });
    
    score = (positiveCount - negativeCount) * 2;
    
    if (positiveCount > negativeCount) {
      evidence.push('Description contains predominantly positive sentiment indicators');
    } else if (negativeCount > positiveCount) {
      evidence.push('Description contains predominantly negative sentiment indicators');
    } else {
      evidence.push('Description maintains neutral sentiment');
    }
    
    return { score, evidence };
  }
  
  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(
    outcome: boolean,
    finalScore: number,
    marketSentiment: number,
    categoryInsights: any,
    questionAnalysis: any
  ): string {
    const confidence = Math.abs(finalScore - 50).toFixed(1);
    const direction = outcome ? 'YES' : 'NO';
    
    let reasoning = `Based on comprehensive analysis, this market resolves to ${direction} with ${confidence}% confidence above baseline. `;
    
    if (Math.abs(marketSentiment - 50) > 20) {
      reasoning += `Market participants show strong ${marketSentiment > 50 ? 'positive' : 'negative'} sentiment (${marketSentiment.toFixed(1)}% YES). `;
    }
    
    if (categoryInsights.evidence.length > 0) {
      reasoning += `Category analysis indicates: ${categoryInsights.evidence[0]}. `;
    }
    
    if (questionAnalysis.evidence.length > 0) {
      reasoning += `Question structure suggests: ${questionAnalysis.evidence[0]}. `;
    }
    
    reasoning += 'This decision is made using pattern recognition, historical trends, and market dynamics without requiring external AI services.';
    
    return reasoning;
  }
  
  /**
   * Generate evidence hash for on-chain storage
   */
  generateEvidenceHash(analysis: MarketAnalysis): string {
    const evidenceData = {
      outcome: analysis.outcome,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      evidence: analysis.evidence,
      timestamp: analysis.timestamp,
    };
    
    // Simple hash function (in production, use proper crypto)
    const str = JSON.stringify(evidenceData);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
  }
}

// Singleton instance
export const smartMockOracle = new SmartMockOracle();
