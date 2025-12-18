'use client';

import { RainbowKitButton } from '@/components/RainbowKitButton';
import { useAccount } from 'wagmi';

export default function TestWalletPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Wallet Connection Test</h1>

        <div className="space-y-6">
          {/* RainbowKit Button */}
          <div className="p-4 border-2 border-purple-200 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">
              RainbowKit Connect Button:
            </h2>
            <RainbowKitButton />
          </div>

          {/* Connection Status */}
          <div className="p-4 border-2 border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Connection Status:</h2>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Connected:</span>{' '}
                <span
                  className={isConnected ? 'text-green-600' : 'text-red-600'}
                >
                  {isConnected ? '✅ Yes' : '❌ No'}
                </span>
              </p>
              {address && (
                <p className="text-sm">
                  <span className="font-medium">Address:</span>{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {address}
                  </code>
                </p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">📝 Instructions:</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Click the &ldquo;Connect Wallet&rdquo; button above</li>
              <li>Select your wallet (MetaMask, WalletConnect, etc.)</li>
              <li>Approve the connection</li>
              <li>Check if the connection status shows &ldquo;Connected: Yes&rdquo;</li>
            </ol>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 pt-6 border-t">
          <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
