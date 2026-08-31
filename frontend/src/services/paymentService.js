import apiClient from '../api/apiClient';

const paymentService = {
  /**
   * Create a Razorpay order from a backend Order ID.
   */
  createRazorpayOrder: async (orderId) => {
    const response = await apiClient.post('/payments/create/', { order_id: orderId });
    return response.data;
  },

  /**
   * Verify a successful Razorpay payment signature.
   */
  verifyRazorpayPayment: async (data) => {
    const response = await apiClient.post('/payments/verify/', data);
    return response.data;
  },

  /**
   * Confirm Cash on Delivery (COD) for an order.
   */
  confirmCOD: async (orderId) => {
    const response = await apiClient.post('/payments/cod/', { order_id: orderId });
    return response.data;
  },

  /**
   * Get transaction details for an order.
   */
  getTransactionDetail: async (transactionId) => {
    const response = await apiClient.get(`/payments/${transactionId}/`);
    return response.data;
  },
};

export default paymentService;
