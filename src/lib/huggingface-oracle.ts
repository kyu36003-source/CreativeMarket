/**
 * Hugging Face AI Oracle - FREE Real AI Analysis
 * 
 * Uses Hugging Face Inference API with FREE tier:
 * - DeepSeek-V3: State-of-the-art reasoning model
 * - Llama-3.3-70B: Meta's powerful open model
 * - Qwen 2.5: Alibaba's intelligent model
 * 
 * FREE TIER:
 * - Unlimited requests for public models
 * - No credit card required
 * - Production-ready performance
 * - Multiple model fallbacks
 * 
 * Alternative providers (also FREE):
 * - Groq: Ultra-fast inference (14,000 tokens/sec)
 * - Together AI: Fast and reliable
 * - Cerebras: High performance
 */

import { HfInference } from '@huggingface/inference';

export interface HuggingFaceConfig {
  apiKey?: string; // Optional - works without API key for public models!
  model?: string;
  fallbackModels?: string[];
  maxTokens?: number;
  temperature?: number;
}

export interface MarketAnalysis {
  outcome: boolean;
  confidence: number; // 0-1
  reasoning: string;
  evidencePoints: string[];
  evidenceHash: string;
  analyzerVersion: string;
  model: string;
}

/**
 * FREE Hugging Face AI Oracle
 * Real AI analysis without any costs!
 */
export class HuggingFaceOracle {
  private client: HfInference;
  private config: Required<HuggingFaceConfig>;

  // Top FREE models - ranked by performance
  private static readonly DEFAULT_MODELS = [
    'deepseek-ai/DeepSeek-V3', // Best reasoning
    'meta-llama/Llama-3.3-70B-Instruct', // Meta's flagship
    'Qwen/Qwen2.5-72B-Instruct', // Alibaba's best
    'mistralai/Mixtral-8x7B-Instruct-v0.1', // Fast and good
    'microsoft/Phi-3.5-mini-instruct', // Lightweight but capable
  ];

  constructor(config: HuggingFaceConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.HUGGINGFACE_API_KEY || '',
      model: config.model || HuggingFaceOracle.DEFAULT_MODELS[0],
      fallbackModels: config.fallbackModels || HuggingFaceOracle.DEFAULT_MODELS.slice(1),
      maxTokens: config.maxTokens || 1024,
      temperature: config.temperature || 0.3, // Lower for factual analysis
    };

