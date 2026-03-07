'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatLKR } from '@/lib/utils';

const DELIVERY_FEE = 200;
const MIN_ORDER = 500;

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, itemCount } = useCart();

  const total = subtotal + DELIVERY_FEE;
  const canCheckout = items.length > 0 && subtotal >= MIN_ORDER;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <span className="text-6xl mb-4">{'\u{1F6D2}'}</span>
        <h2 className="font-bold text-lg text-gray-700 mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-gray-500 mb-6">
          Browse our products and add items to get started.
        </p>
        <Link
          href="/"
          className="bg-[#0D7377] text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-[#0D7377]/20"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <h1 className="font-bold text-lg text-gray-800 mb-1">Shopping Cart</h1>
      <p className="text-xs text-gray-500 mb-4">
        {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
      </p>

      {/* Cart Items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-[#0D7377] opacity-40">
                  {item.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-800 truncate">{item.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-bold text-[#0D7377]">
                    {formatLKR(item.price)}
                  </span>
                  <span className="text-[10px] text-gray-400">/ {item.unit}</span>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-1 text-gray-400 hover:text-red-500 shrink-0"
                aria-label="Remove item"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold text-gray-800">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm"
                >
                  +
                </button>
              </div>
              <span className="font-bold text-sm text-gray-800">
                {formatLKR(item.price * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold text-gray-800">{formatLKR(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-semibold text-gray-800">{formatLKR(DELIVERY_FEE)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
          <span className="font-bold text-gray-800">Total</span>
          <span className="font-bold text-lg text-[#0D7377]">{formatLKR(total)}</span>
        </div>
      </div>

      {/* Minimum order notice */}
      {subtotal < MIN_ORDER && (
        <div className="bg-amber-50 text-amber-700 text-xs text-center py-2.5 px-3 rounded-xl mb-4">
          Minimum order amount is {formatLKR(MIN_ORDER)}. Add {formatLKR(MIN_ORDER - subtotal)} more.
        </div>
      )}

      {/* Checkout Button */}
      <Link
        href={canCheckout ? '/checkout' : '#'}
        className={`block w-full py-3.5 rounded-xl font-bold text-center text-sm transition-colors ${
          canCheckout
            ? 'bg-[#0D7377] text-white shadow-lg shadow-[#0D7377]/20 active:bg-[#0a5c5f]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        onClick={(e) => !canCheckout && e.preventDefault()}
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
