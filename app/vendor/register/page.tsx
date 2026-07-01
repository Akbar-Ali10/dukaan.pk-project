'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, User, Phone, FileText, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface VendorFormData {
  businessName: string
  vendorName: string
  phone: string
  businessDescription: string
}

export default function VendorRegister() {
  const router = useRouter()
  const [formData, setFormData] = useState<VendorFormData>({
    businessName: '',
    vendorName: '',
    phone: '',
    businessDescription: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const isFormValid = 
    formData.businessName.trim() && 
    formData.vendorName.trim() && 
    formData.phone.trim() && 
    formData.businessDescription.trim()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUserId = session?.user?.id || null

      // Data insert with the new columns you added in Supabase
      const { data, error } = await supabase
        .from('vendors')
        .insert([
          {
            profile_id: currentUserId,
            business_name: formData.businessName,
            vendor_name: formData.vendorName, // 👈 New column
            phone_number: formData.phone,      // 👈 New column
            business_description: formData.businessDescription,
            status: 'pending',
            logo_url: null,
            commission_rate: 0.0
          }
        ])
        .select()

      if (error) throw error

      setSuccessMsg('Congratulations! Your registration request has been submitted successfully.')
      
      setTimeout(() => {
        router.push('/vendor/dashboard')
      }, 3000)

    } catch (err: any) {
      console.error('Vendor registration error:', err)
      setErrorMsg(err.message || 'Something went wrong during registration.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-background min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-[#1D4ED8] tracking-tight">dukaan.pk</h1>
        <h2 className="mt-2 text-xl font-bold text-foreground">Vendor Partnership Program</h2>
        <p className="mt-1 text-sm text-muted-foreground">Bring your shop online and expand your business reach</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-border sm:rounded-lg sm:px-10 shadow-sm">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm font-medium">
              ⚠️ Error: {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 text-sm font-medium">
              🎉 {successMsg} <br /> <span className="text-xs font-normal">Redirecting to dashboard...</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Business Name */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-muted-foreground" /> Business / Shop Name
              </label>
              <input 
                type="text" 
                name="businessName" 
                value={formData.businessName} 
                onChange={handleInputChange}
                placeholder="e.g. Al-Madina Electronics"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                required 
              />
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-muted-foreground" /> Owner Full Name
              </label>
              <input 
                type="text" 
                name="vendorName" 
                value={formData.vendorName} 
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                required 
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-muted-foreground" /> WhatsApp Number
              </label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange}
                placeholder="03XX XXXXXXX"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                required 
              />
            </div>

            {/* Business Description */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-muted-foreground" /> Business Description
              </label>
              <textarea 
                name="businessDescription" 
                value={formData.businessDescription} 
                onChange={handleInputChange}
                placeholder="Tell us about the products you sell..."
                rows={3}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" 
                required 
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                  isFormValid && !isSubmitting
                    ? 'bg-[#1D4ED8] hover:bg-blue-700 active:scale-95'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? '⏳ Saving details...' : 'Register as Partner'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}