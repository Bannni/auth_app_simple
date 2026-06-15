import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  //belum login
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Untuk POST (create), hanya admin yang bisa
  if (req.method === "POST") {
    if (session.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { name, price, stock, description, image } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ message: "Invalid data" });
    }

    try {
      const product = await prisma.product.create({
        data: {
          name,
          description: description || null,
          price: parseInt(price),
          stock: parseInt(stock) || 0,
          image: image || null,
        },
      });

      return res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Untuk GET (read), bisa user atau admin
  if (req.method === "GET") {
    try {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json(products);
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  res.status(405).json({ message: "Method Not Allowed" });
}