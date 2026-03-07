'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatLKR } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  unit: string;
  image_url: string;
  category_name: string;
  category_type: 'pharmacy' | 'liquor';
  requires_prescription: number;
  is_age_restricted: number;
  stock_quantity: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addToCart } = useCart();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setProducts([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Search failed:', err);
        setProducts([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleAdd(product: Product) {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  }

  return (
    <div className="px-4 py-4">
      {/* Search Input */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-[#0D7377] focus:ring-1 focus:ring-[#0D7377] bg-gray-50"
          placeholder="Search products..."
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-12 text-gray-400">
          <div className="w-8 h-8 border-3 border-[#0D7377] border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-sm">Searching...</span>
        </div>
      )}

      {/* Initial state */}
      {!loading && !searched && products.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-3">{'\u{1F50D}'}</span>
          <p className="text-sm">Search for pharmacy and liquor products</p>
        </div>
      )}

      {/* No results */}
      {!loading && searched && products.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-3">{'\u{1F614}'}</span>
          <h2 className="font-bold text-base text-gray-600 mb-1">No Results</h2>
          <p className="text-sm">No products match &quot;{query.trim()}&quot;</p>
        </div>
      )}

      {/* Results Grid */}
      {!loading && products.length > 0 && (
        <>
          <p className="text-xs text-gray-500 mb-3">
            {products.length} result{products.length !== 1 ? 's' : ''} for &quot;{query.trim()}&quot;
          </p>
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => {
              const isPharmacy = product.category_type === 'pharmacy';
              const bgColor = isPharmacy ? 'bg-teal-50' : 'bg-amber-50';
              const textColor = isPharmacy ? 'text-[#0D7377]' : 'text-[#D4A843]';
              const outOfStock = product.stock_quantity <= 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
                >
                  <Link href={`/product/${product.id}`}>
                    <div className={`h-28 ${bgColor} flex items-center justify-center relative`}>
                      <span className={`text-4xl font-bold ${textColor} opacity-40`}>
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                      {product.requires_prescription === 1 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium">
                          Rx
                        </span>
                      )}
                      {product.is_age_restricted === 1 && (
                        <span className="absolute top-2 right-2 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium">
                          18+
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-semibold text-sm text-gray-800 truncate">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        {product.category_name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-bold text-[#0D7377] text-sm">
                          {formatLKR(product.price)}
                        </span>
                        <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                          {product.unit}
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleAdd(product)}
                      disabled={outOfStock}
                      className={`w-full mt-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        outOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : addedId === product.id
                          ? 'bg-green-500 text-white'
                          : 'bg-[#0D7377] text-white active:bg-[#0a5c5f]'
                      }`}
                    >
                      {outOfStock
                        ? 'Out of Stock'
                        : addedId === product.id
                        ? 'Added!'
                        : 'Add'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
