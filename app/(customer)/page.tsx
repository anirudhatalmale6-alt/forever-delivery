'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TYPE_CONFIG } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  product_count: number;
}

const TYPES = ['pharmacy', 'liquor', 'cosmetics', 'rations', 'snacks', 'beverages'] as const;

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string | null>(null);

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

  const filteredCategories = activeType
    ? categories.filter((c) => c.type === activeType)
    : categories;

  return (
    <div className="px-4 py-4">
      {/* Section Cards - 3x2 grid */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {TYPES.map((type) => {
          const cfg = TYPE_CONFIG[type];
          const isActive = activeType === type;
          return (
            <button
              key={type}
              onClick={() => setActiveType(isActive ? null : type)}
              className={`rounded-xl p-3 text-center transition-all shadow-sm active:scale-[0.96] ${
                isActive
                  ? `${cfg.bg} text-white shadow-lg ring-2 ring-black/10`
                  : `${cfg.bgLight} ${cfg.textLight}`
              }`}
            >
              <span className="text-2xl block mb-1">{cfg.icon}</span>
              <span className="font-bold text-xs block leading-tight">{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Categories Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-800 text-lg">
          {activeType ? TYPE_CONFIG[activeType]?.label + ' Categories' : 'All Categories'}
        </h2>
        {activeType && (
          <button
            onClick={() => setActiveType(null)}
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

      {/* Empty */}
      {!loading && filteredCategories.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <span className="text-4xl block mb-2">{'\u{1F4E6}'}</span>
          <p className="text-sm">No categories found</p>
        </div>
      )}

      {/* Categories Grid */}
      {!loading && filteredCategories.length > 0 && (
        <div className="space-y-3">
          {filteredCategories.map((category) => {
            const cfg = TYPE_CONFIG[category.type] || TYPE_CONFIG.pharmacy;
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="block rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shrink-0 ${cfg.bg}`}
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
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.bgLight} ${cfg.textLight}`}
                      >
                        {cfg.label}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
