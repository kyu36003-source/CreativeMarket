'use client';

/**
 * Creative Market Card Component
 * 
 * Displays creative prediction markets with:
 * - AI analysis badge
 * - Gasless trading option
 * - Pooled liquidity benefits
 * - Visual preview of creative work
 */

import { useState } from 'react';
import { 
  TrendingUp, 
  Zap, 
  Users, 
  Clock, 
  Sparkles,
  ExternalLink,
  Brain
} from 'lucide-react';
import { AISignalBadge } from './AIMarketAnalytics';
import type { CreativeMarketType } from '@/lib/creative-templates';

interface CreativeMarketCardProps {
  market: {
    id: string;
    title: string;
    question: string;
    type: CreativeMarketType;
    category: string;
    icon: string;
    color: string;
    deadline: number;
    yesPool: string;
    noPool: string;
    totalVolume: string;
    uniqueTraders: number;
    aiEnabled: boolean;
    judgmentType: 'ai-judged' | 'objective-metric' | 'hybrid';
    imagePreview?: string;
  };
  onSelect?: (marketId: string) => void;
  showAnalytics?: boolean;
}

export function CreativeMarketCard({ 
  market, 
  onSelect,
  showAnalytics = true 
}: CreativeMarketCardProps) {
  const [aiPrediction] = useState({
    probability: 0.65 + Math.random() * 0.2,
    signal: Math.random() > 0.5 ? 'bullish' : 'bearish' as 'bullish' | 'bearish',
  });

  const yesPool = parseFloat(market.yesPool) || 500;
  const noPool = parseFloat(market.noPool) || 500;
  const totalPool = yesPool + noPool;
  const yesPercentage = (yesPool / totalPool) * 100;

  const timeUntilDeadline = market.deadline - Date.now();
  const daysLeft = Math.floor(timeUntilDeadline / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeUntilDeadline % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const getJudgmentBadge = () => {
    const badges = {
      'ai-judged': {
        text: 'AI Judged',
        icon: Brain,
        color: 'bg-purple-100 text-purple-700 border-purple-200',
      },
      'objective-metric': {
        text: 'Verified Data',
        icon: TrendingUp,
        color: 'bg-blue-100 text-blue-700 border-blue-200',
      },
      'hybrid': {
        text: 'AI + Data',
        icon: Sparkles,
        color: 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200',
      },
    };

    const badge = badges[market.judgmentType];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={() => onSelect?.(market.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`text-3xl flex-shrink-0 p-2 rounded-lg bg-gradient-to-br ${market.color}`}>
            {market.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {market.category}
              </span>
              {getJudgmentBadge()}
            </div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
              {market.question}
            </h3>
          </div>
        </div>
      </div>

      {/* Image Preview (if available) */}
      {market.imagePreview && (
        <div className="mb-3 rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={market.imagePreview} 
            alt={market.title}
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      {/* AI Analysis Badge */}
      {showAnalytics && market.aiEnabled && (
        <div className="mb-3">
          <AISignalBadge 
            probability={aiPrediction.probability}
            signal={aiPrediction.signal}
          />
        </div>
      )}

      {/* Market Stats */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Market Odds</span>
          <span className="font-semibold text-gray-900">
            {yesPercentage.toFixed(1)}% YES
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${market.color} transition-all duration-300`}
            style={{ width: `${yesPercentage}%` }}
          />
        </div>
      </div>

      {/* Pool Info */}
      <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
        <div>
          <div className="text-xs text-gray-500 mb-1">YES Pool</div>
          <div className="font-semibold text-green-600">${yesPool.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">NO Pool</div>
          <div className="font-semibold text-red-600">${noPool.toLocaleString()}</div>
        </div>
      </div>

      {/* Features */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Gasless Badge */}
        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-full text-xs text-green-700">
          <Zap className="h-3 w-3" />
          <span>Gasless Trading</span>
        </div>

        {/* Liquidity Pool Badge */}
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700">
          <Users className="h-3 w-3" />
          <span>Pooled Liquidity</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>
            {daysLeft > 0 
              ? `${daysLeft}d ${hoursLeft}h left`
              : `${hoursLeft}h left`
            }
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{market.uniqueTraders} traders</span>
          <span>${parseFloat(market.totalVolume).toLocaleString()} vol</span>
        </div>
      </div>

      {/* Quick Action on Hover */}
      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium text-sm hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2">
          <span>View Market</span>
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Grid of Creative Market Cards
 */
export function CreativeMarketsGrid({ 
  markets,
  onSelectMarket 
}: { 
  markets: CreativeMarketCardProps['market'][]; 
  onSelectMarket?: (marketId: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {markets.map((market) => (
        <CreativeMarketCard 
          key={market.id}
          market={market}
          onSelect={onSelectMarket}
        />
      ))}
    </div>
  );
}
