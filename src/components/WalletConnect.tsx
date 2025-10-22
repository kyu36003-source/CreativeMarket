'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConnectors, setShowConnectors] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getConnectorName = (connectorId: string) => {
    switch (connectorId) {
      case 'injected':
        return 'MetaMask';
      case 'walletConnect':
        return 'WalletConnect';
      default:
        return connectorId;
    }
  };

  if (isConnected && address) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">{formatAddress(address)}</span>
          <span className="sm:hidden">{address.slice(0, 6)}...</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg p-4 z-50">
            <div className="mb-2 text-sm text-gray-600">Connected to</div>
            <div className="font-mono text-sm mb-3 break-all">{address}</div>
            {chain && (
              <div className="mb-3 text-sm">
                <span className="text-gray-600">Network: </span>
                <span className="font-semibold">{chain.name}</span>
              </div>
            )}
            <Button
              variant="destructive"
              size="sm"
              className="w-full gap-2"
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowConnectors(!showConnectors)}
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
      
      {showConnectors && (
        <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg overflow-hidden z-50">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => {
                connect({ connector });
                setShowConnectors(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b last:border-b-0"
            >
              <Wallet className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium">{getConnectorName(connector.id)}</div>
                <div className="text-xs text-gray-500">
                  {connector.id === 'injected' ? 'Browser Wallet' : 'Mobile & Desktop'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
