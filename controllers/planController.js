// controllers/commentController.js
const Comment = require('../models/planCommentModel');
const { handleErrorAsync } = require('../services/handleResponse');
const plan = require('../utils/plan.json');
const {
    Success,
    SuccessList,
    appError,
} = require("../services/handleResponse.js");

exports.getPlans = handleErrorAsync(async (req, res, next) => {
    const { timeSort, type = "", keyWord, area = "", page = 1, limit = 6, cate } = req.query;
    const { plan_id } = req.params;
    const tSort = "-publicAt";

    const resPlan = plan;
    let filteredPlans = plan;
    if (keyWord) {
        filteredPlans = plan.filter(item =>
            item.title.includes(keyWord) || item.description.includes(keyWord)
        );
    }
    const totalCount = filteredPlans.length; // 總數據數量
    const totalPages = Math.ceil(totalCount / limit); // 總頁數
    const currentPage = parseInt(page, 10); // 當前頁碼
    const startIndex = (currentPage - 1) * limit; // 起始索引
    const endIndex = currentPage * limit; // 結束索引

    // 分頁數據
    const paginatedPlans = filteredPlans.slice(startIndex, endIndex);

    // 分頁資訊
    const pagination = {
        total: totalCount,
        total_pages: totalPages,
        current_page: currentPage,
        has_pre: currentPage > 1,
        has_next: currentPage < totalPages
    };
    Success(res, "請求成功，回傳所需數據", { data: resPlan, pagination })
});
exports.getPlanById = handleErrorAsync(async (req, res, next) => {
    const { plan_id } = req.params;
    console.log(plan_id)
    if (!plan_id || plan_id.trim() === '') {
        return next(appError("plan_id欄位不能為空值！", next, 400, 1002
        ));
    }
    const resPlan = plan.find(item => item.id === plan_id);
    console.log('resPlan', resPlan);
    Success(res, "請求成功，回傳所需數據", { data: resPlan });
});


/* 
exports.getAllPlans = async (req, res) => {

    console.log(req.user);
    res.status(200);
};


exports.createPlan = async (req, res) => {
    res.status(200);
};


exports.getPlanById = async (req, res) => {
    res.status(200);
};


exports.updatePlanById = async (req, res) => {
    res.status(200);
};


exports.deletePlanById = async (req, res) => {
    res.status(200);
}; */
