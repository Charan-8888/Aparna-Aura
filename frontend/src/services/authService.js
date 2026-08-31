import apiClient from '../api/apiClient';

const AUTH_BASE = '/auth';

const authService = {
  /**
   * Login with email and password.
   * Returns { access, refresh, user }
   */
  login: async (email, password) => {
    const response = await apiClient.post(`${AUTH_BASE}/login/`, { email, password });
    return response.data;
  },

  loginWithGoogle: async (credential) => {
    const response = await apiClient.post(`${AUTH_BASE}/google/`, { credential });
    return response.data;
  },

  /**
   * Register a new account.
   * Returns { access, refresh, user } (auto-login on registration)
   */
  register: async ({ email, password, first_name, last_name }) => {
    const response = await apiClient.post(`${AUTH_BASE}/register/`, {
      email,
      password,
      first_name,
      last_name,
    });
    return response.data;
  },

  /**
   * Logout and blacklist the refresh token.
   */
  logout: async (refreshToken) => {
    const response = await apiClient.post(`${AUTH_BASE}/logout/`, {
      refresh: refreshToken,
    });
    return response.data;
  },

  /**
   * Fetch the currently authenticated user.
   */
  getMe: async () => {
    const response = await apiClient.get(`${AUTH_BASE}/me/`);
    return response.data;
  },

  /**
   * Get new access token using refresh token.
   */
  refresh: async (refreshToken) => {
    const response = await apiClient.post(`${AUTH_BASE}/refresh/`, {
      refresh: refreshToken,
    });
    return response.data;
  },

  /**
   * Change the logged-in user's password.
   */
  changePassword: async ({ old_password, new_password }) => {
    const response = await apiClient.post(`${AUTH_BASE}/password/change/`, {
      old_password,
      new_password,
    });
    return response.data;
  },

  /**
   * Request a password reset email.
   */
  forgotPassword: async (email) => {
    const response = await apiClient.post(`${AUTH_BASE}/password/forgot/`, { email });
    return response.data;
  },

  /**
   * Reset the password using a token from email.
   */
  resetPassword: async ({ email, otp, new_password }) => {
    const response = await apiClient.post(`${AUTH_BASE}/password/reset/`, {
      email,
      otp,
      new_password,
    });
    return response.data;
  },
};

export default authService;
