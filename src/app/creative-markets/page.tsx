'use client';

/**
 * Creative Prediction Markets Demo Page
 *
 * Showcases all hackathon features:
 * - AI-Judged Creative Markets
 * - Gasless Transactions
 * - Liquidity Aggregation
 * - AI Analytics
 */

import { useState, useEffect } from 'react';
import { CreativeMarketsGrid } from '@/components/CreativeMarketCard';
import { AIMarketAnalytics } from '@/components/AIMarketAnalytics';
import {
  creativeMarketTemplates,
  createMarketFromTemplate,
  getAllCategories,
} from '@/lib/creative-templates';
import { liquidityAggregator } from '@/lib/liquidity-aggregator';
import {
  Brain,
  Zap,
  Users,
  TrendingUp,
  Sparkles,
  Award,
  Target,
} from 'lucide-react';

export default function CreativeMarketsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [_showAnalytics, _setShowAnalytics] = useState(true);
  const [markets, setMarkets] = useState<any[]>([]);
  const [poolStats, setPoolStats] = useState<any[]>([]);

  useEffect(() => {
    // Generate sample markets from templates
    const sampleMarkets = creativeMarketTemplates.map((template, index) => {
      const { marketData } = createMarketFromTemplate(template, {
        deadline: Date.now() + (7 + index) * 24 * 60 * 60 * 1000, // 7-13 days
        creator: '0x1234...5678',
        initialLiquidity: (1000 + Math.random() * 9000).toFixed(0),
      });

      return {
        ...marketData,
        icon: template.icon,
        color: template.color,
        judgmentType: template.judgmentType,
        uniqueTraders: Math.floor(Math.random() * 50) + 10,
        totalVolume: (Math.random() * 50000).toFixed(2),
      };
    });

    setMarkets(sampleMarkets);

    // Load pool stats
    const stats = liquidityAggregator.getPools().map(pool => ({
      ...pool,
      stats: liquidityAggregator.getPoolStats(pool.marketType),
    }));
    setPoolStats(stats);
  }, []);

  const categories = ['all', ...getAllCategories()];
  const filteredMarkets =
    selectedCategory === 'all'
      ? markets
      : markets.filter(m => m.category === selectedCategory);

  const selectedMarketData = markets.find(m => m.id === selectedMarket);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered • Gasless • Creative</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Creative Prediction Markets
            </h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-8">
              Predict creative outcomes. Let AI judge. Trade gas-free.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4">
              <FeaturePill
                icon={Brain}
                title="AI Oracle"
                description="Fast, subjective judging"
              />
              <FeaturePill
                icon={Zap}
                title="Gasless Trading"
                description="No gas fees needed"
              />
              <FeaturePill
                icon={Users}
                title="Pooled Liquidity"
                description="Better pricing"
              />
              <FeaturePill
                icon={TrendingUp}
                title="AI Analytics"
                description="Smart predictions"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              label="Total Liquidity"
              value={`$${poolStats.reduce((sum, p) => sum + parseFloat(p.totalLiquidity), 0).toLocaleString()}`}
              icon={Users}
              color="text-blue-600"
            />
            <StatCard
              label="Active Markets"
              value={markets.length.toString()}
              icon={Target}
              color="text-purple-600"
            />
            <StatCard
              label="Avg APR"
              value={`${(poolStats.reduce((sum, p) => sum + p.apr, 0) / poolStats.length || 0).toFixed(1)}%`}
              icon={TrendingUp}
              color="text-green-600"
            />
            <StatCard
              label="AI Accuracy"
              value="87%"
              icon={Brain}
              color="text-pink-600"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Browse Creative Markets
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Markets Grid */}
        {filteredMarkets.length > 0 ? (
          <CreativeMarketsGrid
            markets={filteredMarkets}
            onSelectMarket={setSelectedMarket}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            No markets found in this category
          </div>
        )}

        {/* Selected Market Analytics */}
        {selectedMarket && selectedMarketData && (
          <div className="fixed bottom-0 right-0 w-full md:w-96 max-h-[80vh] overflow-y-auto bg-white border-l border-t border-gray-200 shadow-2xl p-6 z-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Market Analysis</h3>
              <button
                onClick={() => setSelectedMarket(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <AIMarketAnalytics
              marketId={selectedMarket}
              marketData={{
                question: selectedMarketData.question,
                context: selectedMarketData.category,
                deadline: selectedMarketData.deadline,
                yesPool: selectedMarketData.yesPool,
                noPool: selectedMarketData.noPool,
                category: selectedMarketData.category,
              }}
            />
          </div>
        )}

        {/* Liquidity Pools Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Liquidity Pools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {poolStats.map(pool => (
              <LiquidityPoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </div>

        {/* Hackathon Features Showcase */}
        <div className="mt-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🏆 Hackathon-Winning Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HackathonFeature
              icon={Brain}
              title="AI-Assisted Oracle"
              description="Subjective creative judging in minutes, not 48 hours. Solves YZi Labs Priority #1."
              tech="Claude AI, Vision API"
            />
            <HackathonFeature
              icon={Zap}
              title="Gasless UX"
              description="Trade predictions without crypto knowledge. Feels like a normal app. Solves YZi Labs Priority #3."
              tech="Account Abstraction, Sponsored Txs"
            />
            <HackathonFeature
              icon={Users}
              title="Liquidity Aggregation"
              description="Pool liquidity across similar creative markets. 45% better pricing. Solves fragmentation problem."
              tech="AMM Pools, Cross-Market Routing"
            />
            <HackathonFeature
              icon={Target}
              title="Niche Market Focus"
              description="First prediction market for creative industry. Design, music, art, content. Zero competition."
              tech="Creative-Specific Templates"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturePill({ icon: Icon, title, description }: any) {
  return (
    <div className="inline-flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
      <Icon className="h-5 w-5" />
      <div className="text-left">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-purple-100">{description}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="text-center">
      <Icon className={`h-8 w-8 ${color} mx-auto mb-2`} />
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

function LiquidityPoolCard({ pool }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{pool.name}</h3>
        <span className="text-2xl">
          {creativeMarketTemplates.find(t => t.type === pool.marketType)?.icon}
        </span>
      </div>

      {pool.stats && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">TVL</span>
            <span className="font-medium">{pool.stats.tvl}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">APR</span>
            <span className="font-medium text-green-600">{pool.stats.apr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">24h Volume</span>
            <span className="font-medium">{pool.stats.volume24h}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Markets</span>
            <span className="font-medium">{pool.stats.marketsSupported}</span>
          </div>
        </div>
      )}

      <button className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
        Add Liquidity
      </button>
    </div>
  );
}

function HackathonFeature({ icon: Icon, title, description, tech }: any) {
  return (
    <div className="bg-white rounded-lg p-6 border border-purple-200">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">{tech}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
