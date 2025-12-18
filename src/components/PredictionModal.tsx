'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrendingUp, TrendingDown, Zap, Info, Loader2 } from 'lucide-react';
import { AIAnalysis } from '@/types/market';

interface PredictionModalProps {
  marketId: string;
  question: string;
  yesOdds: number;
  noOdds: number;
  onClose: () => void;
  onSubmit: (position: boolean, amount: string) => void;
  isSubmitting?: boolean;
}

export function PredictionModal({
  marketId,
  question,
  yesOdds,
  noOdds,
  onClose,
  onSubmit,
  isSubmitting = false,
}: PredictionModalProps) {
  const [position, setPosition] = useState<boolean | null>(null);
  const [amount, setAmount] = useState('0.1');
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Fetch AI analysis when requested
  useEffect(() => {
    if (showAIAnalysis && !aiAnalysis) {
      const fetchAIAnalysis = async () => {
        setLoadingAnalysis(true);
        try {
          const response = await fetch(`/api/ai-analysis/${marketId}`);
          if (!response.ok) throw new Error('Failed to fetch AI analysis');
          const data = await response.json();
          setAiAnalysis(data);
        } catch (_error) {
          // Failed to fetch analysis
        } finally {
          setLoadingAnalysis(false);
        }
      };
      fetchAIAnalysis();
    }
  }, [showAIAnalysis, marketId, aiAnalysis]);

  const calculatePotentialWinnings = () => {
    if (!position || !amount) return '0';
    const investAmount = parseFloat(amount);
    const odds = position ? yesOdds : noOdds;
    const potentialReturn = (investAmount / (odds / 100)) * (1 - odds / 100);
    return potentialReturn.toFixed(4);
  };

  const getSentimentLabel = (sentiment: number): string => {
    if (sentiment > 0.3) return 'Bullish';
    if (sentiment < -0.3) return 'Bearish';
    return 'Neutral';
  };

  const getSentimentColor = (sentiment: number): string => {
    if (sentiment > 0.3) return 'text-green-600';
    if (sentiment < -0.3) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Make Your Prediction</CardTitle>
          <CardDescription className="text-base mt-2">
            {question}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Analysis Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-purple-900 mb-1">
                  AI-Powered Analysis Available
                </div>
                <p className="text-sm text-purple-700 mb-2">
                  Get real-time AI insights and market sentiment analysis
                  powered by our advanced oracle system.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAIAnalysis(!showAIAnalysis)}
                  className="text-purple-600 border-purple-300"
                >
                  {showAIAnalysis ? 'Hide' : 'Show'} AI Analysis
                </Button>
              </div>
            </div>
          </div>

          {showAIAnalysis && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              {loadingAnalysis ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    Loading AI analysis...
                  </p>
                </div>
              ) : aiAnalysis ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      AI Confidence:
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {aiAnalysis.confidence}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Sentiment:</span>
                    <span
                      className={`text-lg font-bold ${getSentimentColor(aiAnalysis.sentiment)}`}
                    >
                      {getSentimentLabel(aiAnalysis.sentiment)}
                    </span>
                  </div>
                  {aiAnalysis.factors && aiAnalysis.factors.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <div className="font-semibold mb-1">Key Factors:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {aiAnalysis.factors.map((factor, index) => (
                          <li key={index}>
                            {factor.name} (
                            {factor.impact > 0.7
                              ? 'High'
                              : factor.impact > 0.4
                                ? 'Medium'
                                : 'Low'}{' '}
                            Impact)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 italic">
                    Last updated:{' '}
                    {new Date(aiAnalysis.lastUpdated * 1000).toLocaleString()} •
                    Sources: {aiAnalysis.sources?.length || 0} analyzed
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    No AI analysis available
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Position Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">
              Choose Your Position
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPosition(true)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  position === true
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-lg">YES</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {yesOdds}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Current odds</div>
              </button>
              <button
                onClick={() => setPosition(false)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  position === false
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span className="font-bold text-lg">NO</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{noOdds}%</div>
                <div className="text-xs text-gray-500 mt-1">Current odds</div>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Investment Amount</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                step="0.01"
                min="0.01"
                className="w-full p-3 pr-16 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-gray-600">
                BNB
              </span>
            </div>
            <div className="flex gap-2">
              {['0.1', '0.5', '1', '5'].map(preset => (
                <Button
                  key={preset}
                  size="sm"
                  variant="outline"
                  onClick={() => setAmount(preset)}
                >
                  {preset} BNB
                </Button>
              ))}
            </div>
          </div>

          {/* Potential Winnings */}
          {position !== null && amount && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">
                  Potential Winnings:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {calculatePotentialWinnings()} BNB
                </span>
              </div>
              <div className="text-xs text-gray-600">
                If your prediction is correct, you will receive your investment
                plus winnings
              </div>
            </div>
          )}

          {/* Gasless Transaction Info */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <span className="font-semibold">Gasless Transaction:</span> This
                transaction uses account abstraction technology. No gas fees
                required!
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={position === null || !amount || parseFloat(amount) <= 0 || isSubmitting}
              onClick={() => onSubmit(position!, amount)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Confirm Prediction'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
