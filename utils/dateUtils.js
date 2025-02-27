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
    const specifiedDate = new Date(time);
    const now = new Date();
    // 計算兩個時間的差值（以毫秒為單位）
    const diffMs = now - specifiedDate;

    // 計算天數
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));


    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${diffDays} 天 ${diffHours} 小時`;

}

// Export functions
module.exports = { convertToUTC8, convertDayToUTC8, convertActiveTime };
