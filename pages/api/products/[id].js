import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;

  // UPDATE
  if (req.method === "PUT") {
    const { name, price, stock, description, image } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ message: "Invalid data" });
    }

    try {
      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          description: description !== undefined ? description : undefined,
          price: Number(price),
          stock: stock != null ? Number(stock) : undefined,
          image: image || undefined,
        },
      });

      return res.status(200).json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({ message: "Gagal update produk" });
    }
  }

  // DELETE
  if (req.method === "DELETE") {
    try {
      await prisma.product.delete({
        where: { id },
      });

      return res.status(200).json({ message: "Produk berhasil dihapus" });
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({ message: "Gagal menghapus produk" });
    }
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
