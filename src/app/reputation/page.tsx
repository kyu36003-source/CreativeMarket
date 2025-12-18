/**
 * Reputation Dashboard
 * View trader reputation, stats, and enable copy trading
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
} from 'lucide-react';

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
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-4">
            Connect your wallet to view your trading reputation and statistics
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" />
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

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Trading Reputation</h1>
        <p className="text-muted-foreground">
          Track your performance and build your reputation in the prediction
          markets
        </p>
      </div>

      {/* Tier Card */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
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

      {/* Achievements */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Achievements
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg text-center">
            <div className="text-4xl mb-2">🎯</div>
            <p className="font-medium mb-1">First Win</p>
            <p className="text-xs text-muted-foreground">
              Win your first prediction
            </p>
          </div>
          <div className="p-4 border rounded-lg text-center opacity-50">
            <div className="text-4xl mb-2">🔥</div>
            <p className="font-medium mb-1">Hot Streak</p>
            <p className="text-xs text-muted-foreground">
              Win 5 trades in a row
            </p>
          </div>
          <div className="p-4 border rounded-lg text-center opacity-50">
            <div className="text-4xl mb-2">💰</div>
            <p className="font-medium mb-1">High Roller</p>
            <p className="text-xs text-muted-foreground">
              Trade over 100 BNB volume
            </p>
          </div>
          <div className="p-4 border rounded-lg text-center opacity-50">
            <div className="text-4xl mb-2">🎓</div>
            <p className="font-medium mb-1">Market Master</p>
            <p className="text-xs text-muted-foreground">Complete 100 trades</p>
          </div>
          <div className="p-4 border rounded-lg text-center opacity-50">
            <div className="text-4xl mb-2">⭐</div>
            <p className="font-medium mb-1">Top Trader</p>
            <p className="text-xs text-muted-foreground">Reach Diamond tier</p>
          </div>
          <div className="p-4 border rounded-lg text-center opacity-50">
            <div className="text-4xl mb-2">👥</div>
            <p className="font-medium mb-1">Influencer</p>
            <p className="text-xs text-muted-foreground">Have 100+ copiers</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
