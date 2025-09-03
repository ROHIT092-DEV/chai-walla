'use client';

import { useUser } from '@clerk/nextjs';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

export default function CheckoutPage() {
  const { user } = useUser();
  const { items, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Cart is Empty</h2>
          <Button onClick={() => router.push('/products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="mr-3">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Checkout</h1>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4">
          <h2 className="font-medium mb-3">Order Summary</h2>
          {items.map((item) => (
            <div key={item._id} className="flex justify-between text-sm mb-2">
              <span>{item.name} x{item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>₹{getTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <h2 className="font-medium mb-3">Payment Method</h2>
          <button
            onClick={handleCashPayment}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            <CreditCard className="w-5 h-5" />
            <span>{loading ? 'Processing...' : 'Pay at Counter'}</span>
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Complete payment at the tea stall counter
          </p>
        </div>
      </div>
      </div>
    </>
  );
}