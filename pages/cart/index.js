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

export default function CartPage() {
  const router = useRouter();
  const { cart, loading, updateQuantity, removeFromCart, clearCart, getTotalPrice, getTotalItems, fetchCart } = useCart();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const init = async () => {
      const session = await getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUserName(session.user.name || session.user.email);
      await fetchCart();
    };
    init();
  }, [router, fetchCart]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      // Remove item if quantity is 0 or less
      await removeFromCart(itemId);
      return;
    }
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId) => {
    if (confirm("Yakin ingin menghapus item ini dari keranjang?")) {
      await removeFromCart(itemId);
    }
  };

  const handleClearCart = async () => {
    if (confirm("Yakin ingin mengosongkan keranjang?")) {
      await clearCart();
    }
  };

  const content = (
    <>
      {/* HEADER */}
      <div className="mb-8">
        <div className="bg-linear-to-r from-blue-600 to-cyan-500 rounded-xl shadow-lg p-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">🛒 Keranjang Belanja</h1>
              <p className="text-blue-100">Periksa dan kelola produk yang ingin kamu beli</p>
            </div>
            {cart.items && cart.items.length > 0 && (
              <button
                onClick={handleClearCart}
                className="bg-white text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition shadow-md font-semibold"
              >
                🗑️ Kosongkan Keranjang
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CART CONTENT */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Memuat keranjang...</p>
        </div>
      ) : !cart.items || cart.items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Keranjang Kosong</h2>
          <p className="text-gray-600 mb-8">Belum ada produk di keranjang belanja kamu.</p>
          <Link href="/products/user-index">
            <span className="bg-linear-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-cyan-600 transition shadow-md inline-block cursor-pointer font-semibold text-lg">
              🛍️ Mulai Belanja
            </span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CART ITEMS */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-linear-to-r from-blue-600 to-cyan-500 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Daftar Produk</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-24 w-24 rounded-lg object-cover shadow-md"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center text-4xl">
                          🛍️
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{item.product.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{formatCurrency(item.product.price)} / unit</p>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 font-bold transition flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-semibold text-gray-900 text-lg">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold transition flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600 mb-2">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition flex items-center space-x-1 text-sm"
                        >
                          <span>🗑️</span>
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-24">
              <div className="bg-linear-to-r from-blue-600 to-cyan-500 px-6 py-4">
                <h2 className="text-xl font-bold text-white">🎯 Ringkasan Belanja</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Total Items</span>
                    <span className="font-semibold">{getTotalItems()} item</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatCurrency(getTotalPrice())}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-700">
                    <span>Ongkos Kirim</span>
                    <span className="font-semibold text-green-600">🎉 Gratis</span>
                  </div>
                  
                  <div className="border-t-2 border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between text-gray-900">
                      <span className="text-xl font-bold">Total</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(getTotalPrice())}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full mt-6 bg-linear-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-lg font-bold hover:from-blue-700 hover:to-cyan-600 transition shadow-lg text-lg"
                >
                  🛍️ Checkout ({getTotalItems()} item)
                </button>

                <Link href="/products/user-index">
                  <span className="block w-full mt-4 text-center text-blue-600 hover:text-blue-800 transition cursor-pointer font-medium">
                    ← Lanjut Belanja
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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
