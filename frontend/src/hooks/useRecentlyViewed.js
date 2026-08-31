import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'aa_recently_viewed';
const MAX_ITEMS = 12;

/**
 * Hook to track and retrieve recently viewed products using localStorage.
 * Products are stored as lightweight objects: { id, slug, name, price, image, category }
 */
export const useRecentlyViewed = () => {
  const [items, setItems] = useState([]);

  // Load on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setItems(stored);
    } catch {
      setItems([]);
    }
  }, []);

  // Track a product view
  const trackView = useCallback((product) => {
    if (!product?.id) return;
    
    const entry = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: typeof product.images?.[0] === 'object'
        ? product.images?.[0]?.image
        : (product.images?.[0] || product.image || ''),
      category: typeof product.category === 'object'
        ? product.category?.name
        : (product.category || 'Jewellery'),
    };

    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const updated = [entry, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  }, []);

  return { recentlyViewed: items, trackView, clearHistory };
};
