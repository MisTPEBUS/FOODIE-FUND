// controllers/commentController.js
const Comment = require('../models/planCommentModel');
const { handleErrorAsync } = require('../services/handleResponse');
const plan = require('../utils/plan.json');
const {
    Success,
    SuccessList,
    appError,
} = require("../services/handleResponse.js");
const { convertActiveTime } = require('../utils/dateUtils.js');
const { getCoverage, getTotalOrders, getTotalRefunds, getAvgDonation, getAvgAmount, getRepurchaseRate } = require('../utils/calUtils.js');

exports.getPlanAdmin = handleErrorAsync(async (req, res, next) => {
    const { timeSort, type = "", keyWord, area = "", page = 1, limit = 6, cate } = req.query;
    const { plan_id } = req.params;
    console.log(plan_id);
    console.log(`sadf`, req.user);
    let projects = [{
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
    let steps = [
        { label: "填寫提案內容", status: "pending" }, // ✅ 已完成
        { label: "設定金流", status: "pending" }, // 🟢 進行中
        { label: "完善計畫回饋", status: "pending" }, // ✅ 已完成
        { label: "提交送審", status: "pending" }, // ⚪ 未完成
        { label: "開始募資", status: "pending" }, // ⚪ 未完成
    ];
    let comments = [];
    let plan = {
        "info": "",
        "email": "",
        "phone": "",
        "proposer": "",
        "activeTime": "",
        "repurchaseRate": 0,
        "address": "",
        "updated_at": "",
        "coverage": 0,
        "avgAmount": 0,
        "targetAmount": 0,
        "totalOrders": 0,
        "totalRefunds": 0,
        "avgDonation": 0,
    };
    let orders = [

    ];

    if (req.user.name != "lulume") {
        projects = [];
        return Success(res, "請求成功，回傳所需數據", { projects, steps, plan, orders, comments });

    }
    else if (plan_id == "66d66fb3217ebbebc04b1d50") {
        steps = [
            { label: "填寫提案內容", status: "completed" }, // ✅ 已完成
            { label: "設定金流", status: "completed" }, // 🟢 進行中
            { label: "完善計畫回饋", status: "completed" }, // ✅ 已完成
            { label: "提交送審", status: "completed" }, // ⚪ 未完成
            { label: "開始募資", status: "completed" }, // ⚪ 未完成
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
        ];
        orders = [
            {
                "id": "9f87b6e9d7ce4b1283c9fda1d5ef4a92",
                "order_no": "ORD202502260001",
                "order_date": "2025-02-26T03:20:00+08:00",
                "discount": 100,
                "donate": 0,
                "subtotal": 6666,
                "shipping_fee": 150,
                "total_amount": 6716,
                "currency": "NT$",
                "payment_method": "credit_card",
                "status": "resolve",
                "customer": {
                    "name": "火腿",
                },
            },
            {
                "id": "9f87b6e9d7ce4b1283c9fda1d5ef4a92",
                "order_no": "ORD202502260002",
                "order_date": "2025-02-26T03:20:00+08:00",
                "discount": 100,
                "donate": 5000,
                "subtotal": 11666,
                "shipping_fee": 150,
                "total_amount": 16716,
                "currency": "NT$",
                "payment_method": "credit_card",
                "status": "resolve",
                "customer": {
                    "name": "兔子",
                },
            }
        ];
        plan = {
            "tittle": "喵喵咖啡館",
            "info": "喵喵咖啡館在於創辦人在台北時創立,我們的理念很簡單-提供優質的食物和咖啡,咖啡具有使人們停下來和彼此互動的能力。",
            "email": "ttppoo12144@gmail.com",
            "phone": "123456789",
            "proposer": "兔子",
            "activeTime": convertActiveTime("2025-02-27T01:20:00"),
            "repurchaseRate": 0,
            "address": "地球某個角落",
            "end_at": "2025-12-26",
            "coverage": 2.23,
            "avgAmount": 11666,
            "targetAmount": 1000000,
            "totalOrders": 2,
            "totalRefunds": 0,
            "avgDonation": 2500,
        };
    }
    else if (plan_id == "66fb66d32bebc04b1d517eb0") {
        steps = [
            { label: "填寫提案內容", status: "completed" }, // ✅ 已完成
            { label: "設定金流", status: "completed" }, // 🟢 進行中
            { label: "完善計畫回饋", status: "completed" }, // ✅ 已完成
            { label: "提交送審", status: "completed" }, // ⚪ 未完成
            { label: "開始募資", status: "completed" }, // ⚪ 未完成
        ];
        comments = [
            {
                id: "d9ob7fa3c9c174c4f8c369c91c1e2ae55",
                status: "pending",
                name: "陳先生",
                content: "您好可以提供有什麼火腿精緻菜單料理嗎",
                createdAt: "2025-02-26 23:50"
            },
            {
                id: "eqaz7fa3c9c174c4f8c369c91c1e2azdv",
                status: "pending",
                name: "N7",
                content: "您好，我最近了解到你們餐廳正在進行募資，對於你們的理念和未來的計畫感到非常興趣。我想進一步了解一下，如果餐廳順利",
                createdAt: "2025-02-26 23:50"
            },
            {
                id: "d9ob7fa3c9c174c4f8c369c91c1e2ae55",
                status: "resolve",
                name: "兔子",
                content: "什麼時候可以開幕，我要吃火腿",
                createdAt: "2025-02-26 23:50"
            },
            {
                id: "550e8400e29b41d4a716446655440000",
                status: "resolve",
                name: "Lobinda",
                content: "您好，我最近了解到你們餐廳正在進行募資，對於你們的理念和未來的計畫感到非常興趣。我想進一步了解一下，如果餐廳順利",
                createdAt: "2025-02-27 00:12"
            },

        ];
        orders = [
            {
                "id": "9f87b6e9d7ce4b1283c9fda1d5ef4a92",
                "order_no": "ORD202502000101",
                "order_date": "2025-02-26T03:20:00+08:00",
                "discount": 0,
                "donate": 10000,
                "subtotal": 2000,
                "shipping_fee": 0,
                "total_amount": 2000,
                "currency": "NT$",
                "payment_method": "credit_card",
                "status": "resolve",
                "customer": {
                    "name": "陳先生",
                },
            },
            {
                "id": "7c9f87b6e9de4b1283c9fda1d5ef4a92",
                "order_no": "ORD202502000102",
                "order_date": "2025-02-26T03:20:00+08:00",
                "discount": 100,
                "donate": 5000,
                "subtotal": 11666,
                "shipping_fee": 150,
                "total_amount": 16716,
                "currency": "NT$",
                "payment_method": "credit_card",
                "status": "reject",
                "customer": {
                    "name": "兔子",
                },
            },
            {
                "id": "7c9f87b6e9de4b1283c9fda1d5ef4a92",
                "order_no": "ORD202502000108",
                "order_date": "2025-02-26T03:20:00+08:00",
                "discount": 0,
                "donate": 5000,
                "subtotal": 101000,
                "shipping_fee": 0,
                "total_amount": 106000,
                "currency": "NT$",
                "payment_method": "credit_card",
                "status": "resolve",
                "customer": {
                    "name": "火腿",
                },
            },
            {
                "id": "1d73cc9f87b6e9de4b1289fda5ef4a92",
                "order_no": "ORD202502000103",
                "order_date": "2025-02-26T03:20:00+08:00",
                "discount": 0,
                "donate": 50000,
                "subtotal": 316660,
                "shipping_fee": 0,
                "total_amount": 366600,
                "currency": "NT$",
                "payment_method": "credit_card",
                "status": "resolve",
                "customer": {
                    "name": "兔子",
                },
            },
            {
                "id": "283c9fd7c9f87b6e9de4b1a1f4a92d5e",
                "order_no": "ORD202502000104",
                "order_date": "2025-02-26T03:20:00+08:00",
                "discount": 0,
                "donate": 50000,
                "subtotal": 120000,
                "shipping_fee": 0,
                "total_amount": 170000,
                "currency": "NT$",
                "payment_method": "credit_card",
                "status": "resolve",
                "customer": {
                    "name": "N7",
                },
            },
            {
                "id": "de4b127c9f87b1d5ef4a926e983c9fda",
                "order_no": "ORD202502000105",
                "order_date": "2025-02-26T03:20:00+08:00",
                "discount": 0,
                "donate": 1000,
                "subtotal": 300000,
                "shipping_fee": 150,
                "total_amount": 301000,
                "currency": "NT$",
                "payment_method": "credit_card",
                "status": "resolve",
                "customer": {
                    "name": "兔子",
                },
            },
            {
                "id": "7c9f87b6e9de4b1283c9fda1d5ef4a92",
                "order_no": "ORD202502000112",
                "order_date": "2025-02-26T03:20:00+08:00",
                "discount": 100,
                "donate": 5000,
                "subtotal": 11666,
                "shipping_fee": 150,
                "total_amount": 16716,
                "currency": "NT$",
                "payment_method": "credit_card",
                "status": "resolve",
                "customer": {
                    "name": "兔子",
                },
            }
        ];
        plan = {
            "tittle": "FOODIE 主題火腿餐廳",
            "info": `火腿主題餐廳是一家專注於各種火腿美食的特色餐廳，旨在為顧客提供豐富多樣的火腿料理體驗。餐廳的菜單圍繞著不同類型和風味的火腿設計，如西班牙伊比利亞火腿、意大利帕爾馬火腿和德國黑森林火腿等，搭配創意小吃、沙拉、三明治和主菜，滿足不同口味的需求。
            餐廳的氛圍通常會反映火腿的傳統和文化背景，例如使用木質元素、復古的裝飾品和暖色調的燈光來營造溫馨舒適的用餐環境。同時，餐廳可能還會設有開放式廚房或展示區，讓顧客可以觀賞到專業切割火腿的過程，增加互動性和趣味性。
            除了火腿料理，餐廳還提供多種搭配的葡萄酒和特色飲品，以提升整體用餐體驗。這類餐廳不僅適合火腿愛好者，也是尋求獨特美食體驗的顧客的理想選擇。`,
            "email": "abcd@gmail.com",
            "phone": "123456789",
            "proposer": "abcd@gmail.com",
            "activeTime": convertActiveTime("2025-01-27T01:20:00"),
            "repurchaseRate": getRepurchaseRate(orders),
            "address": "地球某個角落",
            "end_at": "2025-08-26",
            "coverage": getCoverage(orders, 1000000),
            "avgAmount": getAvgAmount(orders),
            "targetAmount": 1000000,
            "totalOrders": getTotalOrders(orders),
            "totalRefunds": getTotalRefunds(orders),
            "avgDonation": getAvgDonation(orders),
        };
    }
    else if (plan_id == "zcfd369d2bebc04b1d517eb0") {
        steps = [
            { label: "填寫提案內容", status: "completed" }, // ✅ 已完成
            { label: "設定金流", status: "pending" }, // 🟢 進行中
            { label: "完善計畫回饋", status: "pending" }, // ✅ 已完成
            { label: "提交送審", status: "pending" }, // ⚪ 未完成
            { label: "開始募資", status: "pending" }, // ⚪ 未完成
        ];
        plan = {
            "tittle": "Test",
            "info": `TEST。`,
            "email": "abcd@gmail.com",
            "phone": "123456789",
            "proposer": "abcd@gmail.com",
            "activeTime": convertActiveTime("2025-02-27T03:20:00"),
            "repurchaseRate": 0,
            "address": "地球某個角落",
            "end_at": "2025-03-26",
            "coverage": 0,
            "avgAmount": 0,
            "targetAmount": 0,
            "totalOrders": 0,
            "totalRefunds": 0,
            "avgDonation": 0,
        };

    }
    Success(res, "請求成功，回傳所需數據", { projects, steps, plan, orders, comments })

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


