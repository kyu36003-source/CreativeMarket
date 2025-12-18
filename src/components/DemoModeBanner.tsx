/**
 * Demo Mode Banner
 * Displays a notice when static data is being used (production demo mode)
 */

'use client';

import { useEffect, useState } from 'react';
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
    <div className="mb-4 px-4 py-2 bg-gray-50 border-l-4 border-blue-400 text-xs text-gray-600">
      <p className="flex items-center gap-2">
        <Sparkles className="h-3 w-3 text-blue-500" />
        <span>
          <strong>Demo environment:</strong> Market data reflects real-world DeFi and creative economy trends. 
          Connect wallet to interact on BSC Testnet.
        </span>
      </p>
    </div>
  );
}
