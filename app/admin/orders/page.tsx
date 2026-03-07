'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatLKR, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { ShoppingBag, Eye, Search } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: string;
  total: number;
  created_at: string;
}

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    if (activeTab !== 'all' && o.status !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q)
      );
    }
    return true;
  });

  // Count per status
  const statusCounts: Record<string, number> = { all: orders.length };
  for (const o of orders) {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[#0D7377]/30 border-t-[#0D7377] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and track all customer orders</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-[#0D7377] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {statusCounts[tab.key] !== undefined && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {statusCounts[tab.key] || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by order #, name, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0D7377] focus:border-transparent outline-none bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No orders found</p>
            <p className="text-sm mt-1">
              {activeTab !== 'all'
                ? `No ${getStatusLabel(activeTab).toLowerCase()} orders`
                : 'Orders will appear here once customers place them'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-5 text-gray-600 font-semibold">Order #</th>
                  <th className="text-left py-3 px-5 text-gray-600 font-semibold">Customer</th>
                  <th className="text-left py-3 px-5 text-gray-600 font-semibold">Phone</th>
                  <th className="text-left py-3 px-5 text-gray-600 font-semibold">Status</th>
                  <th className="text-right py-3 px-5 text-gray-600 font-semibold">Total</th>
                  <th className="text-right py-3 px-5 text-gray-600 font-semibold">Date</th>
                  <th className="text-center py-3 px-5 text-gray-600 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-5 font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="py-3 px-5 text-gray-700">{order.customer_name}</td>
                    <td className="py-3 px-5 text-gray-500">{order.customer_phone}</td>
                    <td className="py-3 px-5">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: getStatusColor(order.status) + '18',
                          color: getStatusColor(order.status),
                        }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right font-medium text-gray-900">
                      {formatLKR(order.total)}
                    </td>
                    <td className="py-3 px-5 text-right text-gray-500 whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-3 px-5 text-center">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#0D7377] hover:bg-[#0D7377]/10 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
