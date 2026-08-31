import apiClient from '../api/apiClient';

const cartService = {
  /**
   * Get the current user's cart with all items and totals.
   */
  getCart: async () => {
    const response = await apiClient.get('/cart/');
    return response.data;
  },

  /**
   * Add a product to the cart.
   * @param {string|number} productId
   * @param {number} quantity
   */
  addItem: async (productId, quantity = 1) => {
    const response = await apiClient.post('/cart/items/', {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  /**
   * Update the quantity of an existing cart item.
   * @param {string|number} itemId - cart item ID (not product ID)
   * @param {number} quantity
   */
  updateItem: async (itemId, quantity) => {
    const response = await apiClient.patch(`/cart/items/${itemId}/`, { quantity });
    return response.data;
  },

  /**
   * Remove a specific item from the cart.
   * @param {string|number} itemId - cart item ID
   */
  removeItem: async (itemId) => {
    await apiClient.delete(`/cart/items/${itemId}/`);
  },

  /**
   * Clear all items from the cart.
   */
  clearCart: async () => {
    await apiClient.delete('/cart/clear/');
  },
};

export default cartService;
