'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react'

export default function OrderConfirmed() {
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    const id = 'DKN' + Math.random().toString(36).substr(2, 9).toUpperCase()
    setOrderId(id)
  }, [])

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-[#1D4ED8]">dukaan.pk</h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 flex flex-col items-center">
        {/* Success Animation */}
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-14 h-14 text-[#16A34A]" strokeWidth={1.5} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Order Confirmed! 🎉
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Shukriya! Aapka order place ho gaya hai. Jald hi WhatsApp pe confirmation aayega.
        </p>

        {/* Order ID Box */}
        <div className="w-full bg-green-50 border border-green-200 rounded-lg p-5 mb-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Aapka Order Number</p>
          <p className="text-2xl font-bold text-[#16A34A] tracking-widest">#{orderId}</p>
          <p className="text-xs text-gray-400 mt-2">Yeh number save kar lein — tracking ke liye kaam aayega</p>
        </div>

        {/* WhatsApp Preview */}
        <div className="w-full bg-[#E7FEDF] rounded-lg p-4 mb-8 border border-green-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">WA</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">dukaan.pk</p>
              <p className="text-sm text-gray-700">
                ✅ Aapka order <span className="font-bold">#{orderId}</span> confirm ho gaya!
                Delivery 2-4 working days mein hogi. Cash on Delivery pe payment karein.
              </p>
              <p className="text-xs text-gray-400 mt-1">Abhi • WhatsApp</p>
            </div>
          </div>
        </div>

        {/* COD Reminder */}
        <div className="w-full bg-[#FEF3C7] border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm font-semibold text-[#92400E] mb-1">💰 Cash on Delivery yaad rakhein</p>
          <p className="text-xs text-[#92400E]">
            Delivery agent aayega tab payment karein. Pehle se koi payment nahi karni.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <Link
            href="/track-order"
            className="w-full h-13 bg-[#1D4ED8] text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#1e40af] transition py-4"
          >
            <Package size={20} />
            Order Track Karein
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/"
            className="w-full h-13 bg-white text-[#1D4ED8] border-2 border-[#1D4ED8] rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition py-4"
          >
            <Home size={20} />
            Homepage Pe Jaayein
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1F2937] text-white py-6 mt-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            &copy; 2026 dukaan.pk. All rights reserved. | Cash on Delivery Available Nationwide
          </p>
        </div>
      </footer>
    </div>
  )
}