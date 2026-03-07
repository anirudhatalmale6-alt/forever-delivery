'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { formatLKR } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  unit: string;
  image_url: string;
  category_id: string;
  category_name: string;
  category_type: 'pharmacy' | 'liquor';
  requires_prescription: number;
  is_age_restricted: number;
  stock_quantity: number;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) {
        setProduct(null);
        return;
      }
      const data = await res.json();
      setProduct(data.product || null);
    } catch (err) {
      console.error('Failed to fetch product:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart() {
    if (!product) return;
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
      },
      quantity
    );
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <div className="w-8 h-8 border-3 border-[#0D7377] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm">Loading product...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 px-4">
        <span className="text-5xl block mb-3">{'\u{1F6AB}'}</span>
        <h2 className="font-bold text-lg text-gray-700 mb-2">Product Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">
          This product may have been removed or is unavailable.
        </p>
        <Link href="/" className="text-[#0D7377] font-semibold text-sm underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const isPharmacy = product.category_type === 'pharmacy';
  const bgColor = isPharmacy ? 'bg-teal-50' : 'bg-amber-50';
  const textColor = isPharmacy ? 'text-[#0D7377]' : 'text-[#D4A843]';
  const outOfStock = product.stock_quantity <= 0;

  return (
    <div className="relative">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-semibold animate-bounce">
          Added to cart!
        </div>
      )}

      {/* Back */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur text-gray-600 shadow"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Product Image Placeholder */}
      <div className={`h-56 ${bgColor} flex items-center justify-center relative`}>
        <span className={`text-7xl font-bold ${textColor} opacity-30`}>
          {product.name.charAt(0).toUpperCase()}
        </span>
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {product.requires_prescription === 1 && (
            <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow">
              Prescription Required
            </span>
          )}
          {product.is_age_restricted === 1 && (
            <span className="bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow">
              Age 18+ Only
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-4 py-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h1 className="font-bold text-xl text-gray-800">{product.name}</h1>
          <span
            className={`text-[10px] font-medium px-2 py-1 rounded-full shrink-0 mt-1 ${
              isPharmacy ? 'bg-teal-50 text-[#0D7377]' : 'bg-amber-50 text-[#D4A843]'
            }`}
          >
            {product.category_name}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-[#0D7377]">{formatLKR(product.price)}</span>
          <span className="text-sm text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
            per {product.unit}
          </span>
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 leading-relaxed mb-5">
            {product.description}
          </p>
        )}

        {outOfStock ? (
          <div className="bg-red-50 text-red-600 text-center py-3 rounded-xl font-semibold text-sm">
            Currently Out of Stock
          </div>
        ) : (
          <>
            {/* Quantity */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-gray-700">Quantity</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:bg-gray-100 text-lg font-medium"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:bg-gray-100 text-lg font-medium"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-gray-400">
                {product.stock_quantity} in stock
              </span>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 bg-[#0D7377] text-white font-bold rounded-xl text-sm shadow-lg shadow-[#0D7377]/20 active:bg-[#0a5c5f] transition-colors"
            >
              Add to Cart {'\u2022'} {formatLKR(product.price * quantity)}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
