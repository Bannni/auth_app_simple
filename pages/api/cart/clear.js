import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user.id;

  // DELETE - Clear all items from cart
  if (req.method === "DELETE") {
    try {
      const cart = await prisma.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        return res.status(200).json({ message: "Keranjang sudah kosong" });
      }

      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return res.status(200).json({ message: "Keranjang berhasil dikosongkan" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      return res.status(500).json({ message: "Gagal mengosongkan keranjang" });
    }
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
