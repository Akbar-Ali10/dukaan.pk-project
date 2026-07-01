'use client'

import { ProductCard } from './ProductCard'
import type { ProductStatus } from './ProductCard'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  status: ProductStatus
  stock: number
  vendor_id?: string | null
}

interface ProductGridProps {
  products: Product[]
  isLoading: boolean
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden border border-gray-200 animate-pulse">
            <div className="aspect-square bg-gray-300" />
            <div className="p-4 flex flex-col gap-3">
              <div className="h-4 bg-gray-300 rounded w-3/4" />
              <div className="h-4 bg-gray-300 rounded w-1/2" />
              <div className="h-11 bg-gray-300 rounded w-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-500 text-lg font-medium mb-2">No products found</p>
        <p className="text-gray-400 text-sm">Try a different category or search term</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          image={product.image}
          status={product.status}
          stock={product.stock}
          vendor_id={product.vendor_id || null}
        />
      ))}
    </div>
  )
}