'use client';

import Link from 'next/link';
import { Market } from '@/types/market';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatBNB, calculateMarketOdds } from '@/lib/market-data';
import { Clock, TrendingUp, Users } from 'lucide-react';

interface MarketCardProps {
  market: Market;
  onPredict?: (marketId: string) => void;
}

export function MarketCard({ market, onPredict }: MarketCardProps) {
  const odds = calculateMarketOdds(market.totalYesAmount, market.totalNoAmount);
  const totalVolume = market.totalYesAmount + market.totalNoAmount;
  const timeRemaining = market.endTime * 1000 - Date.now();
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));

  return (
    <Link href={`/markets/${market.id}`} className="block">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {market.category.toUpperCase()}
              </span>
              {!market.resolved && daysRemaining > 0 && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {daysRemaining}d left
                </span>
              )}
            </div>
            <h3 className="font-semibold text-lg leading-tight">
              {market.question}
            </h3>
          </div>
          {market.imageUrl && (
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={market.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">
          {market.description}
        </p>

        {/* Odds Display */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">YES</div>
            <div className="text-2xl font-bold text-green-600">
              {odds.yesOdds}%
            </div>
            <div className="text-xs text-gray-500">
              {formatBNB(market.totalYesAmount)} BNB
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">NO</div>
            <div className="text-2xl font-bold text-red-600">
              {odds.noOdds}%
            </div>
            <div className="text-xs text-gray-500">
              {formatBNB(market.totalNoAmount)} BNB
            </div>
          </div>
        </div>

        {/* Market Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>{formatBNB(totalVolume)} BNB Volume</span>
          </div>
          {market.tags && market.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{market.tags.length} tags</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {!market.resolved && onPredict && (
          <Button 
            className="w-full" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPredict(market.id);
            }}
          >
            Make Prediction
          </Button>
        )}
        {market.resolved && (
          <div
            className={`p-3 rounded-lg text-center font-semibold ${
              market.outcome
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            Resolved: {market.outcome ? 'YES' : 'NO'}
          </div>
        )}
      </CardContent>
    </Card>
    </Link>
  );
}
