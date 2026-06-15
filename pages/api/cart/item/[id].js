import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user.id;
  const { id } = req.query;

  // Verify ownership
  const cartItem = await prisma.cartItem.findUnique({
    where: { id },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    return res.status(404).json({ message: "Item tidak ditemukan" });
  }

  // PUT - Update quantity
  if (req.method === "PUT") {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity minimal 1" });
    }

    try {
      // Check stock availability
      const cartItemWithProduct = await prisma.cartItem.findUnique({
        where: { id },
        include: { product: true },
      });

      if (quantity > cartItemWithProduct.product.stock) {
        return res.status(400).json({ 
          message: `Stok tidak cukup. Sisa stok: ${cartItemWithProduct.product.stock}` 
        });
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id },
        data: { quantity },
        include: { product: true },
      });
      return res.status(200).json(updatedItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      return res.status(500).json({ message: "Gagal update item keranjang" });
    }
  }

  // DELETE - Remove item from cart
  if (req.method === "DELETE") {
    try {
      await prisma.cartItem.delete({
        where: { id },
      });
      return res.status(200).json({ message: "Item berhasil dihapus dari keranjang" });
    } catch (error) {
      console.error("Error deleting cart item:", error);
      return res.status(500).json({ message: "Gagal menghapus item keranjang" });
    }
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
