'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { formatLKR } from '@/lib/utils';

const DELIVERY_FEE = 200;

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = subtotal + DELIVERY_FEE;

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
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
      setAuthChecked(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
          delivery_address: address.trim(),
          delivery_city: city.trim(),
          customer_name: fullName.trim(),
          customer_phone: phone.trim(),
          customer_email: profile?.email || '',
          payment_method: 'cod',
          notes: notes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to place order. Please try again.');
        return;
      }

      clearCart();
      router.push(`/order/${data.order.id}?success=1`);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Loading
  if (!authChecked) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <div className="w-8 h-8 border-3 border-[#0D7377] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <span className="text-5xl mb-4">{'\u{1F512}'}</span>
        <h2 className="font-bold text-lg text-gray-700 mb-2">Please Log In</h2>
        <p className="text-sm text-gray-500 mb-6">
          You need to be logged in to place an order.
        </p>
        <Link
          href="/login"
          className="bg-[#0D7377] text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-[#0D7377]/20"
        >
          Log In
        </Link>
        <Link
          href="/signup"
          className="mt-3 text-sm text-[#0D7377] font-medium"
        >
          or create an account
        </Link>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <span className="text-5xl mb-4">{'\u{1F6D2}'}</span>
        <h2 className="font-bold text-lg text-gray-700 mb-2">Cart is Empty</h2>
        <p className="text-sm text-gray-500 mb-6">
          Add items to your cart before checking out.
        </p>
        <Link
          href="/"
          className="bg-[#0D7377] text-white px-6 py-2.5 rounded-xl font-semibold text-sm"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/cart"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-bold text-lg text-gray-800">Checkout</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Delivery Info */}
        <div className="mb-5">
          <h2 className="font-bold text-sm text-gray-700 mb-3">Delivery Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D7377] focus:ring-1 focus:ring-[#0D7377]"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D7377] focus:ring-1 focus:ring-[#0D7377]"
                placeholder="e.g. 07X XXXX XXX"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Delivery Address *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D7377] focus:ring-1 focus:ring-[#0D7377] resize-none"
                rows={2}
                placeholder="Street address, building, floor"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D7377] focus:ring-1 focus:ring-[#0D7377]"
                placeholder="e.g. Colombo"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D7377] focus:ring-1 focus:ring-[#0D7377] resize-none"
                rows={2}
                placeholder="Any special instructions..."
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-5">
          <h2 className="font-bold text-sm text-gray-700 mb-3">Order Summary</h2>
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate flex-1">
                  {item.name} x{item.quantity}
                </span>
                <span className="font-medium text-gray-800 ml-2 shrink-0">
                  {formatLKR(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">{formatLKR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-semibold">{formatLKR(DELIVERY_FEE)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-bold text-gray-800">Total</span>
              <span className="font-bold text-lg text-[#0D7377]">{formatLKR(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <h2 className="font-bold text-sm text-gray-700 mb-3">Payment Method</h2>
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-lg">{'\u{1F4B5}'}</span>
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-800">Cash on Delivery</span>
              <p className="text-xs text-gray-500">Pay when your order arrives</p>
            </div>
            <div className="ml-auto w-5 h-5 border-2 border-[#0D7377] rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-[#0D7377] rounded-full" />
            </div>
          </div>
        </div>

        {/* Place Order */}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
            submitting
              ? 'bg-gray-300 text-gray-500 cursor-wait'
              : 'bg-[#0D7377] text-white shadow-lg shadow-[#0D7377]/20 active:bg-[#0a5c5f]'
          }`}
        >
          {submitting ? 'Placing Order...' : `Place Order \u2022 ${formatLKR(total)}`}
        </button>
      </form>
    </div>
  );
}
