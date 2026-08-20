/**
 * Common frontend utility helper functions
 */

/**
 * Format a SQL/standard date string to local readable format
 * @param {string} dateStr - YYYY-MM-DD or TIMESTAMP
 * @returns {string} - e.g. "Jun 15, 2026"
 */
export const formatDateReadable = (dateStr) => {
  if (!dateStr) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
};

/**
 * Limit text to a specified character length and add ellipses
 * @param {string} text 
 * @param {number} limit 
 * @returns {string}
 */
export const truncateText = (text, limit = 100) => {
  if (!text) return '';
  if (text.length <= limit) return text;
  return text.slice(0, limit) + '...';
};
