'use client';

import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';
import { Product } from '@/lib/product';
import { useCart } from '@/contexts/CartContext';
import {
  ShoppingCart,
  ArrowRight,
  Play,
  Star,
  Users,
  Coffee,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useUser();
  const { addToCart } = useCart();
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalPosts: 0,
      totalRevenue: 0,
    },
    growth: {
      users: '+0%',
      orders: '+0%',
      revenue: '+0%',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchFeaturedProducts(), fetchDashboardData()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products/featured');
      if (response.ok) {
        const data = await response.json();
        setFeaturedProducts(Array.isArray(data) ? data : []);
      } else {
        setFeaturedProducts([]);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setFeaturedProducts([]);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    addToCart(product);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
              <div
                className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-orange-300 rounded-full animate-spin mx-auto"
                style={{
                  animationDirection: 'reverse',
                  animationDuration: '1.5s',
                }}
              ></div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">
                ☕ Brewing Something Special
              </h2>
              <p className="text-orange-400 animate-pulse">
                Loading delicious content...
              </p>
              <div className="flex justify-center space-x-1 mt-4">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white pt-16 pb-20 lg:pt-20 lg:pb-0">
        {/* Hero Section - Papa React Design for Tea Stall */}
        <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '2s' }}
            ></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm text-orange-200 px-6 py-3 rounded-full text-sm font-medium mb-8 border border-orange-500/30">
                  <Coffee className="w-4 h-4 mr-2" />
                  India's Premium Tea Collection
                </div>

                <h1 className="text-3xl sm:text-6xl lg:text-8xl font-black mb-8 leading-tight">
                  Premium Tea
                  <span className="block bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Delivered Fresh
                  </span>
                </h1>

                <p className="text-sm lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                  Discover the finest collection of authentic teas, carefully
                  sourced and delivered fresh to your doorstep. Experience the
                  perfect brew every time.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                  <div className="flex flex-wrap gap-6 mt-8">
                    {/* Shop Now Button */}
                    <button
                      onClick={() => router.push('/products')}
                      className="group bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700
               text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-semibold text-lg sm:text-xl
               transition-all duration-300 shadow-xl hover:shadow-orange-500/30
               transform hover:-translate-y-1 flex items-center justify-center gap-3"
                    >
                      <span className="tracking-wide">Shop Now</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* View Collection Button */}
                    <button
                      className="group bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20
               text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-semibold text-lg sm:text-xl
               transition-all duration-300 hover:border-white/40 flex items-center justify-center gap-3"
                    >
                      <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="tracking-wide">View Collection</span>
                    </button>
                  </div>
                </div>

                {/* Real-time Business Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div className="text-4xl lg:text-5xl font-black text-orange-400 mb-2">
                      {dashboardData.stats.totalUsers}+
                    </div>
                    <div className="text-gray-300 text-sm lg:text-base">
                      Happy Customers
                    </div>
                    <div className="text-green-400 text-xs mt-1">
                      {dashboardData.growth.users} this month
                    </div>
                  </motion.div>

                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <div className="text-4xl lg:text-5xl font-black text-yellow-400 mb-2">
                      {dashboardData.stats.totalOrders}+
                    </div>
                    <div className="text-gray-300 text-sm lg:text-base">
                      Orders Delivered
                    </div>
                    <div className="text-green-400 text-xs mt-1">
                      {dashboardData.growth.orders} this month
                    </div>
                  </motion.div>

                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <div className="text-4xl lg:text-5xl font-black text-pink-400 mb-2">
                      {dashboardData.stats.totalPosts}+
                    </div>
                    <div className="text-gray-300 text-sm lg:text-base">
                      Community Posts
                    </div>
                    <div className="text-pink-400 text-xs mt-1">
                      Tea stories shared
                    </div>
                  </motion.div>

                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <div className="text-4xl lg:text-5xl font-black text-green-400 mb-2">
                      {dashboardData.stats.totalProducts}+
                    </div>
                    <div className="text-gray-300 text-sm lg:text-base">
                      Tea Varieties
                    </div>
                    <div className="text-green-400 text-xs mt-1">
                      Premium quality
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
                Why Choose Our Tea?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the difference with our premium quality, authentic
                flavors, and exceptional service
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Coffee className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Premium Quality
                </h3>
                <p className="text-gray-600 mb-6">
                  Hand-picked tea leaves from the finest gardens, ensuring
                  exceptional taste and aroma in every cup
                </p>
                <div className="text-orange-600 font-semibold">
                  100% Authentic • Fresh Daily
                </div>
              </motion.div>

              <motion.div
                className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Fast Delivery
                </h3>
                <p className="text-gray-600 mb-6">
                  Quick and reliable delivery service ensuring your tea reaches
                  you fresh and on time
                </p>
                <div className="text-green-600 font-semibold">
                  Same Day • Free Shipping
                </div>
              </motion.div>

              <motion.div
                className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Customer Care
                </h3>
                <p className="text-gray-600 mb-6">
                  Dedicated support team to help you choose the perfect tea and
                  ensure complete satisfaction
                </p>
                <div className="text-blue-600 font-semibold">
                  24/7 Support • Expert Advice
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
                What Our Customers Say
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Real reviews from real tea lovers who trust our quality
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold">C{i}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Customer {i}</h4>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    "Amazing quality tea! The flavor is incredible and delivery
                    was super fast. Will definitely order again!"
                  </p>
                  <div className="text-sm text-orange-600 font-semibold">
                    Verified Purchase
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => router.push('/community')}
                className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white px-8 py-3 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2 mx-auto"
              >
                <span>View All Reviews</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
                🔥 Trending Teas
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover our most popular tea varieties loved by thousands of
                customers
              </p>
            </div>

            {featuredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <ShoppingCart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  🎉 New Collection Coming Soon!
                </h3>
                <p className="text-gray-600 text-lg">
                  Amazing tea varieties are being curated just for you!
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-12">
                  {featuredProducts.map((product, index) => (
                    <motion.div
                      key={product._id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-orange-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <div className="aspect-square bg-gradient-to-br from-orange-50 to-yellow-50 p-4 relative">
                        {product.image ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}${product.image}`}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Coffee className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full px-2 py-1">
                          <span className="text-xs font-bold text-white">
                            🔥
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-black text-orange-600">
                            ₹{product.price}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              product.stock > 10
                                ? 'bg-green-100 text-green-700'
                                : product.stock > 0
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {product.stock > 0
                              ? `${product.stock} left`
                              : 'Out of stock'}
                          </span>
                        </div>

                        {product.stock > 0 ? (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white py-2 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            🛒 Add to Cart
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-gray-100 text-gray-400 py-2 rounded-xl text-sm font-medium cursor-not-allowed"
                          >
                            😔 Out of Stock
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={() => router.push('/products')}
                    className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center space-x-3 mx-auto"
                  >
                    <span>🚀 Explore All Teas</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
