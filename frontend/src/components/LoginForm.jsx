// frontend/src/components/LoginForm.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = () => setForm({ email: 'demo@local', password: 'password123' });
    window.addEventListener('use-demo', handler);
    return () => window.removeEventListener('use-demo', handler);
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await api.post('/auth/login', form);
      setLoading(false);
      onLogin();
    } catch (err) {
      setLoading(false);
      setErr(err.response?.data?.msg || 'Login failed');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && <div className="text-sm text-red-600">{err}</div>}
      <div>
        <label className="text-sm block mb-1">Email</label>
        <input className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
      </div>

      <div>
        <label className="text-sm block mb-1">Password</label>
        <input type="password" className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
      </div>

      <div>
        <button className="btn-login" type="submit" disabled={loading}>
          <span>{loading ? 'Signing in...' : 'Sign in'}</span>
        </button>
      </div>
    </form>
  );
}
