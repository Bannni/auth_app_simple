import Link from "next/link"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { useCart } from "@/lib/cartContext"

export default function Navbar({ userName, userRole }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { itemCount } = useCart()

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LOGO / BRAND */}
          <div className="shrink-0">
            <Link href="/dashboard/user" className="flex items-center space-x-2 text-2xl font-bold bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              <span>🛍️</span>
              <span>ShopHub</span>
            </Link>
          </div>

          {/* CENTER NAVIGATION - DESKTOP */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard/user" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Home
            </Link>
            <Link href="/products/user-index" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Produk
            </Link>
            <Link href="/cart" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Keranjang
            </Link>
          </div>

          {/* RIGHT SIDE - CART & USER PROFILE */}
          <div className="flex items-center space-x-4">
            {/* CART ICON */}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {/* USER MENU */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* USER DROPDOWN */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{userRole}</p>
                  </div>
                  
                  <Link href="/dashboard/user" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition">
                    👤 My Account
                  </Link>
                  <Link href="/cart" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition">
                    🛒 My Orders
                  </Link>
                  <Link href="/products/user-index" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition">
                    ❤️ Wishlist
                  </Link>
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <Link href="/dashboard/user" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
              🏠 Home
            </Link>
            <Link href="/products/user-index" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
              📦 Produk
            </Link>
            <Link href="/cart" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition items-center justify-between">
              <span>🛒 Keranjang</span>
              {itemCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="px-4 py-2 text-sm text-gray-500">
                <p className="font-semibold text-gray-900">{userName}</p>
                <p>{userRole}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center space-x-2 mt-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
