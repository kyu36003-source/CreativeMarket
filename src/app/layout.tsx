import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/components/providers/Web3Provider';
import { Navigation } from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'PredictBNB - AI-Powered Prediction Markets on BNB Chain',
    template: '%s | PredictBNB',
  },
  description:
    'Next-generation prediction markets with AI-assisted oracles, gasless transactions, and instant resolution on BNB Chain. Built for the Seedify Hackathon.',
  keywords: [
    'Prediction Markets',
    'BNB Chain',
    'Crypto',
    'AI Oracle',
    'DeFi',
    'Web3',
    'Blockchain',
    'Seedify',
  ],
  authors: [{ name: 'PredictBNB Team' }],
  creator: 'PredictBNB',
  metadataBase: new URL('https://predictbnb.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://predictbnb.vercel.app',
    title: 'PredictBNB - AI-Powered Prediction Markets',
    description:
      'Next-generation prediction markets with AI-assisted oracles on BNB Chain',
    siteName: 'PredictBNB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PredictBNB - AI-Powered Prediction Markets',
    description:
      'Next-generation prediction markets with AI-assisted oracles on BNB Chain',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Web3Provider>
          <div className="relative flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1">{children}</main>
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
