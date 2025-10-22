// ============================================================================
// Copy Trading Homepage - Clean & Modern
// ============================================================================

'use client';

import { Button } from '@/components/ui/button';
import { Leaderboard } from '@/components/copy-trading/Leaderboard';
import { useTopTraders } from '@/hooks/use-copy-trading';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

export default function CopyTradingHome() {
  const { data: topTraders, isLoading } = useTopTraders({ limit: 5 });

  // Type-safe array handling
  const tradersList = (topTraders || []) as any[];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Stop Guessing.
              <br />
              Start Copying.
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Follow proven traders. Auto-copy their predictions. Earn passive
              income.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <WalletConnect />
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 backdrop-blur text-white border-white/30 hover:bg-white/20"
                asChild
              >
                <a href="#leaderboard">View Top Traders</a>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <DollarSign className="h-8 w-8 mb-2 mx-auto" />
                <div className="text-3xl font-bold">$2.4M+</div>
                <div className="text-blue-100 text-sm">Total Volume</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Users className="h-8 w-8 mb-2 mx-auto" />
                <div className="text-3xl font-bold">15K+</div>
                <div className="text-blue-100 text-sm">Active Traders</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <TrendingUp className="h-8 w-8 mb-2 mx-auto" />
                <div className="text-3xl font-bold">85%</div>
                <div className="text-blue-100 text-sm">Avg Win Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Start earning in 3 simple steps. No trading experience required.
          </p>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-semibold mb-3">Choose a Trader</h3>
              <p className="text-gray-600 leading-relaxed">
                Browse top performers and check their stats, win rate, and
                profit history. Find the perfect match for your strategy.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-semibold mb-3">Click Follow</h3>
              <p className="text-gray-600 leading-relaxed">
                Set your copy amount and preferences in seconds. Your account
                will automatically mirror their predictions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-semibold mb-3">Earn Passively</h3>
              <p className="text-gray-600 leading-relaxed">
                Sit back and watch your profits grow. All predictions are
                auto-copied to your account 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Traders */}
      <section id="leaderboard" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-3">
                  Top Traders
                </h2>
                <p className="text-gray-600 text-lg">
                  Follow the best performers and start copying their strategies
                </p>
              </div>

              <Button
                variant="outline"
                size="lg"
                className="mt-4 md:mt-0"
                asChild
              >
                <Link href="/leaderboard" passHref>
                  View All Traders
                </Link>
              </Button>
            </div>

            <Leaderboard
              traders={tradersList}
              loading={isLoading}
              onFollowTrader={id => console.log('Follow trader:', id)}
            />

            {!isLoading && tradersList.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Loading top traders...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            What Traders Say
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Join thousands of users already earning passive income
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                rating: 5,
                text: "I made $2,400 this month just copying @CryptoWhale's trades. Best decision ever!",
                author: 'Sarah M.',
                profit: '+$2,400',
              },
              {
                rating: 5,
                text: '85% win rate by following the pros. No more guessing, just pure profits!',
                author: 'Mike T.',
                profit: '+$1,850',
              },
              {
                rating: 5,
                text: 'Set it and forget it. Passive income while I sleep. Game changer!',
                author: 'Alex R.',
                profit: '+$3,200',
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <svg
                      key={j}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                  "{testimonial.text}"
                </p>
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="font-semibold text-gray-900">
                    {testimonial.author}
                  </div>
                  <div className="text-green-600 font-bold">
                    {testimonial.profit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join 15,000+ traders already profiting from copy trading. No
            experience needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <WalletConnect />
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100"
              asChild
            >
              <Link href="/leaderboard" passHref>
                Browse Traders
              </Link>
            </Button>
          </div>

          <div className="mt-12 text-sm text-blue-100">
            🔒 Secured by BNB Chain • ⚡ No Gas Fees • 🤖 AI-Powered Oracles
          </div>
        </div>
      </section>
    </main>
  );
}
