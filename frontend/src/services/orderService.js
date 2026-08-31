import apiClient from '../api/apiClient';

const orderService = {
  /**
   * Place an order from the active cart.
   * @param {string} shippingAddressId
   * @param {string|null} billingAddressId
   */
  checkout: async (shippingAddressId, billingAddressId = null) => {
    const response = await apiClient.post('/orders/checkout/', {
      shipping_address_id: shippingAddressId,
      billing_address_id: billingAddressId || shippingAddressId,
    });
    return response.data; // Note: standardized response { success, data, message }
  },

  /**
   * Get all orders for the current user.
   * Supports pagination.
   */
  getOrders: async (page = 1) => {
    const response = await apiClient.get('/orders/', { params: { page } });
    return response.data;
  },

  /**
   * Get a specific order by its ID.
   */
  getOrder: async (id) => {
    const response = await apiClient.get(`/orders/${id}/`);
    return response.data;
  },

  /**
   * Cancel an order if it's pending or confirmed.
   */
  cancelOrder: async (id) => {
    const response = await apiClient.post(`/orders/${id}/cancel/`);
    return response.data;
  },
};

export default orderService;
