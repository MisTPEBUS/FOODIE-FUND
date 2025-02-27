// controllers/commentController.js
const Comment = require('../models/planCommentModel');
const { handleErrorAsync } = require('../services/handleResponse');
const plan = require('../utils/plan.json');
const {
    Success,
    SuccessList,
    appError,
} = require("../services/handleResponse.js");

exports.getPlanAdmin = handleErrorAsync(async (req, res, next) => {
    const { timeSort, type = "", keyWord, area = "", page = 1, limit = 6, cate } = req.query;
    const { plan_id } = req.params;
    const projects = [{
        "id": "66d66fb3217ebbebc04b1d50",
        "name": "貓貓咖啡廳",
        "status": "pending"
    },
    {
        "id": "66fb66d32bebc04b1d517eb0",
        "name": "金華火腿",
        "status": "resolve"
    },
    {
        "id": "zcfd369d2bebc04b1d517eb0",
        "name": "Test",
        "status": "reject"
    }]
    const steps = [
        { label: "填寫提案內容", status: "pending" }, // ✅ 已完成
        { label: "設定金流", status: "pending" }, // 🟢 進行中
        { label: "完善計畫回饋", status: "pending" }, // ✅ 已完成
        { label: "提交送審", status: "pending" }, // ⚪ 未完成
        { label: "開始募資", status: "pending" }, // ⚪ 未完成
    ];
    const comments = [];

    if (plan_id == 'default') {


    }
    else if (plan_id == '66d66fb3217ebbebc04b1d50') {
        steps = [
            { label: "填寫提案內容", status: "pending" }, // ✅ 已完成
            { label: "設定金流", status: "pending" }, // 🟢 進行中
            { label: "完善計畫回饋", status: "pending" }, // ✅ 已完成
            { label: "提交送審", status: "pending" }, // ⚪ 未完成
            { label: "開始募資", status: "pending" }, // ⚪ 未完成
        ];
        comments = [
            {
                id: "d6b7fa3c9c174c4f8c369c91c1e2aee0",
                avatar: "https://flowbite.com/docs/images/people/profile-picture-3.jpg",
                status: "pending", name: "兔子", content: "你們的餐廳會開在哪裡?", createdAt: "2025-02-26 23:50"
            },
            {
                id: "ycb7fa3cvb174c4f8c369c91c1e2aehg", avatar: "",
                status: "pending", name: "lobinda@gmail.com", content: "沒有圖片會有錯誤嗎?", createdAt: "2025-02-26 23:55"
            },
        ]

    }
    else if (plan_id == '66fb66d32bebc04b1d517eb0') {
        steps = [
            { label: "填寫提案內容", status: "completed" }, // ✅ 已完成
            { label: "設定金流", status: "completed" }, // 🟢 進行中
            { label: "完善計畫回饋", status: "pending" }, // ✅ 已完成
            { label: "提交送審", status: "pending" }, // ⚪ 未完成
            { label: "開始募資", status: "pending" }, // ⚪ 未完成
        ];
        comments = [
            {
                id: "d9ob7fa3c9c174c4f8c369c91c1e2ae55",
                avatar: "https://flowbite.com/docs/images/people/profile-picture-3.jpg",
                status: "resolve", name: "兔子", content: "來個女生?", createdAt: "2025-02-26 23:50"
            },

        ]
    }
    else if (plan_id == 'zcfd369d2bebc04b1d517eb0') {
        steps = [
            { label: "填寫提案內容", status: "completed" }, // ✅ 已完成
            { label: "設定金流", status: "completed" }, // 🟢 進行中
            { label: "完善計畫回饋", status: "pending" }, // ✅ 已完成
            { label: "提交送審", status: "pending" }, // ⚪ 未完成
            { label: "開始募資", status: "pending" }, // ⚪ 未完成
        ];

    }
    Success(res, "請求成功，回傳所需數據", { projects, steps, comments })

    // Success(res, "請求成功，回傳所需數據")
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

exports.createPlan = handleErrorAsync(async (req, res, next) => {
    try {
        //檢查欄位

        //新增
        Success(res, 新增成功, {}, 201);
    } catch (error) {
        appError(error.message, next, 400, 400);
    }
});

exports.deletePlanByID = handleErrorAsync(async (req, res, next) => {

});
exports.updatePlan = handleErrorAsync(async (req, res, next) => {

});


