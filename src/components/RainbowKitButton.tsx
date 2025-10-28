'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function RainbowKitButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, status } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);

  const isConnecting = status === 'pending';

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Check if MetaMask is available
  const isMetaMaskInstalled =
    typeof window !== 'undefined' && window.ethereum?.isMetaMask;

  // Get connector display name
  const getConnectorName = (id: string) => {
    if (id.includes('metaMask') || id.includes('injected')) {
      return isMetaMaskInstalled ? 'MetaMask' : 'Browser Wallet';
    }
    if (id.includes('walletConnect')) return 'WalletConnect';
    if (id.includes('coinbase')) return 'Coinbase Wallet';
    return 'Injected Wallet';
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {/* Chain indicator */}
        {chain && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {chain.name}
            </span>
          </div>
        )}

        {/* Address display */}
        <div className="hidden sm:block px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <code className="text-sm font-mono text-blue-700">
            {formatAddress(address)}
          </code>
        </div>

        {/* Disconnect button */}
        <Button
          onClick={() => disconnect()}
          variant="outline"
          size="sm"
          className="gap-2 border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowConnectors(!showConnectors)}
        disabled={isConnecting}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2"
      >
        <Wallet className="h-5 w-5" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>

      {/* Connector dropdown */}
      {showConnectors && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowConnectors(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <p className="text-sm font-semibold text-gray-900">
                Choose Wallet
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Select your preferred wallet
              </p>
            </div>

            {connectors.length > 0 ? (
              <div className="py-1">
                {connectors.map(connector => {
                  // Force ready state for injected connector if MetaMask is installed
                  const isReady = connector.id.includes('injected')
                    ? isMetaMaskInstalled
                    : connector.ready;

                  return (
                    <button
                      key={connector.id}
                      onClick={() => {
                        connect({ connector });
                        setShowConnectors(false);
                      }}
                      disabled={!isReady || isConnecting}
                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 ${
                        !isReady || isConnecting
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      }`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Wallet className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {getConnectorName(connector.id)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isReady ? 'Ready to connect' : 'Not installed'}
                        </div>
                      </div>
                      {!isReady && (
                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded font-medium">
                          Install
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-6 text-center">
                <Wallet className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  No Wallet Detected
                </p>
                <p className="text-xs text-gray-600 mb-4">
                  Please install MetaMask or another Web3 wallet
                </p>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Wallet className="h-4 w-4" />
                  Install MetaMask
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
