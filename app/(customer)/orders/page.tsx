'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatLKR, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  customer_name: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.status === 401) {
        setIsLoggedIn(false);
        setAuthChecked(true);
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  }

  // Not logged in
  if (authChecked && !isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <span className="text-5xl mb-4">{'\u{1F512}'}</span>
        <h2 className="font-bold text-lg text-gray-700 mb-2">Log In to View Orders</h2>
        <p className="text-sm text-gray-500 mb-6">
          Please log in to see your order history.
        </p>
        <Link
          href="/login"
          className="bg-[#0D7377] text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-[#0D7377]/20"
        >
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-lg text-gray-800">My Orders</h1>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="text-sm text-[#0D7377] font-medium flex items-center gap-1 disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && orders.length === 0 && (
        <div className="flex flex-col items-center py-16 text-gray-400">
          <div className="w-8 h-8 border-3 border-[#0D7377] border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-sm">Loading orders...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && orders.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-3">{'\u{1F4E6}'}</span>
          <h2 className="font-bold text-base text-gray-600 mb-2">No Orders Yet</h2>
          <p className="text-sm text-gray-500 mb-6">Your order history will appear here.</p>
          <Link
            href="/"
            className="bg-[#0D7377] text-white px-6 py-2.5 rounded-xl font-semibold text-sm"
          >
            Start Shopping
          </Link>
        </div>
      )}

      {/* Order List */}
      {orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order/${order.id}`}
              className="block bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-gray-800">
                  #{order.order_number}
                </span>
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: getStatusColor(order.status) + '18',
                    color: getStatusColor(order.status),
                  }}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {formatDate(order.created_at)}
                </span>
                <span className="font-bold text-[#0D7377]">
                  {formatLKR(order.total)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
