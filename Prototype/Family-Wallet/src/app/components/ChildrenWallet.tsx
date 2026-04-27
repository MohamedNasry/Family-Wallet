import { Star, Award, TrendingUp, Gift, Plus, Camera } from 'lucide-react';

export default function ChildrenWallet() {
  const points = 450;
  const level = 3;
  const nextLevelPoints = 500;
  const progress = (points / nextLevelPoints) * 100;

  const badges = [
    { id: 1, name: 'Saver', icon: '💰', earned: true },
    { id: 2, name: 'Smart Shopper', icon: '🛒', earned: true },
    { id: 3, name: 'Budget Master', icon: '📊', earned: false },
    { id: 4, name: 'Math Whiz', icon: '🧮', earned: false },
  ];

  const recentSpending = [
    { id: 1, title: 'Ice Cream', amount: -5, points: -10, date: 'Today' },
    { id: 2, title: 'School Lunch', amount: -12, points: -24, date: 'Yesterday' },
    { id: 3, title: 'Book Store', amount: -18, points: -36, date: '2 days ago' },
  ];

  const rewards = [
    { id: 1, name: 'Movie Ticket', points: 100, icon: '🎬' },
    { id: 2, name: 'Ice Cream', points: 50, icon: '🍦' },
    { id: 3, name: 'Toy', points: 200, icon: '🎮' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24">
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-b-3xl p-6 pt-12 mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-2xl mb-1">Emma's Wallet</h1>
            <p className="text-white/90">Level {level} · Keep going! 🌟</p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <span className="text-3xl">👧</span>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/90 text-sm">Your Points</span>
            <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
          </div>
          <p className="text-white text-4xl mb-4">{points} pts</p>

          <div className="mb-2">
            <div className="flex justify-between text-white/90 text-xs mb-1">
              <span>Level {level}</span>
              <span>{points}/{nextLevelPoints}</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
              <div
                className="bg-yellow-300 h-full rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <p className="text-white/90 text-xs">{nextLevelPoints - points} points to Level {level + 1}!</p>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <h3 className="text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Your Badges
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {badges.map(badge => (
              <div
                key={badge.id}
                className={`p-3 rounded-xl text-center ${
                  badge.earned ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 'bg-gray-100'
                }`}
              >
                <div className={`text-3xl mb-1 ${!badge.earned && 'grayscale opacity-50'}`}>
                  {badge.icon}
                </div>
                <p className={`text-xs ${badge.earned ? 'text-purple-700' : 'text-gray-500'}`}>
                  {badge.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md">
          <h3 className="text-gray-800 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-600" />
            Available Rewards
          </h3>
          <div className="space-y-3">
            {rewards.map(reward => (
              <div key={reward.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{reward.icon}</div>
                  <div>
                    <p className="text-gray-800 font-medium">{reward.name}</p>
                    <p className="text-sm text-gray-600">{reward.points} points</p>
                  </div>
                </div>
                <button
                  disabled={points < reward.points}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    points >= reward.points
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  Claim
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Recent Activity
            </h3>
          </div>
          <div className="space-y-3">
            {recentSpending.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-gray-800 font-medium">{item.title}</p>
                  <p className="text-gray-500 text-sm">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-800 font-medium">${Math.abs(item.amount)}</p>
                  <p className="text-purple-600 text-sm">{item.points} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-24 right-6 flex gap-3">
        <button className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all">
          <Camera className="w-6 h-6" />
        </button>
        <button className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all">
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
