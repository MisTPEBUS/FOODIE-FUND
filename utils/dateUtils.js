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
function convertActiveTime(time) {
    if (!(typeof time === "string")) {
        time = new Date(time).toISOString(); // 確保 time 是字串
    }

    const specifiedDate = new Date(time);
    if (isNaN(specifiedDate.getTime())) {
        return "0 天 0 小時"; // 如果時間無效，回傳 0 天 0 小時
    }

    const now = new Date();
    const diffMs = now - specifiedDate;

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) || 0;
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) || 0;

    return `${diffDays} 天 ${diffHours} 小時`;
}

// Export functions
module.exports = { convertToUTC8, convertDayToUTC8, convertActiveTime };
