import { getSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function UserDashboard() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    getSession().then(session => {
      if (!session) {
        router.push("/login")
      } else {
        setUser(session.user)
      }
    })
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-800">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        
        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          User Dashboard
        </h1>

        {/* WELCOME */}
        <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            Selamat Datang!
          </h2>
          <p className="text-gray-700">
            Halo <strong>{user.name || user.email}</strong>
          </p>
          <p className="text-gray-700 mt-2">
            Role Anda:{" "}
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
              {user.role}
            </span>
          </p>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg mb-3 text-gray-900">
              Profil Saya
            </h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Nama:</strong> {user.name || "Belum diisi"}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Edit Profil
            </button>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg mb-3 text-gray-900">
              Fitur User
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Lihat dan edit profil pribadi</li>
              <li>Riwayat aktivitas</li>
              <li>Pengaturan akun</li>
              <li>Notifikasi sistem</li>
            </ul>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t pt-6 flex justify-between">
          {user.role === "admin" && (
            <a
              href="/dashboard/admin"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Ke Admin Dashboard
            </a>
          )}
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
