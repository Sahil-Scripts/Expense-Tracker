import React, { useState, useMemo } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function TransactionsList({ items = [], onChange }) {
  const [sortBy, setSortBy] = useState('date-desc');
  const [expandedId, setExpandedId] = useState(null);

  async function del(id) {
    console.log('🗑️ Deleting transaction ID:', id);

    try {
      console.log('Calling DELETE API...');
      await api.delete('/transactions/' + id);
      console.log('✅ Transaction deleted');
      toast.success('🗑️ Transaction deleted successfully!');
      console.log('Calling onChange...');
      await onChange(); // Wait for list to refresh
      console.log('✅ List refreshed');
    } catch (err) {
      console.error('❌ Delete failed:', err);
      toast.error('❌ Failed to delete transaction');
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const sortedItems = useMemo(() => {
    const sorted = [...items];
    sorted.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
    return sorted;
  }, [items, sortBy]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Transactions</h3>
        <select
          className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/50">
              <th className="pb-3 font-medium pl-2">Date</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Note</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {sortedItems.length === 0 && (
              <tr>
                <td colSpan="6" className="py-12">
                  <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">💸</div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                      No transactions yet!
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Add your first expense or income to start tracking your finances.
                    </p>
                  </div>
                </td>
              </tr>
            )}
            {sortedItems.map(it => (
              <React.Fragment key={it._id}>
                <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 pl-2 text-slate-600 dark:text-slate-400">{new Date(it.date).toLocaleDateString()}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${it.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      }`}>
                      {it.type}
                    </span>
                  </td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">
                    <div>{it.category}</div>
                    {it.subcategory && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        → {it.subcategory}
                      </div>
                    )}
                  </td>
                  <td className={`py-3 font-semibold ${it.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {it.type === 'expense' ? '-' : '+'}₹{it.amount.toLocaleString()}
                  </td>
                  <td className="py-3">
                    {it.note ? (
                      <button
                        onClick={() => toggleExpand(it._id)}
                        className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                        title="View note"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${expandedId === it._id ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className="text-xs">
                          {expandedId === it._id ? 'Hide' : 'View'}
                        </span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">No note</span>
                    )}
                  </td>
                  <td className="py-3 text-right pr-2">
                    <button
                      type="button"
                      onClick={() => del(it._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                      title="Delete transaction"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                    </button>
                  </td>
                </tr>
                {/* Expanded note row */}
                {expandedId === it._id && it.note && (
                  <tr className="bg-indigo-50 dark:bg-indigo-900/10">
                    <td colSpan="6" className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">Note</div>
                          <div className="text-sm text-slate-700 dark:text-slate-300">{it.note}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
