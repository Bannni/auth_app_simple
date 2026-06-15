const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  // ==================== SEED ADMIN ====================
  const adminEmail = "admin@google.com";
  const adminName = "Super Admin";
  const adminPassword = "12345678";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log("✅ Admin user created!");
  } else {
    console.log("⚠️ Admin user already exists.");
  }

  // ==================== SEED USER DUMMY ====================
  const userEmail = "user1@google.com";
  const userName = "User Satu";
  const userPassword = "12345678";

  const hashedUserPassword = await bcrypt.hash(userPassword, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        name: userName,
        email: userEmail,
        password: hashedUserPassword,
        role: "user",
      },
    });
    console.log("✅ User dummy created! (user1@google.com / 12345678)");
  } else {
    console.log("⚠️ User dummy already exists.");
  }

  // ==================== SEED PRODUCTS ====================
  const dummyProducts = [
    {
      name: "Laptop ASUS ROG Strix G16",
      description: "Laptop gaming performa tinggi dengan prosesor Intel Core i7 Gen 13, RAM 16GB DDR5, SSD 512GB NVMe, dan GPU NVIDIA RTX 4060. Layar 16 inch 165Hz untuk pengalaman gaming yang mulus.",
      price: 22500000,
      stock: 10,
    },
    {
      name: "iPhone 15 Pro Max 256GB",
      description: "Smartphone flagship Apple dengan chip A17 Pro, kamera 48MP dengan sistem kamera Pro, layar Super Retina XDR 6.7 inch, dan bodi titanium premium.",
      price: 19999000,
      stock: 15,
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      description: "Smartphone Android premium dengan Snapdragon 8 Gen 3, S Pen built-in, kamera 200MP, layar Dynamic AMOLED 2X 6.8 inch, dan fitur Galaxy AI.",
      price: 18499000,
      stock: 12,
    },
    {
      name: "Sony WH-1000XM5 Headphone",
      description: "Headphone wireless premium dengan noise cancelling terbaik di kelasnya, audio Hi-Res, battery life 30 jam, dan desain ultra-ringan yang nyaman.",
      price: 4999000,
      stock: 25,
    },
    {
      name: "iPad Air M2 256GB",
      description: "Tablet Apple dengan chip M2 yang powerful, layar Liquid Retina 10.9 inch, kompatibel dengan Apple Pencil dan Magic Keyboard. Ideal untuk produktivitas dan hiburan.",
      price: 11999000,
      stock: 8,
    },
    {
      name: "Mechanical Keyboard Keychron K8 Pro",
      description: "Keyboard mekanikal wireless dengan switch Gateron G Pro, hot-swappable, RGB backlight, koneksi Bluetooth 5.1 & USB-C, dan bodi aluminium.",
      price: 1599000,
      stock: 30,
    },
    {
      name: "Monitor LG UltraWide 34 inch",
      description: "Monitor ultrawide 34 inch dengan resolusi WQHD 3440x1440, panel IPS, HDR10, 160Hz refresh rate, dan FreeSync Premium. Sempurna untuk multitasking dan gaming.",
      price: 7499000,
      stock: 5,
    },
    {
      name: "Logitech MX Master 3S Mouse",
      description: "Mouse wireless premium untuk produktivitas dengan sensor 8000 DPI, scroll MagSpeed, koneksi multi-device, USB-C charging, dan desain ergonomis.",
      price: 1499000,
      stock: 40,
    },
    {
      name: "Nintendo Switch OLED",
      description: "Konsol gaming portable dengan layar OLED 7 inch yang vibrant, kickstand lebar, speaker enhanced, dan dock dengan port LAN. Main di rumah atau di mana saja.",
      price: 5299000,
      stock: 0,
    },
    {
      name: "AirPods Pro 2nd Gen USB-C",
      description: "Earbuds wireless Apple dengan Active Noise Cancellation adaptif, Transparency mode, audio spasial, dan charging case USB-C dengan speaker & lanyard loop.",
      price: 3799000,
      stock: 20,
    },
    {
      name: "Webcam Logitech C920 HD Pro",
      description: "Webcam Full HD 1080p dengan autofocus, dual mic stereo, koreksi cahaya HD, dan kompatibel dengan semua platform video call. Ideal untuk WFH dan streaming.",
      price: 1299000,
      stock: 0,
    },
    {
      name: "SSD Samsung 990 PRO 1TB",
      description: "SSD NVMe M.2 PCIe Gen 4.0 dengan kecepatan baca hingga 7450 MB/s dan tulis 6900 MB/s. Dilengkapi heatspreader dan teknologi Samsung V-NAND.",
      price: 1899000,
      stock: 50,
    },
  ];

  for (const product of dummyProducts) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });

    if (!existing) {
      await prisma.product.create({
        data: product,
      });
      console.log(`✅ Product created: ${product.name} (stok: ${product.stock})`);
    } else {
      console.log(`⚠️ Product already exists: ${product.name}`);
    }
  }

  console.log("\n🎉 Seeding selesai!");
  console.log("📝 Login Admin: admin@google.com / 12345678");
  console.log("📝 Login User: user1@google.com / 12345678");
  console.log(`📦 Total ${dummyProducts.length} produk dummy (2 produk stok habis: Nintendo Switch OLED & Webcam Logitech)`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
