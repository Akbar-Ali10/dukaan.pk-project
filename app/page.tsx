'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import TrustBar from '@/components/TrustBar'
import { ProductGrid } from '@/components/ProductGrid'
import WhatsAppFAB from '@/components/WhatsAppFAB'
import { supabase } from '@/lib/supabase'
import type { ProductStatus } from '@/components/ProductCard'
import { Flame, Star, Sparkles, Smartphone, Shirt, Home as HomeIcon, Heart, Trophy, Gift, ArrowRight, ShoppingCart, X, User, Phone, MapPin, CheckCircle, ArrowLeft, Trash2, Info, Link2, HelpCircle, ShieldAlert, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  status: ProductStatus
  stock: number
  vendor_id: string
  description?: string
}

interface CartItem extends Product {
  quantity: number
}

export default function Home() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // 🛒 Shopping Cart States
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [orderPlacing, setOrderPlacing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [lastOrderNumber, setLastOrderNumber] = useState('')

  const productsSectionRef = useRef<HTMLDivElement>(null)

  const scrollToProducts = () => {
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 📦 Fetch Products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)

      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .gt('stock', 0)
        .order('created_at', { ascending: false })

      if (selectedCategory) {
        query = query.eq('category', selectedCategory)
      } else {
        query = query.limit(12)
      }

      const { data, error } = await query

      if (error) {
        console.error('Homepage products fetch error:', error)
        setIsLoading(false)
        return
      }

      const mapped: Product[] = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image_url || '',
        category: p.category || 'Electronics',
        status: p.status === 'out_of_stock'
          ? 'out-of-stock'
          : p.stock <= 4
          ? 'low-stock'
          : 'in-stock',
        stock: p.stock,
        vendor_id: p.vendor_id,
        description: p.description || ''
      }))

      setProducts(mapped)
      setIsLoading(false)
    }

    fetchProducts()
  }, [selectedCategory])

  const updateQuantity = (id: string, amount: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + amount
            if (nextQty > item.stock) {
              alert('Stock ki limit khatam ho chuki hai.')
              return item
            }
            return { ...item, quantity: nextQty }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    )
  }

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  // 📝 Order Placement Pipeline
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return alert('Aapka cart khali hai!')
    if (!customerName || !customerPhone || !shippingAddress) return alert('Form mukammal fill karein!')

    try {
      setOrderPlacing(true)
      const orderNumber = `DKN-${Math.floor(100000 + Math.random() * 900000)}`
      const cartTotal = getCartTotal()

      const { data: orderRow, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            order_number: orderNumber,
            customer_name: customerName,
            customer_phone: customerPhone,
            shipping_address: shippingAddress,
            total: cartTotal,
            status: 'received',
            payment_method: 'COD'
          }
        ])
        .select()
        .single()

      if (orderError) throw orderError

      const orderItemsPayload = cart.map((item) => ({
        order_id: orderRow.id,
        product_id: item.id,
        vendor_id: item.vendor_id,
        quantity: item.quantity,
        price: item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload)

      if (itemsError) throw itemsError

      setLastOrderNumber(orderNumber)
      setOrderSuccess(true)
      setCart([])
      setCustomerName('')
      setCustomerPhone('')
      setShippingAddress('')
    } catch (err: any) {
      alert(`Order placement failed: ${err.message}`)
    } finally {
      setOrderPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased font-sans">
      <Header />
      <TrustBar />

      {/* Floating Mini-Cart Button */}
      {cart.length > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-24 right-6 z-50 bg-[#1D4ED8] hover:bg-blue-700 text-white px-5 py-4 rounded-full shadow-2xl flex items-center gap-2 transition-all active:scale-95"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-bold text-sm">View Cart</span>
          <span className="bg-white text-[#1D4ED8] font-black text-xs px-2 py-0.5 rounded-full ml-1">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </button>
      )}
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-gradient-to-r from-[#1D4ED8] to-blue-800 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-sm min-h-[240px] flex flex-col justify-center text-left">
          <div className="max-w-xl space-y-4 z-10">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Welcome to dukaann.pk</h1>
            <p className="text-sm md:text-base text-blue-100 font-medium">Discover amazing products with instant Cash on Delivery across Pakistan</p>
            <button 
              onClick={scrollToProducts} 
              className="mt-2 bg-white text-[#1D4ED8] hover:bg-blue-50 font-extrabold text-sm px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-white/10 skew-x-12 translate-x-16 hidden md:block" />
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Categories Grid */}
        <section className="mb-10 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-[#1D4ED8] rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Shop by Category</h2>
            </div>
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)} 
                className="text-xs font-bold text-red-500 hover:underline"
              >
                Clear Filter [x]
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {[
              { label: 'Mobiles', value: 'Mobiles', icon: Smartphone, color: 'bg-amber-50 text-amber-600 border-amber-100' },
              { label: 'Fashion', value: 'Fashion', icon: Shirt, color: 'bg-green-50 text-green-600 border-green-100' },
              { label: 'Home Decor', value: 'Home Decor', icon: HomeIcon, color: 'bg-purple-50 text-purple-600 border-purple-100' },
              { label: 'Beauty', value: 'Beauty', icon: Heart, color: 'bg-pink-50 text-pink-600 border-pink-100' },
              { label: 'Sports', value: 'Sports', icon: Trophy, color: 'bg-blue-50 text-blue-600 border-blue-100' },
              { label: 'Offers', value: 'General', icon: Gift, color: 'bg-red-50 text-red-600 border-red-100' },
            ].map((cat, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                  setSelectedCategory(cat.value)
                  scrollToProducts()
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer group text-center ${
                  selectedCategory === cat.value 
                    ? 'bg-blue-50 border-blue-400 shadow-sm' 
                    : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-blue-200'
                }`}
              >
                <div className={`p-3 rounded-xl mb-2 border ${cat.color} group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-700 group-hover:text-[#1D4ED8] transition-colors">
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Flash Sale Banner */}
        <div className="bg-gradient-to-r from-red-500 to-amber-500 rounded-2xl p-4 sm:p-6 text-white mb-10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl animate-pulse">
              <Flame className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">Bachat Offer & Flash Deals</h3>
              <p className="text-xs text-white/90">Click on any category above to instant filter products feed dynamically!</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-black/20 px-4 py-1.5 rounded-full font-mono font-bold text-xs border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
            LIVE NOW
          </div>
        </div>

        {/* Product Grid Section */}
        <section ref={productsSectionRef} className="space-y-6 scroll-mt-24 mb-24">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {selectedCategory ? `${selectedCategory} Items` : 'Trending Items Nationwide'}
              </h2>
            </div>
            <span className="text-xs font-bold text-[#1D4ED8] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {products.length} Products Found
            </span>
          </div>
          
          <div className="min-h-[400px]">
            <ProductGrid products={products} isLoading={isLoading} />
          </div>
        </section>

      </main>

      {/* 🛒 PREVENTIVE FULL SCREEN POLISHED CHECKOUT MODAL OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex justify-center items-center overflow-y-auto p-2 sm:p-4 animate-fadeIn">
          <div className="bg-[#F8FAFC] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100">
            
            {/* Modal Navigation Top Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between px-6">
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                Continue Shopping
              </button>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                Dukan.pk Premium Checkout
              </span>
              <button onClick={() => setIsCartOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Modal Layout Segment */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {orderSuccess ? (
                <div className="text-center py-16 max-w-md mx-auto space-y-4 bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 mt-6">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900">Mubarak Ho! Order Place Ho Gaya.</h4>
                  <p className="text-xs text-slate-600 font-medium">Aapka automatic logistics order tracking number yeh hai:</p>
                  <div className="p-3 bg-slate-50 rounded-xl font-mono text-base font-bold border border-emerald-200 text-blue-600 tracking-wider w-fit mx-auto">
                    {lastOrderNumber}
                  </div>
                  <p className="text-xs text-slate-400">Humare verified vendors jald hi aapse call par rabta karenge.</p>
                  <button 
                    onClick={() => { setOrderSuccess(false); setIsCartOpen(false); }} 
                    className="mt-4 w-full py-3 bg-[#1D4ED8] text-white text-xs font-bold rounded-xl tracking-wider uppercase shadow-md hover:bg-blue-700"
                  >
                    Shop More Products
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto mt-6">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <div className="text-slate-500 font-bold text-sm">Aapka shopping cart khali hai.</div>
                  <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto">Website se trending items cart mein add karke order confirm karein.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Cart Review Stream (5 Columns) */}
                  <div className="lg:col-span-5 space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2">Order Summary ({cart.length} Items)</span>
                    
                    <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-3 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 relative group">
                          <img src={item.image || '/placeholder.png'} className="w-14 h-14 object-cover rounded-lg border bg-white flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-slate-900 text-xs truncate pr-4">{item.name}</h5>
                            <span className="text-xs font-black text-blue-600 block mt-0.5">Rs. {item.price.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Qty: {item.quantity}</span>
                          </div>
                          
                          <div className="flex flex-col items-end justify-between h-full gap-2">
                            <button 
                              onClick={() => updateQuantity(item.id, -item.quantity)}
                              className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                              <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 flex items-center justify-center font-bold text-slate-500 text-xs hover:bg-slate-100 rounded">-</button>
                              <span className="font-mono text-xs font-bold w-5 text-center text-slate-800">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 flex items-center justify-center font-bold text-slate-500 text-xs hover:bg-slate-100 rounded">+</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cost Calculations Layer */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4 space-y-2">
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Subtotal Price:</span>
                        <span className="font-bold text-slate-700">Rs. {getCartTotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Shipping Logistics:</span>
                        <span className="text-emerald-600 font-bold">FREE DELIVERY</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800 pt-2 border-t border-dashed border-slate-200">
                        <span>Total Bill Amount:</span>
                        <span className="text-base font-black text-[#1D4ED8]">Rs. {getCartTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Premium Form Stream (7 Columns) */}
                  <div className="lg:col-span-7 bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 block">Customer Information</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">Please provide your valid address details for instant cash on delivery dispatch.</p>
                      </div>

                      <div className="space-y-3.5">
                        {/* Name Input */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 block">Full Name *</label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <input 
                              type="text" 
                              required 
                              placeholder="Aapka Poora Naam likhein"
                              value={customerName} 
                              onChange={(e) => setCustomerName(e.target.value)}
                              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs outline-none font-medium bg-slate-50/30 transition-all placeholder:text-slate-400 text-slate-800" 
                            />
                          </div>
                        </div>

                        {/* Phone Input */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 block">Mobile Number *</label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <input 
                              type="tel" 
                              required 
                              placeholder="03xxxxxxxxX (11 digits Mobile Number)"
                              value={customerPhone} 
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs outline-none font-mono transition-all placeholder:text-slate-400 text-slate-800" 
                            />
                          </div>
                        </div>

                        {/* Address Textarea */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 block">Complete Shipping Address *</label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <textarea 
                              required 
                              rows={3} 
                              placeholder="Ghar ka address, Gali, Block, Shehar ka naam mukammal tafseel se likhein *"
                              value={shippingAddress} 
                              onChange={(e) => setShippingAddress(e.target.value)}
                              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs outline-none font-medium bg-slate-50/30 transition-all placeholder:text-slate-400 text-slate-800 resize-none leading-relaxed" 
                            />
                          </div>
                        </div>

                        {/* Payment Selection State Box */}
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input type="radio" checked readOnly className="w-3.5 h-3.5 text-blue-600 accent-blue-600" />
                            <span className="text-xs font-bold text-slate-700">Cash on Delivery (COD)</span>
                          </div>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-md uppercase">100% Trusted</span>
                        </div>
                      </div>

                      {/* Action Submission Buttons */}
                      <div className="pt-2">
                        <button 
                          type="submit" 
                          disabled={orderPlacing}
                          className="w-full py-3.5 bg-[#1D4ED8] hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                        >
                          {orderPlacing ? 'Processing Order Securely...' : 'Confirm Order via Cash on Delivery'}
                        </button>
                        <p className="text-[10px] text-center text-slate-400 mt-2">By clicking confirm you agree to accept delivery packages across Pakistan.</p>
                      </div>
                    </form>
                  </div>

                </div>
              )}
            </div>
            
            {/* Modal Bottom Sticky Micro Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400 font-medium">
              🔒 256-Bit SSL Encrypted Endpoint Logistics Pipeline — Dukaan.pk
            </div>

          </div>
        </div>
      )}

      {/* Corporate Solid Modern Footer (Premium Redesigned Layout) */}
      <footer className="bg-[#1F2937] text-white mt-24 py-12 border-t-4 border-[#1D4ED8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-left">
            <div className="space-y-3">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                <Info className="w-5 h-5 text-[#1D4ED8]" /> dukaan.pk
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Pakistan&apos;s fastest growing premium e-commerce network with 100% verified digital vendors and lightning fast Cash on Delivery logistics.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-200 mb-3 border-b border-gray-700 pb-1.5 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-[#1D4ED8]" /> Quick Links
              </h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="#" className="hover:text-[#1D4ED8] block transition-all">About Us</Link></li>
                <li><Link href="#" className="hover:text-[#1D4ED8] block transition-all">Contact Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-200 mb-3 border-b border-gray-700 pb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#1D4ED8]" /> Help Desk
              </h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="#" className="hover:text-[#1D4ED8] block transition-all">Track Order FAQ</Link></li>
                <li><Link href="#" className="hover:text-[#1D4ED8] block transition-all">Easy Returns</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-200 mb-3 border-b border-gray-700 pb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#1D4ED8]" /> Legal Docs
              </h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="#" className="hover:text-[#1D4ED8] block transition-all">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>&copy; 2026 dukaan.pk. All rights reserved.</p>
            <p className="bg-gray-800 px-3 py-1 rounded-md text-gray-400 font-medium flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-500" /> ⚡ Optimized for Pakistani 4G Mobile Connections
            </p>
          </div>
        </div>
      </footer>

      <WhatsAppFAB />
    </div>
  )
}