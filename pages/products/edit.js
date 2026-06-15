import { getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";
import prisma from "../../lib/prisma";
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

  const { id } = context.query;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return { notFound: true };
  }

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock || 0,
        image: product.image,
        createdAt: product.createdAt.toISOString(),
      },
    },
  };
}

export default function EditProductPage({ product }) {
  const router = useRouter();

  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  const [image, setImage] = useState(product.image || "");
  const [imagePreview, setImagePreview] = useState(product.image || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, price: Number(price), stock: Number(stock), image }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengubah produk");
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
              <h1 className="text-3xl font-bold mb-2">✏️ Edit Produk</h1>
              <p className="text-blue-100">Perbarui informasi produk di toko online Anda</p>
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
          <div className="bg-linear-to-r from-blue-600 to-cyan-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white">📦 Edit Informasi Produk</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
              <strong>📋 Info:</strong> ID: <code className="bg-blue-100 px-2 py-1 rounded">{product.id}</code> | 
              Dibuat: {new Date(product.createdAt).toLocaleDateString('id-ID')}
            </div>

            {/* NAMA PRODUK */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Produk
              </label>
              <input
                type="text"
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
                {loading ? "⏳ Menyimpan..." : "✅ Simpan Perubahan"}
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
