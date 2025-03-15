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

    // 確保 time 是字串
    if (typeof time !== "string") {
        return "0 天 0 小時"; // 若非有效字串則回傳 0
    }

    // 解析傳入的時間
    const specifiedDate = new Date(time);

    // 確保日期是有效的
    if (isNaN(specifiedDate.getTime())) {
        return "0 天 0 小時"; // 無效日期回傳 0
    }

    // 取得現在的時間
    const now = new Date();

    // 計算時間差（毫秒）
    const diffMs = now - specifiedDate;

    // 計算天數
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // 計算小時數（忽略完整的天數）
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${diffDays} 天 ${diffHours} 小時`;


}

// Export functions
module.exports = { convertToUTC8, convertDayToUTC8, convertActiveTime };
