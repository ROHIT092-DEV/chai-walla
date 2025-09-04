'use client';

import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';
import { Product } from '@/lib/product';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useUser();
  const { addToCart } = useCart();
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    averageRating: 0
  });

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchFeaturedProducts(), fetchStats()]);
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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setStats({
          totalCustomers: 500,
          totalProducts: 50,
          averageRating: 4.8
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalCustomers: 500,
        totalProducts: 50,
        averageRating: 4.8
      });
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
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-orange-300 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">☕ Brewing Something Special</h2>
              <p className="text-orange-400 animate-pulse">Loading delicious content...</p>
              <div className="flex justify-center space-x-1 mt-4">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
        {/* Hero Section - PW Live Style */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-24">
            <div className="text-center">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                  ⚡ India&apos;s #1 Tea Stall Platform
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-4 lg:mb-6 leading-tight">
                  Sip. Savor.
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                    Succeed.
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-blue-100 mb-6 lg:mb-8 max-w-3xl mx-auto leading-relaxed">
                  Transform your tea experience with premium quality products, authentic flavors, and unmatched service.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center mb-8 lg:mb-12">
                  <button 
                    onClick={() => router.push('/products')}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg transition-all duration-300 shadow-xl hover:shadow-orange-500/25 transform hover:-translate-y-1"
                  >
                    🚀 Start Shopping
                  </button>
                  <button className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg transition-all duration-300">
                    📱 Download App
                  </button>
                </div>
                
                {/* Achievement Stats */}
                <div className="grid grid-cols-3 gap-4 lg:gap-8 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl xl:text-4xl font-black text-yellow-300 mb-1 lg:mb-2">{stats.totalCustomers}+</div>
                    <div className="text-blue-200 text-xs lg:text-sm font-medium">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-black text-yellow-300 mb-2">{stats.totalProducts}+</div>
                    <div className="text-blue-200 text-sm font-medium">Premium Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-black text-yellow-300 mb-2">{stats.averageRating.toFixed(1)}★</div>
                    <div className="text-blue-200 text-sm font-medium">User Rating</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="bg-gray-50 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 mb-3 lg:mb-4">
                Why Choose Our Tea Stall?
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                Experience the perfect blend of tradition and innovation
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <motion.div 
                className="text-center p-6 lg:p-8 bg-white rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4">Lightning Fast</h3>
                <p className="text-sm lg:text-base text-gray-600">Quick service and instant ordering for busy schedules</p>
              </motion.div>
              
              <motion.div 
                className="text-center p-6 lg:p-8 bg-white rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4">Premium Quality</h3>
                <p className="text-sm lg:text-base text-gray-600">Handpicked ingredients and authentic recipes</p>
              </motion.div>
              
              <motion.div 
                className="text-center p-6 lg:p-8 bg-white rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">💯</span>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4">100% Fresh</h3>
                <p className="text-sm lg:text-base text-gray-600">Made fresh daily with natural ingredients</p>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Featured Products Section */}
        <div className="bg-white py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div 
              className="text-center mb-8 lg:mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 mb-3 lg:mb-4">
                🔥 Trending Products
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                Discover what&apos;s hot and popular among our customers
              </p>
            </motion.div>

            {featuredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <ShoppingCart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 lg:mb-3">
                  🎉 Coming Soon!
                </h3>
                <p className="text-gray-600 text-base lg:text-lg">
                  Amazing products are being curated just for you!
                </p>
              </div>
            ) : (
            <>
              {/* Products Grid - Modern PW Style */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-4 mb-8 lg:mb-12">
                {featuredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    className="group bg-white rounded-xl lg:rounded-2xl shadow-md lg:shadow-lg hover:shadow-xl lg:hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 p-4 relative">
                      {product.image ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}${product.image}`}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M2 21h19v-3H2v3zM20 8H4V6c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2zm-8.5 0h-3V6h3v2zm7.5 0h-3V6h3v2z"/>
                                  </svg>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M2 21h19v-3H2v3zM20 8H4V6c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2zm-8.5 0h-3V6h3v2zm7.5 0h-3V6h3v2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full px-2 py-1">
                        <span className="text-xs font-bold text-white">🔥</span>
                      </div>
                    </div>

                    <div className="p-3 lg:p-4">
                      <h3 className="font-bold text-gray-900 text-xs lg:text-sm mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base lg:text-lg font-black text-blue-600">
                          ₹{product.price}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          product.stock > 10 
                            ? 'bg-green-100 text-green-700' 
                            : product.stock > 0 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                        </span>
                      </div>

                      {product.stock > 0 ? (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg lg:rounded-xl text-xs lg:text-sm font-bold transition-all duration-300 shadow-md lg:shadow-lg hover:shadow-lg lg:hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          🛒 Add to Cart
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-gray-100 text-gray-400 py-2 rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium cursor-not-allowed"
                        >
                          😔 Out of Stock
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* View More Button */}
              <div className="text-center">
                <button
                  onClick={() => router.push('/products')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 lg:px-10 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg transition-all duration-300 shadow-lg lg:shadow-xl hover:shadow-xl lg:hover:shadow-2xl transform hover:-translate-y-1 flex items-center space-x-2 lg:space-x-3 mx-auto"
                >
                  <span>🚀 Explore All Products</span>
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
