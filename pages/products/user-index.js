import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import UserLayout from "../dashboard/components/UserLayout";
import { useCart } from "@/lib/cartContext";

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return { props: {} };
}

export default function UserProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [addingProductId, setAddingProductId] = useState(null);
  const [notification, setNotification] = useState(null);
  const router = useRouter();
  const { addToCart, fetchCart, itemCount } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        setUserName(session.user.name || session.user.email);

        const res = await fetch("/api/user/product");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
        await fetchCart();
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, fetchCart]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showNotification = (totalItems) => {
    setNotification(totalItems);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddToCart = async (productId) => {
    setAddingProductId(productId);
    const success = await addToCart(productId, 1);
    if (success) {
      showNotification(itemCount + 1);
    }
    setAddingProductId(null);
  };

  const content = (
    <>
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          ✅ Keranjang berisi <strong>{notification} item</strong>!
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl shadow-lg p-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">🛍️ Katalog Produk</h1>
              <p className="text-blue-100">Temukan ribuan produk berkualitas dengan harga terbaik</p>
            </div>
            <Link href="/cart">
              <span className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition shadow-md cursor-pointer inline-block font-semibold">
                🛒 Lihat Keranjang ({itemCount})
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <input
            type="text"
            placeholder="🔍 Cari produk berdasarkan nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Memuat produk...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl text-gray-600">Belum ada produk tersedia.</p>
            <p className="text-gray-500 mt-2">Silakan tunggu produk terbaru dari toko kami</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600">Tidak ada produk yang sesuai</p>
            <p className="text-gray-500 mt-2">Coba kata kunci pencarian lain</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <p className="text-gray-600 font-medium">Menampilkan {filteredProducts.length} produk</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">🛍️</div>
                    )}
                    {product.stock > 0 ? (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Tersedia
                      </span>
                    ) : (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Stok Habis
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={product.name}>
                      {product.name}
                    </h3>
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-400">★★★★★</span>
                      <span className="text-gray-500 text-sm ml-2">(4.5)</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mb-3">
                      {formatCurrency(product.price)}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      Stok: <span className="font-semibold">{product.stock}</span> unit
                    </p>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={addingProductId === product.id || product.stock === 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg hover:from-blue-700 hover:to-cyan-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                    >
                      {addingProductId === product.id ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Menambahkan...</span>
                        </>
                      ) : product.stock === 0 ? (
                        "Stok Habis"
                      ) : (
                        <>
                          🛒 Tambahkan ke Keranjang
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-8">
        <Link href="/dashboard/user">
          <span className="inline-block text-blue-600 hover:text-blue-800 transition">
            ← Kembali ke Dashboard
          </span>
        </Link>
      </div>
    </>
  );

  return (
    <UserLayout userName={userName} userRole="user">
      {content}
    </UserLayout>
  );
}
