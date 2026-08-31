import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';

/**
 * Hook to manage fetching a single product
 * @param {string} slug - Product slug
 * @returns {Object} - product, loading, error, and refetch method
 */
export const useProduct = (slug) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async (productSlug) => {
    if (!productSlug) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProduct(productSlug);
      setProduct(response);
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError(err.response?.data?.detail || err.message || 'An error occurred while fetching the product.');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProduct(slug);
  }, [slug, fetchProduct]);

  return {
    product,
    loading,
    error,
    retry: () => fetchProduct(slug),
  };
};
