'use client'

import { useState, useEffect } from 'react'
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

export default function ProductsClient() {
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
        console.error(error)
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

    if (searchQuery.trim()) {
      products = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (activeCategory !== 'All') {
      products = products.filter(
        (p) => p.category === activeCategory
      )
    }

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
                : "Products"}
            </h1>

            <p className="text-gray-600 text-sm mt-1">
              {isLoading
                ? "Dhundh raha hai..."
                : `${filteredProducts.length} products mile`}
            </p>
          </div>

          <SortDropdown
            sortOption={sortOption}
            onSortChange={setSortOption}
          />

        </div>

        <ProductGrid
          products={filteredProducts}
          isLoading={isLoading}
        />

      </main>

      <WhatsAppFAB />
    </div>
  )
}