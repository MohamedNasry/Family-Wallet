import { useState } from 'react';
import { Users, ArrowRight, Copy, Share2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<'welcome' | 'setup' | 'code'>('welcome');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [familyCode] = useState('FAM-' + Math.random().toString(36).substr(2, 6).toUpperCase());

  const currencies = ['USD', 'EUR', 'SAR', 'AED', 'EGP'];

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl mb-4 text-gray-800">Family Wallet</h1>
            <p className="text-gray-600 mb-8">Manage shared expenses together with your family, easily and transparently</p>

            <div className="space-y-4">
              <button
                onClick={() => setStep('setup')}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition-all"
              >
                Create Family Wallet
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onComplete}
                className="w-full bg-white border-2 border-green-500 text-green-600 py-4 rounded-2xl font-medium hover:bg-green-50 transition-all"
              >
                Join via Code
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl mb-6 text-gray-800 text-center">Select Your Currency</h2>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {currencies.map(currency => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`py-4 rounded-xl font-medium transition-all ${
                    selectedCurrency === currency
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('code')}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition-all"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl mb-2 text-gray-800">Your Family Code</h2>
            <p className="text-gray-600">Share this code with family members</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6">
            <p className="text-4xl text-center tracking-wider mb-4 text-gray-800">{familyCode}</p>

            <div className="flex gap-3">
              <button className="flex-1 bg-white py-3 rounded-xl flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 transition-all">
                <Copy className="w-5 h-5" />
                Copy
              </button>
              <button className="flex-1 bg-white py-3 rounded-xl flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 transition-all">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-medium hover:from-green-600 hover:to-green-700 transition-all"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
