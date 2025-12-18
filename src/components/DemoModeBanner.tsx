/**
 * Demo Mode Banner
 * Displays a notice when static data is being used (production demo mode)
 */

'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles } from 'lucide-react';

export function DemoModeBanner() {
  const [isStaticMode, setIsStaticMode] = useState(false);

  useEffect(() => {
    // Check if we're using static data
    const useStatic =
      process.env.NEXT_PUBLIC_USE_STATIC_DATA === 'true' ||
      typeof window !== 'undefined' && !window.ethereum;
    setIsStaticMode(useStatic);
  }, []);

  if (!isStaticMode) {
    return null;
  }

  return (
    <Alert className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <Sparkles className="h-5 w-5 text-purple-600" />
      <AlertDescription className="ml-2">
        <div className="flex items-start gap-2">
          <div>
            <p className="font-semibold text-purple-900 mb-1">
              🎯 Production Demo Mode
            </p>
            <p className="text-sm text-gray-700">
              You&apos;re viewing live prediction markets with real AI-powered resolution. 
              This demo showcases our platform&apos;s capabilities with curated markets from the Creative Economy.
              {' '}
              <strong className="text-purple-700">
                Connect your wallet to place real bets on BSC Testnet.
              </strong>
            </p>
            <p className="text-xs text-gray-600 mt-2">
              💎 Building for Q1 2026 mainnet launch • Target: 50+ users, $5K+ TVL, 10+ active markets
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
