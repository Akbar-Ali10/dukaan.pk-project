'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import { CategoryFilter } from '@/components/CategoryFilter'
import { SortDropdown } from '@/components/SortDropdown'
import { ProductGrid } from '@/components/ProductGrid'
import WhatsAppFAB from '@/components/WhatsAppFAB'
import { supabase } from '@/lib/supabase'
import type { ProductStatus } from '@/components/ProductCard'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  status: ProductStatus
  stock: number
  vendor_id: string | null
}

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Solar']

function ProductsContent() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  const [activeCategory, setActiveCategory] = useState('All')
  const [sortOption, setSortOption] = useState('newest')
  const [isLoading, setIsLoading] = useState(true)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'inactive')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Products fetch error:', error)
        setIsLoading(false)
        return
      }

      const mapped: Product[] = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image_url || '',
        category: p.category || 'Electronics',
        status:
          p.status === 'out_of_stock'
            ? 'out-of-stock'
            : p.stock <= 4
            ? 'low-stock'
            : 'in-stock',
        stock: p.stock,
        vendor_id: p.vendor_id || null,
      }))

      setAllProducts(mapped)
      setIsLoading(false)
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    let products = [...allProducts]

    // Search Filter
    if (searchQuery.trim()) {
      products = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category Filter
    if (activeCategory !== 'All') {
      products = products.filter(
        (p) => p.category === activeCategory
      )
    }

    // Sorting
    if (sortOption === 'price-low') {
      products.sort((a, b) => a.price - b.price)
    } else if (sortOption === 'price-high') {
      products.sort((a, b) => b.price - a.price)
    }

    setFilteredProducts(products)
  }, [allProducts, activeCategory, sortOption, searchQuery])

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />

      <CategoryFilter
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {searchQuery
                ? `"${searchQuery}" ke results`
                : 'Products'}
            </h1>

            <p className="text-gray-600 text-sm mt-1">
              {isLoading
                ? 'Dhundh raha hai...'
                : `${filteredProducts.length} products mile`}
            </p>
          </div>

          <SortDropdown
            sortOption={sortOption}
            onSortChange={setSortOption}
          />
        </div>

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Koi product nahi mila
            </h3>
            <p className="text-gray-500 text-sm">
              Dusra keyword try karein
            </p>
          </div>
        )}

        <ProductGrid
          products={filteredProducts}
          isLoading={isLoading}
        />
      </main>

      <footer className="bg-[#1F2937] text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-[#1D4ED8] mb-4">
                dukaan.pk
              </h3>
              <p className="text-gray-400">
                Pakistan&apos;s fastest growing e-commerce platform
                with 100% Cash on Delivery
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Help</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Shipping
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <p className="text-center text-gray-400">
              &copy; 2026 dukaan.pk. All rights reserved. |
              Cash on Delivery Available Nationwide
            </p>
          </div>
        </div>
      </footer>

      <WhatsAppFAB />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading products...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  )
}
export const dynamic = 'force-dynamic'