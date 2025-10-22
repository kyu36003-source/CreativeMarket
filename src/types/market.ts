export interface Market {
  id: string;
  question: string;
  description: string;
  category: string;
  creator: string;
  endTime: number;
  totalYesAmount: bigint;
  totalNoAmount: bigint;
  resolved: boolean;
  outcome: boolean | null;
  resolvedAt: number | null;
  imageUrl?: string;
  tags?: string[];
}

export interface UserPosition {
  marketId: string;
  yesAmount: bigint;
  noAmount: bigint;
  yesShares: bigint;
  noShares: bigint;
  potentialWinnings: bigint;
}

export interface MarketOdds {
  yesOdds: number; // Percentage (0-100)
  noOdds: number; // Percentage (0-100)
  yesPrice: number; // Price per share
  noPrice: number; // Price per share
}

export interface OracleResolution {
  marketId: string;
  pending: boolean;
  confidence: number; // 0-100
  suggestedOutcome: boolean | null;
  dataSource: string;
  timestamp: number;
}

export interface MarketCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Transaction {
  hash: string;
  type: 'buy' | 'sell' | 'create' | 'resolve' | 'claim';
  marketId: string;
  amount: bigint;
  position: boolean | null;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface AIAnalysis {
  marketId: string;
  sentiment: number; // -1 to 1
  confidence: number; // 0 to 100
  factors: Array<{
    name: string;
    impact: number;
    description: string;
  }>;
  recommendation: 'buy_yes' | 'buy_no' | 'hold' | 'uncertain';
  sources: string[];
  lastUpdated: number;
}
