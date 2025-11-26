import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function SettingsPage({ user, onUpdateUser }) {
    const [budget, setBudget] = useState(user?.monthlyBudget || '');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (user) setBudget(user.monthlyBudget || '');
    }, [user]);

    async function save() {
        try {
            await api.put('/auth/profile', { monthlyBudget: Number(budget) });
            setMsg('Settings saved!');
            onUpdateUser(); // refresh user data in App
            setTimeout(() => setMsg(''), 3000);
        } catch (e) {
            setMsg('Failed to save.');
        }
    }

    return (
        <div className="max-w-md mx-auto mt-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Settings</h2>
            <div className="app-card space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Budget Limit (₹)</label>
                    <input
                        type="number"
                        className="input"
                        value={budget}
                        onChange={e => setBudget(e.target.value)}
                        placeholder="e.g. 20000"
                    />
                    <p className="text-xs text-slate-500 mt-1">Set a limit to receive alerts on the dashboard.</p>
                </div>

                <button onClick={save} className="btn-primary w-full">Save Changes</button>

                {msg && <div className={`text-center text-sm font-medium ${msg.includes('Failed') ? 'text-red-600' : 'text-emerald-600'}`}>{msg}</div>}
            </div>
        </div>
    );
}
