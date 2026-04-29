import { useState } from 'react';
import Onboarding from './components/Onboarding';
import HomeDashboard from './components/HomeDashboard';
import AddExpense from './components/AddExpense';
import FamilyMembers from './components/FamilyMembers';
import Analytics from './components/Analytics';
import Insights from './components/Insights';
import ChildrenWallet from './components/ChildrenWallet';
import ParentalControl from './components/ParentalControl';
import ExpenseSplitting from './components/ExpenseSplitting';
import PaymentsTracking from './components/PaymentsTracking';
import BottomNav from './components/BottomNav';

type Screen = 'onboarding' | 'home' | 'members' | 'analytics' | 'insights' | 'children' | 'parental' | 'payments';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSplitting, setShowSplitting] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const handleOnboardingComplete = () => {
    setCurrentScreen('home');
  };

  const handleAddExpense = () => {
    setShowAddExpense(true);
  };

  const handleExpenseSubmit = () => {
    setShowAddExpense(false);
    setShowSplitting(true);
  };

  const handleSplittingClose = () => {
    setShowSplitting(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') setCurrentScreen('home');
    else if (tab === 'members') setCurrentScreen('members');
    else if (tab === 'analytics') setCurrentScreen('analytics');
    else if (tab === 'insights') setCurrentScreen('insights');
  };

  return (
    <div className="size-full bg-white font-sans">
      {currentScreen === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {currentScreen === 'home' && (
        <>
          <HomeDashboard onAddExpense={handleAddExpense} />
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

          <div className="fixed top-6 right-6 flex gap-2 z-30">
            <button
              onClick={() => setCurrentScreen('children')}
              className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm hover:bg-purple-600 transition-all shadow-md"
            >
              Kids View
            </button>
            <button
              onClick={() => setCurrentScreen('parental')}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm hover:bg-blue-600 transition-all shadow-md"
            >
              Parental
            </button>
            <button
              onClick={() => setCurrentScreen('payments')}
              className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm hover:bg-green-600 transition-all shadow-md"
            >
              Payments
            </button>
          </div>
        </>
      )}

      {currentScreen === 'members' && (
        <>
          <FamilyMembers />
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </>
      )}

      {currentScreen === 'analytics' && (
        <>
          <Analytics />
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </>
      )}

      {currentScreen === 'insights' && (
        <>
          <Insights />
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </>
      )}

      {currentScreen === 'children' && (
        <>
          <ChildrenWallet />
          <button
            onClick={() => setCurrentScreen('home')}
            className="fixed top-6 left-6 px-4 py-2 bg-white text-gray-700 rounded-xl text-sm hover:bg-gray-100 transition-all shadow-md z-30"
          >
            ← Back
          </button>
        </>
      )}

      {currentScreen === 'parental' && (
        <>
          <ParentalControl />
          <button
            onClick={() => setCurrentScreen('home')}
            className="fixed top-6 left-6 px-4 py-2 bg-white text-gray-700 rounded-xl text-sm hover:bg-gray-100 transition-all shadow-md z-30"
          >
            ← Back
          </button>
        </>
      )}

      {currentScreen === 'payments' && (
        <>
          <PaymentsTracking />
          <button
            onClick={() => setCurrentScreen('home')}
            className="fixed top-6 left-6 px-4 py-2 bg-white text-gray-700 rounded-xl text-sm hover:bg-gray-100 transition-all shadow-md z-30"
          >
            ← Back
          </button>
        </>
      )}

      {showAddExpense && (
        <AddExpense onClose={() => setShowAddExpense(false)} onSubmit={handleExpenseSubmit} />
      )}

      {showSplitting && (
        <ExpenseSplitting onClose={handleSplittingClose} />
      )}
    </div>
  );
}