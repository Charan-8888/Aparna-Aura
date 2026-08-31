import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';

/**
 * Hook to manage fetching a list of products (paginated)
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} - products, pagination state, loading, error, and refetch method
 */
export const useProducts = (initialFilters = {}) => {
  const [data, setData] = useState({
    results: [],
    count: 0,
    next: null,
    previous: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts(filters);
      // Handle both paginated and unpaginated response formats robustly
      if (response && Array.isArray(response.results)) {
        setData(response);
      } else if (Array.isArray(response)) {
        setData({ results: response, count: response.length, next: null, previous: null });
      } else {
        setData({ results: [], count: 0, next: null, previous: null });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // If an invalid page or non-existent filtered result is hit, treat as empty results
        setData({ results: [], count: 0, next: null, previous: null });
        setError(null);
      } else {
        console.error('Failed to fetch products:', err);
        setError(err.response?.data?.detail || err.response?.data?.message || err.message || 'An error occurred while fetching products.');
        setData({ results: [], count: 0, next: null, previous: null });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(initialFilters);
  }, [JSON.stringify(initialFilters), fetchProducts]);

  return {
    products: data.results,
    pagination: {
      count: data.count,
      next: data.next,
      previous: data.previous,
    },
    loading,
    error,
    retry: () => fetchProducts(initialFilters),
  };
};
