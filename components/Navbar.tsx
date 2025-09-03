'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { useUserRole } from '@/hooks/useUserRole';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Coffee, Settings, User, ShoppingCart, Search, Package, UserCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const { role, loading } = useUserRole();
  const { getTotalItems, isLoaded: cartLoaded } = useCart();
  const pathname = usePathname();
  
  const totalItems = cartLoaded ? getTotalItems() : 0;

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 backdrop-blur-lg">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              Tea Stall
            </span>
          </Link>
          
          <div className="flex items-center space-x-2">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2 mr-4">
              <Link href="/" className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                pathname === '/' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}>
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              
              <Link href="/products" className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                pathname === '/products' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}>
                <Package className="w-5 h-5" />
                <span className="font-medium">Menu</span>
              </Link>
            </div>
            
            {isLoaded ? (
              user ? (
                <>
                  <Link href="/cart" className="relative p-3 hover:bg-slate-800 rounded-xl transition-colors">
                    <ShoppingCart className="w-6 h-6 text-white" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </Link>
                  
                  <Link 
                    href="/my-space" 
                    className={`p-3 rounded-xl transition-colors ${
                      pathname === '/my-space' ? 'bg-orange-500' : 'hover:bg-slate-800'
                    }`}
                  >
                    <UserCircle className="w-6 h-6 text-white" />
                  </Link>
                </>
              ) : (
                <Link href="/sign-in" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg">
                  Sign In
                </Link>
              )
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-slate-800 rounded-xl animate-pulse"></div>
                <div className="w-12 h-12 bg-slate-800 rounded-xl animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800">
        <div className="flex justify-center space-x-8 py-4">
          <Link href="/" className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all ${
            pathname === '/' ? 'bg-orange-500' : 'hover:bg-slate-800'
          }`}>
            <Home className={`w-5 h-5 mb-1 ${pathname === '/' ? 'text-white' : 'text-slate-400'}`} />
            <span className={`text-xs font-bold ${pathname === '/' ? 'text-white' : 'text-slate-400'}`}>
              Home
            </span>
          </Link>
          
          <Link href="/products" className={`flex flex-col items-center justify-center px-6 py-3 rounded-xl transition-all ${
            pathname === '/products' ? 'bg-orange-500' : 'hover:bg-slate-800'
          }`}>
            <Package className={`w-6 h-6 mb-1 ${pathname === '/products' ? 'text-white' : 'text-slate-400'}`} />
            <span className={`text-xs font-bold ${pathname === '/products' ? 'text-white' : 'text-slate-400'}`}>
              Menu
            </span>
          </Link>
        </div>
      </nav>


    </>
  );
}