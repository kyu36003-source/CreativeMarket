// ============================================================================
// Trader Profile Page - Detailed trader information
// ============================================================================

'use client';

import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTraderProfile } from '@/hooks/use-copy-trading';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import { ArrowLeft, Users, TrendingUp, Award, Calendar } from 'lucide-react';
import { formatBigInt, formatPercentage } from '@/lib/utils';

interface TraderProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function TraderProfilePage({ params }: TraderProfilePageProps) {
  const { id } = use(params);
  const { data: trader, isLoading, error } = useTraderProfile(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trader profile...</p>
        </div>
      </div>
    );
  }

  if (error || !trader) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load trader profile</p>
          <Button asChild>
            <Link href="/leaderboard" passHref>
              Back to Leaderboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const badgeColors = {
    bronze: 'bg-orange-600',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-purple-500',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/leaderboard" passHref>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Leaderboard
              </Link>
            </Button>

            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <Card className="p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {trader.username?.[0] ||
                  trader.address.slice(2, 4).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">
                    {trader.username ||
                      `${trader.address.slice(0, 6)}...${trader.address.slice(-4)}`}
                  </h1>

                  {trader.verified && (
                    <svg
                      className="w-7 h-7 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}

                  {trader.badge && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${badgeColors[trader.badge]}`}
                    >
                      {trader.badge.toUpperCase()}
                    </span>
                  )}
                </div>

                {trader.bio && (
                  <p className="text-gray-600 mb-4">{trader.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{trader.followers.toLocaleString()} followers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined {new Date(trader.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Rank #{trader.rank}</span>
                  </div>
                </div>

                {/* Specialties */}
                {trader.specialties && trader.specialties.length > 0 && (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {trader.specialties.map(specialty => (
                      <span
                        key={specialty}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Follow Button */}
              <div>
                <Button size="lg" className="w-full md:w-auto">
                  Follow & Auto-Copy
                </Button>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Win Rate</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercentage(trader.stats.winRate)}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Profit</div>
                  <div className="text-2xl font-bold">
                    {formatBigInt(trader.stats.totalProfit)} BNB
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Win Streak</div>
                  <div className="text-2xl font-bold">
                    {trader.stats.streak}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <div className="text-sm text-gray-600">ROI</div>
                  <div
                    className={`text-2xl font-bold ${trader.stats.roi > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {trader.stats.roi > 0 ? '+' : ''}
                    {trader.stats.roi.toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Performance Details */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">Performance Details</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Total Bets</span>
                  <span className="font-semibold">
                    {trader.stats.totalBets}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Total Volume</span>
                  <span className="font-semibold">
                    {formatBigInt(trader.stats.totalVolume)} BNB
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Average Return</span>
                  <span className="font-semibold">
                    {trader.stats.avgReturn.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Best Streak</span>
                  <span className="font-semibold">
                    {trader.stats.bestStreak} wins
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Average Odds</span>
                  <span className="font-semibold">
                    {trader.stats.avgOdds.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Sharpe Ratio</span>
                  <span className="font-semibold">
                    {trader.stats.sharpeRatio.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Monthly Earnings</span>
                  <span className="font-semibold text-green-600">
                    {formatBigInt(trader.monthlyEarnings)} BNB
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Total Copy Fees</span>
                  <span className="font-semibold text-green-600">
                    {formatBigInt(trader.totalCopyFees)} BNB
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Ready to Follow?</h3>
              <p className="mb-6 text-blue-100">
                Auto-copy {trader.username || 'this trader'}'s predictions and
                start earning
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Follow & Start Copying
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
