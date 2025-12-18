/**
 * Reputation Dashboard - Your Complete Trading Profile
 * View trader reputation, stats, betting history, copy trading, and achievements
 */

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import {
  useTraderReputation,
  useSuccessRate,
  useTraderTier,
  useEnableCopyTrading,
} from '@/hooks/useContracts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  TrendingUp,
  Target,
  Users,
  Award,
  Sparkles,
  Loader2,
  Copy,
  CheckCircle,
  BarChart3,
  Activity,
  History,
  Wallet,
  Share2,
  ExternalLink,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { formatEther } from 'viem';

export default function ReputationPage() {
  const { address, isConnected } = useAccount();
  const { data: reputationData, isLoading } = useTraderReputation(address);
  const { data: successRateData } = useSuccessRate(address);
  const { data: tierData } = useTraderTier(address);
  const { enableCopyTrading, isPending } = useEnableCopyTrading();

  const [copyTradingEnabled, setCopyTradingEnabled] = useState(false);

  if (!isConnected) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Connect Your Wallet</h2>
          <p className="text-muted-foreground text-lg mb-6">
            Connect your wallet to view your complete trading profile, reputation stats,
            betting history, and copy trading features
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Reputation Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span>Betting History</span>
            </div>
            <div className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              <span>Copy Trading</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Achievements</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const [totalTrades, winningTrades, _totalVolume, roi] = reputationData 
    ? Array.from(reputationData as readonly [bigint, bigint, bigint, bigint])
    : [BigInt(0), BigInt(0), BigInt(0), BigInt(0)];
  const successRate = typeof successRateData === 'number' ? successRateData : 0;
  const tier = typeof tierData === 'number' ? tierData : 0;

  const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  const tierColors = [
    'text-orange-700',
    'text-gray-400',
    'text-yellow-500',
    'text-cyan-400',
    'text-purple-500',
  ];
  const tierIcons = ['🥉', '🥈', '🥇', '💎', '👑'];
  const currentTier = tier < tierNames.length ? tier : 0;

  const handleToggleCopyTrading = async () => {
    try {
      await enableCopyTrading();
      setCopyTradingEnabled(!copyTradingEnabled);
    } catch (_error) {
      // Error handled by wagmi
    }
  };

  // Mock data for demonstration (replace with actual contract calls)
  const userActiveBets: any[] = [];
  const userResolvedBets: any[] = [];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {address?.slice(2, 4).toUpperCase()}
              </div>
              My Profile
            </h1>
            <p className="text-muted-foreground">
              {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/trader/${address}`} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Public Profile
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <Activity className="w-4 h-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="copytrading" className="gap-2">
            <Copy className="w-4 h-4" />
            Copy Trading
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Award className="w-4 h-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Tier Card */}
          <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{tierIcons[currentTier]}</div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Tier</p>
              <h2 className={`text-3xl font-bold ${tierColors[currentTier]}`}>
                {tierNames[currentTier]}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {currentTier < tierNames.length - 1
                  ? `${50 - Number(totalTrades)} trades until ${tierNames[currentTier + 1]}`
                  : 'Maximum tier reached!'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">
              Reputation Score
            </p>
            <p className="text-4xl font-bold">{Number(totalTrades) * 10}</p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-muted-foreground">Total Trades</p>
          </div>
          <p className="text-3xl font-bold">{Number(totalTrades)}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-green-500" />
            <p className="text-sm text-muted-foreground">Winning Trades</p>
          </div>
          <p className="text-3xl font-bold">{Number(winningTrades)}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-purple-500" />
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
          <p className="text-3xl font-bold">{successRate}%</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-500" />
            <p className="text-sm text-muted-foreground">ROI</p>
          </div>
          <p
            className={`text-3xl font-bold ${roi > 0 ? 'text-green-500' : 'text-red-500'}`}
          >
            {roi > 0 ? '+' : ''}
            {roi}%
          </p>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Performance Overview
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Win Rate Breakdown
            </p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Wins</span>
                  <span className="font-medium">{Number(winningTrades)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${Number(totalTrades) > 0 ? (Number(winningTrades) / Number(totalTrades)) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Losses</span>
                  <span className="font-medium">
                    {Number(totalTrades) - Number(winningTrades)}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{
                      width: `${Number(totalTrades) > 0 ? ((Number(totalTrades) - Number(winningTrades)) / Number(totalTrades)) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Recent Performance
            </p>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {Math.random() > 0.5 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-red-500" />
                    )}
                    <span className="text-sm">
                      Market #{Math.floor(Math.random() * 1000)}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${Math.random() > 0.5 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {Math.random() > 0.5 ? '+' : '-'}
                    {(Math.random() * 2).toFixed(3)} BNB
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Copy Trading Section */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Copy Trading
            </h3>
            <p className="text-sm text-muted-foreground">
              Allow others to automatically copy your trades and earn a share of
              their profits
            </p>
          </div>
          <Button
            onClick={handleToggleCopyTrading}
            disabled={isPending}
            variant={copyTradingEnabled ? 'outline' : 'default'}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : copyTradingEnabled ? (
              'Disable Copy Trading'
            ) : (
              'Enable Copy Trading'
            )}
          </Button>
        </div>

        {copyTradingEnabled && (
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-green-500" />
              <p className="font-medium text-green-500">Copy Trading Active</p>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Other traders can now copy your positions. You earn 10% of their
              profits!
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Active Copiers</p>
                <p className="font-medium">{Math.floor(Math.random() * 50)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Copied Volume</p>
                <p className="font-medium">
                  {(Math.random() * 10).toFixed(2)} BNB
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Earnings from Copies</p>
                <p className="font-medium text-green-500">
                  +{(Math.random() * 0.5).toFixed(4)} BNB
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

        </TabsContent>

        {/* Betting History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5" />
              Betting History
            </h3>
            <div className="space-y-3">
              {userResolvedBets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No resolved bets yet</p>
                  <p className="text-sm mt-1">Your betting history will appear here</p>
                </div>
              ) : (
                userResolvedBets.map((market: any, i: number) => {
                  const userPosition = market.positions?.find(
                    (p: any) => p.user.toLowerCase() === address?.toLowerCase()
                  );
                  return (
                    <Card key={i} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link href={`/markets/${market.id}`} className="hover:underline">
                            <h4 className="font-semibold mb-1">{market.question}</h4>
                          </Link>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Wallet className="w-3 h-3" />
                              Bet: {formatEther(userPosition?.amount || BigInt(0))} BNB
                            </span>
                            <span className={`font-medium ${userPosition?.position ? 'text-green-600' : 'text-red-600'}`}>
                              {userPosition?.position ? 'YES' : 'NO'}
                            </span>
                            <span className={`flex items-center gap-1 ${market.outcome === userPosition?.position ? 'text-green-600' : 'text-red-600'}`}>
                              {market.outcome === userPosition?.position ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Won
                                </>
                              ) : (
                                <>Lost</>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${market.outcome === userPosition?.position ? 'text-green-600' : 'text-red-600'}`}>
                            {market.outcome === userPosition?.position ? '+' : '-'}
                            {formatEther(userPosition?.amount || BigInt(0))} BNB
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(Number(market.endTime) * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Active Bets Tab */}
        <TabsContent value="active" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Active Positions
            </h3>
            <div className="space-y-3">
              {userActiveBets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No active bets</p>
                  <p className="text-sm mt-1">Start predicting on markets to see them here</p>
                  <Button asChild className="mt-4" size="sm">
                    <Link href="/">Browse Markets</Link>
                  </Button>
                </div>
              ) : (
                userActiveBets.map((market: any, i: number) => {
                  const userPosition = market.positions?.find(
                    (p: any) => p.user.toLowerCase() === address?.toLowerCase()
                  );
                  return (
                    <Card key={i} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link href={`/markets/${market.id}`} className="hover:underline">
                            <h4 className="font-semibold mb-1">{market.question}</h4>
                          </Link>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Wallet className="w-3 h-3" />
                              Bet: {formatEther(userPosition?.amount || BigInt(0))} BNB
                            </span>
                            <span className={`font-medium ${userPosition?.position ? 'text-green-600' : 'text-red-600'}`}>
                              {userPosition?.position ? 'YES' : 'NO'}
                            </span>
                            <span className="flex items-center gap-1 text-yellow-600">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Ends: {new Date(Number(market.endTime) * 1000).toLocaleDateString()}
                          </p>
                          <Button asChild size="sm" variant="outline" className="mt-2">
                            <Link href={`/markets/${market.id}`}>
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Market
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Copy Trading Tab */}
        <TabsContent value="copytrading" className="space-y-6">
          {/* Copy Trading Section */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Copy className="w-5 h-5" />
                  Copy Trading
                </h3>
                <p className="text-sm text-muted-foreground">
                  Allow others to automatically copy your trades and earn a share of
                  their profits
                </p>
              </div>
              <Button
                onClick={handleToggleCopyTrading}
                disabled={isPending}
                variant={copyTradingEnabled ? 'outline' : 'default'}
                className="gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : copyTradingEnabled ? (
                  'Disable Copy Trading'
                ) : (
                  'Enable Copy Trading'
                )}
              </Button>
            </div>

            {copyTradingEnabled && (
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-green-500" />
                  <p className="font-medium text-green-500">Copy Trading Active</p>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Other traders can now copy your positions. You earn 10% of their
                  profits!
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Active Copiers</p>
                    <p className="font-medium">{Math.floor(Math.random() * 50)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Copied Volume</p>
                    <p className="font-medium">
                      {(Math.random() * 10).toFixed(2)} BNB
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Earnings from Copies</p>
                    <p className="font-medium text-green-500">
                      +{(Math.random() * 0.5).toFixed(4)} BNB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">How Copy Trading Works</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-3">
                  1
                </div>
                <h4 className="font-semibold mb-2">Enable Copy Trading</h4>
                <p className="text-sm text-muted-foreground">
                  Turn on copy trading to let others follow your predictions
                </p>
              </div>
              <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mb-3">
                  2
                </div>
                <h4 className="font-semibold mb-2">Build Your Reputation</h4>
                <p className="text-sm text-muted-foreground">
                  Make accurate predictions to attract copiers
                </p>
              </div>
              <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mb-3">
                  3
                </div>
                <h4 className="font-semibold mb-2">Earn Passive Income</h4>
                <p className="text-sm text-muted-foreground">
                  Get 10% of your copiers&apos; profits automatically
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Achievements
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center bg-green-500/5 border-green-500/20">
                <div className="text-4xl mb-2">🎯</div>
                <p className="font-medium mb-1">First Win</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Win your first prediction
                </p>
                <div className="flex items-center justify-center gap-1 text-green-600 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>Completed</span>
                </div>
              </div>
              <div className="p-4 border rounded-lg text-center opacity-50">
                <div className="text-4xl mb-2">🔥</div>
                <p className="font-medium mb-1">Hot Streak</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Win 5 trades in a row
                </p>
                <div className="text-xs text-muted-foreground">
                  Progress: 2/5
                </div>
              </div>
              <div className="p-4 border rounded-lg text-center opacity-50">
                <div className="text-4xl mb-2">💰</div>
                <p className="font-medium mb-1">High Roller</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Trade over 100 BNB volume
                </p>
                <div className="text-xs text-muted-foreground">
                  Progress: 12.5/100 BNB
                </div>
              </div>
              <div className="p-4 border rounded-lg text-center opacity-50">
                <div className="text-4xl mb-2">🎓</div>
                <p className="font-medium mb-1">Market Master</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Complete 100 trades
                </p>
                <div className="text-xs text-muted-foreground">
                  Progress: {Number(totalTrades)}/100
                </div>
              </div>
              <div className="p-4 border rounded-lg text-center opacity-50">
                <div className="text-4xl mb-2">⭐</div>
                <p className="font-medium mb-1">Top Trader</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Reach Diamond tier
                </p>
                <div className="text-xs text-muted-foreground">
                  Current: {tierNames[currentTier]}
                </div>
              </div>
              <div className="p-4 border rounded-lg text-center opacity-50">
                <div className="text-4xl mb-2">👥</div>
                <p className="font-medium mb-1">Influencer</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Have 100+ copiers
                </p>
                <div className="text-xs text-muted-foreground">
                  Progress: 0/100
                </div>
              </div>
              <div className="p-4 border rounded-lg text-center opacity-50">
                <div className="text-4xl mb-2">⚡</div>
                <p className="font-medium mb-1">Quick Draw</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Bet within 1 hour of market creation
                </p>
              </div>
              <div className="p-4 border rounded-lg text-center opacity-50">
                <div className="text-4xl mb-2">🎲</div>
                <p className="font-medium mb-1">Risk Taker</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Bet against 80%+ odds
                </p>
              </div>
              <div className="p-4 border rounded-lg text-center opacity-50">
                <div className="text-4xl mb-2">🌟</div>
                <p className="font-medium mb-1">Perfect Week</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Win all trades in 7 days
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🏆</div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Keep Building Your Legacy</h4>
                <p className="text-sm text-muted-foreground">
                  Complete more trades and improve your performance to unlock all achievements
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
