'use client'

import { ShoppingCart, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

export type ProductStatus = 'in-stock' | 'low-stock' | 'out-of-stock'

interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
  status: ProductStatus
  stock: number
  vendor_id?: string | null
}

export function ProductCard({ id, name, price, image, status, stock, vendor_id }: ProductCardProps) {
  const { addToCart } = useCart()
  const isOutOfStock = status === 'out-of-stock'
  const isLowStock = status === 'low-stock'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id,
      name,
      price,
      image,
      stock: stock || 10,
      vendor_id: vendor_id || null
    }, 1)
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <Link href={`/product/${id}`}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className={`object-cover w-full h-full transition-opacity ${
              isOutOfStock ? 'opacity-60' : 'opacity-100'
            }`}
            sizes="(max-width: 768px) 50vw, 33vw"
            priority={false}
          />

          {isLowStock && (
            <div className="absolute top-3 right-3">
              <div className="animate-pulse-ring">
                <div className="px-3 py-1.5 bg-[#D97706] text-white text-xs font-semibold rounded-full flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  Low Stock
                </div>
              </div>
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <p className="text-white font-semibold text-sm">Out of Stock</p>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col">
        <Link href={`/product/${id}`}>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 hover:text-[#1D4ED8] transition-colors">
            {name}
          </h3>
        </Link>

        <div className="mb-3">
          <p className={`font-bold text-lg ${
            status === 'in-stock' ? 'text-[#1D4ED8]' : 'text-gray-500'
          }`}>
            Rs. {price.toLocaleString()}
          </p>
          {stock > 0 && stock <= 10 && isLowStock && (
            <p className="text-xs text-[#D97706] font-medium mt-1">
              Only {stock} left
            </p>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-11 ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : status === 'in-stock'
                ? 'bg-[#1D4ED8] text-white hover:bg-[#1e40af] focus:ring-[#1D4ED8]'
                : 'bg-[#FDB022] text-white hover:bg-[#f59e0b] focus:ring-[#FDB022]'
          }`}
        >
          <ShoppingCart size={18} />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}