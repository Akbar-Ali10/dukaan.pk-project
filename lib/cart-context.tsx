'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// Cart item ke liye strict TypeScript properties matrix
interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  stock: number
  vendor_id: string | null
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: any, quantity: number) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  // ✅ INITIAL STATE: Pehle check karega ke localStorage mein data hai ya nahi
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('dukaan_cart')
      return savedCart ? JSON.parse(savedCart) : []
    }
    return []
  })

  // ✅ EFFECT: Jab bhi cart state change hogi, yeh automatic localStorage mein save karega
  useEffect(() => {
    localStorage.setItem('dukaan_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: any, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)

      if (existingItem) {
        // Agar pehle se hai toh quantity plus/minus karein
        const newQuantity = existingItem.quantity + quantity
        
        // Agar quantity 0 ya us se kam ho jaye toh item remove kar do
        if (newQuantity <= 0) {
          return prevCart.filter((item) => item.id !== product.id)
        }

        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        )
      }

      // Agar naya item add ho raha hai aur quantity positive hai
      if (quantity > 0) {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: Array.isArray(product.images) ? product.images[0] : product.image,
            quantity: quantity,
            stock: product.stock || 99,
            vendor_id: product.vendor_id || null,
          },
        ]
      }

      return prevCart
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}