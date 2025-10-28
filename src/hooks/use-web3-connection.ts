'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReconnect, useDisconnect } from 'wagmi';

/**
 * Hook to monitor and handle Web3 connection state
 * Provides automatic reconnection logic and error recovery
 */
export function useWeb3Connection() {
  const { isConnected, isConnecting, isDisconnected, address } = useAccount();
  const { reconnect } = useReconnect();
  const { disconnect } = useDisconnect();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    // Handle connection interruptions
    const handleOnline = () => {
      console.log('Network back online, attempting to reconnect...');
      setConnectionError(null);
      if (isDisconnected && retryCount < 3) {
        reconnect();
        setRetryCount(prev => prev + 1);
      }
    };

    const handleOffline = () => {
      console.log('Network offline');
      setConnectionError(
        'Network connection lost. Please check your internet connection.'
      );
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isDisconnected, reconnect, retryCount]);

  // Reset retry count on successful connection
  useEffect(() => {
    if (isConnected) {
      setRetryCount(0);
      setConnectionError(null);
    }
  }, [isConnected]);

  const handleManualReconnect = async () => {
    setConnectionError(null);
    setRetryCount(0);
    setIsReconnecting(true);
    try {
      await reconnect();
    } catch (error) {
      console.error('Reconnection failed:', error);
      setConnectionError('Failed to reconnect. Please try again.');
    } finally {
      setIsReconnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnectionError(null);
    setRetryCount(0);
    disconnect();
  };

  return {
    isConnected,
    isConnecting,
    isDisconnected,
    isReconnecting,
    address,
    connectionError,
    retryCount,
    reconnect: handleManualReconnect,
    disconnect: handleDisconnect,
  };
}
