'use client';

import { useUser } from '@clerk/nextjs';
import { useUserRole } from '@/hooks/useUserRole';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product, Category } from '@/lib/product';
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  X,
  Image as ImageIcon,
  BarChart3,
  Users,
  Package,
  ArrowLeft,
} from 'lucide-react';
import { IKImage, IKUpload } from 'imagekitio-next';

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const { role, loading } = useUserRole();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>(
    'products'
  );
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'orders' | 'products'
  >(searchParams.get('section') as 'dashboard' | 'orders' | 'products' || 'dashboard');
  const [orders, setOrders] = useState<Order[]>([]);

  interface Order {
    _id: string;
    userId: string;
    items: Array<{
      product?: { name: string; price: number };
      name?: string;
      price?: number;
      quantity: number;
    }>;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }
  const [uploading, setUploading] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    categoryId: '',
    stock: '',
    image: '',
    featured: false,
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (isLoaded && !loading) {
      if (!user) {
        router.push('/sign-in');
      } else if (role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, role, isLoaded, loading, router]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOrders();

    // Setup polling for real-time updates
    const interval = setInterval(() => {
      fetchOrders();
    }, 500); // Poll every 500ms for near real-time

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const section = searchParams.get('section') as 'dashboard' | 'orders' | 'products';
    if (section && ['dashboard', 'orders', 'products'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    // Immediate local update for instant feedback
    setOrders(prev => prev.map(order => 
      order._id === orderId ? { ...order, status } : order
    ));
    
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Error updating order:', error);
      fetchOrders(); // Revert on error
    }
  };

  const approvePayment = async (orderId: string) => {
    // Immediate local update for instant feedback
    setOrders(prev => prev.map(order => 
      order._id === orderId ? { ...order, paymentStatus: 'completed', status: 'paid' } : order
    ));
    
    try {
      await fetch(`/api/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'completed' }),
      });
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      });
    } catch (error) {
      console.error('Error approving payment:', error);
      fetchOrders(); // Revert on error
    }
  };

  const rejectPayment = async (orderId: string) => {
    // Immediate local update for instant feedback
    setOrders(prev => prev.map(order => 
      order._id === orderId ? { ...order, paymentStatus: 'failed' } : order
    ));
    
    try {
      await fetch(`/api/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'failed' }),
      });
    } catch (error) {
      console.error('Error rejecting payment:', error);
      fetchOrders(); // Revert on error
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
      };

      let response;
      if (editingProduct) {
        response = await fetch(`/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
      } else {
        response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
      }

      if (response.ok) {
        resetProductForm();
        fetchProducts();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });

      setCategoryForm({ name: '', description: '' });
      setShowCategoryForm(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      price: '',
      description: '',
      categoryId: '',
      stock: '',
      image: '',
      featured: false,
    });
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      categoryId: product.categoryId,
      stock: product.stock.toString(),
      image: product.image || '',
      featured: product.featured || false,
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Delete this product?')) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchProducts();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Delete this category?')) {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchCategories();
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category?.name || 'Unknown';
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || role !== 'admin') {
    return null;
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-lg font-medium">Back to Home</span>
            </button>
          </div>

          {/* Admin Navigation */}
          <div className="flex space-x-1 mb-8 bg-white border rounded-lg p-1 shadow-sm overflow-x-auto">
            <button
              onClick={() => {
                setActiveSection('dashboard');
                router.push('/admin?section=dashboard');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-colors min-w-0 flex-shrink-0 ${
                activeSection === 'dashboard'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 mb-1 sm:mb-0" />
              <span className="text-xs sm:text-sm whitespace-nowrap">
                Dashboard
              </span>
            </button>
            <button
              onClick={() => {
                setActiveSection('orders');
                router.push('/admin?section=orders');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-colors min-w-0 flex-shrink-0 ${
                activeSection === 'orders'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 mb-1 sm:mb-0" />
              <span className="text-xs sm:text-sm whitespace-nowrap">
                Orders
              </span>
            </button>
            <button
              onClick={() => {
                setActiveSection('products');
                router.push('/admin?section=products');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-medium transition-colors min-w-0 flex-shrink-0 ${
                activeSection === 'products'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4 mb-1 sm:mb-0" />
              <span className="text-xs sm:text-sm whitespace-nowrap">
                Products
              </span>
            </button>
          </div>

          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Analytics Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Products
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {products.length}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Categories
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {categories.length}
                      </p>
                    </div>
                    <Tag className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Low Stock Items
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {products.filter((p) => p.stock <= 5).length}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Management Section */}
          {activeSection === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Orders Management
              </h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-lg border shadow-sm"
                  >
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            Order #{order._id.slice(-6)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              order.paymentStatus === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : order.paymentStatus === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {order.paymentStatus === 'completed'
                              ? '✓ Payment Confirmed'
                              : order.paymentStatus === 'failed'
                              ? '✗ Payment Failed'
                              : '⏳ Payment Pending'}
                          </span>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              order.status === 'pending'
                                ? 'bg-gray-100 text-gray-800'
                                : order.status === 'paid'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'preparing'
                                ? 'bg-orange-100 text-orange-800'
                                : order.status === 'ready'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'completed'
                                ? 'bg-green-200 text-green-900'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status === 'pending' && '📋 Order Placed'}
                            {order.status === 'paid' && '💳 Payment Received'}
                            {order.status === 'preparing' && '👨‍🍳 Preparing'}
                            {order.status === 'ready' && '✅ Ready for Pickup'}
                            {order.status === 'completed' && '🎉 Completed'}
                            {order.status === 'cancelled' && '❌ Cancelled'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Order Items
                        </h4>
                        <div className="space-y-2">
                          {order.items?.map((item, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded"
                            >
                              <div className="flex-1">
                                <span className="font-medium text-sm">
                                  {item.product?.name || item.name}
                                </span>
                                <span className="text-gray-500 text-sm ml-2">
                                  x{item.quantity}
                                </span>
                              </div>
                              <span className="font-medium text-sm">
                                ₹
                                {(
                                  (item.product?.price || item.price) *
                                  item.quantity
                                ).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-lg">
                              Total Amount
                            </span>
                            <span className="font-bold text-xl text-green-600">
                              ₹{order.totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {order.paymentStatus === 'pending' && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-sm font-medium text-yellow-800">
                              Waiting for customer to complete payment at
                              counter
                            </span>
                          </div>
                        </div>
                      )}

                      {order.paymentStatus === 'submitted' && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-sm font-medium text-amber-800">
                              Customer has submitted payment confirmation -
                              Requires approval
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        {order.paymentStatus === 'submitted' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => approvePayment(order._id)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              ✓ Approve Payment
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectPayment(order._id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              ✗ Reject Payment
                            </Button>
                          </>
                        )}
                        {order.paymentStatus === 'completed' &&
                          order.status === 'paid' && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateOrderStatus(order._id, 'preparing')
                              }
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              👨‍🍳 Start Preparing
                            </Button>
                          )}

                        {order.status === 'preparing' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order._id, 'ready')
                            }
                            className="bg-green-500 hover:bg-green-600"
                          >
                            ✅ Mark Ready for Pickup
                          </Button>
                        )}

                        {order.status === 'ready' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order._id, 'completed')
                            }
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            🎉 Complete Order
                          </Button>
                        )}

                        {order.status !== 'completed' &&
                          order.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateOrderStatus(order._id, 'cancelled')
                              }
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              ❌ Cancel Order
                            </Button>
                          )}
                      </div>
                    </div>
                  </div>
                ))}

                {orders.length === 0 && (
                  <div className="bg-white p-8 rounded-lg border text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Orders
                    </h3>
                    <p className="text-gray-600">
                      No orders have been placed yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product Management Section */}
          {activeSection === 'products' && (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-md w-fit">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    activeTab === 'products'
                      ? 'bg-white shadow-sm font-medium'
                      : 'text-gray-600'
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    activeTab === 'categories'
                      ? 'bg-white shadow-sm font-medium'
                      : 'text-gray-600'
                  }`}
                >
                  Categories
                </button>
              </div>

              {activeTab === 'products' && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Products</h2>
                    <Button size="sm" onClick={() => setShowProductForm(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Product
                    </Button>
                  </div>

                  {showProductForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                          <h3 className="text-lg font-medium">
                            {editingProduct ? 'Edit Product' : 'Add Product'}
                          </h3>
                          <button
                            onClick={resetProductForm}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form
                          onSubmit={handleProductSubmit}
                          className="p-4 space-y-4"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                              </label>
                              <Input
                                placeholder="Product name"
                                value={productForm.name}
                                onChange={(e) =>
                                  setProductForm({
                                    ...productForm,
                                    name: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (₹)
                              </label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={productForm.price}
                                onChange={(e) =>
                                  setProductForm({
                                    ...productForm,
                                    price: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                              </label>
                              <select
                                value={productForm.categoryId}
                                onChange={(e) =>
                                  setProductForm({
                                    ...productForm,
                                    categoryId: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              >
                                <option value="">Select category</option>
                                {categories.map((category) => (
                                  <option
                                    key={category._id}
                                    value={category._id}
                                  >
                                    {category.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock
                              </label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={productForm.stock}
                                onChange={(e) =>
                                  setProductForm({
                                    ...productForm,
                                    stock: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              placeholder="Product description"
                              value={productForm.description}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={3}
                              required
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="featured"
                              checked={productForm.featured}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  featured: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                              htmlFor="featured"
                              className="text-sm font-medium text-gray-700"
                            >
                              Featured on Homepage
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Image (Optional)
                            </label>
                            <div className="space-y-3">
                              {productForm.image ? (
                                <div className="relative inline-block">
                                  <IKImage
                                    urlEndpoint={
                                      process.env
                                        .NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
                                    }
                                    path={productForm.image}
                                    alt="Product"
                                    width={120}
                                    height={120}
                                    className="rounded-lg border"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setProductForm({
                                        ...productForm,
                                        image: '',
                                      })
                                    }
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                  <IKUpload
                                    publicKey={
                                      process.env
                                        .NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!
                                    }
                                    urlEndpoint={
                                      process.env
                                        .NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
                                    }
                                    authenticator={async () => {
                                      try {
                                        const response = await fetch(
                                          '/api/imagekit-auth'
                                        );
                                        return await response.json();
                                      } catch (error) {
                                        throw new Error(
                                          'Authentication request failed'
                                        );
                                      }
                                    }}
                                    onUploadStart={() => setUploading(true)}
                                    onSuccess={(result) => {
                                      setProductForm({
                                        ...productForm,
                                        image: result.filePath,
                                      });
                                      setUploading(false);
                                    }}
                                    onError={(error) => {
                                      console.error('Upload error:', error);
                                      setUploading(false);
                                    }}
                                    className="hidden"
                                    id="image-upload"
                                    folder="/products"
                                  />
                                  <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer"
                                  >
                                    {uploading ? (
                                      <div className="flex flex-col items-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                        <span className="text-sm text-gray-600">
                                          Uploading...
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center">
                                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">
                                          Click to upload image
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">
                                          PNG, JPG up to 5MB
                                        </span>
                                      </div>
                                    )}
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2 pt-4 border-t">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={resetProductForm}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={uploading}>
                              {editingProduct ? 'Update' : 'Add'} Product
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <div
                        key={product._id}
                        className="bg-white rounded-lg border hover:border-gray-300 transition-colors"
                      >
                        {product.image ? (
                          <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                            <IKImage
                              urlEndpoint={
                                process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
                              }
                              path={product.image}
                              alt={product.name}
                              width={300}
                              height={300}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-medium text-gray-900 text-sm leading-tight flex-1 mr-2">
                              {product.name}
                            </h3>
                            <div className="flex space-x-1 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDeleteProduct(product._id!)
                                }
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-gray-900 text-base">
                              ₹{product.price}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                product.stock > 0
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {product.stock > 0
                                ? `${product.stock} left`
                                : 'Out of stock'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                              {getCategoryName(product.categoryId)}
                            </span>
                            {product.featured && (
                              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === 'categories' && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Categories</h2>
                    <Button size="sm" onClick={() => setShowCategoryForm(true)}>
                      <Tag className="w-4 h-4 mr-1" />
                      Add Category
                    </Button>
                  </div>

                  {showCategoryForm && (
                    <div className="bg-white rounded-lg border p-4 mb-6 max-w-md">
                      <h3 className="font-medium mb-3">Add Category</h3>
                      <form
                        onSubmit={handleCategorySubmit}
                        className="space-y-3"
                      >
                        <Input
                          placeholder="Category name"
                          value={categoryForm.name}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                        <textarea
                          placeholder="Description (optional)"
                          value={categoryForm.description}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                        />
                        <div className="flex space-x-2">
                          <Button type="submit" size="sm">
                            Add
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowCategoryForm(false);
                              setCategoryForm({ name: '', description: '' });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <div
                        key={category._id}
                        className="bg-white rounded-lg border p-3"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900 text-sm">
                            {category.name}
                          </h3>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCategory(category._id!)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        {category.description && (
                          <p className="text-gray-600 text-xs">
                            {category.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
