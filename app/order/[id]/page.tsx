'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

interface Order {
  _id: string;
  userId: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { isLoaded } = useUser();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);

  useEffect(() => {
    fetchOrder();
    
    // Setup polling for real-time updates
    const interval = setInterval(fetchOrder, 500);
    
    return () => clearInterval(interval);
  }, [resolvedParams.id, fetchOrder]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const markPaymentCompleted = async () => {
    try {
      await fetch(`/api/orders/${resolvedParams.id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'submitted' })
      });
      
      fetchOrder(); // Immediate refresh
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-800 bg-yellow-100 border border-yellow-200';
      case 'payment_submitted': return 'text-amber-800 bg-amber-100 border border-amber-200';
      case 'paid': return 'text-blue-800 bg-blue-100 border border-blue-200';
      case 'preparing': return 'text-orange-800 bg-orange-100 border border-orange-200';
      case 'ready': return 'text-green-800 bg-green-100 border border-green-200';
      case 'completed': return 'text-green-900 bg-green-200 border border-green-300';
      case 'cancelled': return 'text-red-800 bg-red-100 border border-red-200';
      default: return 'text-gray-800 bg-gray-100 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
          <Button onClick={() => router.push('/')}>Go Home</Button>
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
            <button onClick={() => router.push('/')} className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Order #{order._id.slice(-6)}</h1>
              <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Order Status Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status === 'pending' && '📋 Order Placed'}
                {order.status === 'paid' && '💳 Payment Received'}
                {order.status === 'preparing' && '👨‍🍳 Preparing Your Order'}
                {order.status === 'ready' && '✅ Ready for Pickup'}
                {order.status === 'completed' && '🎉 Order Completed'}
                {order.status === 'cancelled' && '❌ Order Cancelled'}
              </span>
            </div>

            {/* Progress Timeline */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  order.paymentStatus === 'completed' ? 'bg-green-500' : 
                  order.paymentStatus === 'submitted' ? 'bg-yellow-500' :
                  order.paymentStatus === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                }`}>
                  {order.paymentStatus === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                  {order.paymentStatus === 'submitted' && <Clock className="w-3 h-3 text-white" />}
                  {order.paymentStatus === 'failed' && <XCircle className="w-3 h-3 text-white" />}
                  {order.paymentStatus === 'pending' && <Clock className="w-3 h-3 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {order.paymentStatus === 'completed' ? '✓ Payment Confirmed' : 
                     order.paymentStatus === 'submitted' ? '⏳ Payment Under Review' :
                     order.paymentStatus === 'failed' ? '✗ Payment Failed' : 
                     '⏳ Payment Pending'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.paymentStatus === 'completed' ? 'Your payment has been successfully processed' : 
                     order.paymentStatus === 'submitted' ? 'Admin is reviewing your payment confirmation' :
                     order.paymentStatus === 'failed' ? 'Please retry payment at the counter' : 
                     'Complete payment at the counter to proceed'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  ['paid', 'preparing', 'ready', 'completed'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {['paid', 'preparing', 'ready', 'completed'].includes(order.status) && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Order Confirmed</p>
                  <p className="text-xs text-gray-500">Your order has been received and confirmed</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  ['preparing', 'ready', 'completed'].includes(order.status) ? 'bg-green-500' : 
                  order.status === 'paid' ? 'bg-orange-400' : 'bg-gray-300'
                }`}>
                  {['preparing', 'ready', 'completed'].includes(order.status) && <CheckCircle className="w-3 h-3 text-white" />}
                  {order.status === 'paid' && <Clock className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {order.status === 'preparing' ? '👨‍🍳 Currently Preparing' : 
                     ['ready', 'completed'].includes(order.status) ? '✓ Preparation Complete' : 
                     'Preparation Pending'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.status === 'preparing' ? 'Our team is carefully preparing your order' : 
                     ['ready', 'completed'].includes(order.status) ? 'Your order has been prepared with care' : 
                     'Preparation will begin once payment is confirmed'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  ['ready', 'completed'].includes(order.status) ? 'bg-green-500' : 
                  order.status === 'preparing' ? 'bg-orange-400' : 'bg-gray-300'
                }`}>
                  {['ready', 'completed'].includes(order.status) && <CheckCircle className="w-3 h-3 text-white" />}
                  {order.status === 'preparing' && <Clock className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {order.status === 'ready' ? '🎉 Ready for Pickup!' : 
                     order.status === 'completed' ? '✓ Order Collected' : 
                     'Awaiting Pickup'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.status === 'ready' ? 'Your order is ready! Please collect from the counter' : 
                     order.status === 'completed' ? 'Thank you for your visit!' : 
                     'You will be notified when ready for pickup'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product?.name || item.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">₹{((item.product?.price || item.price) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-xl font-bold text-green-600">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Action Card - Fixed for mobile */}
          {order.paymentStatus === 'pending' && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200 p-4 sm:p-6 mb-20 sm:mb-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Payment Required</h3>
                  <p className="text-sm text-gray-600">Complete your payment to proceed</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  📍 <strong>Please visit our counter to complete payment</strong>
                </p>
                <p className="text-xs text-gray-600">
                  After completing payment at the counter, click the button below to notify admin for verification.
                </p>
              </div>
              <Button 
                onClick={markPaymentCompleted} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 text-base shadow-lg"
              >
                ✓ I've Completed Payment
              </Button>
            </div>
          )}

          {order.paymentStatus === 'submitted' && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 p-4 sm:p-6 text-center mb-20 sm:mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Under Review</h3>
              <p className="text-gray-600">Your payment confirmation has been submitted. Our admin will verify and approve it shortly.</p>
            </div>
          )}

          {/* Order Complete Message */}
          {order.status === 'completed' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4 sm:p-6 text-center mb-20 sm:mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Completed!</h3>
              <p className="text-gray-600">Thank you for choosing our tea stall. We hope you enjoyed your order!</p>
            </div>
          )}

          {/* Order Ready Message */}
          {order.status === 'ready' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 sm:p-6 text-center mb-20 sm:mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Order is Ready!</h3>
              <p className="text-gray-600">Please collect your order from the counter. Thank you for your patience!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}