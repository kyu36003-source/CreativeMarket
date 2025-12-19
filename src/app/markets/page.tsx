/**
 * Markets Listing Page
 * Browse and filter all available markets
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { STATIC_MARKETS } from '@/lib/static-markets';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Search,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { formatEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';

const categories = [
  'All',
  'Crypto',
  'DeFi',
  'NFT',
  'Movies',
  'Music',
  'Relationships',
  'Sports',
  'Politics',
  'Entertainment',
  'Technology',
  'Finance',
  'Other',
];

const statusFilters = ['All', 'Active', 'Resolved', 'Ending Soon'];

interface MarketData {
  id: number;
  question: string;
  description: string;
  category: string;
  totalPool: number;
  yesAmount: number;
  noAmount: number;
  yesPercentage: number;
  endTime: number;
  resolved: boolean;
  outcome: boolean;
  aiOracleEnabled: boolean;
}

export default function MarketsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const marketsLoadedRef = useRef(false);

  // Load markets from static data (single source of truth)
  useEffect(() => {
    if (marketsLoadedRef.current) return;
    
    // Convert STATIC_MARKETS to MarketData format
    const convertedMarkets = STATIC_MARKETS.map(sm => {
      const totalYes = Number(formatEther(sm.totalYesAmount));
      const totalNo = Number(formatEther(sm.totalNoAmount));
      const totalPool = totalYes + totalNo;
      const yesPercentage = totalPool > 0 ? (totalYes / totalPool) * 100 : 50;

      return {
        id: Number(sm.id),
        question: sm.question,
        description: sm.description,
        category: sm.category,
        totalPool,
        yesAmount: totalYes,
        noAmount: totalNo,
        yesPercentage,
        endTime: Number(sm.endTime),
        resolved: sm.resolved,
        outcome: sm.outcome,
        aiOracleEnabled: sm.aiOracleEnabled,
      };
    });

    setMarkets(convertedMarkets);
    marketsLoadedRef.current = true;
    setLoading(false);
  }, []);

  const totalMarkets = markets.length;

  const filteredMarkets = markets.filter(market => {
    // Category filter
    if (
      selectedCategory !== 'All' &&
      market.category.toLowerCase() !== selectedCategory.toLowerCase()
    ) {
      return false;
    }

    // Status filter
    const now = Date.now();
    const endTime = market.endTime * 1000;
    const isActive = !market.resolved && endTime > now;
    const isEndingSoon = isActive && endTime - now < 7 * 86400000; // 7 days

    if (selectedStatus === 'Active' && !isActive) return false;
    if (selectedStatus === 'Resolved' && !market.resolved) return false;
    if (selectedStatus === 'Ending Soon' && !isEndingSoon) return false;

    // Search filter
    if (searchQuery && !market.question.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Prediction Markets</h1>
        <p className="text-muted-foreground">
          Browse and bet on {totalMarkets} active prediction markets
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Markets</p>
          <p className="text-2xl font-bold">{totalMarkets}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Markets</p>
          <p className="text-2xl font-bold">
            {markets.filter((m: MarketData) => !m.resolved).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Volume</p>
          <p className="text-2xl font-bold">
            {markets.reduce((sum: number, m: MarketData) => sum + m.totalPool, 0).toFixed(2)}{' '}
            BNB
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Resolved Today</p>
          <p className="text-2xl font-bold">
            {markets.filter((m: MarketData) => m.resolved).length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search markets..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map(status => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Markets Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredMarkets.length > 0 ? (
          filteredMarkets.map(market => {
            const now = Date.now();
            const endTime = market.endTime * 1000;
            const hasEnded = endTime < now;
            const endingSoon = endTime - now < 86400000 && endTime - now > 0; // 24 hours

            return (
              <Link key={market.id} href={`/markets/${market.id}`} className="block">
              <Card
                className="p-6 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                        {market.category}
                      </span>
                      {market.aiOracleEnabled && (
                        <span className="px-2 py-1 bg-purple-500/10 text-purple-500 text-xs rounded">
                          🤖 AI Oracle
                        </span>
                      )}
                      {market.resolved && (
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Resolved
                        </span>
                      )}
                      {endingSoon && !market.resolved && (
                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded">
                          ⏰ Ending Soon
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {market.question}
                    </h3>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* YES Option */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span className="font-semibold">YES</span>
                      </div>
                      <span className="text-2xl font-bold">
                        {market.yesPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${market.yesPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* NO Option */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-500" />
                        <span className="font-semibold">NO</span>
                      </div>
                      <span className="text-2xl font-bold">
                        {(100 - market.yesPercentage).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${100 - market.yesPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{market.totalPool.toFixed(2)} BNB</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {market.resolved
                          ? 'Resolved'
                          : hasEnded
                            ? 'Ended'
                            : `${formatDistanceToNow(new Date(endTime), { addSuffix: true })}`}
                      </span>
                    </div>
                  </div>
                  <Button size="sm">View Market</Button>
                </div>
              </Card>
              </Link>
            );
          })
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No markets found</p>
          </Card>
        )}
      </div>
    </div>
  );
}
