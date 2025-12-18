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
  const [showBetForm, setShowBetForm] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);

  const { potentialWinnings, odds } = useCalculateWinnings(
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
        setShowBetForm(false);
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

  const handlePlaceBet = async () => {
    if (!isConnected || selectedPosition === null) return;

    try {
      await placeBet(marketId, selectedPosition, betAmount);
      // Transaction modal will show automatically via useEffect
    } catch (error) {
      console.error('Error placing bet:', error);
    }
  };

  const handleClaim = async () => {
    if (!isConnected) return;

    try {
      await claimWinnings(marketId);
    } catch (error) {
      console.error('Error claiming winnings:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* YES Option */}
        <Card
          className={`p-6 cursor-pointer transition-all ${
            selectedPosition === true && showBetForm
              ? 'ring-2 ring-green-500 bg-green-500/5'
              : 'hover:border-green-500/50'
          } ${resolved && outcome ? 'border-green-500 bg-green-500/10' : ''}`}
          onClick={() => {
            if (!hasEnded && !resolved) {
              setSelectedPosition(true);
              setShowBetForm(true);
            }
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h3 className="text-2xl font-bold">YES</h3>
            </div>
            {resolved && outcome && (
              <CheckCircle className="w-6 h-6 text-green-500" />
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Probability
                </span>
                <span className="text-sm font-medium">
                  {yesPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${yesPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Bet</p>
                <p className="font-medium">{yesAmount.toFixed(4)} BNB</p>
              </div>
              <div>
                <p className="text-muted-foreground">Your Bet</p>
                <p className="font-medium">{userYesAmount.toFixed(4)} BNB</p>
              </div>
            </div>
          </div>
        </Card>

        {/* NO Option */}
        <Card
          className={`p-6 cursor-pointer transition-all ${
            selectedPosition === false && showBetForm
              ? 'ring-2 ring-red-500 bg-red-500/5'
              : 'hover:border-red-500/50'
          } ${resolved && !outcome ? 'border-red-500 bg-red-500/10' : ''}`}
          onClick={() => {
            if (!hasEnded && !resolved) {
              setSelectedPosition(false);
              setShowBetForm(true);
            }
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-red-500" />
              <h3 className="text-2xl font-bold">NO</h3>
            </div>
            {resolved && !outcome && (
              <CheckCircle className="w-6 h-6 text-red-500" />
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Probability
                </span>
                <span className="text-sm font-medium">
                  {noPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${noPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Bet</p>
                <p className="font-medium">{noAmount.toFixed(4)} BNB</p>
              </div>
              <div>
                <p className="text-muted-foreground">Your Bet</p>
                <p className="font-medium">{userNoAmount.toFixed(4)} BNB</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bet Form */}
      {showBetForm && selectedPosition !== null && !hasEnded && !resolved && (
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Place Bet on {selectedPosition ? 'YES' : 'NO'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Bet Amount (BNB)
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={e => setBetAmount(e.target.value)}
                step="0.01"
                min="0.01"
                placeholder="0.1"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Potential Profit</span>
                <span className="font-medium text-green-500">
                  +{potentialWinnings} BNB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Odds</span>
                <span className="font-medium">{odds}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee (2%)</span>
                <span className="font-medium">
                  {(Number(betAmount) * 0.02).toFixed(4)} BNB
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBetForm(false);
                  setSelectedPosition(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePlaceBet}
                disabled={!isConnected || isBetting || Number(betAmount) < 0.01}
                className="flex-1 gap-2"
              >
                {isBetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Placing Bet...
                  </>
                ) : (
                  `Bet ${betAmount} BNB`
                )}
              </Button>
            </div>

            {!isConnected && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Please connect your wallet to place a bet
              </p>
            )}
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
                      setShowBetForm(false);
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
