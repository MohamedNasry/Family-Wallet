import { useState } from 'react';
import { X, Camera, Check, ChevronDown, ShoppingBag, Zap, Car, Home, GraduationCap, Heart, MoreHorizontal } from 'lucide-react';

interface AddExpenseProps {
  onClose: () => void;
  onSubmit: () => void;
}

export default function AddExpense({ onClose, onSubmit }: AddExpenseProps) {
  const [mode, setMode] = useState<'manual' | 'scan' | 'processing' | 'preview'>('manual');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [paidBy, setPaidBy] = useState('Sarah');

  const categories = [
    { name: 'Food', icon: ShoppingBag, color: 'bg-orange-100 text-orange-600' },
    { name: 'Bills', icon: Zap, color: 'bg-blue-100 text-blue-600' },
    { name: 'Transport', icon: Car, color: 'bg-purple-100 text-purple-600' },
    { name: 'Housing', icon: Home, color: 'bg-green-100 text-green-600' },
    { name: 'Education', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Health', icon: Heart, color: 'bg-red-100 text-red-600' },
    { name: 'Other', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-600' },
  ];

  const familyMembers = ['Sarah', 'John', 'Emma', 'Alex'];

  const handleScanReceipt = () => {
    setMode('scan');
  };

  const handleCapture = () => {
    setMode('processing');
    setTimeout(() => {
      setMode('preview');
      setAmount('125.50');
      setCategory('Food');
    }, 2000);
  };

  const handleSubmit = () => {
    onSubmit();
  };

  if (mode === 'scan') {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent z-10">
            <button
              onClick={() => setMode('manual')}
              className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-96 border-4 border-white/50 rounded-2xl" />
          </div>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
            <button
              onClick={handleCapture}
              className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center"
            >
              <Camera className="w-8 h-8 text-gray-800" />
            </button>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
            <p className="text-white text-lg mb-2">Position receipt in frame</p>
            <p className="text-white/70">Make sure all details are visible</p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'processing') {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h3 className="text-xl text-gray-800 mb-2">Processing Receipt...</h3>
          <p className="text-gray-600">Extracting information</p>
        </div>
      </div>
    );
  }

  if (mode === 'preview') {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto pb-6">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <button onClick={() => setMode('manual')} className="text-gray-600">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg text-gray-800">Review & Confirm</h2>
          <div className="w-6" />
        </div>

        <div className="p-6">
          <div className="bg-green-50 rounded-2xl p-4 mb-6 text-center">
            <Check className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-green-600">Receipt scanned successfully!</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <h3 className="text-gray-800 mb-4">Extracted Information</h3>

            <div className="space-y-4">
              <div>
                <label className="text-gray-600 text-sm mb-2 block">Merchant</label>
                <input
                  type="text"
                  value="Fresh Market"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
                />
              </div>

              <div>
                <label className="text-gray-600 text-sm mb-2 block">Amount</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 text-2xl"
                />
              </div>

              <div>
                <label className="text-gray-600 text-sm mb-2 block">Date</label>
                <input
                  type="text"
                  value="April 25, 2026"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-medium hover:from-green-600 hover:to-green-700 transition-all"
          >
            Confirm Expense
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto pb-6">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
        <button onClick={onClose} className="text-gray-600">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg text-gray-800">Add Expense</h2>
        <div className="w-6" />
      </div>

      <div className="p-6">
        <div className="mb-8">
          <label className="text-gray-600 text-sm mb-3 block">Amount</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl text-gray-400">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-50 rounded-2xl pl-16 pr-6 py-6 text-4xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="text-gray-600 text-sm mb-3 block">Category</label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`p-4 rounded-2xl transition-all ${
                    category === cat.name
                      ? 'bg-green-100 ring-2 ring-green-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full ${cat.color} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-gray-700 text-center">{cat.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-8">
          <label className="text-gray-600 text-sm mb-3 block">Paid By</label>
          <div className="relative">
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full bg-gray-50 rounded-2xl px-6 py-4 text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {familyMembers.map(member => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={handleScanReceipt}
          className="w-full bg-blue-500 text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-blue-600 transition-all mb-4"
        >
          <Camera className="w-5 h-5" />
          Scan Receipt
        </button>

        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-medium hover:from-green-600 hover:to-green-700 transition-all"
        >
          Add Expense
        </button>
      </div>
    </div>
  );
}
