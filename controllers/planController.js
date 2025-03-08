// controllers/commentController.js
const Comment = require('../models/planCommentModel');
const { handleErrorAsync } = require('../services/handleResponse');
const plan = require('../utils/plan.json');
const {
    Success,
    SuccessList,
    appError,
} = require("../services/handleResponse.js");
const { convertActiveTime, convertDayToUTC8, convertToUTC8 } = require('../utils/dateUtils.js');
const { getCoverage, getTotalOrders, getTotalRefunds, getAvgDonation, getAvgAmount, getRepurchaseRate } = require('../utils/calUtils.js');
const Plan = require('../models/planModel.js');

const { v4: uuidv4 } = require("uuid");
const firebaseAdmin = require("../services/firebase.js");
const { default: mongoose } = require('mongoose');

const bucket = firebaseAdmin.storage().bucket();



exports.getPlanAdmin = handleErrorAsync(async (req, res, next) => {
    const { timeSort, type = "", keyWord, area = "", page = 1, limit = 6, cate } = req.query;
    const { plan_id } = req.params;



    const projects_t = [{
        "id": "66d66fb3217ebbebc04b1d50",
        "name": "貓貓咖啡廳",
        "status": "resolve"
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
    }];
    console.log(req.user.id);
    let projects = await Plan.find({ user_id: req.user.id }).select("_id title");


    try {

        let steps = [
            { label: "提案內容", status: "pending" }, // ✅ 已完成
            { label: "設定金流", status: "pending" }, // 🟢 進行中
            { label: "計畫回饋", status: "current" }, // ✅ 已完成
            { label: "提交送審", status: "pending" }, // ⚪ 未完成
            { label: "開始募資", status: "pending" }, // ⚪ 未完成
        ];
        let comments = [];
        let plan = {
            "title": "",
            "info": "",
            "email": "",
            "phone": "",
            "proposer": "",
            "activeTime": "",
            "repurchaseRate": 0,
            "address": "",
            "endAt": "",
            "coverage": 0,
            "avgAmount": 0,
            "targetAmount": 0,
            "totalOrders": 0,
            "totalRefunds": 0,
            "avgDonation": 0,
        };
        let orders = [

        ];
        let formattedProjects = projects.map(p => ({
            id: p._id.toString(),
            name: p.title,
            status: "reject" // 預設為 reject
        }));

        // 建立 `id` 到 `status` 的映射
        let statusMap = projects_t.reduce((map, item) => {
            map[item.id] = item.status;
            return map;
        }, {});

        // 合併數據
        let mergedProjects = formattedProjects.map(p => ({
            ...p,
            status: statusMap[p.id] || "reject" // 若匹配到則使用 `projects_t` 的 status，否則為 "reject"
        }));

        // 合併 `projects_t` 中沒有出現在 `projects` 的額外數據
        let extraProjects = projects_t.filter(t => !formattedProjects.some(p => p.id === t.id));

        // 最終合併所有項目
        let finalProjects = [...mergedProjects, ...extraProjects];


        if (req.user.name != "lulume") {
            projects = [];
            console.log(123);
            return Success(res, "請求成功，回傳所需數據", { projects: finalProjects, steps, plan, orders, comments });

        }
        else if (plan_id == "66d66fb3217ebbebc04b1d50") {
            console.log(1233);
            steps = [
                { label: "提案內容", status: "completed" }, // ✅ 已完成
                { label: "設定金流", status: "completed" }, // 🟢 進行中
                { label: "計畫回饋", status: "current" }, // ✅ 已完成
                { label: "提交送審", status: "pending" }, // ⚪ 未完成
                { label: "開始募資", status: "pending" }, // ⚪ 未完成
            ];
            comments = [
                {
                    id: "d6b7fa3c9c174c4f8c369c91c1e2aee0",
                    avatar: "https://flowbite.com/docs/images/people/profile-picture-3.jpg",
                    status: "pending", name: "兔子", content: "你們的餐廳會開在哪裡?", createdAt: "2025-02-26"
                },
                {
                    id: "ycb7fa3cvb174c4f8c369c91c1e2aehg", avatar: "",
                    status: "pending", name: "Lobinda", content: "沒有圖片會有錯誤嗎?", createdAt: "2025-02-26"
                },
            ];
            orders = [
                {
                    "id": "9f87b6e9d7ce4b1283c9fda1d5ef4a92",
                    "order_no": "ORD202502260001",
                    "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                        "photo": "https://lh3.googleusercontent.com/a/ACg8ocLdXZ3oI-zAaV8TwfewBa7lK96h7YgemhOChkWRmOMwjm29DwI=s96-c"
                    },
                },
                {
                    "id": "4b1283c9fd9f87b6e9d7cea1d5ef4a92",
                    "order_no": "ORD202502260002",
                    "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                        "photo": ""
                    },
                }
            ];
            plan = {
                "title": "喵喵咖啡館",
                "info": "喵喵咖啡館在於創辦人在台北時創立,我們的理念很簡單-提供優質的食物和咖啡,咖啡具有使人們停下來和彼此互動的能力。",
                "email": "ttppoo12144@gmail.com",
                "phone": "123456789",
                "proposer": "兔子",
                "activeTime": convertActiveTime("2025-02-27T01:20:00"),
                "repurchaseRate": 0,
                "address": "地球某個角落",
                "endAt": "2025-12-26",
                "coverage": 2.23,
                "avgAmount": 11666,
                "targetAmount": 1000000,
                "totalOrders": 2,
                "totalRefunds": 0,
                "avgDonation": 2500,
            };
        }
        else if (plan_id == "66fb66d32bebc04b1d517eb0") {
            console.log(12393);
            steps = [
                { label: "提案內容", status: "completed" }, // ✅ 已完成
                { label: "設定金流", status: "completed" }, // 🟢 進行中
                { label: "計畫回饋", status: "completed" }, // ✅ 已完成
                { label: "提交送審", status: "completed" }, // ⚪ 未完成
                { label: "開始募資", status: "completed" }, // ⚪ 未完成
            ];
            comments = [
                {
                    id: "d9ob7fa3c9c174c4f8c369c91c1e2ae55",
                    status: "pending",
                    name: "陳先生",
                    content: "您好可以提供有什麼火腿精緻菜單料理嗎",
                    createdAt: "2025-02-26"
                },
                {
                    id: "eqaz7fa3c9c174c4f8c369c91c1e2azdv",
                    status: "pending",
                    name: "N7",
                    content: "您好，我最近了解到你們餐廳正在進行募資，對於你們的理念和未來的計畫感到非常興趣。我想進一步了解一下，如果餐廳順利",
                    createdAt: "2025-02-26"
                },
                {
                    id: "d9ob7fa3c9c174c9961369c91c1e2ae55",
                    status: "resolve",
                    name: "兔子",
                    content: "什麼時候可以開幕，我要吃火腿",
                    createdAt: "2025-02-26"
                },
                {
                    id: "550e8400e29b41d4a716446655440000",
                    status: "resolve",
                    name: "Lobinda",
                    content: "您好，我最近了解到你們餐廳正在進行募資，對於你們的理念和未來的計畫感到非常興趣。我想進一步了解一下，如果餐廳順利",
                    createdAt: "2025-02-27"
                },

            ];
            orders = [
                {
                    "id": "9f87b6e9d7ce4b1283c9fda1d5ef4a92",
                    "order_no": "ORD202502000101",
                    "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                        "photo": ""
                    },
                },
                {
                    "id": "7c968yy6e9de4b1283c9fda1d5ef4a92",
                    "order_no": "ORD202502000102",
                    "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                        "photo": ""
                    },
                },
                {
                    "id": "e9d7e4b1283c9fda1d5ef4ac9f87b692",
                    "order_no": "ORD202502000108",
                    "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                        "photo": "https://lh3.googleusercontent.com/a/ACg8ocLdXZ3oI-zAaV8TwfewBa7lK96h7YgemhOChkWRmOMwjm29DwI=s96-c"
                    },
                },
                {
                    "id": "1d73cc9f87b6e9de4b1289fda5ef4a92",
                    "order_no": "ORD202502000103",
                    "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                        "photo": ""
                    },
                },
                {
                    "id": "283c9fd7c9f87b6e9de4b1a1f4a92d5e",
                    "order_no": "ORD202502000104",
                    "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                        "photo": ""
                    },
                },
                {
                    "id": "de4b127c9f87b1d5ef4a926e983c9fda",
                    "order_no": "ORD202502000105",
                    "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
                    "discount": 0,
                    "donate": 1000,
                    "subtotal": 300000,
                    "shipping_fee": 150,
                    "total_amount": 301000,
                    "currency": "NT$",
                    "payment_method": "credit_card",
                    "status": "resolve",
                    "customer": {
                        "name": "鴨子",
                        "photo": "https://avatars.githubusercontent.com/u/47508893?v=4"
                    },
                },
                {
                    "id": "7c9f87b6e9de4b1283c9fda1d5ef4a92",
                    "order_no": "ORD202502000112",
                    "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                        "photo": ""
                    },
                }
            ];
            plan = {
                "title": "FOODIE 主題火腿餐廳",
                "info": `火腿主題餐廳是一家專注於各種火腿美食的特色餐廳，旨在為顧客提供豐富多樣的火腿料理體驗。餐廳的菜單圍繞著不同類型和風味的火腿設計，如西班牙伊比利亞火腿、意大利帕爾馬火腿和德國黑森林火腿等，搭配創意小吃、沙拉、三明治和主菜，滿足不同口味的需求。
            餐廳的氛圍通常會反映火腿的傳統和文化背景，例如使用木質元素、復古的裝飾品和暖色調的燈光來營造溫馨舒適的用餐環境。同時，餐廳可能還會設有開放式廚房或展示區，讓顧客可以觀賞到專業切割火腿的過程，增加互動性和趣味性。
            除了火腿料理，餐廳還提供多種搭配的葡萄酒和特色飲品，以提升整體用餐體驗。這類餐廳不僅適合火腿愛好者，也是尋求獨特美食體驗的顧客的理想選擇。`,
                "email": "abcd@gmail.com",
                "phone": "123456789",
                "proposer": "abcd@gmail.com",
                "activeTime": convertActiveTime("2025-01-27T01:20:00"),
                "repurchaseRate": getRepurchaseRate(orders),
                "address": "地球某個角落",
                "endAt": "2025-08-26",
                "coverage": getCoverage(orders, 1000000),
                "avgAmount": getAvgAmount(orders),
                "targetAmount": 1000000,
                "totalOrders": getTotalOrders(orders),
                "totalRefunds": getTotalRefunds(orders),
                "avgDonation": getAvgDonation(orders),
            };
        }
        else if (plan_id == "zcfd369d2bebc04b1d517eb0") {
            console.log(12133);
            steps = [
                { label: "提案內容", status: "completed" }, // ✅ 已完成
                { label: "設定金流", status: "current" }, // 🟢 進行中
                { label: "計畫回饋", status: "pending" }, // ✅ 已完成
                { label: "提交送審", status: "pending" }, // ⚪ 未完成
                { label: "開始募資", status: "pending" }, // ⚪ 未完成
            ];
            plan = {
                "title": "Test",
                "info": `TEST。`,
                "email": "abcd@gmail.com",
                "phone": "123456789",
                "proposer": "abcd@gmail.com",
                "activeTime": convertActiveTime("2025-02-27T03:20:00"),
                "repurchaseRate": 0,
                "address": "地球某個角落",
                "endAt": "2025-03-26",
                "coverage": 0,
                "avgAmount": 0,
                "targetAmount": 0,
                "totalOrders": 0,
                "totalRefunds": 0,
                "avgDonation": 0,
            };

        }

        // 轉換 `projects` 為統一格式

        formattedProjects = projects.map(p => ({
            id: p._id.toString(),
            name: p.title,
            status: "reject" // 預設為 reject
        }));

        // 建立 `id` 到 `status` 的映射
        statusMap = projects_t.reduce((map, item) => {
            map[item.id] = item.status;
            return map;
        }, {});

        // 合併數據
        mergedProjects = formattedProjects.map(p => ({
            ...p,
            status: statusMap[p.id] || "reject" // 若匹配到則使用 `projects_t` 的 status，否則為 "reject"
        }));

        // 合併 `projects_t` 中沒有出現在 `projects` 的額外數據
        extraProjects = projects_t.filter(t => !formattedProjects.some(p => p.id === t.id));

        // 最終合併所有項目
        finalProjects = [...mergedProjects, ...extraProjects];


        Success(res, "請求成功，回傳所需數據", { projects: finalProjects, steps, plan, orders, comments })
    } catch (error) {
        console.log(error.message);
    }


});
exports.getPlanAdminByID = handleErrorAsync(async (req, res, next) => {
    const { timeSort, type = "", keyWord, area = "", page = 1, limit = 6, cate } = req.query;
    const { plan_id } = req.params;
    console.log('66d47ab0acd4eea1593b1e92', req.user);


    const projects_t = [{
        "id": "66d66fb3217ebbebc04b1d50",
        "name": "貓貓咖啡廳",
        "status": "resolve"
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
    }];

    let projects = await Plan.find({ user_id: req.user.id }).select("_id title");




    let steps = [
        { label: "提案內容", status: "pending" }, // ✅ 已完成
        { label: "設定金流", status: "pending" }, // 🟢 進行中
        { label: "計畫回饋", status: "current" }, // ✅ 已完成
        { label: "提交送審", status: "pending" }, // ⚪ 未完成
        { label: "開始募資", status: "pending" }, // ⚪ 未完成
    ];
    let comments = [];
    let plan = {
        "title": "",
        "info": "",
        "email": "",
        "phone": "",
        "proposer": "",
        "activeTime": "",
        "repurchaseRate": 0,
        "address": "",
        "endAt": "",
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
            { label: "提案內容", status: "completed" }, // ✅ 已完成
            { label: "設定金流", status: "completed" }, // 🟢 進行中
            { label: "計畫回饋", status: "current" }, // ✅ 已完成
            { label: "提交送審", status: "pending" }, // ⚪ 未完成
            { label: "開始募資", status: "pending" }, // ⚪ 未完成
        ];
        comments = [
            {
                id: "d6b7fa3c9c174c4f8c369c91c1e2aee0",
                avatar: "https://flowbite.com/docs/images/people/profile-picture-3.jpg",
                status: "pending", name: "兔子", content: "你們的餐廳會開在哪裡?", createdAt: "2025-02-26"
            },
            {
                id: "ycb7fa3cvb174c4f8c369c91c1e2aehg", avatar: "",
                status: "pending", name: "Lobinda", content: "沒有圖片會有錯誤嗎?", createdAt: "2025-02-26"
            },
        ];
        orders = [
            {
                "id": "9f87b6e9d7ce4b1283c9fda1d5ef4a92",
                "order_no": "ORD202502260001",
                "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                    "photo": "https://lh3.googleusercontent.com/a/ACg8ocLdXZ3oI-zAaV8TwfewBa7lK96h7YgemhOChkWRmOMwjm29DwI=s96-c"
                },
            },
            {
                "id": "4b1283c9fd9f87b6e9d7cea1d5ef4a92",
                "order_no": "ORD202502260002",
                "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                    "photo": ""
                },
            }
        ];
        plan = {
            "title": "喵喵咖啡館",
            "info": "喵喵咖啡館在於創辦人在台北時創立,我們的理念很簡單-提供優質的食物和咖啡,咖啡具有使人們停下來和彼此互動的能力。",
            "email": "ttppoo12144@gmail.com",
            "phone": "123456789",
            "proposer": "兔子",
            "activeTime": convertActiveTime("2025-02-27T01:20:00"),
            "repurchaseRate": 0,
            "address": "地球某個角落",
            "endAt": "2025-12-26",
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
            { label: "提案內容", status: "completed" }, // ✅ 已完成
            { label: "設定金流", status: "completed" }, // 🟢 進行中
            { label: "計畫回饋", status: "completed" }, // ✅ 已完成
            { label: "提交送審", status: "completed" }, // ⚪ 未完成
            { label: "開始募資", status: "completed" }, // ⚪ 未完成
        ];
        comments = [
            {
                id: "d9ob7fa3c9c174c4f8c369c91c1e2ae55",
                status: "pending",
                name: "陳先生",
                content: "您好可以提供有什麼火腿精緻菜單料理嗎",
                createdAt: "2025-02-26"
            },
            {
                id: "eqaz7fa3c9c174c4f8c369c91c1e2azdv",
                status: "pending",
                name: "N7",
                content: "您好，我最近了解到你們餐廳正在進行募資，對於你們的理念和未來的計畫感到非常興趣。我想進一步了解一下，如果餐廳順利",
                createdAt: "2025-02-26"
            },
            {
                id: "d9ob7fa3c9c174c9961369c91c1e2ae55",
                status: "resolve",
                name: "兔子",
                content: "什麼時候可以開幕，我要吃火腿",
                createdAt: "2025-02-26"
            },
            {
                id: "550e8400e29b41d4a716446655440000",
                status: "resolve",
                name: "Lobinda",
                content: "您好，我最近了解到你們餐廳正在進行募資，對於你們的理念和未來的計畫感到非常興趣。我想進一步了解一下，如果餐廳順利",
                createdAt: "2025-02-27"
            },

        ];
        orders = [
            {
                "id": "9f87b6e9d7ce4b1283c9fda1d5ef4a92",
                "order_no": "ORD202502000101",
                "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                    "photo": ""
                },
            },
            {
                "id": "7c968yy6e9de4b1283c9fda1d5ef4a92",
                "order_no": "ORD202502000102",
                "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                    "photo": ""
                },
            },
            {
                "id": "e9d7e4b1283c9fda1d5ef4ac9f87b692",
                "order_no": "ORD202502000108",
                "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                    "photo": "https://lh3.googleusercontent.com/a/ACg8ocLdXZ3oI-zAaV8TwfewBa7lK96h7YgemhOChkWRmOMwjm29DwI=s96-c"
                },
            },
            {
                "id": "1d73cc9f87b6e9de4b1289fda5ef4a92",
                "order_no": "ORD202502000103",
                "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                    "photo": ""
                },
            },
            {
                "id": "283c9fd7c9f87b6e9de4b1a1f4a92d5e",
                "order_no": "ORD202502000104",
                "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                    "photo": ""
                },
            },
            {
                "id": "de4b127c9f87b1d5ef4a926e983c9fda",
                "order_no": "ORD202502000105",
                "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
                "discount": 0,
                "donate": 1000,
                "subtotal": 300000,
                "shipping_fee": 150,
                "total_amount": 301000,
                "currency": "NT$",
                "payment_method": "credit_card",
                "status": "resolve",
                "customer": {
                    "name": "鴨子",
                    "photo": "https://avatars.githubusercontent.com/u/47508893?v=4"
                },
            },
            {
                "id": "7c9f87b6e9de4b1283c9fda1d5ef4a92",
                "order_no": "ORD202502000112",
                "order_date": convertToUTC8("2025-02-26T03:20:00+08:00"),
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
                    "photo": ""
                },
            }
        ];
        plan = {
            "title": "FOODIE 主題火腿餐廳",
            "info": `火腿主題餐廳是一家專注於各種火腿美食的特色餐廳，旨在為顧客提供豐富多樣的火腿料理體驗。餐廳的菜單圍繞著不同類型和風味的火腿設計，如西班牙伊比利亞火腿、意大利帕爾馬火腿和德國黑森林火腿等，搭配創意小吃、沙拉、三明治和主菜，滿足不同口味的需求。
            餐廳的氛圍通常會反映火腿的傳統和文化背景，例如使用木質元素、復古的裝飾品和暖色調的燈光來營造溫馨舒適的用餐環境。同時，餐廳可能還會設有開放式廚房或展示區，讓顧客可以觀賞到專業切割火腿的過程，增加互動性和趣味性。
            除了火腿料理，餐廳還提供多種搭配的葡萄酒和特色飲品，以提升整體用餐體驗。這類餐廳不僅適合火腿愛好者，也是尋求獨特美食體驗的顧客的理想選擇。`,
            "email": "abcd@gmail.com",
            "phone": "123456789",
            "proposer": "abcd@gmail.com",
            "activeTime": convertActiveTime("2025-01-27T01:20:00"),
            "repurchaseRate": getRepurchaseRate(orders),
            "address": "地球某個角落",
            "endAt": "2025-08-26",
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
            { label: "提案內容", status: "completed" }, // ✅ 已完成
            { label: "設定金流", status: "current" }, // 🟢 進行中
            { label: "計畫回饋", status: "pending" }, // ✅ 已完成
            { label: "提交送審", status: "pending" }, // ⚪ 未完成
            { label: "開始募資", status: "pending" }, // ⚪ 未完成
        ];
        plan = {
            "title": "Test",
            "info": `TEST。`,
            "email": "abcd@gmail.com",
            "phone": "123456789",
            "proposer": "abcd@gmail.com",
            "activeTime": convertActiveTime("2025-02-27T03:20:00"),
            "repurchaseRate": 0,
            "address": "地球某個角落",
            "endAt": "2025-03-26",
            "coverage": 0,
            "avgAmount": 0,
            "targetAmount": 0,
            "totalOrders": 0,
            "totalRefunds": 0,
            "avgDonation": 0,
        };

    }

    // 轉換 `projects` 為統一格式
    let formattedProjects = projects.map(p => ({
        id: p._id.toString(),
        name: p.title,
        status: "reject" // 預設為 reject
    }));

    // 建立 `id` 到 `status` 的映射
    let statusMap = projects_t.reduce((map, item) => {
        map[item.id] = item.status;
        return map;
    }, {});

    // 合併數據
    let mergedProjects = formattedProjects.map(p => ({
        ...p,
        status: statusMap[p.id] || "reject" // 若匹配到則使用 `projects_t` 的 status，否則為 "reject"
    }));

    // 合併 `projects_t` 中沒有出現在 `projects` 的額外數據
    let extraProjects = projects_t.filter(t => !formattedProjects.some(p => p.id === t.id));

    // 最終合併所有項目
    let finalProjects = [...mergedProjects, ...extraProjects];

    console.log(finalProjects);
    Success(res, "請求成功，回傳所需數據", { projects: finalProjects, steps, plan, orders, comments })

});



