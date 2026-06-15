import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user.id;

  // GET - Get user's cart
  if (req.method === "GET") {
    try {
      let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      }

      return res.status(200).json(cart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      return res.status(500).json({ message: "Gagal mengambil data keranjang" });
    }
  }

  // POST - Add item to cart
  if (req.method === "POST") {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID diperlukan" });
    }

    try {
      // Check product exists and has stock
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }

      if (product.stock <= 0) {
        return res.status(400).json({ message: "Stok produk habis, tidak bisa ditambahkan ke keranjang" });
      }

      // Get or create cart
      let cart = await prisma.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
        });
      }

      // Check if item already in cart
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      });

      if (existingItem) {
        // Check if total quantity exceeds stock
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          return res.status(400).json({ 
            message: `Stok tidak cukup. Sisa stok: ${product.stock}, di keranjang: ${existingItem.quantity}` 
          });
        }

        // Update quantity
        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
          include: { product: true },
        });
        return res.status(200).json(updatedItem);
      } else {
        if (quantity > product.stock) {
          return res.status(400).json({ 
            message: `Stok tidak cukup. Sisa stok: ${product.stock}` 
          });
        }

        // Add new item
        const newItem = await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
          include: { product: true },
        });
        return res.status(201).json(newItem);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      return res.status(500).json({ message: "Gagal menambahkan ke keranjang" });
    }
  }

  res.status(405).json({ message: "Method Not Allowed" });
}
