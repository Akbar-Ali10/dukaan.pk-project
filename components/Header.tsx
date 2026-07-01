'use client'

import { useState, useEffect } from 'react' // ✅ useEffect add kiya safeguard ke liye
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

export default function Header() {
  const { getCartCount } = useCart()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false) // 🔥 SSR Hydration guard flag

  // ✅ Ensure components render sync seamlessly inside browser window runtime
  useEffect(() => {
    setMounted(true)
  }, [])

  const cartCount = getCartCount()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e as unknown as React.FormEvent)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-[#1D4ED8]">dukaan.pk</h1>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Products search karein..."
                className="w-full px-4 py-2 pr-10 border border-[#E5E7EB] rounded-lg bg-white text-sm focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:text-[#1D4ED8] transition"
              >
                <Search className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>
          </form>

          {/* Cart Icon */}
          <Link href="/cart" className="relative flex items-center cursor-pointer">
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-[#1F2937] hover:text-[#1D4ED8] transition" />
              {/* 🔥 Safeguard: Only show badge when browser mounts, avoiding HTML mismatch */}
              {mounted && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>

        </div>

        {/* Search Bar - Mobile */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Products search karein..."
              className="w-full px-4 py-2 pr-10 border border-[#E5E7EB] rounded-lg bg-white text-sm focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
            >
              <Search className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>
        </form>

      </div>
    </header>
  )
}