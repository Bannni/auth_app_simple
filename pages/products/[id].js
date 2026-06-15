import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;

  //UPDATE
  if (req.method === "PUT") {
    const { name, price, image } = req.body;

    try {
      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          price: Number(price),
          image: image || undefined,
        },
      });

      return res.status(200).json(product);
    } catch {
      return res.status(500).json({ message: "Gagal update produk" });
    }
  }

  //DELETE
  if (req.method === "DELETE") {
    try {
      await prisma.product.delete({
        where: { id },
      });

      return res.status(200).json({ message: "Produk berhasil dihapus" });
    } catch {
      return res.status(500).json({ message: "Gagal menghapus produk" });
    }
  }

  res.status(405).json({ message: "Method Not Allowed" });
}