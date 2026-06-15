import Link from "next/link"
import { useState } from "react"
import { signOut } from "next-auth/react"

export default function AdminNavbar({ userName, userRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 bg-linear-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-xl transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0`}
      >
        {/* LOGO/HEADER */}
        <div className="p-6 border-b border-gray-700">
          <Link href="/dashboard/admin">
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <span>🛍️</span>
              <span>ShopHub</span>
            </h1>
          </Link>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
        </div>

        {/* NAVIGATION MENU */}
        <nav className="mt-6">
          <Link href="/dashboard/admin" className="flex items-center px-6 py-3 hover:bg-gray-700 transition border-l-4 border-transparent hover:border-blue-500">
            <span className="text-lg mr-3">📊</span>
            <span>Dashboard</span>
          </Link>

          <Link href="/products" className="flex items-center px-6 py-3 hover:bg-gray-700 transition border-l-4 border-transparent hover:border-blue-500">
            <span className="text-lg mr-3">📦</span>
            <span>Manajemen Produk</span>
          </Link>

          <Link href="/products/create" className="flex items-center px-6 py-3 hover:bg-gray-700 transition border-l-4 border-transparent hover:border-blue-500">
            <span className="text-lg mr-3">➕</span>
            <span>Tambah Produk</span>
          </Link>

          <Link href="/dashboard/admin" className="flex items-center px-6 py-3 hover:bg-gray-700 transition border-l-4 border-transparent hover:border-blue-500">
            <span className="text-lg mr-3">👥</span>
            <span>Manajemen User</span>
          </Link>

          <Link href="/dashboard/admin" className="flex items-center px-6 py-3 hover:bg-gray-700 transition border-l-4 border-transparent hover:border-blue-500">
            <span className="text-lg mr-3">📈</span>
            <span>Laporan</span>
          </Link>

          <Link href="/dashboard/admin" className="flex items-center px-6 py-3 hover:bg-gray-700 transition border-l-4 border-transparent hover:border-blue-500">
            <span className="text-lg mr-3">⚙️</span>
            <span>Pengaturan</span>
          </Link>
        </nav>

        {/* USER INFO & LOGOUT */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700 bg-gray-800">
          <div className="mb-3">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-bold text-white truncate">{userName}</p>
            <div className="mt-2 inline-block px-3 py-1 bg-red-900 text-red-200 text-xs rounded-full font-semibold">
              {userRole}
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* TOP HEADER */}
        <div className="bg-white shadow-md z-30 relative">
          <div className="flex items-center justify-between h-16 px-6">
            {/* TOGGLE SIDEBAR BUTTON */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none md:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* TITLE */}
            <h2 className="text-xl font-bold text-gray-800 flex-1 ml-4 md:ml-0">
              Dashboard Admin
            </h2>

            {/* USER PROFILE MENU */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-600">
                  Selamat datang, <span className="font-bold">{userName}</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* OVERLAY FOR MOBILE SIDEBAR */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
