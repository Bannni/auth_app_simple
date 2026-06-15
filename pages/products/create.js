import { getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../dashboard/components/AdminLayout";
import Link from "next/link";

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

export default function CreateProductPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran file terlalu besar. Maksimal 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          stock: Number(stock) || 0,
          image,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal menyimpan produk");
      }

      router.push("/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const content = (
    <>
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">➕ Tambah Produk Baru</h1>
              <p className="text-blue-100">Tambahkan produk baru ke toko online Anda</p>
            </div>
            <Link href="/products">
              <span className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition shadow-md cursor-pointer inline-block font-semibold">
                ← Kembali
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white">📦 Informasi Produk</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* NAMA PRODUK */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Produk
              </label>
              <input
                type="text"
                placeholder="Contoh: Laptop ASUS ROG"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                required
              />
            </div>

            {/* HARGA */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Harga (Rp)
              </label>
              <input
                type="number"
                placeholder="Contoh: 15000000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                required
              />
            </div>

            {/* STOK */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stok
              </label>
              <input
                type="number"
                placeholder="Contoh: 100"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                required
              />
            </div>

            {/* GAMBAR */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gambar Produk
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
              <p className="text-xs text-gray-500 mt-2">Format: JPG, PNG, GIF. Maksimal 5MB</p>
              
              {imagePreview && (
                <div className="mt-4 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img src={imagePreview} alt="preview" className="w-full h-64 object-cover" />
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                ❌ {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-cyan-600 transition shadow-lg disabled:opacity-50"
              >
                {loading ? "⏳ Menyimpan..." : "✅ Simpan Produk"}
              </button>
              <Link href="/products">
                <span className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">
                  Batal
                </span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  return <AdminLayout userName="Admin" userRole="admin">{content}</AdminLayout>;
}
