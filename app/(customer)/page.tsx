'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: 'pharmacy' | 'liquor';
  product_count: number;
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<'all' | 'pharmacy' | 'liquor'>('all');

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredCategories =
    activeType === 'all'
      ? categories
      : categories.filter((c) => c.type === activeType);

  return (
    <div className="px-4 py-4">
      {/* Section Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setActiveType(activeType === 'pharmacy' ? 'all' : 'pharmacy')}
          className={`rounded-2xl p-5 text-left transition-all shadow-sm active:scale-[0.97] ${
            activeType === 'pharmacy'
              ? 'bg-[#0D7377] text-white shadow-lg ring-2 ring-[#0D7377]/30'
              : 'bg-gradient-to-br from-teal-50 to-teal-100 text-teal-800'
          }`}
        >
          <span className="text-3xl block mb-2">{'\u{1F48A}'}</span>
          <span className="font-bold text-lg block">Pharmacy</span>
          <span className={`text-xs ${activeType === 'pharmacy' ? 'text-teal-100' : 'text-teal-600'}`}>
            Medicine & Health
          </span>
        </button>

        <button
          onClick={() => setActiveType(activeType === 'liquor' ? 'all' : 'liquor')}
          className={`rounded-2xl p-5 text-left transition-all shadow-sm active:scale-[0.97] ${
            activeType === 'liquor'
              ? 'bg-[#D4A843] text-white shadow-lg ring-2 ring-[#D4A843]/30'
              : 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-800'
          }`}
        >
          <span className="text-3xl block mb-2">{'\u{1F377}'}</span>
          <span className="font-bold text-lg block">Liquor</span>
          <span className={`text-xs ${activeType === 'liquor' ? 'text-amber-100' : 'text-amber-600'}`}>
            Wine, Beer & Spirits
          </span>
        </button>
      </div>

      {/* Categories Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-800 text-lg">
          {activeType === 'all'
            ? 'All Categories'
            : activeType === 'pharmacy'
            ? 'Pharmacy Categories'
            : 'Liquor Categories'}
        </h2>
        {activeType !== 'all' && (
          <button
            onClick={() => setActiveType('all')}
            className="text-sm text-[#0D7377] font-medium"
          >
            Show All
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-12 text-gray-400">
          <div className="w-8 h-8 border-3 border-[#0D7377] border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-sm">Loading categories...</span>
        </div>
      )}

      {/* Categories Grid */}
      {!loading && filteredCategories.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <span className="text-4xl block mb-2">{'\u{1F4E6}'}</span>
          <p className="text-sm">No categories found</p>
        </div>
      )}

      {!loading && filteredCategories.length > 0 && (
        <div className="space-y-3">
          {filteredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="block rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shrink-0 ${
                    category.type === 'pharmacy'
                      ? 'bg-[#0D7377]'
                      : 'bg-[#D4A843]'
                  }`}
                >
                  {category.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        category.type === 'pharmacy'
                          ? 'bg-teal-50 text-[#0D7377]'
                          : 'bg-amber-50 text-[#D4A843]'
                      }`}
                    >
                      {category.type === 'pharmacy' ? 'Pharmacy' : 'Liquor'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {category.product_count} product{category.product_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-300 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
