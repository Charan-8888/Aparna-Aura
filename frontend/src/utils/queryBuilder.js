/**
 * Builds a query string from an object of filters.
 * Ignores null, undefined, or empty string values.
 *
 * @param {Object} params - Key-value pairs of filters
 * @returns {string} - Formatted query string (e.g., '?page=2&search=ring')
 */
export const buildQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return '';

  const queryParts = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);

  return queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
};
