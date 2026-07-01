'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Package, CheckCircle2, Truck, Home, Clock, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type OrderStatus = 'received' | 'confirmed' | 'dispatched' | 'delivered'

interface TrackingStep {
  id: OrderStatus
  label: string
  description: string
  icon: React.ReactNode
}

const steps: TrackingStep[] = [
  {
    id: 'received',
    label: 'Order Received',
    description: 'Aapka order humein mil gaya hai',
    icon: <Clock className="w-5 h-5" />,
  },
  {
    id: 'confirmed',
    label: 'Order Confirmed',
    description: 'Order confirm ho gaya, tayyari ho rahi hai',
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    id: 'dispatched',
    label: 'Dispatched',
    description: 'Order courier ko de diya gaya',
    icon: <Truck className="w-5 h-5" />,
  },
  {
    id: 'delivered',
    label: 'Delivered',
    description: 'Order aapke paas pohonch gaya!',
    icon: <Home className="w-5 h-5" />,
  },
]

const statusOrder: OrderStatus[] = ['received', 'confirmed', 'dispatched', 'delivered']

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [orderData, setOrderData] = useState<{ status: OrderStatus; items: string[] } | null>(null)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  
  // Dynamic testing details state
  const [latestTestOrder, setLatestTestOrder] = useState<{ num: string; phone: string } | null>(null)

  // Fetch the absolute latest order automatically for the testing box
  useEffect(() => {
    async function fetchLatestOrder() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('order_number, customer_phone')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (data && data.order_number) {
          setLatestTestOrder({
            num: data.order_number,
            phone: data.customer_phone || '03710238382'
          })
        }
      } catch (err) {
        console.error('Error fetching latest test order:', err)
      }
    }
    fetchLatestOrder()
  }, [])

  // Helper function to normalize numbers (strips leading 0s, 92, and special chars)
  const normalizePhoneNumber = (numStr: string) => {
    if (!numStr) return ''
    let cleaned = numStr.toString().replace(/\D/g, '') // sirf numbers rakhein
    cleaned = cleaned.replace(/^0+/, '') // starting zeros khatam
    cleaned = cleaned.replace(/^92+/, '') // country code bypass
    return cleaned
  }

  const handleTrack = async () => {
    if (!orderId.trim() || !phone.trim()) return

    setIsLoading(true)
    setError('')
    setOrderData(null)
    setSearched(false)

    const cleanId = orderId.replace('#', '').trim()
    const cleanPhone = phone.trim()

    try {
      let matchedOrder = null

      // Check via Order Number
      const { data: dataByNum } = await supabase
        .from('orders')
        .select('id, status, order_number, customer_phone')
        .eq('order_number', cleanId)
        .maybeSingle()

      if (dataByNum) {
        matchedOrder = dataByNum
      } else {
        // Fallback to UUID matching if applicable
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(cleanId)
        if (isUuid) {
          const { data: dataById } = await supabase
            .from('orders')
            .select('id, status, order_number, customer_phone')
            .eq('id', cleanId)
            .maybeSingle()
          
          if (dataById) matchedOrder = dataById
        }
      }

      if (!matchedOrder) {
        setError('Order ID database mein nahi mili. Sahi details enter karein.')
        setIsLoading(false)
        setSearched(true)
        return
      }

      // Robust Phone Verification Matching Logical Flow
      const dbPhoneClean = normalizePhoneNumber(matchedOrder.customer_phone)
      const inputPhoneClean = normalizePhoneNumber(cleanPhone)

      if (dbPhoneClean !== inputPhoneClean && dbPhoneClean !== '' && inputPhoneClean !== '') {
        setError('Phone Number matched nahi hua. Sahi WhatsApp Number enter karein.')
        setIsLoading(false)
        setSearched(true)
        return
      }

      // Fetch corresponding items
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('product_name')
        .eq('order_id', matchedOrder.id)

      const productNames = itemsData && itemsData.length > 0 
        ? itemsData.map((item: any) => item.product_name)
        : ['Dukaan Hub Product']

      setOrderData({
        status: (matchedOrder.status || 'received') as OrderStatus,
        items: productNames
      })

    } catch (err) {
      console.error(err)
      setError('Database connectivity issue. Dobara koshish karein.')
    }

    setSearched(true)
    setIsLoading(false)
  }

  const currentStatusIndex = orderData ? statusOrder.indexOf(orderData.status) : -1

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[#1D4ED8]">dukaan.pk</h1>
            <p className="text-xs text-gray-500">Order Tracking Panel</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-[#1D4ED8]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Order Track Karein</h2>
              <p className="text-sm text-gray-500">Order ID aur apna WhatsApp phone number enter karein</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Ex: DKN8PD72EM76"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] text-gray-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 03710238382"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] text-gray-900 font-mono"
              />
            </div>

            <button
              onClick={handleTrack}
              disabled={!orderId.trim() || !phone.trim() || isLoading}
              className={`w-full py-4 rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-all ${
                orderId.trim() && phone.trim()
                  ? 'bg-[#1D4ED8] text-white hover:bg-[#1e40af] active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Dhundh raha hai...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Order Track Karein
                </>
              )}
            </button>
          </div>

          {/* 🔄 AUTOMATIC DYNAMIC TESTING BOX */}
          <div className="mt-5 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-[#1D4ED8] font-bold">💡 Latest Order Details (Auto-Fetched):</p>
            <div className="text-xs text-gray-600 mt-2 space-y-1 bg-white p-2.5 rounded border border-blue-50 font-mono">
              {latestTestOrder ? (
                <div>• <strong className="text-gray-900">{latestTestOrder.num}</strong> + {latestTestOrder.phone}</div>
              ) : (
                <div className="animate-pulse text-gray-400">Latest checkout order dhundh raha hai...</div>
              )}
            </div>
          </div>
        </section>

        {/* Error Alert Display */}
        {searched && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-500 font-bold text-sm">!</span>
            </div>
            <div>
              <p className="font-semibold text-red-800 text-sm">Order Tracking Issue</p>
              <p className="text-red-600 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Tracking Flow Output */}
        {orderData && (
          <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Order Status</h3>
              <span className="text-sm font-mono font-bold text-[#1D4ED8] bg-blue-50 px-3 py-1 rounded-full">
                #{orderId.toUpperCase().trim()}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-xs text-gray-500 mb-1">Items:</p>
              {orderData.items.map((item, i) => (
                <p key={i} className="text-sm font-semibold text-gray-800">• {item}</p>
              ))}
            </div>

            <div className="space-y-0">
              {steps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex
                const isCurrent = index === currentStatusIndex
                const isLast = index === steps.length - 1

                return (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isCompleted ? 'bg-[#16A34A] text-white' : 'bg-gray-100 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                        {step.icon}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-10 mt-1 ${index < currentStatusIndex ? 'bg-[#16A34A]' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="pb-8 flex-1">
                      <p className={`font-semibold text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                        {isCurrent && (
                          <span className="ml-2 text-xs bg-green-100 text-[#16A34A] px-2 py-0.5 rounded-full font-bold">
                            Current
                          </span>
                        )}
                      </p>
                      <p className={`text-xs mt-0.5 ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}