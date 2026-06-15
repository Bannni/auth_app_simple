import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../dashboard/components/AdminLayout";

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session || session.user.role !== "admin") {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return { props: {} };
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
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
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [router]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const content = (
    <>
      {/* HEADER */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">🛍️ Manajemen Produk</h1>
              <p className="text-blue-100">Kelola semua produk di toko online Anda</p>
            </div>
            <Link href="/products/create">
              <span className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition shadow-md cursor-pointer inline-block font-semibold">
                ➕ Tambah Produk Baru
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* SEARCH & STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3">
          <input
            type="text"
            placeholder="🔍 Cari produk berdasarkan nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          />
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{products.length}</p>
          <p className="text-sm text-gray-600">Total Produk</p>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Memuat produk...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl text-gray-600 mb-4">Belum ada produk</p>
            <Link href="/products/create">
              <span className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md cursor-pointer inline-block font-semibold">
                ➕ Tambah Produk Pertama
              </span>
            </Link>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600">Tidak ada produk yang sesuai</p>
            <p className="text-gray-500 mt-2">Coba kata kunci pencarian lain</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Gambar</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Nama Produk</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Harga</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Stok</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Dibuat</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`border-b ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition-colors`}
                    >
                      <td className="px-6 py-4 text-sm">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-16 w-16 rounded-lg object-cover shadow-md"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center text-3xl">
                            🛍️
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{product.name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {product.stock > 0 ? `✓ ${product.stock} unit` : 'Stok Habis'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(product.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <Link href={`/products/edit?id=${product.id}`}>
                          <span className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium transition shadow-sm inline-block cursor-pointer">
                            ✏️ Edit
                          </span>
                        </Link>
                        <Link href={`/products/delete?id=${product.id}`}>
                          <span className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-medium transition shadow-sm inline-block cursor-pointer">
                            🗑️ Hapus
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 text-sm text-gray-700 border-t">
              📊 Menampilkan <strong>{filteredProducts.length}</strong> dari <strong>{products.length}</strong> produk
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <AdminLayout userName={userName} userRole="admin">
      {content}
    </AdminLayout>
  );
}
