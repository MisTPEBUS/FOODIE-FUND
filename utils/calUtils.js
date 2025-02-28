const moment = require("moment-timezone");

/**
 * Convert UTC date to UTC+8 timezone with full date and time
 * @param {Date} date - The UTC date to be converted
 * @returns {string} - The formatted date string in UTC+8 timezone (YYYY-MM-DD HH:mm)
 */
function getCoverage(orders, target) {
    // 計算所有訂單的 subtotal 總和
    const totalSubtotal = orders.reduce((acc, order) => acc + order.subtotal, 0);
    console.log(totalSubtotal);
    // 用 subtotal 總和除以目標值，得到目標達成率
    const coverage = (totalSubtotal / target) * 100;

    // 取小數點第 2 位（注意 toFixed 會回傳字串）
    const coverageRounded = parseFloat(coverage.toFixed(2));

    return coverageRounded;
}

function getTotalOrders(orders) {
    // 計算所有訂單的 subtotal 總和

    return orders.length;
}
function getAvgDonation(orders) {
    // 計算所有訂單的捐款總和
    const totalDonation = orders.reduce((acc, order) => acc + order.donate, 0);

    // 計算平均捐款
    const avgDonation = totalDonation / orders.length;

    // 若需要將結果格式化為小數點後 2 位（並轉換回數字）
    const avgDonationRounded = parseFloat(avgDonation.toFixed(0));

    return avgDonationRounded;
}

function getTotalRefunds(orders) {
    const totalRefunds = orders.reduce((acc, order) => acc + (order.refund || 0), 0);

    return totalRefunds;
}
function getAvgAmount(orders) {
    // 計算所有訂單的 total_amount 總和
    const totalAmount = orders.reduce((acc, order) => acc + order.total_amount, 0);

    // 計算平均金額
    const avgAmount = totalAmount / orders.length;

    // 取小數點後 2 位
    return parseFloat(avgAmount.toFixed(0));
}

function getRepurchaseRate(orders) {
    // 依據 customer.name 統計每位客戶的訂單數
    const customerCounts = orders.reduce((acc, order) => {
        const name = order.customer.name;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});

    // 計算下單次數超過 1 次的客戶數量
    const repeatCustomers = Object.values(customerCounts).filter(count => count > 1).length;
    // 總客戶數
    const totalCustomers = Object.keys(customerCounts).length;

    // 如果沒有客戶則回傳 0，否則計算重複購買率
    const repurchaseRate = totalCustomers ? (repeatCustomers / totalCustomers) * 100 : 0;

    // 取小數點後 2 位
    return parseFloat(repurchaseRate.toFixed(1));
}




// Export functions
module.exports = { getRepurchaseRate, getTotalRefunds, getAvgDonation, getTotalOrders, getCoverage, getTotalOrders, getAvgAmount };
