// frontend/src/App.jsx
import React, { useEffect, useState } from 'react';
import api from './api/axios';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AddTransactionForm from './components/AddTransactionForm';
import TransactionsList from './components/TransactionsList';
import PieChartCard from './components/PieChartCard';
import BarChartCard from './components/BarChartCard';
import LineChartCard from './components/LineChartCard';
import ThemeToggle from './components/ThemeToggle';
import CategoryManager from './components/CategoryManager';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import CountUp from 'react-countup';
import './index.css';

import SettingsPage from './components/SettingsPage';

function AuthSwitcher({ onAuthSuccess }) {
  const [tab, setTab] = useState('signin');
  return (
    <div>
      <div className="tab-row mb-4">
        <div className={`center tab-btn ${tab === 'signin' ? 'active' : ''}`} onClick={() => setTab('signin')}>Sign in</div>
        <div className={`center tab-btn ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Create account</div>
      </div>
      <div>
        {tab === 'signin' ? <LoginForm onLogin={onAuthSuccess} /> : <RegisterForm onRegister={onAuthSuccess} />}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [trends, setTrends] = useState(null);
  const [alert, setAlert] = useState(null);
  const [insights, setInsights] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [showCategoryManager, setShowCategoryManager] = useState(false);


  async function fetchData() {
    console.log('fetchData called');
    try {
      const [txRes, trRes, alRes, mlRes, savRes] = await Promise.all([
        api.get(`/transactions?month=${month}`),
        api.get('/dashboard/trends?months=6'),
        api.get(`/dashboard/budget-alerts?month=${month}`),
        api.get('/ml/forecast'),
        api.get('/ml/savings')
      ]);
      console.log('fetchData: got transactions:', txRes.data.length);
      setTransactions(txRes.data);
      setTrends(trRes.data);
      setAlert(alRes.data);
      setInsights({ forecast: mlRes.data.forecast, tip: savRes.data.tip });
      console.log('fetchData completed successfully');
    } catch (e) {
      console.error('fetchData error:', e.response?.data || e);
      console.warn('fetchData failed', e);
    }
  }

  async function loadUser() {
    console.log('loadUser: starting');
    try {
      await api.post('/auth/refresh').catch(err => console.warn('refresh failed:', err?.message));
      const res = await api.get('/auth/me').catch(err => { console.warn('/auth/me failed:', err?.message); return null; });
      const userData = res?.data?.user || null;
      setUser(userData);
      if (userData) {
        fetchData();
      }
      return userData;
    } catch (e) {
      console.error('loadUser unexpected error:', e);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser().then(u => { if (u) fetchData(); });
  }, []);

  useEffect(() => {
    if (user) fetchData();
  }, [user, month]);

  if (loading) return <div className="center min-h-screen">Loading...</div>;

  if (!user) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="brand-strip">
            <div className="flex flex-col items-center gap-3">
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '28px', backdropFilter: 'blur(4px)' }}>K</div>
              <div>
                <div className="text-2xl font-bold tracking-tight">Kubeo</div>
                <div className="text-cyan-100 text-sm mt-1">Manage your finances with clarity</div>
              </div>
            </div>
          </div>
          <div className="p-8"><AuthSwitcher onAuthSuccess={loadUser} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome to Kubeo, {user.name} 👋</h1>
            <div className="text-slate-500 dark:text-slate-400 mt-1">Here's your financial overview for this month.</div>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget</span>
              <input
                type="number"
                className="w-24 text-sm font-bold text-slate-700 dark:text-slate-200 bg-transparent border-none focus:ring-0 p-0"
                placeholder="Set limit"
                value={user.monthlyBudget || ''}
                onChange={async (e) => {
                  const val = Number(e.target.value);
                  setUser({ ...user, monthlyBudget: val }); // optimistic update
                  try { await api.put('/auth/profile', { monthlyBudget: val }); } catch (err) { }
                }}
              />
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <input
              type="month"
              className="border-none bg-transparent focus:ring-0 text-slate-700 dark:text-slate-200 font-medium"
              value={month}
              onChange={e => setMonth(e.target.value)}
            />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 px-2 transition-colors flex items-center gap-1"
              onClick={() => setShowCategoryManager(true)}
            >
              <span>📁</span>
              <span>Categories</span>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 px-2 transition-colors" onClick={async () => {
              try { await api.post('/auth/logout'); } catch (e) { }
              setUser(null);
            }}>Logout</button>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Budget Alert Banner */}
            {alert && alert.budget > 0 && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${alert.level === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200' :
                alert.level === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200' :
                  alert.level === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200' :
                    'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                }`}>
                <div className="flex-1">
                  <h4 className="font-bold text-sm uppercase tracking-wide mb-1">{alert.title}</h4>
                  <p className="text-sm opacity-90">{alert.message}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold">{Math.round((alert.totalExpense / alert.budget) * 100)}%</div>
                  {alert.level === 'safe' && (
                    <button
                      onClick={() => {
                        confetti({
                          particleCount: 100,
                          spread: 70,
                          origin: { y: 0.6 }
                        });
                        toast.success('🎉 Amazing! You\'re under budget!');
                      }}
                      className="text-3xl hover:scale-110 transition-transform cursor-pointer"
                      title="Celebrate!"
                    >
                      🎉
                    </button>
                  )}
                </div>
              </div>
            )}

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Add Transaction</h2>
              </div>
              <div className="app-card">
                <AddTransactionForm onAdd={fetchData} />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Transactions</h2>
              </div>
              <div className="app-card min-h-[400px]">
                <TransactionsList items={transactions} onChange={fetchData} />
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <section>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Smart Insights 🤖</h3>
              <div className="app-card bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border-indigo-100 dark:border-indigo-800/50">
                {insights ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-bold text-indigo-400 dark:text-indigo-300 uppercase tracking-wider mb-1">Next Month Forecast</div>
                      <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                        ₹<CountUp
                          end={insights.forecast}
                          duration={2}
                          separator=","
                        />
                      </div>
                      <div className="text-xs text-indigo-600/80 dark:text-indigo-300/80">Based on your last 6 months</div>
                    </div>
                    <div className="h-px bg-indigo-200/50 dark:bg-indigo-700/50"></div>
                    <div>
                      <div className="text-xs font-bold text-purple-400 dark:text-purple-300 uppercase tracking-wider mb-1">Savings Tip</div>
                      <p className="text-sm text-purple-900 dark:text-purple-100 font-medium">{insights.tip}</p>
                    </div>
                  </div>
                ) : <div className="text-sm text-slate-400">Gathering data...</div>}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Expense Breakdown</h3>
              <div className="app-card">
                <PieChartCard transactions={transactions} />
              </div>
            </section>
            <section>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">6-Month Trend</h3>
              <div className="app-card">
                <BarChartCard data={trends} />
              </div>
            </section>
            <section>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Monthly Trends 📈</h3>
              <div className="app-card">
                <LineChartCard data={trends} />
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <CategoryManager onClose={() => setShowCategoryManager(false)} />
      )}

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Floating Quick Add Button */}
      <button
        onClick={() => {
          const amountInput = document.querySelector('input[placeholder*="mount"]');
          if (amountInput) {
            amountInput.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all flex items-center justify-center text-2xl z-50 font-bold"
        title="Quick Add Transaction"
      >
        +
      </button>
    </div>
  );
}
