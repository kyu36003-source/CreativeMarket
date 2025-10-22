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

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          onClick={() => connect({ connector })}
          className="gap-2"
        >
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      ))}
    </div>
  );
}
