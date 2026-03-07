'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CartProvider, useCart } from '@/lib/cart-context';

function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  const tabs = [
    { href: '/', label: 'Home', icon: '\u{1F3E0}' },
    { href: '/search', label: 'Search', icon: '\u{1F50D}' },
    { href: '/cart', label: 'Cart', icon: '\u{1F6D2}', badge: itemCount },
    { href: '/orders', label: 'Orders', icon: '\u{1F4E6}' },
    { href: '/profile', label: 'Profile', icon: '\u{1F464}' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-[480px] mx-auto flex">
        {tabs.map((tab) => {
          const isActive =
            tab.href === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center py-2 relative transition-colors ${
                isActive ? 'text-[#0D7377]' : 'text-gray-400'
              }`}
            >
              <span className="text-xl relative">
                {tab.icon}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#D4A843] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                ) : null}
              </span>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-[#0D7377]' : 'text-gray-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#0D7377] rounded-b" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#0D7377] text-white z-50 shadow-md">
      <div className="max-w-[480px] mx-auto flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-wide">24seven</span>
        </Link>
        <span className="text-xs opacity-80">Delivery</span>
      </div>
    </header>
  );
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-xl relative">
        <Header />
        <main className="pt-14 pb-16">{children}</main>
        <BottomNav />
      </div>
    </CartProvider>
  );
}
