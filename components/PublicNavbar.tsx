'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Coffee, Search, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicNavbar() {
  const { user } = useUser();
  const pathname = usePathname();

  const menuItems = [
    { id: 'home', icon: Home, label: 'Home', href: '/' },
    { id: 'account', icon: User, label: 'Account', href: user ? '/my-space' : '/sign-in' }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:flex">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tea Stall</h1>
                <p className="text-xs text-gray-500">Fresh & Delicious</p>
              </div>
            </div>

            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for tea, snacks, beverages..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <Link href="/cart" className="relative p-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all">
                    <ShoppingCart className="w-5 h-5" />
                  </Link>
                  <Link href="/my-space">
                    <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                      My Account
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/sign-in">
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Top Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Tea Stall</h1>
                <p className="text-xs text-gray-500">Fresh & Delicious</p>
              </div>
            </div>
            
            {user ? (
              <Link href="/cart" className="relative p-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all">
                <ShoppingCart className="w-5 h-5" />
              </Link>
            ) : (
              <Link href="/sign-in">
                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
          <div className="flex">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`relative flex-1 flex flex-col items-center justify-center py-3 transition-all ${
                    isActive 
                      ? 'text-orange-600 bg-orange-50' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-orange-600' : 'text-gray-500'}`} />
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-b-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Spacers */}
      <div className="pt-16 pb-20 lg:pt-16 lg:pb-0" />
    </>
  );
}