'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MarketCard } from '@/components/MarketCard';
import { PredictionModal } from '@/components/PredictionModal';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { calculateMarketOdds } from '@/lib/market-data';
import { Market, MarketCategoryInfo } from '@/types/market';
import {
  TrendingUp,
  Zap,
  Shield,
  Sparkles,
  Search,
  Brain,
  CheckCircle,
} from 'lucide-react';
import { useMarketCount, useMarket, usePlaceBet } from '@/hooks/useContracts';
import { useRouter } from 'next/navigation';
import { STATIC_MARKETS } from '@/lib/static-markets';

export default function HomePage() {
  const router = useRouter();
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [categories] = useState<MarketCategoryInfo[]>([
    { id: 'all', name: 'All Markets', icon: '🎯', count: 0 },
    { id: 'NFT', name: 'NFT', icon: '🖼️', count: 0 },
    { id: 'Music', name: 'Music', icon: '🎵', count: 0 },
    { id: 'Fashion', name: 'Fashion', icon: '👗', count: 0 },
    { id: 'Art', name: 'Art', icon: '🎨', count: 0 },
    { id: 'Film', name: 'Film', icon: '🎬', count: 0 },
    { id: 'Writing', name: 'Writing', icon: '✍️', count: 0 },
    { id: 'Social', name: 'Social', icon: '🌐', count: 0 },
    { id: 'DeFi', name: 'DeFi', icon: '💎', count: 0 },
    { id: 'Creative', name: 'Creative', icon: '✨', count: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Betting hook
  const { placeBet, isPending: isBetting, isSuccess } = usePlaceBet();

  // Get market count from blockchain (with static fallback)
  const { data: marketCount, isLoading: isLoadingCount } = useMarketCount();
  
  // Fetch markets 1-6 directly (with static fallback)
  const { data: market1Data, isLoading: isLoading1 } = useMarket(1);
  const { data: market2Data, isLoading: isLoading2 } = useMarket(2);
  const { data: market3Data, isLoading: isLoading3 } = useMarket(3);
  const { data: market4Data, isLoading: isLoading4 } = useMarket(4);
  const { data: market5Data, isLoading: isLoading5 } = useMarket(5);
  const { data: market6Data, isLoading: isLoading6 } = useMarket(6);

  // Timeout fallback - stop loading after 3 seconds (faster UX)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 3000); // 3 seconds

    return () => clearTimeout(timeout);
  }, [loading]);

  // Convert blockchain data to Market format
  useEffect(() => {
    // If all hooks have finished loading (not loading anymore)
    const allFinishedLoading = !isLoadingCount && !isLoading1 && !isLoading2 && 
                                !isLoading3 && !isLoading4 && !isLoading5 && !isLoading6;
    
    if (allFinishedLoading) {
      // Hooks loading complete
    }

    const convertToMarket = (marketId: number, data: unknown[]): Market | null => {
      if (!data || data.length < 12) {
        return null;
      }

      const [
        _id,
        question,
        description,
        category,
        creator,
        endTime,
        totalYesAmount,
        totalNoAmount,
        resolved,
        outcome,
        resolvedAt,
        aiOracleEnabled,
      ] = data as [bigint, string, string, string, string, bigint, bigint, bigint, boolean, boolean, bigint, boolean];

      const totalYes = totalYesAmount as bigint;
      const totalNo = totalNoAmount as bigint;
      const { yesOdds, noOdds } = calculateMarketOdds(totalYes, totalNo);

      return {
        id: marketId.toString(),
        question: question as string,
        description: description as string,
        category: category as string,
        creator: creator as string,
        endTime: Number(endTime),
        totalYesAmount: totalYes,
        totalNoAmount: totalNo,
        resolved: resolved as boolean,
        outcome: outcome as boolean,
        resolvedAt: Number(resolvedAt),
        aiOracleEnabled: aiOracleEnabled as boolean,
        yesOdds,
        noOdds,
        totalVolume: totalYes + totalNo,
        participantCount: Math.floor(Math.random() * 50) + 10, // Placeholder
      };
    };

    const loadedMarkets: Market[] = [];
    
    // Try to load from blockchain data
    const marketDataArray = [
      { id: 1, data: market1Data },
      { id: 2, data: market2Data },
      { id: 3, data: market3Data },
      { id: 4, data: market4Data },
      { id: 5, data: market5Data },
      { id: 6, data: market6Data },
    ];

    for (const { id, data } of marketDataArray) {
      if (data) {
        const market = convertToMarket(id, data as unknown[]);
        if (market) loadedMarkets.push(market);
      }
    }

    if (loadedMarkets.length > 0) {
      setMarkets(loadedMarkets);
      setLoading(false);
      setError(null);
    } else if (allFinishedLoading || marketCount !== undefined) {
      // All hooks loaded but no data - this is expected in production demo mode
      // The hooks will have returned static data automatically
      setLoading(false);
      
      // Convert static markets for display if no blockchain data
      if (loadedMarkets.length === 0) {
        const staticMarkets = STATIC_MARKETS.map(sm => {
          const totalYes = sm.totalYesAmount;
          const totalNo = sm.totalNoAmount;
          const { yesOdds, noOdds } = calculateMarketOdds(totalYes, totalNo);
          
          return {
            id: sm.id.toString(),
            question: sm.question,
            description: sm.description,
            category: sm.category,
            creator: sm.creator,
            endTime: Number(sm.endTime),
            totalYesAmount: sm.totalYesAmount,
            totalNoAmount: sm.totalNoAmount,
            resolved: sm.resolved,
            outcome: sm.outcome,
            resolvedAt: Number(sm.resolvedAt),
            aiOracleEnabled: sm.aiOracleEnabled,
            yesOdds,
            noOdds,
            totalVolume: totalYes + totalNo,
            participantCount: Math.floor(Math.random() * 50) + 15,
          };
        });
        
        setMarkets(staticMarkets);
      }
    }
  }, [
    market1Data, market2Data, market3Data, market4Data, market5Data, market6Data,
    marketCount, isLoadingCount, isLoading1, isLoading2, isLoading3, isLoading4, isLoading5, isLoading6
  ]);

  const selectedMarket = markets.find(m => m.id === selectedMarketId);
  const filteredMarkets = markets.filter(market => {
    const matchesCategory =
      selectedCategory === 'all' || market.category === selectedCategory;
    const matchesSearch =
      market.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate category counts
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return markets.length;
    return markets.filter(m => m.category === categoryId).length;
  };

  const handlePredictionSubmit = async (position: boolean, amount: string) => {
    if (!selectedMarketId) return;
    
    try {
      await placeBet(parseInt(selectedMarketId), position, amount);
      // Close modal after successful transaction
      setSelectedMarketId(null);
      // Navigate to market detail page to see the result
      router.push(`/markets/${selectedMarketId}`);
    } catch (error) {
      console.error('Failed to place bet:', error);
      // Keep modal open so user can retry
    }
  };

  // Close modal and redirect to market when transaction succeeds
  useEffect(() => {
    if (isSuccess && selectedMarketId) {
      setTimeout(() => {
        setSelectedMarketId(null);
        router.push(`/markets/${selectedMarketId}`);
      }, 2000);
    }
  }, [isSuccess, selectedMarketId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        {/* Demo Mode Banner */}
        <DemoModeBanner />
        
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">
              Powered by BNB Chain
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Create Your Prediction
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            Crypto • DeFi • NFTs • Music • Movies & More
          </p>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            Set your rules, get AI verification, and let traders predict the outcome.
            Every prediction includes clear resolution criteria for fair results.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/create/new">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg text-lg px-8 py-6 h-auto gap-3">
                <Sparkles className="h-6 w-6" />
                Create Prediction
              </Button>
            </Link>
            <Link href="/markets">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 h-auto">
                <TrendingUp className="h-5 w-5" />
                Browse Markets
              </Button>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <div className="p-6 bg-white/80 backdrop-blur rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all shadow-lg">
              <CheckCircle className="h-10 w-10 text-purple-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Clear Rules Required</h3>
              <p className="text-sm text-gray-600">
                Every prediction must have verifiable resolution criteria reviewed by AI
              </p>
            </div>
            <div className="p-6 bg-white/80 backdrop-blur rounded-xl border-2 border-green-200 hover:border-green-400 transition-all shadow-lg">
              <Brain className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                AI Verification
              </h3>
              <p className="text-sm text-gray-600">
                AI oracle checks data sources and ensures fair resolution in minutes
              </p>
            </div>
            <div className="p-6 bg-white/80 backdrop-blur rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all shadow-lg">
              <Zap className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                Gasless Trading
              </h3>
              <p className="text-sm text-gray-600">No gas fees, no complexity - just predict and earn</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-2 hover:border-purple-300 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>AI-Assisted Oracles</CardTitle>
              <CardDescription>
                Fast market resolution with AI-powered data analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Our advanced AI oracle system analyzes multiple data sources to
                provide faster, more accurate market resolutions compared to
                traditional methods.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-300 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Gasless Transactions</CardTitle>
              <CardDescription>
                No gas fees with account abstraction technology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Trade without worrying about gas fees. Our account abstraction
                layer makes prediction markets accessible to everyone.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-300 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Deep Liquidity</CardTitle>
              <CardDescription>
                Aggregated liquidity pools for better trading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Our liquidity aggregation technology ensures competitive odds
                and minimal slippage across all markets.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Market Categories */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-4">Active Prediction Markets</h3>
          <p className="text-gray-600 mb-6 text-lg">All markets include AI-verified resolution rules with clear data sources and deadlines</p>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all shadow-sm flex items-center gap-2 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-200'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span className="text-lg">🎯</span>
              <span>All Markets</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selectedCategory === 'all' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {getCategoryCount('all')}
              </span>
            </button>
            {categories.filter(cat => cat.id !== 'all').map(cat => {
              const count = getCategoryCount(cat.id);
              if (count === 0) return null; // Hide empty categories
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all shadow-sm flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCategory === cat.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredMarkets.length === 0 ? (
                <>No markets found {searchQuery && `for "${searchQuery}"`}</>
              ) : (
                <>
                  Showing <span className="font-semibold text-purple-600">{filteredMarkets.length}</span> 
                  {selectedCategory !== 'all' && ` ${selectedCategory}`} 
                  {filteredMarkets.length === 1 ? ' market' : ' markets'}
                  {searchQuery && ` matching "${searchQuery}"`}
                </>
              )}
            </p>
          </div>
        )}

        {/* Markets Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading markets...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map(market => (
              <MarketCard
                key={market.id}
                market={market}
                onPredict={setSelectedMarketId}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredMarkets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No markets found matching your criteria.
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p className="mb-2">
            Decentralized Prediction Markets • Powered by BNB Chain
          </p>
          <p className="text-xs">
            AI Oracles • Gasless Transactions • On-Chain Reputation
          </p>
        </div>
      </footer>

      {/* Prediction Modal */}
      {selectedMarket && (
        <PredictionModal
          marketId={selectedMarket.id}
          question={selectedMarket.question}
          yesOdds={
            calculateMarketOdds(
              selectedMarket.totalYesAmount,
              selectedMarket.totalNoAmount
            ).yesOdds
          }
          noOdds={
            calculateMarketOdds(
              selectedMarket.totalYesAmount,
              selectedMarket.totalNoAmount
            ).noOdds
          }
          onClose={() => setSelectedMarketId(null)}
          onSubmit={handlePredictionSubmit}
          isSubmitting={isBetting}
        />
      )}
    </div>
  );
}
