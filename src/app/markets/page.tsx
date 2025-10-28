/**
 * Markets Listing Page
 * Browse and filter all available markets
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMarketCount, useMarket } from '@/hooks/useContracts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Filter,
  Search,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { formatEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';

const categories = [
  'All',
  'Crypto',
  'Sports',
  'Politics',
  'Weather',
  'Entertainment',
  'Technology',
  'Finance',
  'Other',
];

const statusFilters = ['All', 'Active', 'Resolved', 'Ending Soon'];

export default function MarketsPage() {
  const router = useRouter();
  const { data: marketCount } = useMarketCount();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const totalMarkets = marketCount ? Number(marketCount) : 0;

  // In production, fetch all markets from contract or indexer
  // For now, show sample markets
  const sampleMarkets = Array.from({ length: totalMarkets || 8 }, (_, i) => ({
    id: i,
    question: [
      'Will Bitcoin reach $50,000 by end of January 2024?',
      'Will Ethereum price be above $2,500 on January 1st?',
      'Will BNB Chain process over 5M transactions this week?',
      'Will Solana price exceed $100 by February 2024?',
      'Will NFT trading volume increase this month?',
      'Will any cryptocurrency flip Bitcoin in market cap?',
      'Will a major exchange get hacked this quarter?',
      'Will crypto regulations pass in the US this year?',
    ][i % 8],
    category: [
      'Crypto',
      'Crypto',
      'Technology',
      'Crypto',
      'Finance',
      'Crypto',
      'Technology',
      'Politics',
    ][i % 8],
    totalPool: Math.random() * 10 + 1,
    yesPercentage: Math.random() * 100,
    endTime: Date.now() + (Math.random() * 30 - 15) * 86400000,
    resolved: i % 5 === 0,
    outcome: i % 2 === 0,
    aiOracleEnabled: i % 3 !== 0,
  }));

  const filteredMarkets = sampleMarkets.filter(market => {
    if (selectedCategory !== 'All' && market.category !== selectedCategory) {
      return false;
    }
    if (selectedStatus === 'Active' && market.resolved) {
      return false;
    }
    if (selectedStatus === 'Resolved' && !market.resolved) {
      return false;
    }
    if (
      selectedStatus === 'Ending Soon' &&
      (market.resolved || market.endTime > Date.now() + 86400000)
    ) {
      return false;
    }
    if (
      searchQuery &&
      !market.question.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
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
            {sampleMarkets.filter(m => !m.resolved).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Volume</p>
          <p className="text-2xl font-bold">
            {sampleMarkets.reduce((sum, m) => sum + m.totalPool, 0).toFixed(2)}{' '}
            BNB
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Resolved Today</p>
          <p className="text-2xl font-bold">
            {sampleMarkets.filter(m => m.resolved).length}
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
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map(market => {
            const hasEnded = market.endTime < Date.now();
            const endingSoon = market.endTime - Date.now() < 86400000; // 24 hours

            return (
              <Card
                key={market.id}
                className="p-6 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => router.push(`/markets/${market.id}` as any)}
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
                            : `${formatDistanceToNow(new Date(market.endTime), { addSuffix: true })}`}
                      </span>
                    </div>
                  </div>
                  <Button size="sm">View Market</Button>
                </div>
              </Card>
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
