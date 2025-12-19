/**
 * Modern iOS-Style Market Creation Wizard
 * Clean, simple, and fun market creation experience
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useCreateMarket, useReputationScore, useMinReputationToCreate } from '@/hooks/useContracts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';

// Category definitions with templates
const CATEGORIES = [
  {
    id: 'crypto',
    name: 'Crypto',
    icon: '₿',
    color: 'from-orange-500 to-yellow-500',
    templates: [
      {
        question: 'Will [TOKEN] reach $[PRICE] by [DATE]?',
        description: 'Price prediction for [TOKEN]. Will it hit the target price within the timeframe?',
        example: { token: 'BNB', price: '1000', date: 'end of 2025' }
      },
      {
        question: 'Will [TOKEN] outperform [TOKEN2] in [TIMEFRAME]?',
        description: 'Comparative performance between two tokens over specified period.',
        example: { token: 'BNB', token2: 'ETH', timeframe: 'Q1 2026' }
      },
      {
        question: 'Will [TOKEN] stay above $[PRICE] for [DAYS] consecutive days?',
        description: 'Price stability prediction for sustained performance.',
        example: { token: 'BTC', price: '100000', days: '30' }
      }
    ]
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    color: 'from-green-500 to-emerald-500',
    templates: [
      {
        question: 'Will [TEAM] win [EVENT]?',
        description: 'Predict the winner of a major sporting event.',
        example: { team: 'Team A', event: 'Championship 2026' }
      },
      {
        question: 'Will [PLAYER] score over [NUMBER] [METRIC] in [EVENT]?',
        description: 'Player performance prediction for specific statistics.',
        example: { player: 'Player X', number: '30', metric: 'points', event: 'Finals' }
      },
      {
        question: 'Will [TEAM] make it to [STAGE]?',
        description: 'Tournament progression prediction.',
        example: { team: 'Team B', stage: 'semifinals' }
      }
    ]
  },
  {
    id: 'politics',
    name: 'Politics',
    icon: '🏛️',
    color: 'from-blue-500 to-indigo-500',
    templates: [
      {
        question: 'Will [POLICY] be passed by [DATE]?',
        description: 'Legislative outcome prediction.',
        example: { policy: 'New regulation', date: 'end of 2026' }
      },
      {
        question: 'Will [CANDIDATE] win [ELECTION]?',
        description: 'Election result prediction.',
        example: { candidate: 'Candidate A', election: '2026 election' }
      }
    ]
  },
  {
    id: 'weather',
    name: 'Weather',
    icon: '🌤️',
    color: 'from-cyan-500 to-blue-500',
    templates: [
      {
        question: 'Will temperature exceed [TEMP]°F in [CITY] on [DATE]?',
        description: 'Temperature prediction for specific location and date.',
        example: { temp: '100', city: 'Miami', date: 'July 4, 2026' }
      },
      {
        question: 'Will [CITY] have more than [NUMBER] rainy days in [MONTH]?',
        description: 'Precipitation frequency prediction.',
        example: { city: 'Seattle', number: '20', month: 'December' }
      }
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: 'from-pink-500 to-rose-500',
    templates: [
      {
        question: 'Will [MOVIE] gross over $[AMOUNT] million worldwide?',
        description: 'Box office performance prediction.',
        example: { movie: 'Upcoming Blockbuster', amount: '1000' }
      },
      {
        question: 'Will [ARTIST] release [TYPE] by [DATE]?',
        description: 'Entertainment release prediction.',
        example: { artist: 'Popular Artist', type: 'new album', date: 'end of 2026' }
      }
    ]
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: '💻',
    color: 'from-purple-500 to-violet-500',
    templates: [
      {
        question: 'Will [COMPANY] announce [PRODUCT] by [DATE]?',
        description: 'Tech product launch prediction.',
        example: { company: 'Tech Corp', product: 'new device', date: 'Q2 2026' }
      },
      {
        question: 'Will [TECH] reach [MILESTONE] by [DATE]?',
        description: 'Technology milestone prediction.',
        example: { tech: 'AI models', milestone: '1 trillion parameters', date: '2027' }
      }
    ]
  }
];

export default function CreateMarketWizard() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { createMarket, isPending, isConfirming } = useCreateMarket();
  
  // Reputation
  const { data: reputationScore } = useReputationScore(address);
  const { data: minReputationRequired } = useMinReputationToCreate();
  const currentReputation = reputationScore ? Number(reputationScore) : 0;
  const minReputation = minReputationRequired ? Number(minReputationRequired) : 50;
  const hasEnoughReputation = currentReputation >= minReputation;

  // Wizard state
  const [step, setStep] = useState(1); // 1: Category, 2: Template, 3: Details, 4: Review
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[0] | null>(null);
  const [_selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [_customMode, setCustomMode] = useState(false);
  
  // Form data
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('12:00');
  const [aiOracleEnabled, setAiOracleEnabled] = useState(true);

  const handleCategorySelect = (category: typeof CATEGORIES[0]) => {
    setSelectedCategory(category);
    setStep(2);
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setQuestion(template.question);
    setDescription(template.description);
    setStep(3);
  };

  const handleCustom = () => {
    setCustomMode(true);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!hasEnoughReputation) return;
    
    try {
      const endDateTime = new Date(`${endDate}T${endTime}`);
      
      await createMarket({
        question,
        description,
        category: selectedCategory?.id || 'other',
        endTime: endDateTime,
        aiOracleEnabled,
      });

      router.push('/markets');
    } catch (error) {
      console.error('Failed to create market:', error);
    }
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Create Your Market</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect your wallet to start creating prediction markets
          </p>
        </Card>
      </div>
    );
  }

  // Insufficient reputation state
  if (!hasEnoughReputation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-center">Build Your Reputation</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            You need {minReputation} reputation to create markets
          </p>
          
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Your Progress</span>
                <span className="font-bold text-indigo-600">{currentReputation}/{minReputation}</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${Math.min((currentReputation / minReputation) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-xl">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                How to Earn Reputation:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Place predictions: <span className="font-bold text-indigo-600">+10 points</span></span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>Win predictions: <span className="font-bold text-purple-600">+20 bonus</span></span>
                </li>
              </ul>
            </div>
          </div>
          
          <Button
            onClick={() => router.push('/markets')}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-lg h-12 text-base font-semibold"
          >
            Browse Markets
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step ? 'w-8 bg-gradient-to-r from-indigo-500 to-purple-500' :
                    s < step ? 'w-2 bg-indigo-400' : 'w-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <div className="w-20" /> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Category Selection */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Choose a Category
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                What type of prediction do you want to create?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {CATEGORIES.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className="group relative p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-transparent hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl shadow-lg`}>
                      {category.icon}
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {category.templates.length} templates
                      </p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Template Selection */}
        {step === 2 && selectedCategory && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedCategory.color} flex items-center justify-center text-4xl mx-auto mb-4 shadow-xl`}>
                {selectedCategory.icon}
              </div>
              <h1 className="text-4xl font-bold mb-3">{selectedCategory.name}</h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Choose a template or start from scratch
              </p>
            </div>

            <div className="space-y-3">
              {selectedCategory.templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full group p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-600 transition-colors">
                        {template.question}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Zap className="w-3 h-3" />
                        <span>Quick setup with AI</span>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </button>
              ))}

              <button
                onClick={handleCustom}
                className="w-full p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-300 hover:text-indigo-600">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">Create Custom Market</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-3">Market Details</h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Fill in the specifics for your prediction
              </p>
            </div>

            <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-xl">
              <div className="space-y-6">
                {/* Question */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Question <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What will happen?"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide more details about this prediction..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-colors resize-none bg-white dark:bg-gray-700"
                  />
                </div>

                {/* Deadline */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>

                {/* AI Oracle */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiOracleEnabled}
                      onChange={(e) => setAiOracleEnabled(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-indigo-500 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        AI Oracle Resolution
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Let AI automatically resolve this market (recommended)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(4)}
                disabled={!question || !endDate}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-lg h-14 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-3">Review Your Market</h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Everything looks good? Let&apos;s create it!
              </p>
            </div>

            <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-xl">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Category</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedCategory?.icon}</span>
                    <p className="text-xl font-semibold">{selectedCategory?.name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Question</p>
                  <p className="text-xl font-semibold">{question}</p>
                </div>

                {description && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-gray-700 dark:text-gray-300">{description}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ends On</p>
                    <p className="font-semibold">
                      {new Date(`${endDate}T${endTime}`).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Resolution</p>
                    <p className="font-semibold flex items-center gap-2">
                      {aiOracleEnabled ? (
                        <>
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          AI Oracle
                        </>
                      ) : (
                        'Manual'
                      )}
                    </p>
                  </div>
                </div>

                {!aiOracleEnabled && (
                  <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <p className="font-semibold mb-1">Manual Resolution Required</p>
                        <p>You&apos;ll need to manually resolve this market after it ends.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Button
              onClick={handleSubmit}
              disabled={isPending || isConfirming}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg h-14 text-lg font-semibold"
            >
              {isPending || isConfirming ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isPending ? 'Confirm in Wallet...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Create Market
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              By creating this market, you agree to our terms of service
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
