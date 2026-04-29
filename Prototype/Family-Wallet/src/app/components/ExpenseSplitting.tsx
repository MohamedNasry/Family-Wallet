import { Users, DollarSign, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface ExpenseSplittingProps {
  onClose: () => void;
}

export default function ExpenseSplitting({ onClose }: ExpenseSplittingProps) {
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const totalAmount = 125.50;
  const members = [
    { id: 1, name: 'Sarah', avatar: 'SJ', amount: 31.38 },
    { id: 2, name: 'John', avatar: 'JJ', amount: 31.38 },
    { id: 3, name: 'Emma', avatar: 'EJ', amount: 31.38 },
    { id: 4, name: 'Alex', avatar: 'AJ', amount: 31.36 },
  ];

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto pb-6">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <h2 className="text-lg text-gray-800 text-center">Split Expense</h2>
      </div>

      <div className="p-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6 text-center">
          <p className="text-gray-600 mb-2">Total Amount</p>
          <h2 className="text-4xl text-gray-800">${totalAmount.toFixed(2)}</h2>
        </div>

        <div className="mb-6">
          <h3 className="text-gray-800 mb-3">Split Method</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSplitType('equal')}
              className={`p-4 rounded-xl border-2 transition-all ${
                splitType === 'equal'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Users className={`w-6 h-6 mx-auto mb-2 ${splitType === 'equal' ? 'text-green-600' : 'text-gray-500'}`} />
              <p className={`text-sm ${splitType === 'equal' ? 'text-green-600 font-medium' : 'text-gray-700'}`}>
                Equal Split
              </p>
            </button>
            <button
              onClick={() => setSplitType('custom')}
              className={`p-4 rounded-xl border-2 transition-all ${
                splitType === 'custom'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <DollarSign className={`w-6 h-6 mx-auto mb-2 ${splitType === 'custom' ? 'text-green-600' : 'text-gray-500'}`} />
              <p className={`text-sm ${splitType === 'custom' ? 'text-green-600 font-medium' : 'text-gray-700'}`}>
                Custom Split
              </p>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-gray-800 mb-3">Split Breakdown</h3>
          <div className="space-y-3">
            {members.map(member => (
              <div key={member.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">{member.avatar}</span>
                    </div>
                    <span className="text-gray-800 font-medium">{member.name}</span>
                  </div>
                  {splitType === 'equal' ? (
                    <span className="text-lg text-gray-800 font-medium">${member.amount.toFixed(2)}</span>
                  ) : (
                    <input
                      type="number"
                      defaultValue={member.amount.toFixed(2)}
                      className="w-24 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 text-right"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-800 font-medium mb-1">Payment Tracking</p>
              <p className="text-sm text-gray-600">
                Each member will be notified of their share. You can track who has paid in the Payments section.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-medium hover:from-green-600 hover:to-green-700 transition-all"
        >
          Confirm Split
        </button>
      </div>
    </div>
  );
}
