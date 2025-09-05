'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect, use, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { fetchWithDeduplication } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Order {
  _id: string;
  userId: string;
  items: Array<{
    product?: {
      _id: string;
      name: string;
      price: number;
    };
    name?: string;
    price?: number;
    quantity: number;
  }>;
  totalAmount: number;
  status:
    | 'pending'
    | 'paid'
    | 'preparing'
    | 'ready'
    | 'completed'
    | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'submitted';
  createdAt: string;
}

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { isLoaded } = useUser();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const resolvedParams = use(params);
  const fetchedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchOrder = async () => {
      if (fetchedRef.current) return;
      fetchedRef.current = true;
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      try {
        const response = await fetchWithDeduplication(`/api/orders/${resolvedParams.id}`, {
          signal: abortControllerRef.current.signal
        });
        
        if (response.ok && isMounted) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError' && isMounted) {
          console.error('Error fetching order:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
        fetchedRef.current = false;
      }
    };

    if (resolvedParams.id && !fetchedRef.current) {
      fetchOrder();
    }
    
    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [resolvedParams.id]);

  const markPaymentCompleted = async () => {
    setConfirmingPayment(true);
    try {
      await fetch(`/api/orders/${resolvedParams.id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'submitted' }),
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        const response = await fetchWithDeduplication(`/api/orders/${resolvedParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error('Error refreshing order:', error);
      }
    } catch (error) {
      console.error('Error updating payment:', error);
    } finally {
      setConfirmingPayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-800 bg-yellow-100 border border-yellow-200';
      case 'payment_submitted':
        return 'text-amber-800 bg-amber-100 border border-amber-200';
      case 'paid':
        return 'text-blue-800 bg-blue-100 border border-blue-200';
      case 'preparing':
        return 'text-orange-800 bg-orange-100 border border-orange-200';
      case 'ready':
        return 'text-green-800 bg-green-100 border border-green-200';
      case 'completed':
        return 'text-green-900 bg-green-200 border border-green-300';
      case 'cancelled':
        return 'text-red-800 bg-red-100 border border-red-200';
      default:
        return 'text-gray-800 bg-gray-100 border border-gray-200';
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (confirmingPayment) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-light mb-2">Confirming Payment</h2>
            <p className="text-gray-500 mb-6">
              Please wait while we process your confirmation
            </p>
            <div className="w-full bg-gray-100 h-1">
              <div
                className="bg-indigo-500 h-1 animate-pulse"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white pt-16 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-light mb-4">Order Not Found</h2>
            <button
              onClick={() => router.push('/')}
              className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
            >
              GO HOME
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
              onClick={() => router.push('/')}
              className="mr-4 text-gray-500 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl md:text-5xl font-light">
                Order #{order._id.slice(-6)}
              </h1>
              <p className="text-gray-500 mt-2">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Order Status Card */}
          <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6 mb-4 lg:mb-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">
                Order Status
              </h2>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status === 'pending' && '📋 Order Placed'}
                {order.status === 'paid' && '💳 Payment Received'}
                {order.status === 'preparing' && '👨🍳 Preparing Your Order'}
                {order.status === 'ready' && '✅ Ready for Pickup'}
                {order.status === 'completed' && '🎉 Order Completed'}
                {order.status === 'cancelled' && '❌ Order Cancelled'}
              </span>
            </div>

            {/* Progress Timeline */}
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    order.paymentStatus === 'completed'
                      ? 'bg-green-500'
                      : order.paymentStatus === 'submitted'
                      ? 'bg-yellow-500'
                      : order.paymentStatus === 'failed'
                      ? 'bg-red-500'
                      : 'bg-gray-300'
                  }`}
                >
                  {order.paymentStatus === 'completed' && (
                    <CheckCircle className="w-2.5 lg:w-3 h-2.5 lg:h-3 text-white" />
                  )}
                  {order.paymentStatus === 'submitted' && (
                    <Clock className="w-2.5 lg:w-3 h-2.5 lg:h-3 text-white" />
                  )}
                  {order.paymentStatus === 'failed' && (
                    <XCircle className="w-2.5 lg:w-3 h-2.5 lg:h-3 text-white" />
                  )}
                  {order.paymentStatus === 'pending' && (
                    <Clock className="w-2.5 lg:w-3 h-2.5 lg:h-3 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-xs lg:text-sm">
                    {order.paymentStatus === 'completed'
                      ? '✓ Payment Confirmed'
                      : order.paymentStatus === 'submitted'
                      ? '⏳ Payment Under Review'
                      : order.paymentStatus === 'failed'
                      ? '✗ Payment Failed'
                      : '⏳ Payment Pending'}
                  </p>
                  <p className="text-xs lg:text-sm text-gray-500">
                    {order.paymentStatus === 'completed'
                      ? 'Your payment has been successfully processed'
                      : order.paymentStatus === 'submitted'
                      ? 'Admin is reviewing your payment confirmation'
                      : order.paymentStatus === 'failed'
                      ? 'Please retry payment at the counter'
                      : 'Complete payment at the counter to proceed'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    ['paid', 'preparing', 'ready', 'completed'].includes(
                      order.status
                    )
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                >
                  {['paid', 'preparing', 'ready', 'completed'].includes(
                    order.status
                  ) && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Order Confirmed</p>
                  <p className="text-xs text-gray-500">
                    Your order has been received and confirmed
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    ['preparing', 'ready', 'completed'].includes(order.status)
                      ? 'bg-green-500'
                      : order.status === 'paid'
                      ? 'bg-orange-400'
                      : 'bg-gray-300'
                  }`}
                >
                  {['preparing', 'ready', 'completed'].includes(
                    order.status
                  ) && <CheckCircle className="w-3 h-3 text-white" />}
                  {order.status === 'paid' && (
                    <Clock className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {order.status === 'preparing'
                      ? '👨🍳 Currently Preparing'
                      : ['ready', 'completed'].includes(order.status)
                      ? '✓ Preparation Complete'
                      : 'Preparation Pending'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.status === 'preparing'
                      ? 'Our team is carefully preparing your order'
                      : ['ready', 'completed'].includes(order.status)
                      ? 'Your order has been prepared with care'
                      : 'Preparation will begin once payment is confirmed'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    ['ready', 'completed'].includes(order.status)
                      ? 'bg-green-500'
                      : order.status === 'preparing'
                      ? 'bg-orange-400'
                      : 'bg-gray-300'
                  }`}
                >
                  {['ready', 'completed'].includes(order.status) && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                  {order.status === 'preparing' && (
                    <Clock className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {order.status === 'ready'
                      ? '🎉 Ready for Pickup!'
                      : order.status === 'completed'
                      ? '✓ Order Collected'
                      : 'Awaiting Pickup'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.status === 'ready'
                      ? 'Your order is ready! Please collect from the counter'
                      : order.status === 'completed'
                      ? 'Thank you for your visit!'
                      : 'You will be notified when ready for pickup'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Card */}
          <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6 mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 lg:space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm lg:text-base truncate">
                      {item.product?.name || item.name || 'Unknown Item'}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm lg:text-base ml-2">
                    ₹
                    {(
                      (item.product?.price || item.price || 0) * item.quantity
                    ).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 lg:pt-4 mt-3 lg:mt-4">
              <div className="flex justify-between items-center">
                <span className="text-base lg:text-lg font-semibold text-gray-900">
                  Total Amount
                </span>
                <span className="text-lg lg:text-xl font-bold text-green-600">
                  ₹{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Action */}
          {order.paymentStatus === 'pending' && (
            <div className="border border-gray-200 p-8 mb-12">
              <div className="text-center mb-6">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">PAYMENT REQUIRED</h3>
                <p className="text-gray-500 mb-6">Complete your payment to proceed</p>
              </div>
              <div className="border border-gray-100 p-6 mb-6">
                <p className="font-medium mb-2">Please visit our counter to complete payment</p>
                <p className="text-sm text-gray-500">
                  After completing payment at the counter, click the button below to notify admin for verification.
                </p>
              </div>
              <button 
                onClick={markPaymentCompleted} 
                className="w-full bg-black text-white py-4 font-medium hover:bg-gray-800 transition-colors"
              >
                I'VE COMPLETED PAYMENT
              </button>
            </div>
          )}

          {order.paymentStatus === 'submitted' && (
            <div className="border border-gray-200 p-8 text-center mb-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">PAYMENT UNDER REVIEW</h3>
              <p className="text-gray-500">Your payment confirmation has been submitted. Our admin will verify and approve it shortly.</p>
            </div>
          )}

          {/* Order Complete Message */}
          {order.status === 'completed' && (
            <div className="border border-gray-200 p-8 text-center mb-12">
              <CheckCircle className="w-12 h-12 text-black mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">ORDER COMPLETED</h3>
              <p className="text-gray-500">Thank you for choosing our tea stall. We hope you enjoyed your order!</p>
            </div>
          )}

          {/* Order Ready Message */}
          {order.status === 'ready' && (
            <div className="border border-gray-200 p-8 text-center mb-12">
              <CheckCircle className="w-12 h-12 text-black mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">YOUR ORDER IS READY</h3>
              <p className="text-gray-500">Please collect your order from the counter. Thank you for your patience!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}