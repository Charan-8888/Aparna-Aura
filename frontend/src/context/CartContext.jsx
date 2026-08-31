import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import cartService from '../services/cartService';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext(null);

/**
 * CartProvider manages cart state globally.
 *
 * - Fetches cart on mount when user is authenticated.
 * - Re-fetches when authentication state changes.
 * - Exposes optimistic UI for quantity updates.
 * - Redirects guests to /login when they try to add items.
 */
export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [cart, setCart] = useState(null); // full cart object from backend
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── Computed totals (from backend data) ───────────────────────────────────
  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const subtotal = Number(cart?.subtotal || 0);
  const tax = Number(cart?.tax || 0);
  const shipping = Number(cart?.shipping || 0);
  const grandTotal = Number(cart?.grand_total || cart?.total || subtotal + tax + shipping);

  // ─── Fetch Cart ───────────────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      console.error('Cart fetch error:', err);
      setError(err.response?.data?.detail || 'Failed to load cart.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch cart when auth state resolves
  useEffect(() => {
    if (!authLoading) {
      fetchCart();
    }
  }, [authLoading, isAuthenticated, fetchCart]);

  // ─── Add to Cart ──────────────────────────────────────────────────────────
  const addToCart = useCallback(async (productId, quantity = 1, { onRequireLogin } = {}) => {
    if (!isAuthenticated) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    try {
      await cartService.addItem(productId, quantity);
      await fetchCart(); // refresh to get latest totals
    } catch (err) {
      console.error('Add to cart error:', err);
      throw err;
    }
  }, [isAuthenticated, fetchCart]);

  // ─── Update Quantity (Optimistic) ─────────────────────────────────────────
  const updateQuantity = useCallback(async (itemId, quantity) => {
    // Optimistic update
    const previousCart = cart;
    setCart((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      };
    });

    try {
      const updatedItem = await cartService.updateItem(itemId, quantity);
      // Refresh to sync totals from backend
      await fetchCart();
    } catch (err) {
      // Rollback on failure
      setCart(previousCart);
      console.error('Update quantity error:', err);
      throw err;
    }
  }, [cart, fetchCart]);

  // ─── Remove Item ──────────────────────────────────────────────────────────
  const removeItem = useCallback(async (itemId) => {
    // Optimistic remove
    const previousCart = cart;
    setCart((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      };
    });

    try {
      await cartService.removeItem(itemId);
      await fetchCart();
    } catch (err) {
      setCart(previousCart);
      console.error('Remove item error:', err);
      throw err;
    }
  }, [cart, fetchCart]);

  // ─── Clear Cart ───────────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    const previousCart = cart;
    setCart((prev) => prev ? { ...prev, items: [] } : null);
    try {
      await cartService.clearCart();
      await fetchCart();
    } catch (err) {
      setCart(previousCart);
      console.error('Clear cart error:', err);
      throw err;
    }
  }, [cart, fetchCart]);

  const value = {
    cart,
    items,
    itemCount,
    subtotal,
    tax,
    shipping,
    grandTotal,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
