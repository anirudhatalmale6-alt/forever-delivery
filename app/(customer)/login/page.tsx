'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
        return;
      }

      // Redirect to home or back
      router.push('/');
      router.refresh();
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 py-8">
      {/* Logo area */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#0D7377] rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-white font-bold text-xl">24</span>
        </div>
        <h1 className="font-bold text-xl text-gray-800">Welcome Back</h1>
        <p className="text-sm text-gray-500 mt-1">Log in to your 24seven account</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D7377] focus:ring-1 focus:ring-[#0D7377]"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D7377] focus:ring-1 focus:ring-[#0D7377]"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-wait'
              : 'bg-[#0D7377] text-white shadow-lg shadow-[#0D7377]/20 active:bg-[#0a5c5f]'
          }`}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#0D7377] font-semibold">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
