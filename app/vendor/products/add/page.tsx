'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, PlusCircle, Package, Tag, DollarSign, Layers } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AddProduct() {
  const router = useRouter()
  
  // Form States fields ke mutabik
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [stock, setStock] = useState('')
  const [category, setCategory] = useState('Electronics') // Default value jo table mein hai
  const [imageUrl, setImageUrl] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Name se slug banane ka function (e.g. "Mobile Phone" -> "mobile-phone")
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-') // collapse dashes
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    // Validation
    if (!name || !price || !stock) {
      setMessage({ type: 'error', text: 'Please fill out Name, Price, and Stock fields!' })
      setIsSubmitting(false)
      return
    }

    try {
      const productSlug = generateSlug(name)

      // Supabase products table mein insert query
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name,
            slug: productSlug,
            description: description || null,
            price: parseFloat(price),
            compare_price: comparePrice ? parseFloat(comparePrice) : null,
            stock: parseInt(stock),
            category,
            image_url: imageUrl || null,
            status: 'active',
            is_featured: false
          }
        ])

      if (error) throw error

      setMessage({ type: 'success', text: 'Product added successfully into dukaan.pk!' })
      
      // Form fields clear karne ke liye
      setName('')
      setDescription('')
      setPrice('')
      setComparePrice('')
      setStock('')
      setImageUrl('')

      // 2 second baad wapas dashboard par redirect karne ke liye
      setTimeout(() => {
        router.push('/vendor/dashboard')
      }, 2000)

    } catch (err: any) {
      console.error(err)
      setMessage({ type: 'error', text: err.message || 'Something went wrong while adding product.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => router.push('/vendor/dashboard')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm mb-6 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-[#1D4ED8]">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-sm text-gray-500">List a new item on your storefront</p>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 border font-medium text-sm ${
            message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? '✅ ' : '⚠️ '} {message.text}
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-gray-400" /> Product Title / Name *
              </label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wireless Bluetooth Earbuds"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Description</label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write features, specifications, or details about the product..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Pricing Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-gray-400" /> Selling Price (Rs.) *
                </label>
                <input 
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-gray-400" /> Compare Price / Old Price (Rs.)
                </label>
                <input 
                  type="number"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="e.g. 3500 (Optional cut price)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Stock & Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-gray-400" /> Stock Quantity *
                </label>
                <input 
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Home Decor">Home Decor</option>
                </select>
              </div>
            </div>

            {/* Image URL input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Image URL</label>
              <input 
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/product-image.jpg"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 rounded-lg font-bold text-white bg-[#1D4ED8] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed ml-auto"
              >
                <PlusCircle className="w-5 h-5" />
                {isSubmitting ? 'Adding Product...' : 'Publish Product Live'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}