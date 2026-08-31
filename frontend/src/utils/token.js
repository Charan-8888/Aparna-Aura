// Token utility helpers — only place localStorage is accessed for tokens.
// Never import localStorage directly in components.

const ACCESS_TOKEN_KEY = 'aa_access';
const REFRESH_TOKEN_KEY = 'aa_refresh';

/**
 * Save both access and refresh tokens to localStorage.
 * @param {string} access
 * @param {string} refresh
 */
export const saveTokens = (access, refresh) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

/**
 * Retrieve the stored access token.
 * @returns {string|null}
 */
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

/**
 * Retrieve the stored refresh token.
 * @returns {string|null}
 */
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

/**
 * Remove both tokens from localStorage (on logout / session expiry).
 */
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