exports.getPlanClient = handleErrorAsync(async (req, res, next) => {
    //
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
        const {
            activeType,
            location,
            restaurantType,
            image,
            title,
            proposer,
            email,
            phone,
            address,
            info,
            targetAmount,
            endAt,
        } = req.body;
        let filteredData = {
            activeType,
            location,
            restaurantType,
            image,
            title,
            proposer,
            email,
            phone,
            address,
            info,
            endAt,
            targetAmount
        };
        // 建立新資料（會自動觸發Schema驗證）
        /*  const newPlan = await Plan.create({
             activeType,
             location,
             restaurantType,
             image,
             title,
             proposer,
             email,
             phone,
             address,
             info,
             endAt,
             users_id,
         }); */
        console.log(req.files);
        if (req.files && req.files.length > 0) {
            const file = req.files[0];
            const blob = bucket.file(
                `images/${uuidv4()}.${file.originalname.split(".").pop()}`,
            );
            const blobStream = blob.createWriteStream();
            blobStream.end(file.buffer);

            blobStream.on("finish", async () => {
                try {
                    const config = {
                        action: "read",
                        expires: "12-31-2500",
                    };

                    const [fileUrl] = await blob.getSignedUrl(config);

                    // 添加圖片 URL 和計畫 ID
                    filteredData.image = fileUrl;
                    filteredData.user_id = req.user.id;

                    // 儲存到 MongoDB
                    const newPlan = await Plan.create({ ...filteredData });

                    if (!newPlan) {
                        throw appError("建立失敗!", next, 400);
                    }

                    Success(res, "已建立貼文", newPlan, 201);
                } catch (error) {
                    next(error);
                }
            });

            blobStream.on("error", (err) => {
                console.error(err);
                return next(appError("上傳失敗", next, 500));
            });
        } else {
            // 沒有圖片，直接儲存
            filteredData.image = ''; // 空字串
            filteredData.user_id = req.user.id;



            try {
                // 儲存到 MongoDB
                const newPlan = await Plan.create({ ...filteredData });

                if (!newPlan) {
                    throw appError("建立失敗!", next, 400);
                }

                Success(res, "已建立貼文", newPlan, 201);
            } catch (error) {
                next(error);
            }
        }
        //Success(res, '新增成功', newPlan, 201);

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return appError(messages.join(', '), next, 400);
        }
        return appError(error.message, next, 500);
    }
});

exports.updatePlanById = handleErrorAsync(async (req, res, next) => {
    try {
        const planId = req.params.id;
        const updateData = req.body;

        const updatedPlan = await Plan.findByIdAndUpdate(
            planId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedPlan) {
            return appError('找不到指定的資料', next, 404);
        }

        Success(res, '更新成功', updatedPlan);

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return appError(messages.join(', '), next, 400);
        }

        appError(error.message, next, 500);
    }
});


