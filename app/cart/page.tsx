'use client'

import { useUser } from '@clerk/nextjs'
import { useUserRole } from '@/hooks/useUserRole'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Loading from '@/components/Loading'
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
    return <Loading />;
  }

  if (!user) {
    return null
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white pt-16 pb-20 lg:pt-20 lg:pb-6">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-5xl font-light mb-12">Shopping Cart</h1>
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-xl font-light mb-4">Your cart is empty</h2>
              <p className="text-gray-500 mb-8">Add some items to get started</p>
              <Link href="/products">
                <button className="bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors">
                  CONTINUE SHOPPING
                </button>
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
      <main className="min-h-screen bg-white pt-16 pb-20 lg:pt-20 lg:pb-6">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-3xl md:text-5xl font-light">Shopping Cart</h1>
            <button 
              onClick={clearCart}
              className="text-sm text-gray-500 hover:text-black transition-colors uppercase tracking-wide"
            >
              CLEAR CART
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div key={item._id} className="border-b border-gray-100 pb-6">
                  <div className="flex items-start space-x-6">
                    {item.image && (
                      <div className="w-20 h-20 bg-gray-50 flex-shrink-0">
                        <IKImage
                          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
                          path={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {getCategoryName(item.categoryId)}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">{item.name}</h3>
                      <p className="text-gray-500 text-sm mb-4">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => updateQuantity(item._id!, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-200 hover:border-black transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id!, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-200 hover:border-black transition-colors"
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className="text-xl font-light">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item._id!)}
                            className="p-2 text-gray-400 hover:text-black transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-medium mb-6">ORDER SUMMARY</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-light">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery</span>
                    <span className="font-light">₹20.00</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">Total</span>
                      <span className="font-light">₹{(getTotalPrice() + 20).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-black text-white py-3 font-medium hover:bg-gray-800 transition-colors mb-4"
                >
                  PROCEED TO CHECKOUT
                </button>
                
                <Link href="/products">
                  <button className="w-full border border-gray-200 py-3 font-medium hover:border-black transition-colors">
                    CONTINUE SHOPPING
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}