'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useUserRole } from '@/hooks/useUserRole';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
    if (user) {
      fetchUserOrders();
    }
  }, [user, isLoaded, router]);

  const fetchUserOrders = async () => {
    try {
      const response = await fetch('/api/orders/user');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
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
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-orange-300 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Your Profile</h2>
            <p className="text-gray-600">Please wait while we prepare your tea space...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16 pb-20 lg:pt-20 lg:pb-6">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-orange-600 to-yellow-600 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-6xl mx-auto px-4 py-8 lg:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="w-20 lg:w-24 h-20 lg:h-24 mx-auto mb-4 relative">
                <img
                  src={user.imageUrl}
                  alt={user.fullName || 'User'}
                  className="w-full h-full rounded-full border-4 border-white/20 shadow-xl"
                />
                <div className="absolute -bottom-1 -right-1 w-6 lg:w-8 h-6 lg:h-8 bg-green-500 rounded-full border-2 lg:border-4 border-white"></div>
              </div>
              <h1 className="text-2xl lg:text-4xl font-black mb-2">
                {user.fullName || 'Tea Lover'}
              </h1>
              <p className="text-orange-100 text-sm lg:text-lg mb-4">
                {user.primaryEmailAddress?.emailAddress}
              </p>
              {role && (
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4 mr-2" />
                  {role.charAt(0).toUpperCase() + role.slice(1)} Member
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-3 sm:px-4 relative z-10">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6 mb-6 sm:mb-8 -mt-6 sm:-mt-8 lg:-mt-12"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-xl border border-gray-100 relative z-20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">{orders.length}</p>
                  <p className="text-xs lg:text-sm text-gray-600">Orders</p>
                </div>
                <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center self-end sm:self-auto">
                  <Package className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-xl border border-gray-100 relative z-20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-lg sm:text-2xl lg:text-3xl font-black text-gray-900">₹{orders.reduce((sum, order) => sum + order.totalAmount, 0)}</p>
                  <p className="text-xs lg:text-sm text-gray-600">Spent</p>
                </div>
                <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center self-end sm:self-auto">
                  <TrendingUp className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-xl border border-gray-100 relative z-20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">4.9</p>
                  <p className="text-xs lg:text-sm text-gray-600">Rating</p>
                </div>
                <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-yellow-100 rounded-lg sm:rounded-xl flex items-center justify-center self-end sm:self-auto">
                  <Star className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-xl border border-gray-100 relative z-20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">{Math.floor((Date.now() - new Date(user.createdAt!).getTime()) / (1000 * 60 * 60 * 24))}</p>
                  <p className="text-xs lg:text-sm text-gray-600">Days</p>
                </div>
                <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center self-end sm:self-auto">
                  <Award className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Profile Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Quick Actions</h3>
                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={() => router.push('/products')}
                    className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                  >
                    <Coffee className="w-5 h-5" />
                    <span>Browse Menu</span>
                  </button>
                  
                  {role === 'admin' && (
                    <button
                      onClick={() => router.push('/admin')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Admin Panel</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 border border-red-200 hover:border-red-300 flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Orders Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">Recent Orders</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">Track your tea journey</p>
                    </div>
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order, index) => (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="group bg-gray-50 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 border border-gray-200 hover:border-orange-200 rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-lg"
                          onClick={() => router.push(`/order/${order._id}`)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-bold text-xs sm:text-sm">#{order._id.slice(-2)}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                                    Order #{order._id.slice(-6)}
                                  </h4>
                                  <p className="text-xs sm:text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                              </p>
                              {order.adminReason && (order.status === 'cancelled' || order.status === 'rejected') && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-xs text-red-700 font-medium">Admin Note:</p>
                                  <p className="text-xs text-red-600">{order.adminReason}</p>
                                </div>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-lg sm:text-xl font-bold text-gray-900 mb-1">₹{order.totalAmount}</p>
                              <span className={`inline-block px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Coffee className="w-10 h-10 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-3">Start Your Tea Journey!</h4>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Discover our premium tea collection and place your first order.
                      </p>
                      <button
                        onClick={() => router.push('/products')}
                        className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        Explore Menu
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}