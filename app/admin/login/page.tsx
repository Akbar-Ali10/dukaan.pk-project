'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Lock, Mail, Loader2 } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Akbar bhai, yahan humne aapki email aur password '123456' fix kar diya hai
    if (email.trim() === 'akbarali1512141@gmail.com' && password === '123456') {
      setTimeout(() => {
        setLoading(false)
        
        // ✅ Yeh nishani save kar lo ke admin kamyabi se login ho gaya hai
        localStorage.setItem('isAdminLoggedIn', 'true')
        
        // Admin dashboard par bhej dega
        router.push('/admin/dashboard')
      }, 1000) // 1 second ka loading effect
    } else {
      setLoading(false)
      setError('Maazrat! Email ya Password sahi nahi hai.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">dukaan.pk</h1>
          <p className="text-xs text-slate-400 mt-1">Authorized Gateway for Super Admins Only</p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4.5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dukaan.pk"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm outline-none focus:border-emerald-500 font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Secret Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm outline-none focus:border-emerald-500 font-mono transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 mt-2 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/10 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Security Credentials...
              </>
            ) : (
              'Secure Sign In'
            )}
          </button>
        </form>

      </div>
    </div>
  )
}