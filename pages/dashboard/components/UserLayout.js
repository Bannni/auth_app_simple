import Link from "next/link"
import Navbar from "@/components/Navbar"
import AuroraParticles from "./AuroraParticles"

export default function UserLayout({ userName, userRole, children }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex flex-col relative">
      <AuroraParticles />
      {/* TOP NAVIGATION BAR */}
      <Navbar userName={userName} userRole={userRole} />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* BRAND */}
            <div>
              <h3 className="text-lg font-bold mb-4">ShopHub</h3>
              <p className="text-black text-sm">
                Platform belanja online terpercaya dengan ribuan produk pilihan.
              </p>
            </div>

            {/* LINKS */}
            <div>
              <h4 className="font-semibold mb-4">Navigasi</h4>
              <ul className="space-y-2 text-sm text-black">
                <li>
                  <Link href="/products" className="hover:text-white transition cursor-pointer">
                    Produk
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/user" className="hover:text-white transition cursor-pointer">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* HELP */}
            <div>
              <h4 className="font-semibold mb-4">Bantuan</h4>
              <ul className="space-y-2 text-sm text-black">
                <li>
                  <a href="#" className="hover:text-white transition">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Kontak
                  </a>
                </li>
              </ul>
            </div>

            {/* INFO */}
            <div>
              <h4 className="font-semibold mb-4">Informasi</h4>
              <ul className="space-y-2 text-sm text-black">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Kebijakan Privasi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Syarat & Ketentuan
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-black text-sm">
            <p>&copy; {new Date().getFullYear()} ShopHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
