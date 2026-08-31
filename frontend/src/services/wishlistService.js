import apiClient from '../api/apiClient';

const wishlistService = {
  /**
   * Get the current user's wishlist.
   */
  getWishlist: async () => {
    const response = await apiClient.get('/wishlist/');
    return response.data;
  },

  /**
   * Add a product to the wishlist.
   * @param {string|number} productId
   */
  addItem: async (productId) => {
    const response = await apiClient.post('/wishlist/', { product_id: productId });
    return response.data;
  },

  /**
   * Remove a specific item from the wishlist.
   * @param {string|number} wishlistItemId - wishlist entry ID (not product ID)
   */
  removeItem: async (wishlistItemId) => {
    await apiClient.delete(`/wishlist/${wishlistItemId}/`);
  },
};

export default wishlistService;
