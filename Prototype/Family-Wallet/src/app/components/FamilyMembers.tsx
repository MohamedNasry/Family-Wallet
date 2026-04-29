import { Crown, TrendingUp, TrendingDown } from 'lucide-react';

export default function FamilyMembers() {
  const members = [
    { id: 1, name: 'Sarah Johnson', contribution: 2450.00, balance: 150.00, type: 'owed', active: true, avatar: 'SJ' },
    { id: 2, name: 'John Johnson', contribution: 1800.00, balance: -75.00, type: 'owes', active: false, avatar: 'JJ' },
    { id: 3, name: 'Emma Johnson', contribution: 450.00, balance: 0, type: 'settled', active: false, avatar: 'EJ' },
    { id: 4, name: 'Alex Johnson', contribution: 320.00, balance: -45.00, type: 'owes', active: false, avatar: 'AJ' },
  ];

  const totalContribution = members.reduce((sum, m) => sum + m.contribution, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-24">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-b-3xl p-6 pt-12 mb-6 shadow-lg">
        <h1 className="text-white text-2xl mb-2">Family Members</h1>
        <p className="text-white/90">4 active members</p>
      </div>

      <div className="px-6">
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h3 className="text-gray-800 mb-2">Total Contribution</h3>
          <p className="text-3xl text-gray-800">${totalContribution.toFixed(2)}</p>
        </div>

        <div className="space-y-4">
          {members.map((member, index) => (
            <div key={member.id} className="bg-white rounded-2xl p-5 shadow-md">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">{member.avatar}</span>
                  </div>
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-gray-800 font-medium">{member.name}</h3>
                    {index === 0 && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        Top Contributor
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">Total: ${member.contribution.toFixed(2)}</p>
                </div>

                <div className="text-right">
                  {member.type === 'owed' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-medium">${member.balance.toFixed(2)}</span>
                    </div>
                  )}
                  {member.type === 'owes' && (
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="font-medium">${Math.abs(member.balance).toFixed(2)}</span>
                    </div>
                  )}
                  {member.type === 'settled' && (
                    <span className="text-gray-500 text-sm">Settled</span>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {member.type === 'owed' ? 'is owed' : member.type === 'owes' ? 'owes' : ''}
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-gray-50 rounded-xl p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Contribution</span>
                  <span className="text-gray-800">
                    {((member.contribution / totalContribution) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full"
                    style={{ width: `${(member.contribution / totalContribution) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-medium mt-6 hover:from-green-600 hover:to-green-700 transition-all">
          Add Family Member
        </button>
      </div>
    </div>
  );
}
