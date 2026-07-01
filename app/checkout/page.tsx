'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, AlertCircle, Loader2, ShoppingCart, User, Phone, MapPin, Building2, ShieldCheck, ArrowLeft, CreditCard } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { supabase } from '@/lib/supabase'

interface FormData {
  fullName: string
  whatsappNumber: string
  city: string
  deliveryAddress: string
}

export default function CartCheckout() {
  const { cart: cartItems, addToCart, removeFromCart, clearCart } = useCart()
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    whatsappNumber: '',
    city: '',
    deliveryAddress: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = cartItems.length > 0 ? 250 : 0
  const total = subtotal + shipping

  const updateQuantity = (id: string, delta: number) => {
    const item = cartItems.find((i) => i.id === id)
    if (!item) return
    if (delta === -1 && item.quantity === 1) {
      removeFromCart(id)
    } else {
      addToCart(item, delta)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const isFormValid =
    formData.fullName.trim() &&
    formData.whatsappNumber.trim() &&
    formData.city.trim() &&
    formData.deliveryAddress.trim() &&
    cartItems.length > 0

  const handleConfirmOrder = async () => {
    if (!isFormValid || isSubmitting) return
    setIsSubmitting(true)
    setErrorMsg(null)

    let createdOrderId: string | null = null

    try {
      const randomOrderNumber = `DKN-${Math.floor(100000 + Math.random() * 900000)}`

      // Step 1: Order insert
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: randomOrderNumber,
          customer_name: formData.fullName,
          customer_phone: formData.whatsappNumber,
          customer_city: formData.city,
          city: formData.city,
          delivery_address: formData.deliveryAddress,
          shipping_address: formData.deliveryAddress,
          subtotal,
          total,
          total_amount: total,
          payment_method: 'cod',
          status: 'received'
        }])
        .select()
        .single()

      if (orderError) throw orderError
      createdOrderId = orderData.id

      // Step 2: Database se vendor_id fetch karo
      const productIds = cartItems.map(item => item.id)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, vendor_id')
        .in('id', productIds)

      if (productsError) throw productsError

      const vendorMap = new Map<string, string>(
        (productsData || []).map((p: any) => [p.id, p.vendor_id])
      )

      // Step 3: Order items insert with correct vendor_id
      const orderItemsToInsert = cartItems.map((item: any) => ({
        order_id: createdOrderId,
        product_id: item.id,
        product_name: item.name || 'Unnamed Product',
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        vendor_id: vendorMap.get(item.id) || null
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert)

      if (itemsError) {
        if (createdOrderId) {
          await supabase.from('orders').delete().eq('id', createdOrderId)
        }
        throw new Error(`Order items error: ${itemsError.message}`)
      }

      clearCart()
      router.push(`/order-confirmed?id=${createdOrderId}`)

    } catch (err: any) {
      console.error('Order error:', err)
      setErrorMsg(err.message || 'Order submit karne mein masla aya. Dobara try karein.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-800 antialiased font-sans">
      {/* Premium Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#1D4ED8] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Shop
          </button>
          <div className="text-center">
            <h1 className="text-xl font-black text-[#1D4ED8] tracking-tight">dukaan.pk</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Premium Checkout Endpoint</p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Secured
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-xs font-semibold flex items-center gap-2 max-w-4xl mx-auto shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dynamic 2-Column Split Mesh Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto">
          
          {/* LEFT PANEL: Form Inputs Stream (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery Form Container */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <User className="w-4 h-4 text-[#1D4ED8]" /> Delivery Information
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Please fill your shipping metrics accurately for smooth courier routing.</p>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="text" 
                      name="fullName" 
                      required
                      disabled={isSubmitting}
                      value={formData.fullName} 
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs outline-none font-medium bg-slate-50/40 disabled:bg-slate-100 transition-all text-slate-800 placeholder:text-slate-400" 
                    />
                  </div>
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Active WhatsApp Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="tel" 
                      name="whatsappNumber" 
                      required
                      disabled={isSubmitting}
                      value={formData.whatsappNumber} 
                      onChange={handleInputChange}
                      placeholder="03XXXXXXXXX (11 Digits)"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs outline-none font-mono disabled:bg-slate-100 transition-all text-slate-800 placeholder:text-slate-400" 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    Rider order confirmation aur tracking details ke liye is number par rabta karega.
                  </p>
                </div>

                {/* City Selection */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">City *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <select 
                      name="city" 
                      disabled={isSubmitting}
                      value={formData.city} 
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs outline-none bg-white font-medium cursor-pointer disabled:bg-slate-100 transition-all text-slate-800"
                    >
                      <option value="">Select your city</option>
                      <option value="karachi">Karachi</option>
                      <option value="lahore">Lahore</option>
                      <option value="islamabad">Islamabad</option>
                      <option value="rawalpindi">Rawalpindi</option>
                      <option value="faisalabad">Faisalabad</option>
                      <option value="multan">Multan</option>
                      <option value="hyderabad">Hyderabad</option>
                      <option value="peshawar">Peshawar</option>
                      <option value="quetta">Quetta</option>
                      <option value="other">Other City</option>
                    </select>
                  </div>
                </div>

                {/* Full Delivery Address */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Full Delivery Address *</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <textarea 
                      name="deliveryAddress" 
                      required
                      disabled={isSubmitting}
                      value={formData.deliveryAddress} 
                      onChange={handleInputChange}
                      placeholder="Ghar/Apartment no, Gali, Area Block aur mashhoor landmark details..."
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs outline-none font-medium bg-slate-50/40 disabled:bg-slate-100 transition-all text-slate-800 placeholder:text-slate-400 resize-none leading-relaxed" 
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Method Container */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-4">
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#1D4ED8]" /> Payment Strategy
              </h2>
              
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                  💰 Cash on Delivery (COD) Enabled
                </p>
                <p className="text-[11px] text-amber-800 mt-1 font-medium leading-relaxed">
                  Aap ko koi advance payment karne ki zaroorat nahi. Parcel pohnchne par rider ko paise pay karein.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-[#1D4ED8] rounded-xl bg-blue-50/40 shadow-sm">
                <div className="flex items-center gap-3">
                  <input type="radio" checked readOnly className="w-4 h-4 text-[#1D4ED8] accent-[#1D4ED8]" />
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">Cash on Delivery (COD)</span>
                </div>
                <span className="text-[9px] bg-blue-100 text-[#1D4ED8] font-black px-2 py-0.5 rounded uppercase tracking-wider">Zero Risk</span>
              </div>
            </section>
          </div>

          {/* RIGHT PANEL: Sticky Order Review Stream (5 Columns) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            
            <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#1D4ED8]" /> Order Summary
                </h2>
                <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {cartItems.length} Items
                </span>
              </div>

              {/* Cart Items Feed Container */}
              {cartItems.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400">Aapka cart khali hai.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[36vh] overflow-y-auto pr-1 mb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-3 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 relative group">
                      <div className="flex-shrink-0 w-14 h-14 bg-white rounded-lg overflow-hidden border border-slate-200 relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-xs truncate pr-2">{item.name}</h3>
                        <span className="text-xs font-black text-[#1D4ED8] block mt-0.5">Rs. {item.price.toLocaleString()}</span>
                        
                        {/* Incremental Logic Node */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm mt-1.5 w-fit">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={isSubmitting}
                            className="w-5 h-5 flex items-center justify-center font-bold text-slate-500 text-xs hover:bg-slate-100 rounded disabled:opacity-50"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-xs font-bold w-6 text-center text-slate-800">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={isSubmitting}
                            className="w-5 h-5 flex items-center justify-center font-bold text-slate-500 text-xs hover:bg-slate-100 rounded disabled:opacity-50"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right h-full flex flex-col justify-between items-end">
                        <span className="text-xs font-black text-slate-800">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dynamic Ledger Pricing Metrics */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-slate-700">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Shipping Logistics:</span>
                  <span className="font-bold text-slate-700">Rs. {shipping.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-center font-bold text-slate-800">
                  <span className="text-xs font-extrabold text-slate-900">Total Payable Amount:</span>
                  <span className="text-lg font-black text-[#1D4ED8]">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Embed Direct Submit Inside Sticky Right Panel */}
              <div className="mt-4">
                <button
                  onClick={handleConfirmOrder}
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                    isFormValid && !isSubmitting
                      ? 'bg-[#16A34A] hover:bg-green-700 text-white active:scale-[0.99]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <span>Confirm Order via Cash on Delivery</span>
                  )}
                </button>
                
                {/* Form Warning Helper Labels */}
                {!isFormValid && cartItems.length === 0 && (
                  <p className="text-[10px] font-bold text-red-500 mt-2 text-center">Pehle cart mein items add karein.</p>
                )}
                {!isFormValid && cartItems.length > 0 && (
                  <p className="text-[10px] font-bold text-red-500 mt-2 text-center">Meherbani karke upar di gayi saari details fill karein.</p>
                )}
              </div>

            </section>

            {/* Sticky Security Micro Badge */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Secure Checkout Backend Endpoint Pipeline</span>
            </div>

          </div>

        </div>
      </main>
    </div>
  )
}