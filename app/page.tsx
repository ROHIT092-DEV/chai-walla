'use client';

import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { fetchWithDeduplication } from '@/lib/api-utils';
import { Product } from '@/lib/product';
import { useCart } from '@/contexts/CartContext';
import {
  ShoppingCart,
  ArrowRight,
  Users,
  Coffee,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

export default function Home() {
  const { user } = useUser();
  const { addToCart } = useCart();
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
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
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    const loadData = async () => {
      try {
        const [productsRes, dashboardRes] = await Promise.all([
          fetch('/api/products/featured'),
          fetch('/api/dashboard'),
        ]);

        if (productsRes.ok) {
          const products = await productsRes.json();
          setFeaturedProducts(Array.isArray(products) ? products : []);
        }

        if (dashboardRes.ok) {
          const dashboard = await dashboardRes.json();
          setDashboardData(dashboard);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => setLoading(false), 300);
      }
    };

    loadData();
    
    return () => clearInterval(progressInterval);
  }, []);

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
        <div className="min-h-screen bg-white flex items-center justify-center">
          {/* Progress Bar */}
          <div className="fixed top-14 left-0 right-0 z-40">
            <div className="h-0.5 bg-gray-100">
              <div
                className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Loading Content */}
          <div className="text-center">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <Coffee className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-light mb-2">Loading Tea Collection</h2>
            <p className="text-gray-500">Preparing your premium experience...</p>
            <div className="mt-4 text-sm text-gray-400">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white pt-14 pb-20 lg:pt-16 lg:pb-0">
        {/* Hero Section */}
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight">
                Premium Tea
                <span className="block font-normal">Delivered Fresh</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                Discover authentic teas, carefully sourced and delivered fresh
                to your doorstep.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => router.push('/products')}
                  className="bg-white text-black px-8 py-3 rounded-sm font-medium hover:bg-gray-100 transition-colors w-full sm:w-auto"
                >
                  ORDER NOW
                </button>
                <button
                  onClick={() => router.push('/products')}
                  className="border border-white/30 text-white px-8 py-3 rounded-sm font-medium hover:bg-white/10 transition-colors w-full sm:w-auto"
                >
                  LEARN MORE
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white text-black py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-4">Premium Quality</h3>
                <p className="text-gray-600 leading-relaxed">
                  Hand-picked tea leaves from the finest gardens, ensuring
                  exceptional taste and aroma in every cup.
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-4">Fast Delivery</h3>
                <p className="text-gray-600 leading-relaxed">
                  Quick and reliable delivery service ensuring your tea reaches
                  you fresh and on time.
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-4">Customer Care</h3>
                <p className="text-gray-600 leading-relaxed">
                  Dedicated support team to help you choose the perfect tea and
                  ensure complete satisfaction.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-light text-black mb-2">
                  {dashboardData.stats.totalUsers}+
                </div>
                <div className="text-gray-600 text-sm uppercase tracking-wide">
                  Happy Customers
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="text-3xl md:text-4xl font-light text-black mb-2">
                  {dashboardData.stats.totalOrders}+
                </div>
                <div className="text-gray-600 text-sm uppercase tracking-wide">
                  Orders Delivered
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="text-3xl md:text-4xl font-light text-black mb-2">
                  {dashboardData.stats.totalProducts}+
                </div>
                <div className="text-gray-600 text-sm uppercase tracking-wide">
                  Tea Varieties
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="text-3xl md:text-4xl font-light text-black mb-2">
                  24/7
                </div>
                <div className="text-gray-600 text-sm uppercase tracking-wide">
                  Support
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="bg-black text-white py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-light mb-6">
                Featured Collection
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto font-light">
                Discover our most popular tea varieties
              </p>
            </div>

            {featuredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <Coffee className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-light mb-3">
                  New Collection Coming Soon
                </h3>
                <p className="text-gray-400">
                  Amazing tea varieties are being curated for you
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {featuredProducts.slice(0, 6).map((product, index) => (
                    <motion.div
                      key={product._id}
                      className="group border border-gray-800 hover:border-gray-600 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="aspect-square bg-gray-900 p-8 relative">
                        {product.image ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}${product.image}`}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Coffee className="w-16 h-16 text-gray-600" />
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-lg font-medium mb-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xl font-light">
                            ₹{product.price}
                          </span>
                          <span className="text-sm text-gray-400">
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        {product.stock > 0 ? (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-full bg-white text-black py-3 font-medium hover:bg-gray-100 transition-colors"
                          >
                            ADD TO CART
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-gray-800 text-gray-500 py-3 font-medium cursor-not-allowed"
                          >
                            OUT OF STOCK
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={() => router.push('/products')}
                    className="border border-white/30 text-white px-8 py-3 font-medium hover:bg-white/10 transition-colors"
                  >
                    VIEW ALL PRODUCTS
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
