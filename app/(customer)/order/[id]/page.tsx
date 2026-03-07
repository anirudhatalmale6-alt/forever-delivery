'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatLKR, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  line_total: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  delivery_address: string;
  delivery_city: string;
  customer_name: string;
  customer_phone: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === '1';

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(isSuccess);

  useEffect(() => {
    fetchOrder();
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        if (res.status === 401) {
          setError('Please log in to view this order.');
        } else if (res.status === 403) {
          setError('You are not authorized to view this order.');
        } else {
          setError('Order not found.');
        }
        return;
      }
      const data = await res.json();
      setOrder(data.order || null);
      setItems(data.items || []);
    } catch {
      setError('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <div className="w-8 h-8 border-3 border-[#0D7377] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm">Loading order...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24 px-4">
        <span className="text-5xl block mb-3">{'\u{1F6AB}'}</span>
        <h2 className="font-bold text-lg text-gray-700 mb-2">Error</h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <Link href="/orders" className="text-[#0D7377] font-semibold text-sm underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const statusColor = getStatusColor(order.status);

  return (
    <div className="px-4 py-4">
      {/* Success Banner */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4 text-center">
          <span className="text-2xl block mb-1">{'\u{2705}'}</span>
          <span className="font-bold text-sm">Order Placed Successfully!</span>
          <p className="text-xs mt-1 text-green-600">We will prepare your order right away.</p>
        </div>
      )}

      {/* Back + title */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/orders"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-lg text-gray-800">Order #{order.order_number}</h1>
          <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center mb-5">
        <div
          className="px-5 py-2.5 rounded-2xl flex items-center gap-2"
          style={{ backgroundColor: statusColor + '15' }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
          <span
            className="font-bold text-sm"
            style={{ color: statusColor }}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <h2 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-3">
          Delivery Details
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span className="font-medium text-gray-800">{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phone</span>
            <span className="font-medium text-gray-800">{order.customer_phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Address</span>
            <span className="font-medium text-gray-800 text-right max-w-[60%]">
              {order.delivery_address}
              {order.delivery_city ? `, ${order.delivery_city}` : ''}
            </span>
          </div>
          {order.notes && (
            <div className="flex justify-between">
              <span className="text-gray-500">Notes</span>
              <span className="font-medium text-gray-800 text-right max-w-[60%]">
                {order.notes}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Payment</span>
            <span className="font-medium text-gray-800">Cash on Delivery</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h2 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-3">
          Items ({items.length})
        </h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-800 truncate block">
                  {item.product_name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatLKR(item.product_price)} x {item.quantity}
                </span>
              </div>
              <span className="font-semibold text-sm text-gray-800 ml-3 shrink-0">
                {formatLKR(item.line_total)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold text-gray-800">{formatLKR(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-semibold text-gray-800">{formatLKR(order.delivery_fee)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
          <span className="font-bold text-gray-800">Total</span>
          <span className="font-bold text-lg text-[#0D7377]">{formatLKR(order.total)}</span>
        </div>
      </div>

      {/* Auto-refresh note */}
      <p className="text-center text-[10px] text-gray-400 mt-4">
        Status updates automatically every 15 seconds
      </p>
    </div>
  );
}
