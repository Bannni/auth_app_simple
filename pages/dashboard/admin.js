import { getSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import AdminLayout from "./components/AdminLayout"

/* =========================
   FOOTER COMPONENT
   ========================= */
function Footer() {
  return (
    <footer className="border-t mt-10 pt-6 flex justify-between items-center text-sm text-black">
      <span>&copy; 2026 Admin Dashboard. All rights reserved.</span>
    </footer>
  )
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [userName, setUserName] = useState("")
  const router = useRouter()

  useEffect(() => {
    getSession().then(session => {
      if (!session) {
        router.push("/login")
      } else {
        setUserRole(session.user.role)
        setUserName(session.user.name || session.user.email)
        setLoading(false)
      }
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black">
        Loading...
      </div>
    )
  }

  const isAdmin = userRole === "admin"

  const content = (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-4xl">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-black">
            {isAdmin ? "Admin Dashboard" : "Dashboard Pengguna"}
          </h1>
          <div className="text-sm text-black">
            Logged in as <span className="font-bold text-black">{userRole}</span>
          </div>
        </div>

        {/* WELCOME SECTION */}
        <div className="mb-8 p-6 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-3 text-black">
            Selamat Datang, {userName}!
          </h2>
          <p className="text-black">
            Anda masuk sebagai{" "}
            <span className={`px-3 py-1 rounded-full font-bold ${isAdmin ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
              {isAdmin ? "Administrator" : "Pengguna"}
            </span>
          </p>
        </div>

        {/* STATISTICS CARDS */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Produk</p>
                  <p className="text-3xl font-bold text-blue-600">0</p>
                </div>
                <div className="text-4xl text-blue-200">📦</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-green-200 shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Pengguna</p>
                  <p className="text-3xl font-bold text-green-600">0</p>
                </div>
                <div className="text-4xl text-green-200">👥</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-purple-200 shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pesanan Pending</p>
                  <p className="text-3xl font-bold text-purple-600">0</p>
                </div>
                <div className="text-4xl text-purple-200">📋</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-yellow-200 shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Inventori Rendah</p>
                  <p className="text-3xl font-bold text-yellow-600">0</p>
                </div>
                <div className="text-4xl text-yellow-200">⚠️</div>
              </div>
            </div>
          </div>
        )}

        {/* QUICK ACTIONS */}
        {isAdmin && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-black">Aksi Cepat</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a 
                href="/products"
                className="bg-linear-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-md hover:shadow-lg transition transform hover:scale-105 block text-decoration-none cursor-pointer"
              >
                <div className="text-3xl mb-3">📦</div>
                <h3 className="font-bold text-lg mb-2 text-black">
                  Manajemen Produk
                </h3>
                <p className="text-black text-sm mb-4">
                  Tambah, edit, atau hapus produk dari katalog Anda.
                </p>
                <div className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition inline-block text-sm">
                  Kelola Produk →
                </div>
              </a>

              <div className="bg-linear-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 shadow-md hover:shadow-lg transition transform hover:scale-105">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-bold text-lg mb-2 text-black">
                  Laporan & Statistik
                </h3>
                <p className="text-black text-sm mb-4">
                  Lihat analisis penjualan, inventori, dan performa.
                </p>
                <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition text-sm">
                  Lihat Laporan →
                </button>
              </div>

              <div className="bg-linear-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-md hover:shadow-lg transition transform hover:scale-105">
                <div className="text-3xl mb-3">⚙️</div>
                <h3 className="font-bold text-lg mb-2 text-black">
                  Pengaturan Sistem
                </h3>
                <p className="text-black text-sm mb-4">
                  Konfigurasi aplikasi, user, dan preferensi sistem.
                </p>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm">
                  Pengaturan →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RECENT ACTIVITY */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-black">Aktivitas Terbaru</h3>
          <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div>
                  <p className="text-black font-medium">Anda login ke sistem</p>
                  <p className="text-gray-600 text-sm">Baru saja</p>
                </div>
                <span className="text-2xl">🔐</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div>
                  <p className="text-black font-medium">Sistem dashboard siap digunakan</p>
                  <p className="text-gray-600 text-sm">Sistem berjalan normal</p>
                </div>
                <span className="text-2xl">✅</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-black font-medium">Selamat datang di Admin Panel</p>
                  <p className="text-gray-600 text-sm">Mulai kelola aplikasi Anda</p>
                </div>
                <span className="text-2xl">🎉</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 mb-8">
          <a
            href="/api/auth/signout"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition shadow-md hover:shadow-lg"
          >
            Logout
          </a>
          <button
            onClick={() => router.reload()}
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 transition shadow-md hover:shadow-lg"
          >
            Refresh
          </button>
        </div>

        <Footer />
      </div>
    </div>
  )

  return (
    <AdminLayout userName={userName} userRole={userRole}>
      {content}
    </AdminLayout>
  )
}

