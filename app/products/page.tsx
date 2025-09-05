'use client'

import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import Loading from '@/components/Loading'
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
    return <Loading />;
  }

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-white pt-16 pb-20 lg:pt-20 lg:pb-6">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl font-light mb-4">Tea Collection</h1>
            <p className="text-lg text-gray-500 font-light">Browse our complete selection</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-12 pb-8 border-b border-gray-100">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 text-sm font-medium focus:outline-none focus:border-black transition-colors"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 text-sm font-medium focus:outline-none focus:border-black transition-colors bg-white"
            >
              <option value="all">ALL CATEGORIES</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name.toUpperCase()}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 text-sm font-medium focus:outline-none focus:border-black transition-colors bg-white"
            >
              <option value="name">SORT BY NAME</option>
              <option value="price-low">PRICE: LOW TO HIGH</option>
              <option value="price-high">PRICE: HIGH TO LOW</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              {filteredProducts.length} PRODUCTS
              {searchQuery && ` FOR "${searchQuery}"`}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product._id} className="group border border-gray-200 hover:border-gray-400 transition-colors">
                <div className="aspect-square bg-gray-50 p-8">
                  {product.image ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {getCategoryName(product.categoryId)}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium mb-4">{product.name}</h3>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xl font-light">₹{product.price}</span>
                    <span className="text-sm text-gray-500">
                      {product.stock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                    </span>
                  </div>
                  
                  {product.stock > 0 ? (
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-black text-white py-3 font-medium hover:bg-gray-800 transition-colors"
                    >
                      ADD TO CART
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full bg-gray-100 text-gray-400 py-3 font-medium cursor-not-allowed"
                    >
                      OUT OF STOCK
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-light mb-2">No Products Found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}