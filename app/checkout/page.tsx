'use client';

import { useUser } from '@clerk/nextjs';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const { items, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCashPayment = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          totalAmount: getTotalPrice(),
          paymentMethod: 'cash'
        })
      });

      if (response.ok) {
        const order = await response.json();
        clearCart();
        router.push(`/order/${order._id}`);
      }
    } catch (error) {
      console.error('Order creation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!user || items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white pt-16 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-light mb-4">{!user ? 'Please sign in' : 'Cart is Empty'}</h2>
            <button 
              onClick={() => router.push(!user ? '/sign-in' : '/products')}
              className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
            >
              {!user ? 'SIGN IN' : 'CONTINUE SHOPPING'}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center mb-12">
            <button 
              onClick={() => router.back()} 
              className="mr-4 text-gray-500 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl md:text-5xl font-light">Checkout</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Order Summary */}
            <div>
              <h2 className="text-lg font-medium mb-6 uppercase tracking-wide">Order Summary</h2>
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-light">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-medium">TOTAL</span>
                  <span className="text-2xl font-light">₹{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="text-lg font-medium mb-6 uppercase tracking-wide">Payment Method</h2>
              <div className="border border-gray-200 p-8">
                <div className="text-center mb-6">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Pay at Counter</h3>
                  <p className="text-gray-500 text-sm">
                    Complete your payment at the tea stall counter
                  </p>
                </div>
                <button
                  onClick={handleCashPayment}
                  disabled={loading}
                  className="w-full bg-black text-white py-4 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <span>{loading ? 'PROCESSING...' : 'PLACE ORDER'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}