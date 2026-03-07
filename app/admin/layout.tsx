'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Grid3x3,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Orders', href: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" /> },
  { label: 'Products', href: '/admin/products', icon: <Package className="w-5 h-5" /> },
  { label: 'Categories', href: '/admin/categories', icon: <Grid3x3 className="w-5 h-5" /> },
  { label: 'Customers', href: '/admin/customers', icon: <Users className="w-5 h-5" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/profile');
        if (!res.ok) {
          router.replace('/admin-login');
          return;
        }
        const data = await res.json();
        if (!data.user?.is_admin) {
          router.replace('/admin-login');
          return;
        }
        setAdminName(data.user.full_name || 'Admin');
        setAuthChecked(true);
      } catch {
        router.replace('/admin-login');
      }
    }
    checkAuth();
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/profile', { method: 'DELETE' });
    router.replace('/admin-login');
  }

  function isActive(href: string): boolean {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#0D7377]/30 border-t-[#0D7377] rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#095355] flex flex-col transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#D4A843] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">24</span>
            </div>
            <span className="text-white font-bold text-lg">24seven Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-4 h-4 text-white/40" />}
              </Link>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 mb-2">
            <p className="text-white/40 text-xs uppercase tracking-wider">Signed in as</p>
            <p className="text-white text-sm font-medium truncate">{adminName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="lg:hidden ml-3 font-semibold text-gray-800">24seven Admin</div>
          <div className="hidden lg:flex items-center text-sm text-gray-500">
            {navItems.find((item) => isActive(item.href))?.label || 'Dashboard'}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
