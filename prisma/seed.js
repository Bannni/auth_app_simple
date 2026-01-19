const { PrismaClient } = require("@prisma/client"); 
const bcrypt = require("bcryptjs"); 
const prisma = new PrismaClient(); 
async function main() { 
const adminEmail = "admin@google.com"; 
const adminName = "Super Admin"; // Nama Admin 
const adminPassword = "12345678"; // Password Admin 
// Hash password sebelum disimpan ke database 
const hashedPassword = await bcrypt.hash(adminPassword, 10); 
// Cek apakah admin sudah ada di database 
const existingAdmin = await prisma.user.findUnique({ 
where: { email: adminEmail }, 
}); 
if (!existingAdmin) { 
await prisma.user.create({ 
data: { 
name: adminName, // Menyimpan nama admin 
email: adminEmail, 
password: hashedPassword, // Password yang sudah di-hash 
role: "admin", 
}, 
}); 
console.log("✅ Admin user created!"); 
} else { 
console.log("⚠️ Admin user already exists."); 
} 
} 
main() 
.catch((e) => { 
console.error("❌ Seeding failed:", e); 
process.exit(1); 
}) 
.finally(async () => { 
await prisma.$disconnect(); 
}); 