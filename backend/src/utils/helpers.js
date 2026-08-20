/**
 * Common backend utility helper functions
 */

/**
 * Format date to standard YYYY-MM-DD
 * @param {Date|string} date 
 * @returns {string}
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

module.exports = {
  formatDate,
};
