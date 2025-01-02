const moment = require("moment-timezone");

/**
 * Convert UTC date to UTC+8 timezone with full date and time
 * @param {Date} date - The UTC date to be converted
 * @returns {string} - The formatted date string in UTC+8 timezone (YYYY-MM-DD HH:mm)
 */
function convertToUTC8(date = new Date()) {
    return moment(date).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm");
}

/**
 * Convert UTC date to UTC+8 timezone with only the date
 * @param {Date} date - The UTC date to be converted
 * @returns {string} - The formatted date string in UTC+8 timezone (YYYY-MM-DD)
 */
function convertDayToUTC8(date = new Date()) {
    return moment(date).tz("Asia/Taipei").format("YYYY-MM-DD");
}

// Export functions
module.exports = { convertToUTC8, convertDayToUTC8 };
