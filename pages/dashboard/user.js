import { getSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import UserLayout from "./components/UserLayout"
import { useCart } from "@/lib/cartContext"

/* =========================
   PRODUCT TABLE COMPONENT
   ========================= */
function ProductTable({ products, loading }) {
  const { addToCart, loading: cartLoading, itemCount } = useCart()
  const [addingProductId, setAddingProductId] = useState(null)
  const [notification, setNotification] = useState(null)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value)
  }

  const showNotification = (totalItems) => {
    setNotification(totalItems)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleAddToCart = async (productId) => {
    setAddingProductId(productId)
    const success = await addToCart(productId, 1)
    if (success) {
      showNotification(itemCount + 1)
    }
    setAddingProductId(null)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 text-center text-black">Loading produk...</div>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 text-center text-black">Belum ada produk tersedia</div>
      </div>
    )
  }

  // Count available products
  const availableCount = products.filter(p => p.stock > 0).length

  return (
    <>
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          ✅ Keranjang berisi <strong>{notification} item</strong>!
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 bg-linear-to-r from-blue-600 to-cyan-500 flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">📦 Katalog Produk</h3>
        <span className="text-white text-sm font-semibold bg-blue-700 px-3 py-1 rounded-full">
          {availableCount} Tersedia
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-black">Gambar</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-black">Produk</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-black">Harga</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-black">Dibuat</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-black">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr 
                key={product.id} 
                className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-all duration-300`}
              >
                <td className="px-6 py-4 text-sm">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-12 w-12 rounded object-cover shadow-sm" />
                  ) : (
                    <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center text-black text-xs">
                      📷
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-black">{product.name}</td>
                <td className="px-6 py-4 text-sm font-semibold text-green-600">{formatCurrency(product.price)}</td>
                <td className="px-6 py-4 text-sm text-black">
                  {new Date(product.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingProductId === product.id || cartLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
                  >
                    {addingProductId === product.id ? "..." : "🛒 +"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-cyan-50 text-sm text-black font-semibold border-t">
        Total Produk: <span className="text-blue-600">{products.length}</span> | 
        Tersedia: <span className="text-green-600">{availableCount}</span>
      </div>
      </div>
    </>
  )
}

/* =========================
   FOOTER COMPONENT
   ========================= */
function Footer() {
  return (
    <footer className="border-t mt-10 pt-6 text-center text-sm text-black">
      <p>&copy; 2026 User Dashboard. Nikmati pengalaman berbelanja terbaik!</p>
    </footer>
  )
}

export default function UserDashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getSession()
        if (!session) {
          router.push("/login")
          return
        }

        setUser(session.user)

        // Fetch products dari API
        const res = await fetch("/api/user/product")
        if (res.ok) {
          const data = await res.json()
          setProducts(data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
        setProductsLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black">
        Loading...
      </div>
    )
  }

  const content = (
    <>
      {/* WELCOME CARD */}
      <div className="mb-8 p-8 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-xl shadow-lg text-white transform transition hover:shadow-xl duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Selamat Datang, {user.name || "Pengguna"}! 🎉
            </h2>
            <p className="text-blue-100 text-lg">
              Temukan ribuan produk berkualitas dengan harga terbaik. Nikmati pengalaman belanja yang menyenangkan dan aman.
            </p>
          </div>
          <div className="text-8xl opacity-40">🛍️</div>
        </div>
      </div>

      {/* INFO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition hover:shadow-xl hover:scale-105 duration-300 border-t-4 border-blue-600">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">👤</div>
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">Profil</span>
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-900">Profil Anda</h3>
          <p className="text-sm text-gray-600 mb-4">Kelola informasi pribadi dan preferensi Anda</p>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700"><strong>Nama:</strong> {user.name || "Belum diisi"}</p>
            <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 transform transition hover:shadow-xl hover:scale-105 duration-300 border-t-4 border-green-600">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">📊</div>
            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">Statistik</span>
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-900">Statistik Belanja</h3>
          <p className="text-sm text-gray-600 mb-4">Pantau aktivitas dan riwayat belanja Anda</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-xs text-gray-600">Transaksi</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">5.2M</div>
              <div className="text-xs text-gray-600">Total Belanja</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 transform transition hover:shadow-xl hover:scale-105 duration-300 border-t-4 border-purple-600">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">🎁</div>
            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-semibold">Promo</span>
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-900">Promo Spesial</h3>
          <p className="text-sm text-gray-600 mb-4">Dapatkan diskon menarik setiap hari</p>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-center font-bold text-sm">
            🔥 Diskon up to 50%
          </div>
        </div>
      </div>

      {/* PRODUCT CATALOG */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-0 overflow-hidden transform transition hover:shadow-xl duration-300">
        <ProductTable products={products} loading={productsLoading} />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 mb-8">
        <a
          href="/cart"
          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 px-6 rounded-xl font-bold hover:shadow-lg transition transform hover:scale-105 duration-300 text-center text-lg"
        >
          🛒 Lihat Keranjang
        </a>
        <a
          href="/products/user-index"
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white py-4 px-6 rounded-xl font-bold hover:shadow-lg transition transform hover:scale-105 duration-300 text-center text-lg"
        >
          🛍️ Belanja Sekarang
        </a>
      </div>
    </>
  )

  return (
    <UserLayout userName={user.name || user.email} userRole={user.role}>
      {content}
    </UserLayout>
  )
}
