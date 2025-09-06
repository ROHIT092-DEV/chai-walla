'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, use } from 'react';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
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

export default function OrderPageClient({ params }: { params: Promise<{ id: string }> }) {
  const { isLoaded } = useUser();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const { id } = use(params);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchOrder();
      const interval = setInterval(fetchOrder, 3000);
      return () => clearInterval(interval);
    }
  }, [fetchOrder, id]);

  const markPaymentCompleted = async () => {
    setConfirmingPayment(true);
    try {
      await fetch(`/api/orders/${id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'submitted' }),
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      fetchOrder();
    } catch (error) {
      console.error('Error updating payment:', error);
    } finally {
      setConfirmingPayment(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'Payment Pending', color: 'text-yellow-800 bg-yellow-100 border border-yellow-200' };
      case 'submitted':
        return { text: 'Payment Submitted', color: 'text-amber-800 bg-amber-100 border border-amber-200' };
      case 'paid':
        return { text: 'Payment Completed', color: 'text-blue-800 bg-blue-100 border border-blue-200' };
      case 'preparing':
        return { text: 'Order Being Prepared', color: 'text-orange-800 bg-orange-100 border border-orange-200' };
      case 'ready':
        return { text: 'Order Ready for Pickup', color: 'text-green-800 bg-green-100 border border-green-200' };
      case 'completed':
        return { text: 'Order Completed', color: 'text-green-900 bg-green-200 border border-green-300' };
      case 'cancelled':
        return { text: 'Order Cancelled', color: 'text-red-800 bg-red-100 border border-red-200' };
      default:
        return { text: status, color: 'text-gray-800 bg-gray-100 border border-gray-200' };
    }
  };

  const getPaymentStatusDisplay = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'pending':
        return 'Payment Pending';
      case 'submitted':
        return 'Payment Submitted';
      case 'completed':
        return 'Payment Completed';
      case 'failed':
        return 'Payment Failed';
      default:
        return paymentStatus;
    }
  };

  if (loading) return <Loading />;

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
              <div className="bg-indigo-500 h-1 animate-pulse w-full"></div>
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
      <div className="min-h-screen bg-white pt-16 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-medium mb-2">Order #{order._id}</h2>
            <p className="text-gray-500 text-sm">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="border p-4 rounded-lg">
            <h3 className="text-md font-medium mb-3">Items</h3>
            <ul className="space-y-2">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {item.product?.name || item.name} × {item.quantity}
                  </span>
                  <span>
                    ₹{(item.product?.price || item.price) * item.quantity}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>

          <div className="border p-4 rounded-lg">
            <h3 className="text-md font-medium mb-3">Order Status</h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusDisplay(order.status).color}`}
            >
              {getStatusDisplay(order.status).text}
            </span>
          </div>

          <div className="border p-4 rounded-lg">
            <h3 className="text-md font-medium mb-3">Payment Status</h3>
            <p className="mb-2">{getPaymentStatusDisplay(order.paymentStatus)}</p>
            {order.paymentStatus === 'pending' && (
              <Button onClick={markPaymentCompleted}>Confirm Payment</Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
