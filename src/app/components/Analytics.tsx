import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';

export default function Analytics() {
  const categoryData = [
    { name: 'Food', value: 450, color: '#F59E0B' },
    { name: 'Bills', value: 320, color: '#3B82F6' },
    { name: 'Transport', value: 180, color: '#8B5CF6' },
    { name: 'Housing', value: 250, color: '#10B981' },
    { name: 'Education', value: 150, color: '#6366F1' },
    { name: 'Health', value: 120, color: '#EF4444' },
  ];

  const weeklyData = [
    { day: 'Mon', amount: 85 },
    { day: 'Tue', amount: 120 },
    { day: 'Wed', amount: 95 },
    { day: 'Thu', amount: 150 },
    { day: 'Fri', amount: 180 },
    { day: 'Sat', amount: 220 },
    { day: 'Sun', amount: 110 },
  ];

  const insights = [
    {
      type: 'warning',
      title: 'Budget Alert',
      message: 'You\'ve spent 85% of your monthly budget',
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      type: 'tip',
      title: 'Spending Pattern',
      message: 'You spend 40% more on delivery than cooking at home',
      icon: Lightbulb,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      type: 'trend',
      title: 'Great Progress',
      message: 'Your family saved $350 this month compared to last month',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-24">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-b-3xl p-6 pt-12 mb-6 shadow-lg">
        <h1 className="text-white text-2xl mb-2">Analytics</h1>
        <p className="text-white/90">Your spending insights</p>
      </div>

      <div className="px-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-gray-800 mb-4">Expenses by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-gray-700">{cat.name}</span>
                <span className="text-sm text-gray-500 ml-auto">${cat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-gray-800 mb-4">Weekly Spending</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-gray-800 mb-4">AI Insights</h3>
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-4 shadow-md">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 ${insight.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${insight.color}`} />
                    </div>
                    <div>
                      <h4 className="text-gray-800 font-medium mb-1">{insight.title}</h4>
                      <p className="text-gray-600 text-sm">{insight.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
