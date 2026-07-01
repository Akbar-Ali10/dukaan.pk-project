'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function VendorSignup() {
  const router = useRouter()
  
  // Fields for dukaan.pk vendor account creation
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    // 1. Password Match Validation
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match! Please verify.')
      setIsSubmitting(false)
      return
    }

    // 2. Pakistani Phone Number Basic Length Check
    if (phone.trim().length < 11) {
      setErrorMsg('Please enter a valid 11-digit mobile number (e.g., 03001234567).')
      setIsSubmitting(false)
      return
    }

    try {
      // Supabase Auth SignUp (Metadata ke andar name aur phone save kar rahe hain)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phone,
          }
        }
      })

      if (error) throw error

      // Account bante hi, unhein direct register form par bhejenge dukaan setup ke liye
      router.push('/vendor/register')
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-background min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-[#1D4ED8] tracking-tight">dukaan.pk</h1>
        <h2 className="mt-2 text-xl font-bold text-foreground">Create Vendor Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Start selling online across Pakistan</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-border sm:rounded-lg sm:px-10 shadow-sm">
          
          {/* Error Notice */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignup}>
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-muted-foreground" /> Full Name
              </label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Akbar Ali"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                required 
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-muted-foreground" /> Email Address
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@example.com"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                required 
              />
            </div>

            {/* Mobile / WhatsApp Number */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-muted-foreground" /> Mobile / WhatsApp Number
              </label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 03XXXXXXXXX"
                maxLength={11}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                required 
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-muted-foreground" /> Password
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                required 
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-muted-foreground" /> Confirm Password
              </label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                required 
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg font-bold text-white bg-[#1D4ED8] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '⏳ Creating Vendor Account...' : 'Continue to Shop Setup'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Navigation Links */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have a vendor account?{' '}
            <button onClick={() => router.push('/vendor/login')} className="text-[#1D4ED8] font-semibold hover:underline">
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}