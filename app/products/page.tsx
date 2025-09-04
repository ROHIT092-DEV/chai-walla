'use client'

import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import { useEffect, useState } from 'react'
import { Product, Category } from '@/lib/product'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, Filter, SortAsc, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProductsPage() {
  const { user } = useUser()
  const { addToCart } = useCart()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchProducts(), fetchCategories()])
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, selectedCategory, sortBy, searchQuery])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = products
    
    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredProducts(filtered)
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId)
    return category?.name || 'Unknown'
  }

  const handleAddToCart = (product: Product) => {
    if (!user) {
      router.push('/sign-in')
      return
    }
    addToCart(product)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="mb-6">
              <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
            <div className="mb-6">
              <div className="h-10 bg-gray-200 rounded w-80 animate-pulse"></div>
            </div>
            <div className="bg-white rounded-lg border p-4 mb-6">
              <div className="flex gap-4">
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border overflow-hidden">
                  <div className="aspect-square bg-gray-200 animate-pulse"></div>
                  <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gray-50 pt-16 pb-20 lg:pt-20 lg:pb-6">
        <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
          {/* Header */}
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-1 lg:mb-2">All Products</h1>
            <p className="text-sm lg:text-base text-gray-600">Browse our complete collection</p>
          </div>

          {/* Search Bar */}
          <div className="mb-4 lg:mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 lg:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4 mb-4 lg:mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <SortAsc className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid - Flipkart Style */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 lg:gap-3">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100 p-1.5 lg:p-2">
                  {product.image ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                            <svg class="w-6 lg:w-8 h-6 lg:h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M2 21h19v-3H2v3zM20 8H4V6c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2zm-8.5 0h-3V6h3v2zm7.5 0h-3V6h3v2z"/>
                            </svg>
                          </div>
                        `
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-6 lg:w-8 h-6 lg:h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2 21h19v-3H2v3zM20 8H4V6c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2zm-8.5 0h-3V6h3v2zm7.5 0h-3V6h3v2z"/>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="p-2 lg:p-3">
                  <h3 className="font-medium text-gray-900 text-xs lg:text-sm mb-1 line-clamp-2 leading-tight">{product.name}</h3>
                  <div className="mb-1.5 lg:mb-2">
                    <span className="text-xs text-blue-600 bg-blue-50 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded">
                      {getCategoryName(product.categoryId)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-1.5 lg:mb-2">
                    <span className="text-base lg:text-lg font-bold text-gray-900">₹{product.price}</span>
                  </div>
                  
                  {product.stock > 0 ? (
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-1.5 lg:py-2 rounded text-xs lg:text-sm font-medium transition-colors"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-1.5 lg:py-2 rounded text-xs lg:text-sm cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}