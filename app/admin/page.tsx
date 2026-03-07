'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatLKR, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  Package,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  total: number;
  created_at: string;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/products'),
        ]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProductCount(productsData.products?.length || 0);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Compute stats
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.created_at?.startsWith(today));
  const revenueToday = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const recentOrders = orders.slice(0, 10);

  const stats: StatCard[] = [
    {
      label: 'Total Orders',
      value: orders.length,
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Revenue Today',
      value: formatLKR(revenueToday),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Pending Orders',
      value: pendingCount,
      icon: <Clock className="w-6 h-6" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Total Products',
      value: productCount,
      icon: <Package className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[#0D7377]/30 border-t-[#0D7377] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your store performance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-2.5 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-gradient-to-r from-[#0D7377] to-[#095355] rounded-xl p-5 text-white shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 text-[#D4A843]" />
          <span className="font-semibold">Today&apos;s Activity</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-white/60">Orders Today</p>
            <p className="text-xl font-bold">{todayOrders.length}</p>
          </div>
          <div>
            <p className="text-white/60">Revenue Today</p>
            <p className="text-xl font-bold">{formatLKR(revenueToday)}</p>
          </div>
          <div>
            <p className="text-white/60">Avg Order Value</p>
            <p className="text-xl font-bold">
              {todayOrders.length > 0
                ? formatLKR(revenueToday / todayOrders.length)
                : formatLKR(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-[#0D7377] hover:text-[#095355] font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Order #</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Customer</th>
                  <th className="text-left py-3 px-5 text-gray-500 font-medium">Status</th>
                  <th className="text-right py-3 px-5 text-gray-500 font-medium">Total</th>
                  <th className="text-right py-3 px-5 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-[#0D7377] hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-3 px-5 text-gray-700">{order.customer_name}</td>
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
                    <td className="py-3 px-5 text-right text-gray-500">
                      {formatDate(order.created_at)}
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
