import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function PaymentsTracking() {
  const expenses = [
    {
      id: 1,
      title: 'Grocery Shopping',
      amount: 125.50,
      paidBy: 'Sarah',
      date: 'Apr 23, 2026',
      status: 'partial',
      payments: [
        { member: 'Sarah', amount: 31.38, status: 'paid' },
        { member: 'John', amount: 31.38, status: 'paid' },
        { member: 'Emma', amount: 31.38, status: 'pending' },
        { member: 'Alex', amount: 31.36, status: 'pending' },
      ],
    },
    {
      id: 2,
      title: 'Electric Bill',
      amount: 89.00,
      paidBy: 'John',
      date: 'Apr 20, 2026',
      status: 'paid',
      payments: [
        { member: 'Sarah', amount: 22.25, status: 'paid' },
        { member: 'John', amount: 22.25, status: 'paid' },
        { member: 'Emma', amount: 22.25, status: 'paid' },
        { member: 'Alex', amount: 22.25, status: 'paid' },
      ],
    },
    {
      id: 3,
      title: 'Family Dinner',
      amount: 165.00,
      paidBy: 'Sarah',
      date: 'Apr 18, 2026',
      status: 'overdue',
      payments: [
        { member: 'Sarah', amount: 41.25, status: 'paid' },
        { member: 'John', amount: 41.25, status: 'paid' },
        { member: 'Emma', amount: 41.25, status: 'overdue' },
        { member: 'Alex', amount: 41.25, status: 'overdue' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-24">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-b-3xl p-6 pt-12 mb-6 shadow-lg">
        <h1 className="text-white text-2xl mb-2">Payment Tracking</h1>
        <p className="text-white/90">Track who owes what</p>
      </div>

      <div className="px-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl text-gray-800 mb-1">5</p>
            <p className="text-xs text-gray-600">Paid</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl text-gray-800 mb-1">2</p>
            <p className="text-xs text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl text-gray-800 mb-1">2</p>
            <p className="text-xs text-gray-600">Overdue</p>
          </div>
        </div>

        <div className="space-y-4">
          {expenses.map(expense => (
            <div key={expense.id} className="bg-white rounded-2xl p-5 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-800 font-medium mb-1">{expense.title}</h3>
                  <p className="text-sm text-gray-600">Paid by {expense.paidBy} • {expense.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg text-gray-800 font-medium">${expense.amount.toFixed(2)}</p>
                  {expense.status === 'paid' && (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full mt-1">
                      All Paid
                    </span>
                  )}
                  {expense.status === 'partial' && (
                    <span className="inline-block px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full mt-1">
                      Partial
                    </span>
                  )}
                  {expense.status === 'overdue' && (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full mt-1">
                      Overdue
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {expense.payments.map((payment, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        payment.status === 'paid' ? 'bg-green-100' :
                        payment.status === 'overdue' ? 'bg-red-100' : 'bg-orange-100'
                      }`}>
                        {payment.status === 'paid' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : payment.status === 'overdue' ? (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <span className="text-gray-800 text-sm font-medium">{payment.member}</span>
                    </div>
                    <span className="text-gray-800 text-sm">${payment.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {expense.status !== 'paid' && (
                <button className="w-full bg-blue-500 text-white py-3 rounded-xl mt-3 hover:bg-blue-600 transition-all">
                  Send Reminder
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
