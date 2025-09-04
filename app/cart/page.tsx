'use client'

import { useUser } from '@clerk/nextjs'
import { useUserRole } from '@/hooks/useUserRole'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { IKImage } from 'imagekitio-next'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { Category } from '@/lib/product'

export default function CartPage() {
  const { user, isLoaded } = useUser()
  const { role, loading } = useUserRole()
  const router = useRouter()
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (isLoaded && !loading) {
      if (!user) {
        router.push('/sign-in')
      }
    }
  }, [user, isLoaded, loading, router])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId)
    return category?.name || 'Unknown'
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 pt-16 pb-20 lg:pt-20 lg:pb-6">
          <div className="max-w-4xl mx-auto px-4 py-4 lg:py-6">
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">Shopping Cart</h1>
            <div className="bg-white rounded-lg border p-8 lg:p-12 text-center">
              <ShoppingBag className="w-10 lg:w-12 h-10 lg:h-12 text-gray-300 mx-auto mb-3 lg:mb-4" />
              <h2 className="text-base lg:text-lg font-medium text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-sm text-gray-600 mb-4 lg:mb-6">Add some items to get started!</p>
              <Link href="/">
                <Button className="bg-purple-600 hover:bg-purple-700">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-4 lg:py-6">
          <div className="flex justify-between items-center mb-4 lg:mb-6">
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900">Shopping Cart</h1>
            <Button variant="outline" size="sm" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-2 lg:space-y-3">
              {items.map((item) => (
                <div key={item._id} className="bg-white rounded-lg border p-3 lg:p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start space-x-3 lg:space-x-4">
                    {item.image && (
                      <div className="w-12 lg:w-16 h-12 lg:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <IKImage
                          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
                          path={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-xs lg:text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 hidden lg:block">{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 bg-gray-50 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded">
                          {getCategoryName(item.categoryId)}
                        </span>
                        <span className="font-semibold text-gray-900 text-xs lg:text-sm">₹{item.price}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 lg:mt-4 pt-2 lg:pt-3 border-t">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <button
                        onClick={() => updateQuantity(item._id!, item.quantity - 1)}
                        className="w-6 lg:w-7 h-6 lg:h-7 flex items-center justify-center border rounded hover:bg-gray-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-2.5 lg:w-3 h-2.5 lg:h-3" />
                      </button>
                      <span className="w-6 lg:w-8 text-center text-xs lg:text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id!, item.quantity + 1)}
                        className="w-6 lg:w-7 h-6 lg:h-7 flex items-center justify-center border rounded hover:bg-gray-50"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="w-2.5 lg:w-3 h-2.5 lg:h-3" />
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <span className="font-semibold text-gray-900 text-xs lg:text-sm">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item._id!)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border p-4 sticky top-20">
                <h2 className="font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium">₹20.00</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>₹{(getTotalPrice() + 20).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => router.push('/checkout')}
                  className="w-full mb-3 bg-orange-500 hover:bg-orange-600"
                >
                  Proceed to Checkout
                </Button>
                
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}