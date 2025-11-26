// frontend/src/components/RegisterForm.jsx
import React, { useState } from 'react';
import api from '../api/axios';

export default function RegisterForm({ onRegister }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await api.post('/auth/register', form);
      setLoading(false);
      onRegister();
    } catch (err) {
      setLoading(false);
      setErr(err.response?.data?.msg || 'Register failed');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && <div className="text-sm text-red-600">{err}</div>}
      <div>
        <label className="text-sm block mb-1">Full name</label>
        <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
      </div>

      <div>
        <label className="text-sm block mb-1">Email</label>
        <input className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
      </div>

      <div>
        <label className="text-sm block mb-1">Password</label>
        <input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Choose a password" />
      </div>

      <div>
        <button className="btn-login" type="submit" disabled={loading}>
          <span>{loading ? 'Creating...' : 'Create account'}</span>
        </button>
      </div>
    </form>
  );
}
