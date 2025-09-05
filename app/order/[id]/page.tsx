'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
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

export const dynamic = 'force-dynamic';

export default function OrderPage({ params }: { params: { id: string } }) {
  const { isLoaded } = useUser();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchOrder();

    // Poll every 3s (instead of 500ms)
    const interval = setInterval(fetchOrder, 3000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const markPaymentCompleted = async () => {
    setConfirmingPayment(true);
    try {
      await fetch(`/api/orders/${params.id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'submitted' }),
      });

      // Simulate short delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      fetchOrder();
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
      case 'submitted':
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
      {/* ⬇️ your existing UI code for order goes here ⬇️ */}
      {/* I didn’t modify your big UI block since it was already fine */}
    </>
  );
}
