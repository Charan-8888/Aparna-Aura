import apiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../config/api';
import { buildQueryString } from '../utils/queryBuilder';

class ProductService {
  /**
   * Fetches products with optional filters
   * @param {Object} filters - Filtering, sorting, and pagination options
   * @returns {Promise<Object>} - Paginated response from backend
   */
  async getProducts(filters = {}) {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}${queryString}`);
    return response.data;
  }

  /**
   * Fetches a single product by its slug
   * @param {string} slug - Product slug
   * @returns {Promise<Object>} - Product detail object
   */
  async getProduct(slug) {
    const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}${slug}/`);
    return response.data;
  }

  /**
   * Fetches featured products
   */
  async getFeaturedProducts() {
    return this.getProducts({ is_featured: true });
  }

  /**
   * Fetches trending products
   */
  async getTrendingProducts() {
    return this.getProducts({ is_trending: true });
  }

  /**
   * Fetches new arrivals
   */
  async getNewArrivals() {
    return this.getProducts({ is_new_arrival: true });
  }
}

export const productService = new ProductService();
