import { Plus, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface HomeDashboardProps {
  onAddExpense: () => void;
}

export default function HomeDashboard({ onAddExpense }: HomeDashboardProps) {
  const totalBalance = 4250.50;
  const monthlyBudget = 5000;
  const totalExpenses = 749.50;
  const budgetUsed = (totalExpenses / monthlyBudget) * 100;

  const recentTransactions = [
    { id: 1, title: 'Grocery Shopping', amount: -125.50, category: 'Food', paidBy: 'Sarah', date: '2 hours ago', pending: false },
    { id: 2, title: 'Electric Bill', amount: -89.00, category: 'Bills', paidBy: 'John', date: '1 day ago', pending: false },
    { id: 3, title: 'Family Dinner', amount: -165.00, category: 'Food', paidBy: 'Sarah', date: '2 days ago', pending: true },
    { id: 4, title: 'Uber Ride', amount: -35.00, category: 'Transport', paidBy: 'John', date: '3 days ago', pending: false },
    { id: 5, title: 'School Supplies', amount: -85.00, category: 'Education', paidBy: 'Sarah', date: '4 days ago', pending: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-24">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-b-3xl p-6 pt-12 mb-6 shadow-lg">
        <h1 className="text-white text-2xl mb-6">Family Wallet</h1>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-4">
          <p className="text-white/90 text-sm mb-2">Total Balance</p>
          <h2 className="text-white text-4xl">${totalBalance.toFixed(2)}</h2>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/90 text-sm">Monthly Budget</span>
            <span className="text-white">{budgetUsed.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all"
              style={{ width: `${budgetUsed}%` }}
            />
          </div>
          <p className="text-white/90 text-sm mt-2">${totalExpenses.toFixed(2)} of ${monthlyBudget.toFixed(2)}</p>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Expenses</p>
            <p className="text-2xl text-gray-800">${totalExpenses.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Remaining</p>
            <p className="text-2xl text-gray-800">${(monthlyBudget - totalExpenses).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-800 text-lg">Recent Transactions</h3>
          <button className="text-green-600 text-sm">See All</button>
        </div>

        <div className="space-y-3">
          {recentTransactions.map(transaction => (
            <div key={transaction.id} className="bg-white rounded-2xl p-4 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  transaction.pending ? 'bg-orange-100' : 'bg-blue-100'
                }`}>
                  {transaction.pending ? (
                    <Clock className="w-6 h-6 text-orange-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="text-gray-800 font-medium">{transaction.title}</p>
                  <p className="text-gray-500 text-sm">{transaction.paidBy} • {transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-800 font-medium">${Math.abs(transaction.amount).toFixed(2)}</p>
                <p className={`text-xs ${transaction.pending ? 'text-orange-600' : 'text-gray-500'}`}>
                  {transaction.pending ? 'Pending' : transaction.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onAddExpense}
        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:from-green-600 hover:to-green-700 transition-all"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
