'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useUserRole } from '@/hooks/useUserRole';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { fetchWithDeduplication } from '@/lib/api-utils';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';
import { ArrowLeft, User, Mail, Calendar, Shield, LogOut, Settings, Package, Coffee, Star, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MySpacePage() {
  const { user, isLoaded } = useUser();
  const { role, loading } = useUserRole();
  const { signOut } = useClerk();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  interface Order {
    _id: string;
    items: Array<{
      product?: { name: string; price: number };
      name?: string;
      price?: number;
      quantity: number;
    }>;
    totalAmount: number;
    status: string;
    adminReason?: string;
    createdAt: string;
  }
  const [loadingOrders, setLoadingOrders] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
    if (user) {
      fetchUserOrders();
    }
  }, [user, isLoaded, router]);

  const fetchUserOrders = async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    
    try {
      const response = await fetchWithDeduplication('/api/orders/user');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
      fetchedRef.current = false;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-200 text-green-900';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isLoaded || loading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-16 pb-20">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6">
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                className="w-full h-full rounded-full border border-gray-200"
              />
            </div>
            <h1 className="text-3xl md:text-5xl font-light mb-4">
              {user.fullName || 'Tea Lover'}
            </h1>
            <p className="text-gray-500 mb-6">
              {user.primaryEmailAddress?.emailAddress}
            </p>
            {role && (
              <span className="text-sm text-gray-500 uppercase tracking-wide">
                {role} MEMBER
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-light mb-2">{orders.length}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">ORDERS</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light mb-2">₹{orders.reduce((sum, order) => sum + order.totalAmount, 0)}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">SPENT</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light mb-2">4.9</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">RATING</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light mb-2">{Math.floor((Date.now() - new Date(user.createdAt!).getTime()) / (1000 * 60 * 60 * 24))}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">DAYS</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => router.push('/products')}
              className="bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
            >
              <Coffee className="w-4 h-4" />
              <span>BROWSE MENU</span>
            </button>
            
            {role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                className="border border-gray-300 text-gray-700 px-8 py-3 font-medium hover:border-black transition-colors flex items-center justify-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>ADMIN PANEL</span>
              </button>
            )}
            
            <button
              onClick={handleSignOut}
              className="border border-gray-300 text-gray-700 px-8 py-3 font-medium hover:border-black transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>SIGN OUT</span>
            </button>
          </div>

          {/* Orders Section */}
          <div className="border border-gray-200">
            <div className="p-8 border-b border-gray-100">
              <h3 className="text-lg font-medium uppercase tracking-wide">Recent Orders</h3>
              <p className="text-gray-500 text-sm mt-1">Track your tea journey</p>
            </div>

            <div className="p-8">
              {loadingOrders ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.slice(0, 5).map((order, index) => (
                    <div
                      key={order._id}
                      className="border-b border-gray-100 pb-6 last:border-0 cursor-pointer hover:opacity-70 transition-opacity"
                      onClick={() => router.push(`/order/${order._id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">
                            ORDER #{order._id.slice(-6)}
                          </h4>
                          <p className="text-sm text-gray-500 mb-2">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                          </p>
                          {order.adminReason && (order.status === 'cancelled' || order.status === 'rejected') && (
                            <div className="mt-2 p-3 border border-gray-200">
                              <p className="text-xs text-gray-700 font-medium">Admin Note:</p>
                              <p className="text-xs text-gray-600">{order.adminReason}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-light mb-2">₹{order.totalAmount}</p>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  <h4 className="text-xl font-light mb-3">Start Your Tea Journey</h4>
                  <p className="text-gray-500 mb-8">
                    Discover our premium tea collection and place your first order
                  </p>
                  <button
                    onClick={() => router.push('/products')}
                    className="bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors"
                  >
                    EXPLORE MENU
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}