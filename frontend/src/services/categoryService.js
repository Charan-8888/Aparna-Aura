import apiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../config/api';

class CategoryService {
  /**
   * Fetches all active categories
   * @returns {Promise<Array>} - List of categories
   */
  async getCategories() {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES);
    // Handle both paginated { results: [] } and plain array responses
    const data = response.data?.data ?? response.data;
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  }

  /**
   * Fetches a single category by its slug
   * @param {string} slug - Category slug
   * @returns {Promise<Object>} - Category detail object
   */
  async getCategory(slug) {
    const response = await apiClient.get(`${API_ENDPOINTS.CATEGORIES}${slug}/`);
    return response.data?.data ?? response.data;
  }
}

export const categoryService = new CategoryService();
