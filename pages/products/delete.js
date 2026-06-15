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

export default function DeleteProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const session = await getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        setUserName(session.user.name || session.user.email);

        if (!id) return;

        const res = await fetch("/api/user/product");
        if (res.ok) {
          const data = await res.json();
          const found = data.find((p) => p.id === id);
          setProduct(found || null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("⚠️  Apakah Anda YAKIN ingin menghapus produk ini? Tindakan ini tidak bisa dibatalkan!")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("✅ Produk berhasil dihapus");
        router.push("/products");
      } else {
        alert("❌ Gagal menghapus produk");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("❌ Terjadi kesalahan");
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };

  if (loading) {
    return (
      <AdminLayout userName={userName} userRole="admin">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-black">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout userName={userName} userRole="admin">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-xl font-bold text-red-800 mb-2">Produk Tidak Ditemukan</h1>
          <p className="text-red-700 mb-6">Produk yang Anda cari tidak ada atau mungkin sudah dihapus.</p>
          <Link href="/products">
            <span className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition cursor-pointer">
              Kembali ke Daftar Produk
            </span>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const content = (
    <>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Hapus Produk</h1>
        <p className="text-black">Anda akan menghapus produk berikut</p>
      </div>

      {/* CONFIRMATION CARD */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-red-300">
        {/* WARNING BANNER */}
        <div className="bg-red-100 border-b-2 border-red-300 p-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h2 className="text-lg font-bold text-red-800">Peringatan Penghapusan</h2>
              <p className="text-red-700 text-sm">Tindakan ini tidak dapat dibatalkan. Data produk akan dihapus secara permanen.</p>
            </div>
          </div>
        </div>

        {/* PRODUCT DETAILS */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* PRODUCT IMAGE */}
            <div className="flex justify-center items-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-w-xs max-h-64 rounded-lg shadow-md object-cover"
                />
              ) : (
                <div className="w-48 h-48 rounded-lg bg-gray-200 flex items-center justify-center text-black text-5xl">
                  📷
                </div>
              )}
            </div>

            {/* PRODUCT INFO */}
            <div className="md:col-span-2">
              <div className="space-y-6">
                {/* NAMA PRODUK */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Nama Produk</label>
                  <p className="text-2xl font-bold text-black bg-gray-50 p-4 rounded-lg">
                    {product.name}
                  </p>
                </div>

                {/* HARGA */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Harga</label>
                  <p className="text-2xl font-bold text-blue-600 bg-gray-50 p-4 rounded-lg">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                {/* TANGGAL */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Dibuat Pada</label>
                  <p className="text-black bg-gray-50 p-4 rounded-lg">
                    {new Date(product.createdAt).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="bg-gray-50 border-t p-6 flex gap-4 justify-center">
          <Link href="/products">
            <span className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition cursor-pointer font-medium">
              ← Batal
            </span>
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`px-8 py-3 rounded-lg font-medium text-white transition ${
              deleting
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 cursor-pointer"
            }`}
          >
            {deleting ? "⏳ Menghapus..." : "🗑️ Hapus Produk"}
          </button>
        </div>
      </div>

      {/* BACK LINK */}
      <div className="mt-8">
        <Link href="/products">
          <span className="inline-block text-blue-600 hover:text-blue-800 transition cursor-pointer">
            ← Kembali ke Daftar Produk
          </span>
        </Link>
      </div>
    </>
  );

  return (
    <AdminLayout userName={userName} userRole="admin">
      {content}
    </AdminLayout>
  );
}
