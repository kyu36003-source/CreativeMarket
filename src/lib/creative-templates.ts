/**
 * Creative Market Templates
 * 
 * Specialized prediction markets for the creative industry
 * Solves: Niche market opportunity + subjective predictions
 */

import type { CreativeWork } from './ai-oracle';

export type CreativeMarketType = 
  | 'design-contest'
  | 'music-release'
  | 'content-virality'
  | 'art-auction'
  | 'brand-approval'
  | 'influencer-collab';

export interface CreativeMarketTemplate {
  id: string;
  type: CreativeMarketType;
  title: string;
  question: string;
  description: string;
  category: string;
  judgmentType: 'ai-judged' | 'objective-metric' | 'hybrid';
  criteria: string[];
  resolutionTimeframe: number; // seconds
  requiredEvidence: string[];
  icon: string;
  color: string;
  examples: string[];
}

export const creativeMarketTemplates: CreativeMarketTemplate[] = [
  {
    id: 'design-contest',
    type: 'design-contest',
    title: 'Design Contest Outcome',
    question: 'Will this design be approved by the client?',
    description: 'AI judges design quality against client requirements',
    category: 'Design',
    judgmentType: 'ai-judged',
    criteria: [
      'Visual hierarchy and composition',
      'Brand alignment and consistency',
      'Color theory and palette choice',
      'Typography and readability',
      'Overall aesthetic appeal',
      'Technical execution quality',
    ],
    resolutionTimeframe: 3600, // 1 hour with AI
    requiredEvidence: ['design-file', 'client-brief', 'reference-images'],
    icon: '🎨',
    color: 'from-purple-500 to-pink-500',
    examples: [
      'Will this logo design get client approval?',
      'Will this website mockup meet brand guidelines?',
      'Will this packaging design be selected?',
    ],
  },
  {
    id: 'music-release',
    type: 'music-release',
    title: 'Music Release Success',
    question: 'Will this track get featured on editorial playlists?',
    description: 'AI analyzes production quality and commercial appeal',
    category: 'Music',
    judgmentType: 'hybrid',
    criteria: [
      'Production quality and mixing',
      'Composition and arrangement',
      'Commercial viability',
      'Genre authenticity',
      'Vocal performance (if applicable)',
      'Overall listening experience',
    ],
    resolutionTimeframe: 86400, // 24 hours
    requiredEvidence: ['audio-file', 'lyrics', 'artist-profile'],
    icon: '🎵',
    color: 'from-blue-500 to-purple-500',
    examples: [
      'Will this song get Spotify editorial playlist placement?',
      'Will this album reach 100K streams in first week?',
      'Will this remix get label approval?',
    ],
  },
  {
    id: 'content-virality',
    type: 'content-virality',
    title: 'Content Virality Prediction',
    question: 'Will this content reach X views/engagement?',
    description: 'Predict content performance based on quality and market signals',
    category: 'Content',
    judgmentType: 'objective-metric',
    criteria: [
      'Content quality and production value',
      'Engagement potential',
      'Timing and relevance',
      'Target audience alignment',
      'Platform optimization',
    ],
    resolutionTimeframe: 604800, // 7 days
    requiredEvidence: ['content-link', 'analytics-baseline', 'target-metrics'],
    icon: '📹',
    color: 'from-red-500 to-orange-500',
    examples: [
      'Will this video reach 100K views in 7 days?',
      'Will this post get 10K+ engagements?',
      'Will this TikTok go viral (1M+ views)?',
    ],
  },
  {
    id: 'art-auction',
    type: 'art-auction',
    title: 'Art Auction Outcome',
    question: 'Will this artwork sell above reserve price?',
    description: 'AI evaluates artistic merit and market demand',
    category: 'Art',
    judgmentType: 'ai-judged',
    criteria: [
      'Artistic technique and skill',
      'Originality and creativity',
      'Composition and visual impact',
      'Medium mastery',
      'Emotional resonance',
      'Market relevance',
    ],
    resolutionTimeframe: 7200, // 2 hours
    requiredEvidence: ['artwork-image', 'artist-statement', 'reserve-price'],
    icon: '🖼️',
    color: 'from-green-500 to-teal-500',
    examples: [
      'Will this NFT artwork sell above 1 ETH?',
      'Will this painting sell at auction?',
      'Will this sculpture meet reserve price?',
    ],
  },
  {
    id: 'brand-approval',
    type: 'brand-approval',
    title: 'Brand Campaign Approval',
    question: 'Will this campaign be approved by stakeholders?',
    description: 'AI evaluates brand alignment and campaign effectiveness',
    category: 'Marketing',
    judgmentType: 'ai-judged',
    criteria: [
      'Brand guideline compliance',
      'Message clarity and impact',
      'Target audience resonance',
      'Creative execution',
      'Call-to-action effectiveness',
      'Overall campaign coherence',
    ],
    resolutionTimeframe: 7200, // 2 hours
    requiredEvidence: ['campaign-brief', 'creative-assets', 'brand-guidelines'],
    icon: '📱',
    color: 'from-yellow-500 to-orange-500',
    examples: [
      'Will this ad campaign get client approval?',
      'Will this rebrand be accepted?',
      'Will this social media strategy be greenlit?',
    ],
  },
  {
    id: 'influencer-collab',
    type: 'influencer-collab',
    title: 'Influencer Collaboration',
    question: 'Will this collaboration meet performance targets?',
    description: 'Predict collaboration success based on audience fit',
    category: 'Influencer Marketing',
    judgmentType: 'hybrid',
    criteria: [
      'Audience alignment',
      'Content quality and authenticity',
      'Engagement rate potential',
      'Brand fit',
      'Deliverable quality',
    ],
    resolutionTimeframe: 604800, // 7 days
    requiredEvidence: ['influencer-profile', 'content-plan', 'target-kpis'],
    icon: '⭐',
    color: 'from-pink-500 to-rose-500',
    examples: [
      'Will this influencer collab reach 500K impressions?',
      'Will this sponsored post get 5% engagement?',
      'Will this partnership generate 100+ conversions?',
    ],
  },
];

/**
 * Helper to create a creative market from template
 */
export function createMarketFromTemplate(
  template: CreativeMarketTemplate,
  customData: {
    title?: string;
    deadline: number;
    creator: string;
    initialLiquidity?: string;
  }
): {
  template: CreativeMarketTemplate;
  marketData: any;
} {
  return {
    template,
    marketData: {
      id: `market-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: customData.title || template.title,
      question: template.question,
      category: template.category,
      type: template.type,
      judgmentType: template.judgmentType,
      criteria: template.criteria,
      deadline: customData.deadline,
      creator: customData.creator,
      createdAt: Date.now(),
      status: 'active' as const,
      liquidity: customData.initialLiquidity || '1000',
      yesPool: '500',
      noPool: '500',
      totalVolume: '0',
      uniqueTraders: 0,
      aiEnabled: true,
    },
  };
}

/**
 * Get template by type
 */
export function getTemplateByType(type: CreativeMarketType): CreativeMarketTemplate | undefined {
  return creativeMarketTemplates.find((t) => t.type === type);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): CreativeMarketTemplate[] {
  return creativeMarketTemplates.filter((t) => t.category === category);
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  return Array.from(new Set(creativeMarketTemplates.map((t) => t.category)));
}
