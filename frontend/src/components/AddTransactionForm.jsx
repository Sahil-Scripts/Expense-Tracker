// frontend/src/components/AddTransactionForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import Tesseract from 'tesseract.js';
import toast from 'react-hot-toast';

export default function AddTransactionForm({ onAdd }) {
  const [form, setForm] = useState({ type: 'expense', amount: '', category: '', subcategory: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [categories, setCategories] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);

      // Initialize default categories if none exist
      if (res.data.length === 0) {
        await api.post('/categories/init-defaults');
        const newRes = await api.get('/categories');
        setCategories(newRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.amount || !form.category) {
      toast.error('⚠️ Amount and category required');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/transactions', {
        ...form,
        amount: Number(form.amount),
        date: new Date()
      });
      console.log('✅ Transaction added:', response.data);
      toast.success(`💰 ${form.type === 'expense' ? 'Expense' : 'Income'} of ₹${form.amount} added!`);
      setForm({ type: 'expense', amount: '', category: '', subcategory: '', note: '' });
      await onAdd(); // Wait for callback to complete
      console.log('✅ List refreshed');
    } catch (e) {
      console.error('❌ Add failed:', e.response?.data || e);
      toast.error('❌ Failed to add: ' + (e.response?.data?.msg || e.message));
    } finally {
      setLoading(false);
    }
  }

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScanning(true);
    toast.loading('📸 Scanning receipt...');
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      console.log('OCR Text:', text);

      const numbers = text.match(/\d+\.\d{2}/g) || text.match(/\d+/g);
      const maxNum = numbers ? Math.max(...numbers.map(n => parseFloat(n))) : '';
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      const vendor = lines[0] || '';

      setForm(prev => ({
        ...prev,
        amount: maxNum || prev.amount,
        note: 'Receipt: ' + vendor.substring(0, 20) + '...',
        category: 'Shopping'
      }));
      toast.dismiss();
      toast.success('✅ Receipt scanned successfully!');
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error('❌ Failed to scan receipt');
    } finally {
      setScanning(false);
    }
  };

  // Filter categories by transaction type
  const filteredCategories = categories.filter(c => c.type === form.type);

  // Get selected category object
  const selectedCategory = categories.find(c => c.name === form.category);

  return (
    <div className="space-y-4">
      {/* Large Scan Block */}
      <div
        className={`border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-cyan-400 dark:hover:border-cyan-500/50 cursor-pointer transition-all ${scanning ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-4xl mb-2">{scanning ? '⏳' : '📷'}</div>
        <div className="font-bold text-slate-600 dark:text-slate-300">{scanning ? 'Scanning Receipt...' : 'Scan Receipt to Auto-fill'}</div>
        <div className="text-xs mt-1 text-slate-400 dark:text-slate-500">Supports JPG, PNG</div>
        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImage} />
      </div>

      <form onSubmit={submit} className="space-y-3">
        <select className="input w-full" value={form.type} onChange={e => {
          setForm({ ...form, type: e.target.value, category: '', subcategory: '' });
        }}>
          <option value="expense">💸 Expense</option>
          <option value="income">💰 Income</option>
        </select>

        <input
          className="input w-full"
          type="number"
          step="0.01"
          placeholder="Enter amount (e.g., 500)"
          value={form.amount}
          onChange={e => setForm({ ...form, amount: e.target.value })}
          required
        />

        {/* Category selector with icons */}
        <select
          className="input w-full"
          value={form.category}
          onChange={e => {
            setForm({ ...form, category: e.target.value, subcategory: '' });
          }}
          required
        >
          <option value="">Select Category</option>
          {filteredCategories.map(cat => (
            <option key={cat._id} value={cat.name}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>

        {/* Subcategory selector (only shown if category has subcategories) */}
        {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
          <select
            className="input w-full"
            value={form.subcategory}
            onChange={e => setForm({ ...form, subcategory: e.target.value })}
          >
            <option value="">Select Subcategory (Optional)</option>
            {selectedCategory.subcategories.map((sub, idx) => (
              <option key={idx} value={sub.name}>
                {sub.icon} {sub.name}
              </option>
            ))}
          </select>
        )}

        <input
          className="input w-full"
          placeholder="Note (optional)"
          value={form.note}
          onChange={e => setForm({ ...form, note: e.target.value })}
        />

        <div className="flex justify-end">
          <button
            className="btn-primary w-full md:w-auto"
            type="button"
            disabled={loading}
            onClick={submit}
          >
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}
