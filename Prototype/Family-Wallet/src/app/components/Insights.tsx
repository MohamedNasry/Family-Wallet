import { Bell, AlertTriangle, TrendingUp, Lightbulb, Target, Gift, CheckCircle } from 'lucide-react';

export default function Insights() {
  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'Budget Alert',
      message: 'You\'ve used 85% of your monthly budget. Consider reducing spending in the Food category.',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      time: '10 min ago',
    },
    {
      id: 2,
      type: 'success',
      title: 'Great Progress!',
      message: 'Your family saved $350 this month compared to last month. Keep it up!',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100',
      time: '2 hours ago',
    },
    {
      id: 3,
      type: 'tip',
      title: 'Spending Insight',
      message: 'You spend 40% more on delivery than home cooking. Consider meal planning to save more.',
      icon: Lightbulb,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      time: '1 day ago',
    },
    {
      id: 4,
      type: 'goal',
      title: 'Goal Achievement',
      message: 'You\'re on track to save $500 this month! Just 3 more days to go.',
      icon: Target,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      time: '2 days ago',
    },
    {
      id: 5,
      type: 'reward',
      title: 'Reward Unlocked',
      message: 'Emma earned a new badge "Smart Shopper" for making budget-friendly choices!',
      icon: Gift,
      color: 'text-pink-600',
      bg: 'bg-pink-100',
      time: '3 days ago',
    },
  ];

  const quickActions = [
    { id: 1, title: 'Review Budget', icon: Target, color: 'from-green-500 to-green-600' },
    { id: 2, title: 'See Trends', icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
    { id: 3, title: 'Family Goals', icon: CheckCircle, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-24">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-b-3xl p-6 pt-12 mb-6 shadow-lg">
        <h1 className="text-white text-2xl mb-2 flex items-center gap-2">
          <Bell className="w-7 h-7" />
          Insights & Alerts
        </h1>
        <p className="text-white/90">Smart suggestions for your family</p>
      </div>

      <div className="px-6">
        <div className="mb-6">
          <h3 className="text-gray-800 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  className={`bg-gradient-to-r ${action.color} text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-xs">{action.title}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-800">All Notifications</h3>
            <button className="text-green-600 text-sm">Mark all read</button>
          </div>

          <div className="space-y-3">
            {notifications.map(notification => {
              const Icon = notification.icon;
              return (
                <div key={notification.id} className="bg-white rounded-2xl p-5 shadow-md">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 ${notification.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${notification.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-gray-800 font-medium">{notification.title}</h4>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{notification.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-medium mb-2">AI-Powered Insights</h4>
              <p className="text-sm text-white/90">
                Our AI analyzes your spending patterns and provides personalized recommendations to help your family save money and reach financial goals faster.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
