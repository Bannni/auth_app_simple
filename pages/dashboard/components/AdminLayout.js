import AdminNavbar from "@/components/AdminNavbar"
import AuroraParticles from "./AuroraParticles"

export default function AdminLayout({ userName, userRole, children }) {
  return (
    <div className="flex h-screen bg-linear-to-br from-gray-100 to-blue-50 relative overflow-hidden">
      <AuroraParticles />
      
      {/* ADMIN SIDEBAR & CONTENT */}
      <AdminNavbar userName={userName} userRole={userRole} />
      
      {/* PAGE CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 relative z-10">
        {children}
      </div>
    </div>
  )
}
