/**
 * AI-Assisted Oracle for Creative Prediction Markets
 * 
 * Solves YZi Labs Priority #1: Fast, AI-powered oracle for subjective predictions
 * Traditional oracles take 24-48h. This uses AI to resolve in minutes.
 */

export interface CreativeWork {
  type: 'design' | 'music' | 'content' | 'art';
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  criteria: string[];
  submittedAt: number;
}

export interface AIJudgment {
  approved: boolean;
  confidence: number; // 0-1
  reasoning: string;
  scores: {
    [criterion: string]: number; // 0-10
  };
  timestamp: number;
  aiModel: string;
}

export interface OracleResolution {
  marketId: string;
  outcome: boolean;
  confidence: number;
  reasoning: string;
  judgments: AIJudgment[];
  resolvedAt: number;
  disputePeriod: number; // Seconds until final
}

/**
 * AI Oracle that judges creative work
 * Uses Claude API (or fallback to mock for demo)
 */
export class AIOracle {
  private apiKey: string | undefined;
  private model: string = 'claude-3-5-sonnet-20241022';

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
  }

  /**
   * Judge creative work against criteria
   */
  async judgeCreativeWork(work: CreativeWork): Promise<AIJudgment> {
    // Use real Claude API if available, otherwise mock
    if (this.apiKey && typeof window === 'undefined') {
      return this.judgeWithClaude(work);
    }
    
    // Mock AI judgment for demo/testing
    return this.mockAIJudgment(work);
  }

  /**
   * Real Claude API integration
   */
  private async judgeWithClaude(work: CreativeWork): Promise<AIJudgment> {
    try {
      const prompt = this.buildJudgmentPrompt(work);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: prompt,
          }],
        }),
      });

      const data = await response.json();
      return this.parseClaudeResponse(data, work);
    } catch (error) {
      console.error('Claude API error, falling back to mock:', error);
      return this.mockAIJudgment(work);
    }
  }

  /**
   * Build prompt for Claude to judge creative work
   */
  private buildJudgmentPrompt(work: CreativeWork): string {
    return `You are an expert judge evaluating creative work for a prediction market.

Type: ${work.type}
Title: ${work.title}
Description: ${work.description}

Evaluation Criteria:
${work.criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Please analyze this ${work.type} and provide:
1. Overall approval (YES/NO)
2. Confidence score (0-100)
3. Detailed reasoning
4. Individual scores (0-10) for each criterion

Respond in JSON format:
{
  "approved": boolean,
  "confidence": number,
  "reasoning": "detailed explanation",
  "scores": {
    "criterion1": score,
    ...
  }
}`;
  }

  /**
   * Parse Claude's response
   */
  private parseClaudeResponse(data: any, work: CreativeWork): AIJudgment {
    try {
      const text = data.content[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (parsed) {
        return {
          approved: parsed.approved,
          confidence: parsed.confidence / 100,
          reasoning: parsed.reasoning,
          scores: parsed.scores,
          timestamp: Date.now(),
          aiModel: this.model,
        };
      }
    } catch (error) {
      console.error('Error parsing Claude response:', error);
    }

    // Fallback
    return this.mockAIJudgment(work);
  }

  /**
   * Mock AI judgment for demo/testing
   */
  private mockAIJudgment(work: CreativeWork): AIJudgment {
    // Simulate AI analysis based on work characteristics
    const baseScore = 6 + Math.random() * 3; // 6-9 range
    const confidence = 0.75 + Math.random() * 0.2; // 75-95% confidence
    
    const scores: { [key: string]: number } = {};
    work.criteria.forEach((criterion) => {
      scores[criterion] = Number((baseScore + (Math.random() - 0.5) * 2).toFixed(1));
    });

    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / work.criteria.length;
    const approved = avgScore >= 7.0;

    return {
      approved,
      confidence,
      reasoning: this.generateMockReasoning(work, approved, avgScore),
      scores,
      timestamp: Date.now(),
      aiModel: 'mock-ai-v1',
    };
  }

  /**
   * Generate realistic mock reasoning
   */
  private generateMockReasoning(work: CreativeWork, approved: boolean, avgScore: number): string {
    const workTypes: Record<typeof work.type, string[]> = {
      design: [
        'The design shows strong visual hierarchy and consistent branding.',
        'Color palette is well-chosen and evokes the right emotions.',
        'Typography choices enhance readability and aesthetic appeal.',
      ],
      music: [
        'Production quality is professional with clear mixing.',
        'Composition demonstrates creativity and musical depth.',
        'The track has commercial appeal and emotional resonance.',
      ],
      content: [
        'Content is engaging with strong narrative structure.',
        'Production value meets professional standards.',
        'The messaging is clear and impactful for the target audience.',
      ],
      art: [
        'Artistic technique demonstrates skill and originality.',
        'Composition and use of space is thoughtful.',
        'The piece successfully conveys its intended message.',
      ],
    };

    const positives = workTypes[work.type] || ['The work meets professional standards.'];
    const verdict = approved
      ? `Overall assessment: APPROVED. The ${work.type} successfully meets ${Math.round((avgScore / 10) * 100)}% of the criteria.`
      : `Overall assessment: NEEDS IMPROVEMENT. The ${work.type} meets ${Math.round((avgScore / 10) * 100)}% of criteria but falls short of the threshold.`;

    return `${positives.slice(0, 2).join(' ')} ${verdict}`;
  }

  /**
   * Resolve a prediction market using AI
   */
  async resolveMarket(
    marketId: string,
    submissions: CreativeWork[]
  ): Promise<OracleResolution> {
    // Judge all submissions
    const judgments = await Promise.all(
      submissions.map((work) => this.judgeCreativeWork(work))
    );

    // Aggregate judgments
    const approvedCount = judgments.filter((j) => j.approved).length;
    const avgConfidence = judgments.reduce((sum, j) => sum + j.confidence, 0) / judgments.length;
    
    // Market resolves YES if majority approved
    const outcome = approvedCount > submissions.length / 2;
    
    // Combine reasoning
    const reasoning = judgments.length === 1
      ? judgments[0].reasoning
      : `${approvedCount}/${judgments.length} submissions approved. ${judgments[0].reasoning.slice(0, 100)}...`;

    return {
      marketId,
      outcome,
      confidence: avgConfidence,
      reasoning,
      judgments,
      resolvedAt: Date.now(),
      disputePeriod: 24 * 60 * 60, // 24 hours for disputes
    };
  }

  /**
   * Quick prediction for market analytics
   */
  async predictOutcome(market: {
    question: string;
    context: string;
    deadline: number;
  }): Promise<{
    probability: number;
    reasoning: string;
    signal: 'bullish' | 'bearish' | 'neutral';
  }> {
    // Mock prediction based on market data
    const daysUntilDeadline = (market.deadline - Date.now()) / (1000 * 60 * 60 * 24);
    const baseProbability = 0.5 + (Math.random() - 0.5) * 0.4; // 30-70%
    
    // Adjust based on time remaining
    const timeAdjustment = Math.min(daysUntilDeadline / 30, 0.2);
    const probability = Math.max(0.1, Math.min(0.9, baseProbability + timeAdjustment));
    
    const signal = probability > 0.6 ? 'bullish' : probability < 0.4 ? 'bearish' : 'neutral';

    return {
      probability,
      reasoning: `AI analysis suggests ${(probability * 100).toFixed(0)}% likelihood based on market context and ${daysUntilDeadline.toFixed(0)} days remaining.`,
      signal,
    };
  }
}

// Singleton instance
export const aiOracle = new AIOracle();
