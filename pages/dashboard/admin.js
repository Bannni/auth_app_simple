import { getSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    getSession().then(session => {
      if (!session) {
        router.push("/login")
      } else if (session.user.role !== "admin") {
        router.push("/dashboard/user")
      } else {
        setLoading(false)
      }
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-800">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <div className="text-sm text-gray-600">
            Logged in as admin
          </div>
        </div>

        {/* WELCOME */}
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded">
          <h2 className="text-2xl font-semibold mb-3 text-gray-900">
            Selamat Datang, Admin!
          </h2>
          <p className="text-gray-700">
            Anda memiliki akses penuh ke sistem. Role:{" "}
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
              Admin
            </span>
          </p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-bold text-lg mb-3 text-gray-900">
              Kelola User
            </h3>
            <p className="text-gray-700 mb-4">
              Tambah, edit, dan hapus pengguna.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              User Management
            </button>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="font-bold text-lg mb-3 text-gray-900">
              Statistik
            </h3>
            <p className="text-gray-700 mb-4">
              Lihat statistik pengguna dan aktivitas.
            </p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Lihat Statistik
            </button>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="font-bold text-lg mb-3 text-gray-900">
              Pengaturan
            </h3>
            <p className="text-gray-700 mb-4">
              Konfigurasi sistem dan aplikasi.
            </p>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
              Pengaturan
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t pt-6 flex justify-between">
          <a
            href="/dashboard/user"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Ke User Dashboard
          </a>
          <a
            href="/api/auth/signout"
            className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700"
          >
            Logout
          </a>
        </div>
      </div>
    </div>
  )
}
