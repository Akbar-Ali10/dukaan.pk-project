'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight, Phone, KeySquare, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function CustomerLogin() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Email States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Phone States
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)

  // 1. Email Login Function
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/')
    } catch (err: any) {
      setErrorMsg(err.message || 'Email ya password galat hai.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 2. Send Phone OTP Function
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    let formattedPhone = phone.trim()
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+92' + formattedPhone.substring(1)
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+92' + formattedPhone
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })
      if (error) throw error
      setIsOtpSent(true)
      setSuccessMsg('OTP Code aapke mobile number par bhej diya gaya hai!')
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP bhejne mein masla hua hai. Number check karein.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 3. Verify Phone OTP Function
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    let formattedPhone = phone.trim()
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+92' + formattedPhone.substring(1)
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+92' + formattedPhone
    }

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      })
      if (error) throw error
      router.push('/')
    } catch (err: any) {
      setErrorMsg(err.message || 'Ghalat OTP Code enter kiya hai.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 4. Google Login Function
  const handleGoogleLogin = async () => {
    setErrorMsg(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setErrorMsg(err.message || 'Google login temporarily unavailable.')
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-extrabold text-[#1D4ED8] tracking-tight drop-shadow-sm">dukaan.pk</h1>
        <h2 className="mt-3 text-lg font-medium text-slate-600 flex items-center justify-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#1D4ED8]" /> Customer Sign In
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200 sm:rounded-2xl sm:px-10 shadow-xl shadow-slate-100/70">
          
          {/* Tabs for Customer Login */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => { setActiveTab('email'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'email' ? 'bg-white text-[#1D4ED8] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Email Login
            </button>
            <button
              onClick={() => { setActiveTab('phone'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'phone' ? 'bg-white text-[#1D4ED8] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Mobile OTP
            </button>
          </div>

          {/* Status Alert Messages */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl mb-5 text-sm font-medium flex items-start gap-2">
              <span>⚠️</span> <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-xl mb-5 text-sm font-medium flex items-start gap-2">
              <span>✅</span> <span>{successMsg}</span>
            </div>
          )}

          {/* --- EMAIL FORM --- */}
          {activeTab === 'email' && (
            <form className="space-y-4" onSubmit={handleEmailLogin}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 transition-all text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-xl font-bold text-white bg-[#1D4ED8] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 text-sm"
              >
                {isSubmitting ? '⏳ Signing In...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* --- PHONE OTP FORM --- */}
          {activeTab === 'phone' && (
            <div className="space-y-4">
              {!isOtpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03001234567"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 transition-all text-sm"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl font-bold text-white bg-[#1D4ED8] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 text-sm"
                  >
                    {isSubmitting ? '⏳ Sending OTP...' : 'Send OTP Code'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <KeySquare className="w-3.5 h-3.5 text-slate-400" /> Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full tracking-[0.5em] text-center font-bold px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 transition-all text-lg"
                      required
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{phone}</span>
                    <button
                      type="button"
                      onClick={() => { setIsOtpSent(false); setOtp(''); }}
                      className="text-[#1D4ED8] font-semibold hover:underline"
                    >
                      Change Number
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 text-sm"
                  >
                    {isSubmitting ? '⏳ Verifying...' : 'Verify & Login'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* --- OR DIVIDER --- */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 font-semibold text-slate-400 tracking-wider">Or login with</span>
            </div>
          </div>

          {/* --- GOOGLE BUTTON --- */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 shadow-sm text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3A11.917 11.917 0 0 0 12 .909a11.94 11.94 0 0 0-8.659 3.705l1.925 5.151Z" />
              <path fill="#4285F4" d="M23.455 12.273c0-.818-.068-1.609-.205-2.364H12v4.527h6.423a5.552 5.552 0 0 1-2.398 3.64l3.66 2.837c2.136-1.973 3.37-4.873 3.37-8.64Z" />
              <path fill="#FBBC05" d="M3.341 5.614l-1.925-5.15A11.94 11.94 0 0 0 .545 12c0 2.455.737 4.745 2.01 6.668l3.492-2.709A7.042 7.042 0 0 1 4.91 12c0-2.382.636-4.595 1.773-6.386Z" />
              <path fill="#34A853" d="M12 23.091c3.245 0 5.973-1.077 7.964-2.923l-3.66-2.837c-1.013.682-2.31 1.091-3.645 1.091-2.81 0-5.196-1.891-6.05-4.446L1.118 16.61A11.944 11.944 0 0 0 12 23.091Z" />
            </svg>
            Google Account
          </button>

        </div>
      </div>
    </div>
  )
}