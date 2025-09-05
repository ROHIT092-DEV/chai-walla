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
      {/* Top Header - Starlink Style */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="flex items-center">
            <h1 className="text-xl font-medium text-black tracking-wide">
              TEASTALL
            </h1>
          </Link>
          
          <div className="flex items-center space-x-8">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className={`text-sm font-medium tracking-wide transition-colors ${
                pathname === '/' ? 'text-black' : 'text-gray-500 hover:text-black'
              }`}>
                HOME
              </Link>
              
              <Link href="/products" className={`text-sm font-medium tracking-wide transition-colors ${
                pathname === '/products' ? 'text-black' : 'text-gray-500 hover:text-black'
              }`}>
                MENU
              </Link>
              
              <Link href="/community" className={`text-sm font-medium tracking-wide transition-colors ${
                pathname === '/community' ? 'text-black' : 'text-gray-500 hover:text-black'
              }`}>
                COMMUNITY
              </Link>
            </div>
            
            {isLoaded ? (
              user ? (
                <div className="flex items-center space-x-6">
                  <Link href="/cart" className="relative hover:opacity-70 transition-opacity">
                    <ShoppingCart className="w-5 h-5 text-black" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </Link>
                  
                  <Link 
                    href="/my-space" 
                    className="hover:opacity-70 transition-opacity"
                  >
                    <UserCircle className="w-5 h-5 text-black" />
                  </Link>
                </div>
              ) : (
                <Link href="/sign-in" className="bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
                  SIGN IN
                </Link>
              )
            ) : (
              <div className="flex items-center space-x-4">
                <div className="w-5 h-5 bg-gray-200 animate-pulse"></div>
                <div className="w-5 h-5 bg-gray-200 animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Mobile Only - Starlink Style */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
        <div className="flex justify-center space-x-12 py-4">
          <Link href="/" className="flex flex-col items-center justify-center transition-opacity hover:opacity-70">
            <Home className={`w-5 h-5 mb-1 ${pathname === '/' ? 'text-black' : 'text-gray-400'}`} />
            <span className={`text-xs font-medium tracking-wide ${pathname === '/' ? 'text-black' : 'text-gray-400'}`}>
              HOME
            </span>
          </Link>
          
          <Link href="/products" className="flex flex-col items-center justify-center transition-opacity hover:opacity-70">
            <Package className={`w-5 h-5 mb-1 ${pathname === '/products' ? 'text-black' : 'text-gray-400'}`} />
            <span className={`text-xs font-medium tracking-wide ${pathname === '/products' ? 'text-black' : 'text-gray-400'}`}>
              MENU
            </span>
          </Link>
          
          <Link href="/community" className="flex flex-col items-center justify-center transition-opacity hover:opacity-70">
            <Users className={`w-5 h-5 mb-1 ${pathname === '/community' ? 'text-black' : 'text-gray-400'}`} />
            <span className={`text-xs font-medium tracking-wide ${pathname === '/community' ? 'text-black' : 'text-gray-400'}`}>
              COMMUNITY
            </span>
          </Link>
        </div>
      </nav>


    </>
  );
}