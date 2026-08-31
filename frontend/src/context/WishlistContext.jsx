import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import wishlistService from '../services/wishlistService';
import { useAuth } from '../hooks/useAuth';

export const WishlistContext = createContext(null);

/**
 * WishlistProvider manages wishlist state globally.
 *
 * - Fetches wishlist on mount when user is authenticated.
 * - Exposes optimistic toggle.
 * - Rollback on backend failure.
 * - Guest users are redirected to login by consumer components.
 */
export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [wishlist, setWishlist] = useState([]); // array of wishlist items
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── Product ID set for fast O(1) lookup ─────────────────────────────────
  // Map of productId -> wishlistItemId for easy toggle/remove
  const wishlistMap = useMemo(() => {
    const map = {};
    wishlist.forEach((item) => {
      const pid = item.product?.id || item.product_id || item.product;
      if (pid) map[String(pid)] = item.id;
    });
    return map;
  }, [wishlist]);

  // ─── Fetch Wishlist ───────────────────────────────────────────────────────
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await wishlistService.getWishlist();
      // Handle paginated or direct array response
      setWishlist(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      console.error('Wishlist fetch error:', err);
      setError(err.response?.data?.detail || 'Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      fetchWishlist();
    }
  }, [authLoading, isAuthenticated, fetchWishlist]);

  // ─── Check if product is wishlisted ──────────────────────────────────────
  const isWishlisted = useCallback((productId) => {
    return String(productId) in wishlistMap;
  }, [wishlistMap]);

  // ─── Add to Wishlist ──────────────────────────────────────────────────────
  const addToWishlist = useCallback(async (productId) => {
    try {
      const newItem = await wishlistService.addItem(productId);
      setWishlist((prev) => [...prev, newItem]);
    } catch (err) {
      console.error('Add to wishlist error:', err);
      throw err;
    }
  }, []);

  // ─── Remove from Wishlist ─────────────────────────────────────────────────
  const removeFromWishlist = useCallback(async (productId) => {
    const wishlistItemId = wishlistMap[String(productId)];
    if (!wishlistItemId) return;

    // Optimistic remove
    const previous = wishlist;
    setWishlist((prev) => prev.filter((item) => item.id !== wishlistItemId));

    try {
      await wishlistService.removeItem(wishlistItemId);
    } catch (err) {
      // Rollback
      setWishlist(previous);
      console.error('Remove from wishlist error:', err);
      throw err;
    }
  }, [wishlistMap, wishlist]);

  // ─── Toggle (optimistic) ──────────────────────────────────────────────────
  const toggleWishlist = useCallback(async (productId, { onRequireLogin } = {}) => {
    if (!isAuthenticated) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    if (isWishlisted(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  }, [isAuthenticated, isWishlisted, addToWishlist, removeFromWishlist]);

  const value = {
    wishlist,
    wishlistMap,
    wishlistCount: wishlist.length,
    loading,
    error,
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refreshWishlist: fetchWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