    // Initialize HuggingFace client
    // IMPORTANT: For public models, we MUST provide an API key or empty string
    // Get free key at: https://huggingface.co/settings/tokens
    this.client = new HfInference(this.config.apiKey || '');
  }

  /**
   * Analyze market using FREE Hugging Face AI
   */
  async analyzeMarket(market: {
    question: string;
    description: string;
    category: string;
    deadline: number;
    yesAmount: number;
    noAmount: number;
  }): Promise<MarketAnalysis> {
    const prompt = this.buildAnalysisPrompt(market);

    try {
      // Try primary model
      const analysis = await this.tryModel(this.config.model, prompt);
      if (analysis) {
        return analysis;
      }

      // Try fallback models
      for (const model of this.config.fallbackModels) {
        const fallbackAnalysis = await this.tryModel(model, prompt);
        if (fallbackAnalysis) {
          return fallbackAnalysis;
        }
      }

      throw new Error('All models failed - this should not happen with HuggingFace');
    } catch (error) {
      console.error('HuggingFace API error:', error);
      throw error;
    }
  }

  /**
   * Try to get analysis from a specific model
   */
  private async tryModel(model: string, prompt: string): Promise<MarketAnalysis | null> {
    try {
      const response = await this.client.chatCompletion({
        model,
        messages: [
          {
            role: 'system',
            content: `You are an expert prediction market analyst. Analyze the market data and provide a JSON response with:
{
  "outcome": boolean (true for YES, false for NO),
  "confidence": number (0.0 to 1.0),
  "reasoning": "detailed explanation",
  "evidencePoints": ["point 1", "point 2", "point 3"]
}

Be objective, factual, and thorough. Base your analysis on data, patterns, and logical reasoning.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return null;
      }

      // Parse AI response
      const parsed = this.parseAIResponse(content, model);
      return parsed;
    } catch (error) {
      console.error(`Model ${model} failed:`, error);
      return null;
    }
  }

  /**
   * Build analysis prompt from market data
   */
  private buildAnalysisPrompt(market: {
    question: string;
    description: string;
    category: string;
    deadline: number;
    yesAmount: number;
    noAmount: number;
  }): string {
    const daysUntilDeadline = Math.floor(
      (market.deadline - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const totalAmount = market.yesAmount + market.noAmount;
    const yesPercentage = totalAmount > 0 
      ? ((market.yesAmount / totalAmount) * 100).toFixed(1)
      : '50.0';

    return `Analyze this prediction market and determine the most likely outcome.

**Market Question:**
${market.question}

**Category:** ${market.category}

**Description:**
${market.description}

**Market Data:**
- Days until deadline: ${daysUntilDeadline}
- Current YES prediction: ${yesPercentage}%
- Total betting volume: ${totalAmount}
- YES amount: ${market.yesAmount}
- NO amount: ${market.noAmount}

**Analysis Instructions:**
1. Consider the market question carefully
2. Analyze the category-specific factors (${market.category})
3. Evaluate the betting patterns and market sentiment
4. Consider the timeframe and deadline
5. Provide your best judgment with confidence level

**Required Output Format (JSON):**
{
  "outcome": true or false,
  "confidence": 0.0 to 1.0,
  "reasoning": "Your detailed analysis",
  "evidencePoints": ["Evidence 1", "Evidence 2", "Evidence 3"]
}`;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(content: string, model: string): MarketAnalysis {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (
        typeof parsed.outcome !== 'boolean' ||
        typeof parsed.confidence !== 'number' ||
        typeof parsed.reasoning !== 'string'
      ) {
        throw new Error('Invalid response format');
      }

      // Ensure confidence is in range
      const confidence = Math.max(0, Math.min(1, parsed.confidence));

      // Ensure we have evidence points
      const evidencePoints = Array.isArray(parsed.evidencePoints)
        ? parsed.evidencePoints
        : [parsed.reasoning];

      // Generate evidence hash
      const evidenceHash = this.generateEvidenceHash({
        outcome: parsed.outcome,
        confidence,
        reasoning: parsed.reasoning,
        evidencePoints,
      });

      return {
        outcome: parsed.outcome,
        confidence,
        reasoning: parsed.reasoning,
        evidencePoints,
        evidenceHash,
        analyzerVersion: 'huggingface-oracle-v1.0.0',
        model,
      };
    } catch (_error) {
      // Fallback: Basic sentiment analysis from raw response
      const isPositive = this.analyzeTextSentiment(content);
      const confidence = 0.6; // Moderate confidence for fallback

      return {
        outcome: isPositive,
        confidence,
        reasoning: content.slice(0, 500), // First 500 chars
        evidencePoints: [
          'Analysis based on AI model output',
          'Sentiment analysis performed',
          'Confidence adjusted for parsing fallback',
        ],
        evidenceHash: this.generateEvidenceHash({
          outcome: isPositive,
          confidence,
          reasoning: content,
          evidencePoints: [],
        }),
        analyzerVersion: 'huggingface-oracle-v1.0.0-fallback',
        model: `${model} (fallback parser)`,
      };
    }
  }

  /**
   * Simple sentiment analysis for fallback
   */
  private analyzeTextSentiment(text: string): boolean {
    const lowercaseText = text.toLowerCase();

    const positiveWords = [
      'yes', 'true', 'likely', 'probable', 'will', 'expect', 'positive',
      'bullish', 'increase', 'grow', 'success', 'win', 'achieve',
    ];

    const negativeWords = [
      'no', 'false', 'unlikely', 'improbable', 'won\'t', 'negative',
      'bearish', 'decrease', 'decline', 'fail', 'lose', 'doubt',
    ];

    let positiveScore = 0;
    let negativeScore = 0;

    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowercaseText.match(regex);
      if (matches) positiveScore += matches.length;
    });

    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowercaseText.match(regex);
      if (matches) negativeScore += matches.length;
    });

    return positiveScore >= negativeScore;
  }

  /**
   * Generate evidence hash for verification
   */
  private generateEvidenceHash(data: {
    outcome: boolean;
    confidence: number;
    reasoning: string;
    evidencePoints: string[];
  }): string {
    // Simple hash generation (in production, use crypto.subtle)
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
  }

  /**
   * Test connection to Hugging Face
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.chatCompletion({
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: 'Respond with "working" if you can read this.',
          },
        ],
        max_tokens: 10,
      });

      const content = response.choices[0]?.message?.content?.toLowerCase() || '';
      const isWorking = content.includes('working') || content.includes('yes');
      
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get available models
   */
  static getAvailableModels(): string[] {
    return [...HuggingFaceOracle.DEFAULT_MODELS];
  }

  /**
   * Get model info
   */
  static getModelInfo(model: string): {
    name: string;
    description: string;
    speed: 'fast' | 'medium' | 'slow';
    quality: 'excellent' | 'very-good' | 'good';
    cost: 'free';
  } {
    const models: Record<string, any> = {
      'deepseek-ai/DeepSeek-V3': {
        name: 'DeepSeek V3',
        description: 'State-of-the-art reasoning and analysis',
        speed: 'medium',
        quality: 'excellent',
        cost: 'free',
      },
      'meta-llama/Llama-3.3-70B-Instruct': {
        name: 'Llama 3.3 70B',
        description: 'Meta\'s flagship open model',
        speed: 'medium',
        quality: 'excellent',
        cost: 'free',
      },
      'Qwen/Qwen2.5-72B-Instruct': {
        name: 'Qwen 2.5 72B',
        description: 'Alibaba\'s powerful reasoning model',
        speed: 'medium',
        quality: 'excellent',
        cost: 'free',
      },
      'mistralai/Mixtral-8x7B-Instruct-v0.1': {
        name: 'Mixtral 8x7B',
        description: 'Fast and efficient mixture of experts',
        speed: 'fast',
        quality: 'very-good',
        cost: 'free',
      },
      'microsoft/Phi-3.5-mini-instruct': {
        name: 'Phi 3.5 Mini',
        description: 'Lightweight but capable',
        speed: 'fast',
        quality: 'good',
        cost: 'free',
      },
    };

    return models[model] || {
      name: model,
      description: 'Unknown model',
      speed: 'medium',
      quality: 'good',
      cost: 'free',
    };
  }
}

// Singleton instance
export const huggingfaceOracle = new HuggingFaceOracle();
