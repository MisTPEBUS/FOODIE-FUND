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
    if (typeof time !== "string") {
        return "時間格式錯誤";
    }

    // 解析時間，部分環境不支援 "+00:00"，需要手動處理
    let formattedTime = time.replace("+00:00", "Z");
    const specifiedDate = new Date(formattedTime);

    // 檢查是否為有效日期
    if (isNaN(specifiedDate.getTime())) {
        return "無效的日期格式";
    }

    const now = new Date();
    const diffMs = now - specifiedDate;

    // 計算時間差
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${diffDays} 天 ${diffHours} 小時`;


}

// Export functions
module.exports = { convertToUTC8, convertDayToUTC8, convertActiveTime };
