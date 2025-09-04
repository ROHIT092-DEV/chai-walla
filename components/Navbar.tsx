'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { useUserRole } from '@/hooks/useUserRole';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Coffee, Settings, User, ShoppingCart, Search, Package, UserCircle, Users } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const { role, loading } = useUserRole();
  const { getTotalItems, isLoaded: cartLoaded } = useCart();
  const pathname = usePathname();
  
  const totalItems = cartLoaded ? getTotalItems() : 0;

  return (
    <>
      {/* Top Header - Instagram Style */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between max-w-5xl mx-auto">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 tracking-tight">
              Tea Stall
            </span>
          </Link>
          
          <div className="flex items-center space-x-3">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 mr-6">
              <Link href="/" className={`flex items-center space-x-1 transition-colors ${
                pathname === '/' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}>
                <Home className="w-6 h-6" />
                <span className="font-normal text-base">Home</span>
              </Link>
              
              <Link href="/products" className={`flex items-center space-x-1 transition-colors ${
                pathname === '/products' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}>
                <Package className="w-6 h-6" />
                <span className="font-normal text-base">Menu</span>
              </Link>
              
              <Link href="/community" className={`flex items-center space-x-1 transition-colors ${
                pathname === '/community' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}>
                <Users className="w-6 h-6" />
                <span className="font-normal text-base">Community</span>
              </Link>
            </div>
            
            {isLoaded ? (
              user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ShoppingCart className="w-6 h-6 text-gray-700" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </Link>
                  
                  <Link 
                    href="/my-space" 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <UserCircle className="w-6 h-6 text-gray-700" />
                  </Link>
                </div>
              ) : (
                <Link href="/sign-in" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                  Sign In
                </Link>
              )
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Mobile Only - Instagram Style */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="flex justify-center space-x-8 py-3">
          <Link href="/" className="flex flex-col items-center justify-center py-2 transition-all">
            <Home className={`w-6 h-6 mb-1 ${pathname === '/' ? 'text-gray-900' : 'text-gray-400'}`} />
            <span className={`text-xs ${pathname === '/' ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              Home
            </span>
          </Link>
          
          <Link href="/products" className="flex flex-col items-center justify-center py-2 transition-all">
            <Package className={`w-6 h-6 mb-1 ${pathname === '/products' ? 'text-gray-900' : 'text-gray-400'}`} />
            <span className={`text-xs ${pathname === '/products' ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              Menu
            </span>
          </Link>
          
          <Link href="/community" className="flex flex-col items-center justify-center py-2 transition-all">
            <Users className={`w-6 h-6 mb-1 ${pathname === '/community' ? 'text-gray-900' : 'text-gray-400'}`} />
            <span className={`text-xs ${pathname === '/community' ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              Community
            </span>
          </Link>
        </div>
      </nav>


    </>
  );
}