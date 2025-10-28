'use client';

import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useEffect, useState } from 'react';
import { bsc, bscTestnet } from 'wagmi/chains';

/**
 * NetworkGuard Component
 *
 * Ensures users are on BNB Chain (BSC) networks only.
 * Shows warning banner if connected to unsupported networks.
 *
 * Supported Networks:
 * - BNB Mainnet (Chain ID: 56)
 * - BNB Testnet (Chain ID: 97)
 */
export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [dismissed, setDismissed] = useState(false);

  // Supported BNB Chain IDs
  const SUPPORTED_CHAINS = [bsc.id, bscTestnet.id] as const; // 56, 97
  const isSupported = SUPPORTED_CHAINS.includes(
    chainId as (typeof SUPPORTED_CHAINS)[number]
  );

  // Reset dismissed state when chain changes
  useEffect(() => {
    setDismissed(false);
  }, [chainId]);

  // Don't show warning if not connected or network is supported or dismissed
  if (!isConnected || isSupported || dismissed) {
    return <>{children}</>;
  }

  // Get chain name for display
  const getChainName = (id: number): string => {
    const chainNames: Record<number, string> = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      137: 'Polygon Mainnet',
      80001: 'Mumbai Testnet',
      42161: 'Arbitrum One',
      10: 'Optimism',
      43114: 'Avalanche',
      250: 'Fantom',
    };
    return chainNames[id] || `Chain ${id}`;
  };

  const handleSwitchNetwork = async (targetChainId: number) => {
    try {
      await switchChain({ chainId: targetChainId });
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  return (
    <>
      {/* Warning Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <p className="font-bold text-lg">Wrong Network Detected</p>
                <p className="text-sm">
                  You're connected to{' '}
                  <span className="font-semibold">{getChainName(chainId)}</span>
                  . This dApp only works on{' '}
                  <span className="font-semibold">BNB Chain</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Switch to BNB Mainnet */}
              <button
                onClick={() => handleSwitchNetwork(bsc.id)}
                className="px-4 py-2 bg-black text-yellow-500 rounded-lg font-semibold hover:bg-gray-900 transition-colors text-sm"
              >
                Switch to BNB Mainnet
              </button>

              {/* Switch to BNB Testnet */}
              <button
                onClick={() => handleSwitchNetwork(bscTestnet.id)}
                className="px-4 py-2 bg-black text-yellow-500 rounded-lg font-semibold hover:bg-gray-900 transition-colors text-sm"
              >
                Switch to BNB Testnet
              </button>

              {/* Dismiss Button */}
              <button
                onClick={() => setDismissed(true)}
                className="px-3 py-2 text-black hover:bg-yellow-600 rounded-lg transition-colors"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-2 text-xs text-black/80 border-t border-black/20 pt-2">
            💡 <strong>Don't have BNB?</strong> Get free testnet BNB from the{' '}
            <a
              href="https://www.bnbchain.org/en/testnet-faucet"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold hover:text-black"
            >
              BNB Faucet
            </a>{' '}
            or buy BNB on{' '}
            <a
              href="https://www.binance.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold hover:text-black"
            >
              Binance
            </a>
          </div>
        </div>
      </div>

      {/* Add padding to content to prevent overlap with banner */}
      <div className={!isSupported ? 'pt-28' : ''}>{children}</div>
    </>
  );
}

/**
 * useNetworkCheck Hook
 *
 * Returns whether the current network is supported
 * and provides helpers for network switching
 */
export function useNetworkCheck() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  const SUPPORTED_CHAINS = [bsc.id, bscTestnet.id] as const;
  const isSupported = SUPPORTED_CHAINS.includes(
    chainId as (typeof SUPPORTED_CHAINS)[number]
  );
  const isBNBMainnet = chainId === bsc.id;
  const isBNBTestnet = chainId === bscTestnet.id;

  const switchToBNBMainnet = async () => {
    try {
      await switchChain({ chainId: bsc.id });
      return true;
    } catch (error) {
      console.error('Failed to switch to BNB Mainnet:', error);
      return false;
    }
  };

  const switchToBNBTestnet = async () => {
    try {
      await switchChain({ chainId: bscTestnet.id });
      return true;
    } catch (error) {
      console.error('Failed to switch to BNB Testnet:', error);
      return false;
    }
  };

  return {
    isConnected,
    chainId,
    isSupported,
    isBNBMainnet,
    isBNBTestnet,
    switchToBNBMainnet,
    switchToBNBTestnet,
    isSwitching: isPending,
  };
}
