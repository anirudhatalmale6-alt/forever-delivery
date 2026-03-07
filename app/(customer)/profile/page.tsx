'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { formatDate } from '@/lib/utils';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  is_admin: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/auth/profile');
      if (res.ok) {
        const data = await res.json();
        const user: UserProfile = data.user;
        setProfile(user);
        setIsLoggedIn(true);
        setFullName(user.full_name || '');
        setPhone(user.phone || '');
        setAddress(user.address || '');
        setCity(user.city || '');
      } else {
        setIsLoggedIn(false);
      }
    } catch {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError('Name is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update profile.');
        return;
      }

      setProfile({
        ...profile!,
        full_name: data.user.full_name,
        phone: data.user.phone,
        address: data.user.address,
        city: data.user.city,
      });
      setEditing(false);
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/profile', { method: 'DELETE' });
    } catch {
      // Ignore
    }
    clearCart();
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <div className="w-8 h-8 border-3 border-[#0D7377] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm">Loading profile...</span>
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">{'\u{1F464}'}</span>
        </div>
        <h2 className="font-bold text-lg text-gray-700 mb-2">Welcome to 24seven</h2>
        <p className="text-sm text-gray-500 mb-6">
          Log in or create an account to get started.
        </p>
        <div className="flex gap-3 w-full max-w-xs">
          <Link
            href="/login"
            className="flex-1 bg-[#0D7377] text-white py-3 rounded-xl font-bold text-sm text-center shadow-lg shadow-[#0D7377]/20"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="flex-1 bg-white text-[#0D7377] py-3 rounded-xl font-bold text-sm text-center border-2 border-[#0D7377]"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      {/* Avatar + name */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-[#0D7377] rounded-full flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xl">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-lg text-gray-800 truncate">
            {profile?.full_name || 'User'}
          </h1>
          <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
          {profile?.created_at && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              Member since {formatDate(profile.created_at)}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl mb-4">{success}</div>
      )}

      {/* Profile Info / Edit */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm text-gray-700">Personal Information</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-[#0D7377] font-medium"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#0D7377] focus:ring-1 focus:ring-[#0D7377]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#0D7377] focus:ring-1 focus:ring-[#0D7377]"
                placeholder="e.g. 07X XXXX XXX"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#0D7377] focus:ring-1 focus:ring-[#0D7377] resize-none"
                rows={2}
                placeholder="Delivery address"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#0D7377] focus:ring-1 focus:ring-[#0D7377]"
                placeholder="e.g. Colombo"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm ${
                  saving
                    ? 'bg-gray-300 text-gray-500'
                    : 'bg-[#0D7377] text-white active:bg-[#0a5c5f]'
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setError('');
                  setFullName(profile?.full_name || '');
                  setPhone(profile?.phone || '');
                  setAddress(profile?.address || '');
                  setCity(profile?.city || '');
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium text-gray-800">{profile?.full_name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-800">{profile?.email || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium text-gray-800">{profile?.phone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Address</span>
              <span className="font-medium text-gray-800 text-right max-w-[60%]">
                {profile?.address || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">City</span>
              <span className="font-medium text-gray-800">{profile?.city || '-'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="space-y-2 mb-6">
        <Link
          href="/orders"
          className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3.5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{'\u{1F4E6}'}</span>
            <span className="text-sm font-medium text-gray-800">My Orders</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <Link
          href="/cart"
          className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3.5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{'\u{1F6D2}'}</span>
            <span className="text-sm font-medium text-gray-800">My Cart</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-xl font-bold text-sm text-red-500 bg-red-50 active:bg-red-100 transition-colors"
      >
        Log Out
      </button>
    </div>
  );
}
