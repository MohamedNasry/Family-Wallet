import { Shield, Ban, Check, X, Clock } from 'lucide-react';

export default function ParentalControl() {
  const children = [
    { id: 1, name: 'Emma', avatar: '👧', spendingLimit: 50, spent: 35 },
    { id: 2, name: 'Alex', avatar: '👦', spendingLimit: 40, spent: 28 },
  ];

  const blockedCategories = [
    { id: 1, name: 'Games', blocked: true },
    { id: 2, name: 'Junk Food', blocked: true },
    { id: 3, name: 'Entertainment', blocked: false },
    { id: 4, name: 'Toys', blocked: false },
  ];

  const pendingApprovals = [
    { id: 1, child: 'Emma', item: 'New Video Game', amount: 45, category: 'Games', time: '5 min ago' },
    { id: 2, child: 'Alex', item: 'Candy Pack', amount: 8, category: 'Junk Food', time: '1 hour ago' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-24">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-b-3xl p-6 pt-12 mb-6 shadow-lg">
        <h1 className="text-white text-2xl mb-2 flex items-center gap-2">
          <Shield className="w-7 h-7" />
          Parental Control
        </h1>
        <p className="text-white/90">Manage children's spending</p>
      </div>

      <div className="px-6 space-y-6">
        {pendingApprovals.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-md">
            <h3 className="text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Pending Approvals
              <span className="ml-auto bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                {pendingApprovals.length}
              </span>
            </h3>
            <div className="space-y-3">
              {pendingApprovals.map(approval => (
                <div key={approval.id} className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-gray-800 font-medium">{approval.item}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {approval.child} • ${approval.amount} • {approval.category}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{approval.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-green-600 transition-all">
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button className="flex-1 bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-red-600 transition-all">
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-md">
          <h3 className="text-gray-800 mb-4">Spending Limits</h3>
          <div className="space-y-4">
            {children.map(child => {
              const percentage = (child.spent / child.spendingLimit) * 100;
              return (
                <div key={child.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{child.avatar}</div>
                    <div className="flex-1">
                      <h4 className="text-gray-800 font-medium">{child.name}</h4>
                      <p className="text-sm text-gray-600">
                        ${child.spent} / ${child.spendingLimit} this month
                      </p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{percentage.toFixed(0)}% used</span>
                      <span>${child.spendingLimit - child.spent} remaining</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <button className="text-blue-600 text-sm mt-2">Edit Limit</button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md">
          <h3 className="text-gray-800 mb-4 flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-600" />
            Blocked Categories
          </h3>
          <div className="space-y-3">
            {blockedCategories.map(category => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-800 font-medium">{category.name}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={category.blocked} className="sr-only peer" readOnly />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
            ))}
          </div>
          <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl mt-4 hover:bg-gray-200 transition-all">
            Add Category
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-200">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-gray-800 font-medium mb-1">Safety First</h4>
              <p className="text-sm text-gray-600">
                All purchases require your approval. Children can only spend within their set limits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
