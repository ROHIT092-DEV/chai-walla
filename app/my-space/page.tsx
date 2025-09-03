'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useUserRole } from '@/hooks/useUserRole';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { ArrowLeft, User, Mail, Calendar, Shield, LogOut, Settings, Package } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-20 lg:pb-6">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => router.push('/')} 
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="text-center">
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'User'}
                    className="w-20 h-20 rounded-full mx-auto mb-4"
                  />
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {user.fullName || 'User'}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                  
                  {role && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                      <Shield className="w-4 h-4 mr-1" />
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-3" />
                    <span>{user.primaryEmailAddress?.emailAddress}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-3" />
                    <span>Joined {new Date(user.createdAt!).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {role === 'admin' && (
                    <Button 
                      onClick={() => router.push('/admin')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">My Orders</h3>
                  <p className="text-gray-600 text-sm">Track your recent orders</p>
                </div>

                <div className="p-6">
                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div 
                          key={order._id} 
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/order/${order._id}`)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Order #{order._id.slice(-6)}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">₹{order.totalAmount}</p>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h4>
                      <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                      <Button onClick={() => router.push('/products')}>
                        Browse Menu
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}