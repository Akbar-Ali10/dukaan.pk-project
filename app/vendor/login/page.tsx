'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function VendorLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Login hote hi direct dashboard par redirect
      router.push('/vendor/dashboard')
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-background min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-[#1D4ED8] tracking-tight">dukaan.pk</h1>
        <h2 className="mt-2 text-xl font-bold text-foreground">Vendor Sign In</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-border sm:rounded-lg sm:px-10 shadow-sm">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-muted-foreground" /> Email Address
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@example.com"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-muted-foreground" /> Password
              </label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 rounded-lg font-bold text-white bg-[#1D4ED8] hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              {isSubmitting ? '⏳ Signing In...' : 'Login'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button onClick={() => router.push('/vendor/signup')} className="text-[#1D4ED8] font-semibold hover:underline">
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}