'use client'

import { useCart } from '@/lib/cart-context'
import Header from '@/components/Header'
import TrustBar from '@/components/TrustBar'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, ShoppingCart, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartPage() {
    const { cart, addToCart, removeFromCart, getCartTotal } = useCart()
    const router = useRouter()

    const handleQuantityChange = (item: any, change: number) => {
        if (change === -1 && item.quantity === 1) {
            removeFromCart(item.id)
        } else {
            addToCart(item, change)
        }
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased font-sans">
                <Header />
                <TrustBar />
                <main className="max-w-xl mx-auto px-4 py-24 text-center flex flex-col items-center justify-center">
                    <div className="p-6 bg-blue-50/80 border border-blue-100 text-[#1D4ED8] rounded-full shadow-inner mb-6 relative">
                        <ShoppingBag className="w-16 h-16" />
                        <span className="w-3 h-3 rounded-full bg-blue-500 absolute top-4 right-4 animate-ping"></span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Aapki Cart Khali Hai!</h2>
                    <p className="text-xs text-slate-400 max-w-sm mt-2 font-medium leading-relaxed">
                        Dukaan par behtareen products dastyab hain. Abhi shopping shuru karein aur apni pasand ke items cart mein add karein.
                    </p>
                    <Link
                        href="/"
                        className="mt-8 w-full sm:w-auto bg-[#1D4ED8] text-white font-black text-xs uppercase tracking-wider px-10 py-4 rounded-xl shadow-md hover:bg-blue-700 active:scale-[0.99] transition-all"
                    >
                        Shopping Shuru Karein
                    </Link>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased font-sans pb-16">
            <Header />
            <TrustBar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Visual Header Node */}
                <div className="flex items-center justify-between mb-6 max-w-7xl mx-auto border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-[#1D4ED8]" /> Your Shopping Cart
                        </h1>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Review items before routing to checkout</p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="text-xs font-bold text-slate-600 hover:text-[#1D4ED8] flex items-center gap-1.5 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Continue Shopping
                    </button>
                </div>

                {/* Premium Split Mesh Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto">

                    {/* LEFT CONTAINER: Interactive Item Feed Rows (7 Columns) */}
                    <div className="lg:col-span-7 space-y-4">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative group transition-all hover:border-slate-300"
                            >
                                {/* High-Contrast Image Node */}
                                <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden relative shadow-inner">
                                    <img
                                        src={item.image || '/placeholder-logo.png'}
                                        alt={item.name}
                                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>

                                {/* Core Metrics Core */}
                                <div className="flex-1 min-w-0 pr-8">
                                    <h3 className="text-xs font-black text-slate-900 truncate tracking-tight mb-0.5">{item.name}</h3>
                                    <span className="text-xs font-black text-[#1D4ED8] block">Rs. {item.price.toLocaleString()}</span>

                                    {/* Incremental Logic Node */}
                                    <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg p-0.5 shadow-sm mt-3 w-fit">
                                        <button
                                            onClick={() => handleQuantityChange(item, -1)}
                                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 rounded transition-all"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="font-mono text-xs font-bold w-7 text-center text-slate-800">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item, 1)}
                                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 rounded transition-all"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Item Total & Deletion Module */}
                                <div className="flex flex-col items-end justify-between self-stretch text-right">
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-xl hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="mt-auto">
                                        <span className="text-xs font-black text-slate-900 block">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Subtotal</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT CONTAINER: Sticky Checkout Pricing Deck (5 Columns) */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                        <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col">
                            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider">
                                    Order Summary
                                </h3>
                                <span className="text-[10px] font-black bg-blue-50 text-[#1D4ED8] border border-blue-100 px-2 py-0.5 rounded-full">
                                    {cart.reduce((sum, item) => sum + item.quantity, 0)} Items Total
                                </span>
                            </div>

                            {/* Dynamic Pricing Matrix */}
                            <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-2.5 text-xs font-medium">
                                <div className="flex justify-between text-slate-500">
                                    <span>Items Total Price:</span>
                                    <span className="font-bold text-slate-800">Rs. {getCartTotal().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 items-center">
                                    <span className="flex items-center gap-1" title="Standard safe shipping across Pakistan">
                                        Shipping Logistics:
                                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                                    </span>
                                    <span className="text-emerald-600 font-extrabold uppercase tracking-wide bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-100">Free</span>
                                </div>
                                <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-center text-slate-900">
                                    <span className="text-xs font-extrabold">Net Payable Amount:</span>
                                    <span className="text-xl font-black text-[#1D4ED8]">Rs. {getCartTotal().toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Cash On Delivery Assurance Wrapper */}
                            <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3.5 flex items-start gap-2.5">
                                <span className="text-base mt-0.5">💵</span>
                                <div>
                                    <p className="font-extrabold text-amber-900 text-[11px] leading-tight">Cash on Delivery (COD) Enabled</p>
                                    <p className="text-[10px] text-amber-800 mt-0.5 font-medium leading-relaxed">Ghar parcel pohnchne par cash ada karein. No advance payments required.</p>
                                </div>
                            </div>

                            {/* Primary Endpoint Trigger */}
                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full bg-[#16A34A] hover:bg-green-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md active:scale-[0.99] transition-all mt-2"
                            >
                                Proceed to Checkout <ArrowRight className="w-4 h-4" />
                            </button>
                        </section>

                        {/* Trust Assurance Card */}
                        <div className="bg-white rounded-xl border border-slate-200 p-3.5 text-center text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1.5 shadow-sm">
                            <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                            <span>100% Genuine Products & Secure Purchase Pipeline</span>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}