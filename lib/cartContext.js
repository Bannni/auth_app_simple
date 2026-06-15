import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSession } from "next-auth/react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
        setItemCount(data.items?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initCart = async () => {
      const session = await getSession();
      if (session) {
        fetchCart();
      }
    };
    initCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.ok) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cart/item/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating quantity:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cart/item/${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error removing from cart:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cart/clear", {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error clearing cart:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    return cart.items?.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    ) || 0;
  };

  const getTotalItems = () => {
    return cart.items?.reduce(
      (total, item) => total + item.quantity,
      0
    ) || 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
