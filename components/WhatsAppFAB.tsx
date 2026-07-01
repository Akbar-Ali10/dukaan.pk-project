'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppFAB() {
  const handleWhatsAppClick = () => {
    const phoneNumber = '923001234567'
    const message = 'Hello! I would like to know more about your products.'
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition transform hover:scale-110 active:scale-95 min-w-[56px] min-h-[56px] flex items-center justify-center md:min-w-[64px] md:min-h-[64px]"
      aria-label="Contact us on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
    </button>
  )
}
