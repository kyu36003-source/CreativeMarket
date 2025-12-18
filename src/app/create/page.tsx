/**
 * Create Market Component
 * Form for creating new prediction markets
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useCreateMarket } from '@/hooks/useContracts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Plus,
  Loader2,
  Calendar,
  Tag,
  FileText,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'crypto', label: 'Crypto', icon: '₿' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'politics', label: 'Politics', icon: '🏛️' },
  { value: 'weather', label: 'Weather', icon: '🌤️' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'finance', label: 'Finance', icon: '📈' },
  { value: 'other', label: 'Other', icon: '📌' },
];

export default function CreateMarketPage() {
  const router = useRouter();
  const { address: _address, isConnected } = useAccount();
  const { createMarket, isPending, isConfirming, isSuccess, error } =
    useCreateMarket();

  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('crypto');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [aiOracleEnabled, setAiOracleEnabled] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const endDateTime = new Date(`${endDate}T${endTime}`);

      if (endDateTime <= new Date()) {
        alert('End date must be in the future');
        return;
      }

      await createMarket({
        question,
        description,
        category,
        endTime: endDateTime,
        aiOracleEnabled,
      });

      // Wait for success
      if (isSuccess) {
        router.push('/markets');
      }
    } catch (err) {
      console.error('Error creating market:', err);
    }
  };

  // Set minimum date to tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create Prediction Market</h1>
        <p className="text-muted-foreground">
          Create a new market for others to predict on. Markets can be resolved
          automatically by our AI Oracle or manually.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <HelpCircle className="w-4 h-4" />
              Market Question
            </label>
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Will Bitcoin reach $100,000 by December 31, 2025?"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Be specific and unambiguous. Good: &ldquo;Will BTC close above $50k on
              Nov 1?&rdquo; Bad: &ldquo;Will BTC moon?&rdquo;
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <FileText className="w-4 h-4" />
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide context and resolution criteria..."
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32"
              required
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Explain what the market is about and how it will be resolved.
              Include sources if applicable.
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Tag className="w-4 h-4" />
              Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-1 transition-all ${
                    category === cat.value
                      ? 'border-primary bg-primary/10 ring-2 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* End Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Calendar className="w-4 h-4" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={minDateStr}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Calendar className="w-4 h-4" />
                End Time (UTC)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* AI Oracle Option */}
          <div className="p-4 border rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aiOracleEnabled}
                onChange={e => setAiOracleEnabled(e.target.checked)}
                className="mt-1 w-4 h-4"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-medium mb-1">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Enable AI Oracle Resolution
                </div>
                <p className="text-sm text-muted-foreground">
                  {aiOracleEnabled ? (
                    <>
                      ✅ This market will be automatically resolved by our AI
                      Oracle using GPT-4 and multiple data sources. The AI will
                      fetch real-world data and provide evidence-backed
                      resolutions.
                    </>
                  ) : (
                    <>
                      ⚠️ You will need to manually resolve this market. Make
                      sure you can provide proof of the outcome.
                    </>
                  )}
                </p>
              </div>
            </label>
          </div>

          {/* Preview */}
          {question && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Preview</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Question:</strong> {question}
                </p>
                <p>
                  <strong>Category:</strong>{' '}
                  {CATEGORIES.find(c => c.value === category)?.label}
                </p>
                <p>
                  <strong>Ends:</strong>{' '}
                  {endDate && endTime
                    ? new Date(`${endDate}T${endTime}`).toLocaleString()
                    : 'Not set'}
                </p>
                <p>
                  <strong>Resolution:</strong>{' '}
                  {aiOracleEnabled ? '🤖 AI Oracle' : '👤 Manual'}
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">Error: {error.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isConnected || isPending || isConfirming}
              className="flex-1 gap-2"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isPending ? 'Confirm in Wallet...' : 'Creating Market...'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Market
                </>
              )}
            </Button>
          </div>

          {isSuccess && (
            <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400">
                ✅ Market created successfully! Redirecting...
              </p>
            </div>
          )}

          {!isConnected && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                ⚠️ Please connect your wallet to create a market
              </p>
            </div>
          )}
        </form>
      </Card>

      {/* Tips */}
      <Card className="mt-6 p-6">
        <h3 className="font-semibold mb-3">Tips for Creating Good Markets</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            ✅ <strong>Be Specific:</strong> &ldquo;BTC above $50k&rdquo; not &ldquo;BTC moon&rdquo;
          </li>
          <li>
            ✅ <strong>Set Clear Criteria:</strong> Specify exact date, price,
            source
          </li>
          <li>
            ✅ <strong>Choose AI Oracle:</strong> For crypto/sports markets with
            clear data sources
          </li>
          <li>
            ✅ <strong>Manual Resolution:</strong> For subjective or
            hard-to-verify outcomes
          </li>
          <li>
            ✅ <strong>Reasonable Timeline:</strong> Not too short (&lt; 1 hour)
            or too long (&gt; 1 year)
          </li>
          <li>
            ✅ <strong>Popular Topics:</strong> Markets with more interest get
            more liquidity
          </li>
        </ul>
      </Card>
    </div>
  );
}
