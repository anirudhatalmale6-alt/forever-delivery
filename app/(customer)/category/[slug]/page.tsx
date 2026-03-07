'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatLKR } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: 'pharmacy' | 'liquor';
  product_count: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  unit: string;
  image_url: string;
  category_type: 'pharmacy' | 'liquor';
  requires_prescription: number;
  is_age_restricted: number;
  stock_quantity: number;
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [slug]);

  async function fetchCategoryAndProducts() {
    setLoading(true);
    try {
      // First get all categories to find the matching slug
      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      const cats: Category[] = catData.categories || [];
      const cat = cats.find((c) => c.slug === slug);

      if (cat) {
        setCategory(cat);
        const prodRes = await fetch(`/api/products?category_id=${cat.id}`);
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }

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
      {/* Back button + title */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-lg text-gray-800 truncate">
            {category?.name || 'Category'}
          </h1>
          {category?.description && (
            <p className="text-xs text-gray-500 truncate">{category.description}</p>
          )}
        </div>
        {category && (
          <span
            className={`text-[10px] font-medium px-2 py-1 rounded-full shrink-0 ${
              category.type === 'pharmacy'
                ? 'bg-teal-50 text-[#0D7377]'
                : 'bg-amber-50 text-[#D4A843]'
            }`}
          >
            {category.type === 'pharmacy' ? 'Pharmacy' : 'Liquor'}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-16 text-gray-400">
          <div className="w-8 h-8 border-3 border-[#0D7377] border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-sm">Loading products...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && products.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <span className="text-4xl block mb-2">{'\u{1F4E6}'}</span>
          <p className="text-sm">No products in this category</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
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
                  <div
                    className={`h-28 ${bgColor} flex items-center justify-center relative`}
                  >
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
      )}
    </div>
  );
}
