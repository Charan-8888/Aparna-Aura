import apiClient from '../api/apiClient';

const addressService = {
  /**
   * Get all addresses for the authenticated user.
   */
  getAddresses: async () => {
    const response = await apiClient.get('/auth/addresses/');
    return response.data;
  },

  /**
   * Get a specific address by ID.
   */
  getAddress: async (id) => {
    const response = await apiClient.get(`/auth/addresses/${id}/`);
    return response.data;
  },

  /**
   * Create a new address.
   */
  createAddress: async (data) => {
    const response = await apiClient.post('/auth/addresses/', data);
    return response.data;
  },

  /**
   * Update an existing address.
   */
  updateAddress: async (id, data) => {
    const response = await apiClient.put(`/auth/addresses/${id}/`, data);
    return response.data;
  },

  /**
   * Delete an address.
   */
  deleteAddress: async (id) => {
    const response = await apiClient.delete(`/auth/addresses/${id}/`);
    return response.data;
  },
};

export default addressService;
