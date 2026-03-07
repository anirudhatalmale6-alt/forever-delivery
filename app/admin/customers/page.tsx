'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import { Users, Search, Mail, Phone, MapPin } from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  order_count: number;
  created_at: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch('/api/admin/customers');
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.customers || []);
        } else {
          setError('Failed to load customers');
        }
      } catch (err) {
        console.error('Fetch customers error:', err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">
          {customers.length} registered customer{customers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0D7377] focus:border-transparent outline-none bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No customers found</p>
            <p className="text-sm mt-1">
              {search ? 'Try a different search term' : 'Customers will appear here after they register'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-5 text-gray-600 font-semibold">Customer</th>
                  <th className="text-left py-3 px-5 text-gray-600 font-semibold">Contact</th>
                  <th className="text-left py-3 px-5 text-gray-600 font-semibold">Location</th>
                  <th className="text-right py-3 px-5 text-gray-600 font-semibold">Orders</th>
                  <th className="text-right py-3 px-5 text-gray-600 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#0D7377]/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[#0D7377] font-semibold text-sm">
                            {customer.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {customer.full_name || 'Unnamed'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs">{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      {customer.city || customer.address ? (
                        <div className="flex items-start gap-1.5 text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                          <span className="text-xs">
                            {customer.city || customer.address || 'N/A'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {customer.order_count}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(customer.created_at)}
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
