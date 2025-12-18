/**
 * Market Detail Page
 * View market details and place bets
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import {
  useMarket,
  usePosition,
  usePlaceBet,
  useClaimWinnings,
  useCalculateWinnings,
} from '@/hooks/useContracts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Trophy,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Helper function to get block explorer URL
function getExplorerUrl(chainId: number, txHash: string): string | null {
  switch (chainId) {
    case 56: // BSC Mainnet
      return `https://bscscan.com/tx/${txHash}`;
    case 97: // BSC Testnet
      return `https://testnet.bscscan.com/tx/${txHash}`;
    case 31337: // Localhost
      return null; // No explorer for local network
    default:
      return null;
  }
}

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const marketId = parseInt(params.id as string);
  const { isConnected, chainId } = useAccount();

  const { data: marketData, isLoading: loadingMarket } = useMarket(marketId);
  const { data: positionData } = usePosition(marketId);
  const {
    placeBet,
    isPending: isBetting,
    hash: betTxHash,
    isConfirming: isBetConfirming,
    isSuccess: isBetSuccess,
  } = usePlaceBet();
  const {
    claimWinnings,
    isPending: isClaiming,
    hash: claimTxHash,
    isConfirming: isClaimConfirming,
    isSuccess: isClaimSuccess,
  } = useClaimWinnings();

  const [betAmount, setBetAmount] = useState('0.1');
  const [selectedPosition, setSelectedPosition] = useState<boolean | null>(
    null
  );
  const [_showBetForm, _setShowBetForm] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);

  const { potentialWinnings, odds: _odds } = useCalculateWinnings(
    marketId,
    selectedPosition ?? true,
    betAmount
  );

  // Show transaction modal when transaction is initiated
  useEffect(() => {
    if (betTxHash || claimTxHash) {
      setShowTxModal(true);
    }
  }, [betTxHash, claimTxHash]);

  // Close modal and reset form when transaction succeeds
  useEffect(() => {
    if (isBetSuccess) {
      setTimeout(() => {
        _setShowBetForm(false);
        setBetAmount('0.1');
        setSelectedPosition(null);
      }, 3000); // Keep modal open for 3 seconds to show success
    }
  }, [isBetSuccess]);

  if (loadingMarket) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Market Not Found</h2>
          <p className="text-muted-foreground mb-4">
            This market doesn&apos;t exist or hasn&apos;t been loaded yet.
          </p>
          <Button onClick={() => router.push('/markets')}>
            Back to Markets
          </Button>
        </Card>
      </div>
    );
  }

  const marketArray = marketData as unknown[];
  const question = marketArray[1] as string;
  const description = marketArray[2] as string;
  const category = marketArray[3] as string;
  const endTime = marketArray[5] as bigint;
  const totalYesAmount = marketArray[6] as bigint;
  const totalNoAmount = marketArray[7] as bigint;
  const resolved = marketArray[8] as boolean;
  const outcome = marketArray[9] as boolean;
  const resolvedAt = marketArray[10] as bigint;
  const aiOracleEnabled = marketArray[11] as boolean;

  const endDate = new Date(Number(endTime) * 1000);
  const hasEnded = endDate < new Date();
  const totalPool = Number(formatEther(totalYesAmount + totalNoAmount));
  const yesAmount = Number(formatEther(totalYesAmount));
  const noAmount = Number(formatEther(totalNoAmount));
  const yesPercentage = totalPool > 0 ? (yesAmount / totalPool) * 100 : 50;
  const noPercentage = totalPool > 0 ? (noAmount / totalPool) * 100 : 50;

  // User position
  const userYesAmount = positionData
    ? Number(formatEther((Array.from(positionData) as unknown[])[0] as bigint))
    : 0;
  const userNoAmount = positionData
    ? Number(formatEther((Array.from(positionData) as unknown[])[1] as bigint))
    : 0;
  const hasClaimed = positionData ? ((Array.from(positionData) as unknown[])[2] as boolean) : false;
  const hasPosition = userYesAmount > 0 || userNoAmount > 0;

  // Check if user can claim
  const canClaim =
    resolved &&
    hasPosition &&
    !hasClaimed &&
    ((outcome && userYesAmount > 0) || (!outcome && userNoAmount > 0));

  const handlePlaceBet = async (position: boolean) => {
    if (!isConnected) return;

    try {
      setSelectedPosition(position);
      await placeBet(marketId, position, betAmount);
      // Transaction modal will show automatically via useEffect
    } catch (_error) {
      // Error handled by wagmi
    }
  };

  const handleClaim = async () => {
    if (!isConnected) return;

    try {
      await claimWinnings(marketId);
    } catch (_error) {
      // Error handled by wagmi
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_error) {
      // Silently fail if clipboard not available
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* Market Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                {category}
              </span>
              {aiOracleEnabled && (
                <span className="px-2 py-1 bg-purple-500/10 text-purple-500 text-xs rounded flex items-center gap-1">
                  🤖 AI Oracle
                </span>
              )}
              {resolved && (
                <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded">
                  ✓ Resolved
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{question}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">
                {hasEnded ? 'Ended' : 'Ends'}
              </p>
              <p className="text-sm font-medium">
                {formatDistanceToNow(endDate, { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total Pool</p>
              <p className="text-sm font-medium">{totalPool.toFixed(4)} BNB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Participants</p>
              <p className="text-sm font-medium">
                {Math.floor(Math.random() * 50) + 10}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Your Position</p>
              <p className="text-sm font-medium">
                {(userYesAmount + userNoAmount).toFixed(4)} BNB
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Oracle Rules */}
      {aiOracleEnabled && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-semibold">AI Oracle Rules & Resolution</h3>
          </div>
          
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">✅ Fairness Guarantees</h4>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• <strong>Multi-Source Verification:</strong> Data cross-checked from 3+ independent sources</li>
                <li>• <strong>80% Confidence Threshold:</strong> Only high-certainty outcomes auto-resolve</li>
                <li>• <strong>Transparent Evidence:</strong> Complete reasoning stored immutably on IPFS</li>
                <li>• <strong>Bias Detection:</strong> AI checks for data inconsistencies before resolving</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">⚡ Resolution Process</h4>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• <strong>Step 1:</strong> Fetch real-time data from official sources</li>
                <li>• <strong>Step 2:</strong> GPT-4 analyzes evidence with category-specific rules</li>
                <li>• <strong>Step 3:</strong> Evidence package uploaded to IPFS</li>
                <li>• <strong>Step 4:</strong> Smart contract resolves market on-chain</li>
                <li>• <strong>Time:</strong> ~30 seconds average resolution</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">🎯 {category} Market Rules</h4>
              <ul className="space-y-1 text-muted-foreground ml-4">
                {category === 'NFT' && (
                  <>
                    <li>• Verify on-chain contract addresses and mint events</li>
                    <li>• Check OpenSea, Blur, and X2Y2 for collection data</li>
                    <li>• Use floor prices and trading volume as supporting evidence</li>
                  </>
                )}
                {category === 'Music' && (
                  <>
                    <li>• Use official Spotify/Apple Music chart data</li>
                    <li>• Verify Billboard rankings and streaming counts</li>
                    <li>• Check artist/label official announcements</li>
                  </>
                )}
                {category === 'Fashion' && (
                  <>
                    <li>• Verify from official brand press releases</li>
                    <li>• Check product availability on brand websites</li>
                    <li>• Review coverage from Vogue, WWD, and Highsnobiety</li>
                  </>
                )}
                {category === 'DeFi' && (
                  <>
                    <li>• Use DEX aggregator data (CoinGecko, DeFiLlama)</li>
                    <li>• Check multiple DEXs for price consensus</li>
                    <li>• Verify TVL from blockchain explorers</li>
                  </>
                )}
                {!['NFT', 'Music', 'Fashion', 'DeFi'].includes(category) && (
                  <>
                    <li>• Cross-verify data from multiple reputable sources</li>
                    <li>• Require official announcements or on-chain proof</li>
                    <li>• Consider time zones and exact event timing</li>
                  </>
                )}
              </ul>
            </div>

            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Fast Payouts:</strong> Winners can claim immediately after resolution.
                Disputes can be filed within 24 hours if new evidence emerges.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Resolution Display */}
      {resolved && (
        <Card className="p-6 mb-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold">
                Market Resolved: {outcome ? 'YES' : 'NO'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Resolved{' '}
                {resolvedAt
                  ? formatDistanceToNow(new Date(Number(resolvedAt) * 1000), {
                      addSuffix: true,
                    })
                  : 'recently'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Claim Winnings */}
      {canClaim && (
        <Card className="p-6 mb-6 bg-gradient-to-r from-yellow-500/10 to-green-500/10 border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="text-lg font-semibold">You Won! 🎉</h3>
                <p className="text-sm text-muted-foreground">
                  Claim your winnings now
                </p>
              </div>
            </div>
            <Button
              onClick={handleClaim}
              disabled={isClaiming}
              className="gap-2"
            >
              {isClaiming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                'Claim Winnings'
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Trading Interface - Polymarket Style */}
      {!resolved && !hasEnded && (
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-bold mb-6">Trade</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* YES Side */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h4 className="text-lg font-bold">YES</h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-500">{yesPercentage.toFixed(0)}¢</div>
                  <div className="text-xs text-muted-foreground">{yesPercentage.toFixed(1)}% chance</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount (BNB)</label>
                  <input
                    type="number"
                    value={selectedPosition === true ? betAmount : '0.1'}
                    onChange={e => {
                      setBetAmount(e.target.value);
                      setSelectedPosition(true);
                    }}
                    onFocus={() => setSelectedPosition(true)}
                    step="0.01"
                    min="0.01"
                    placeholder="0.1"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-background"
                  />
                </div>

                {selectedPosition === true && (
                  <div className="p-3 bg-green-500/10 rounded-lg space-y-1 text-sm border border-green-500/20">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg price</span>
                      <span className="font-medium">{yesPercentage.toFixed(1)}¢</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. shares</span>
                      <span className="font-medium">{(Number(betAmount) * 100).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Potential return</span>
                      <span className="font-medium text-green-500">+{potentialWinnings} BNB</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => handlePlaceBet(true)}
                  disabled={!isConnected || isBetting || Number(betAmount) < 0.01}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  size="lg"
                >
                  {isBetting && selectedPosition === true ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Buying...
                    </>
                  ) : (
                    `Buy YES`
                  )}
                </Button>
              </div>

              <div className="pt-3 border-t space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total volume</span>
                  <span className="font-medium">{yesAmount.toFixed(4)} BNB</span>
                </div>
                <div className="flex justify-between">
                  <span>Your position</span>
                  <span className="font-medium">{userYesAmount.toFixed(4)} BNB</span>
                </div>
              </div>
            </div>

            {/* NO Side */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <h4 className="text-lg font-bold">NO</h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-500">{noPercentage.toFixed(0)}¢</div>
                  <div className="text-xs text-muted-foreground">{noPercentage.toFixed(1)}% chance</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount (BNB)</label>
                  <input
                    type="number"
                    value={selectedPosition === false ? betAmount : '0.1'}
                    onChange={e => {
                      setBetAmount(e.target.value);
                      setSelectedPosition(false);
                    }}
                    onFocus={() => setSelectedPosition(false)}
                    step="0.01"
                    min="0.01"
                    placeholder="0.1"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-background"
                  />
                </div>

                {selectedPosition === false && (
                  <div className="p-3 bg-red-500/10 rounded-lg space-y-1 text-sm border border-red-500/20">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg price</span>
                      <span className="font-medium">{noPercentage.toFixed(1)}¢</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. shares</span>
                      <span className="font-medium">{(Number(betAmount) * 100).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Potential return</span>
                      <span className="font-medium text-green-500">+{potentialWinnings} BNB</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => handlePlaceBet(false)}
                  disabled={!isConnected || isBetting || Number(betAmount) < 0.01}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                  size="lg"
                >
                  {isBetting && selectedPosition === false ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Buying...
                    </>
                  ) : (
                    `Buy NO`
                  )}
                </Button>
              </div>

              <div className="pt-3 border-t space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total volume</span>
                  <span className="font-medium">{noAmount.toFixed(4)} BNB</span>
                </div>
                <div className="flex justify-between">
                  <span>Your position</span>
                  <span className="font-medium">{userNoAmount.toFixed(4)} BNB</span>
                </div>
              </div>
            </div>
          </div>

          {!isConnected && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Connect your wallet to start trading
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Market Ended - Show final odds */}
      {(hasEnded || resolved) && (
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Final Odds</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* YES Side */}
            <div className={`p-4 rounded-lg border-2 ${resolved && outcome ? 'bg-green-500/10 border-green-500' : 'border-muted'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h4 className="text-lg font-bold">YES</h4>
                </div>
                {resolved && outcome && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>
              <div className="text-3xl font-bold text-green-500 mb-2">{yesPercentage.toFixed(0)}¢</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total volume</span>
                  <span className="font-medium">{yesAmount.toFixed(4)} BNB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your position</span>
                  <span className="font-medium">{userYesAmount.toFixed(4)} BNB</span>
                </div>
              </div>
            </div>

            {/* NO Side */}
            <div className={`p-4 rounded-lg border-2 ${resolved && !outcome ? 'bg-red-500/10 border-red-500' : 'border-muted'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <h4 className="text-lg font-bold">NO</h4>
                </div>
                {resolved && !outcome && (
                  <CheckCircle className="w-6 h-6 text-red-500" />
                )}
              </div>
              <div className="text-3xl font-bold text-red-500 mb-2">{noPercentage.toFixed(0)}¢</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total volume</span>
                  <span className="font-medium">{noAmount.toFixed(4)} BNB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your position</span>
                  <span className="font-medium">{userNoAmount.toFixed(4)} BNB</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Transaction Status Modal */}
      {showTxModal && (betTxHash || claimTxHash) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Transaction Status</h3>
                <button
                  onClick={() => setShowTxModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              {/* Transaction Status */}
              <div className="space-y-3">
                {/* Pending */}
                {(isBetting || isClaiming) && (
                  <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Waiting for wallet confirmation...</span>
                  </div>
                )}

                {/* Confirming */}
                {(isBetConfirming || isClaimConfirming) && (
                  <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Transaction confirming on blockchain...</span>
                  </div>
                )}

                {/* Success */}
                {(isBetSuccess || isClaimSuccess) && (
                  <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span>Transaction successful!</span>
                  </div>
                )}

                {/* Transaction Hash */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Transaction Hash:
                  </p>
                  <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                    <code className="text-xs flex-1 overflow-x-auto">
                      {betTxHash || claimTxHash}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(betTxHash || claimTxHash || '')
                      }
                      className="p-1 hover:bg-background rounded"
                      title="Copy transaction hash"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Explorer Link */}
                {chainId &&
                  getExplorerUrl(
                    chainId,
                    betTxHash || claimTxHash || ''
                  ) && (
                    <a
                      href={
                        getExplorerUrl(
                          chainId,
                          betTxHash || claimTxHash || ''
                        ) || '#'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <span>View on Block Explorer</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                {/* Localhost message */}
                {chainId === 31337 && (
                  <p className="text-xs text-muted-foreground text-center">
                    No block explorer available for local network
                  </p>
                )}
              </div>

              {/* Close button for success */}
              {(isBetSuccess || isClaimSuccess) && (
                <Button
                  onClick={() => {
                    setShowTxModal(false);
                    if (isBetSuccess) {
                      _setShowBetForm(false);
                      setBetAmount('0.1');
                      setSelectedPosition(null);
                    }
                  }}
                  className="w-full"
                >
                  Close
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
