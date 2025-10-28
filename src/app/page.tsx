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
import { RainbowKitButton } from '@/components/RainbowKitButton';
import { MarketCard } from '@/components/MarketCard';
import { PredictionModal } from '@/components/PredictionModal';
import {
  fetchMarkets,
  fetchMarketCategories,
  calculateMarketOdds,
} from '@/lib/market-data';
import { Market, MarketCategoryInfo } from '@/types/market';
import {
  TrendingUp,
  Zap,
  Shield,
  Sparkles,
  Search,
  Filter,
  Brain,
  Palette,
} from 'lucide-react';

export default function HomePage() {
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [categories, setCategories] = useState<MarketCategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchMarketCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load market categories');
      }
    };
    loadCategories();
  }, []);

  // Fetch markets when category or search changes
  useEffect(() => {
    const loadMarkets = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMarkets(selectedCategory, searchQuery);
        setMarkets(data);
      } catch (err) {
        console.error('Failed to load markets:', err);
        setError('Failed to load markets. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadMarkets();
  }, [selectedCategory, searchQuery]);

  const selectedMarket = markets.find(m => m.id === selectedMarketId);
  const filteredMarkets = markets.filter(market => {
    const matchesCategory =
      selectedCategory === 'all' || market.category === selectedCategory;
    const matchesSearch =
      market.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePredictionSubmit = async (position: boolean, amount: string) => {
    console.log('Prediction submitted:', {
      marketId: selectedMarketId,
      position,
      amount,
    });
    // TODO: Implement smart contract interaction
    // Call contract method to place prediction
    try {
      // const tx = await placePrediction(selectedMarketId, position, amount);
      // await tx.wait();
      alert(
        `Prediction placed! Position: ${position ? 'YES' : 'NO'}, Amount: ${amount} BNB`
      );
      setSelectedMarketId(null);
      // Refresh markets after successful prediction
      const data = await fetchMarkets(selectedCategory, searchQuery);
      setMarkets(data);
    } catch (err) {
      console.error('Failed to place prediction:', err);
      alert('Failed to place prediction. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PredictBNB
                </h1>
                <p className="text-xs text-gray-600">Powered by BNB Chain</p>
              </div>
            </div>
            <RainbowKitButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-800">
              Seedify Hackathon 2025 • $400K Prize Pool
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            AI-Powered Prediction Markets on{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BNB Chain
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Predict the future of creative work. Trade predictions with AI
            assistance and gasless transactions.
          </p>

          {/* New: Creative Markets CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/creative-markets">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2"
              >
                <Palette className="h-5 w-5" />
                Explore Creative Markets
                <Sparkles className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button size="lg" variant="outline" className="gap-2">
                <TrendingUp className="h-5 w-5" />
                View Leaderboard
              </Button>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <div className="p-4 bg-white/60 backdrop-blur rounded-lg border border-purple-100">
              <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">AI Oracle</h3>
              <p className="text-sm text-gray-600">
                Subjective judging in minutes, not days
              </p>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur rounded-lg border border-green-100">
              <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Gasless Trading
              </h3>
              <p className="text-sm text-gray-600">
                No crypto knowledge needed
              </p>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur rounded-lg border border-blue-100">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Pooled Liquidity
              </h3>
              <p className="text-sm text-gray-600">45% better pricing</p>
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
          <h3 className="text-2xl font-bold mb-4">Browse Markets</h3>
          <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Markets
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

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
            Built for Seedify Prediction Markets Hackathon 2025 • Powered by BNB
            Chain
          </p>
          <p className="text-xs">
            🏆 YZi Labs Track: AI Oracles + Gasless UX + Liquidity Aggregation
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
        />
      )}
    </div>
  );
}
