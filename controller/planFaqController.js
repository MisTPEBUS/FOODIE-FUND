const PlanFaq = require('../models/planFaq');
const mongoose = require("mongoose");
const {
    Success,
    SuccessList,
    appError,
} = require("../services/handleResponse.js");
const { handleErrorAsync } = require("../services/handleResponse.js");
const { isAuth, generateSendJWT, generateMailSendJWT } = require("../services/auth.js");



exports.getAllFaqs = handleErrorAsync(async (req, res, next) => {
    const { timeSort, keyWord, page = 1, limit = 10 } = req.query;
    const { plan_id } = req.params;
    const tSort = timeSort == "asc" ? "publicAt" : "-publicAt";
    let query = {};


    if (!plan_id || plan_id.trim() === '') {
        return next(appError("id欄位不能為空值！", next, 400, 1002
        ));
    }
    if (plan_id !== 'ALL') {
        query.plan_id = plan_id.trim();
    }


    if (keyWord) {
        const regex = new RegExp(keyWord, 'i');
        query.$or = [
            { title: { $regex: regex } },
            { content: { $regex: regex } }
        ];
    }
    const currentPage = Math.max(parseInt(page) || 1, 1); // 確保 page 是正整數
    const itemsPerPage = Math.max(parseInt(limit) || 10, 1); // 確保 limit 是正整數

    const totalCount = await PlanFaq.countDocuments(query);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    let acties = await PlanFaq.find(query)
        .sort(tSort)
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage);

    // 設定分頁信息
    const pagination = {
        total: totalCount,
        total_pages: totalPages,
        current_page: currentPage,
        has_pre: currentPage > 1,
        has_next: currentPage < totalPages
    };



    Success(res, "請求成功，回傳所需數據", { userQuestionsAndAnswer: acties, pagination: pagination });
    /*
     #swagger.tags = ['計畫管理-常見問題']
     #swagger.path = '/v1/api/plan/{plan_id}/questionsAndAnswers'
     #swagger.method = 'get'
     #swagger.summary = '查詢常見問題清單'
     #swagger.description = '根據提供的參數，查詢常見問題清單，支援關鍵字模糊搜尋及公告時間排序。'
     #swagger.produces = ['application/json']
 */

    /*
        #swagger.parameters['plan_id'] = {
            in: 'path',
            required: true,
            description: '計畫的唯一標識符 (Plan ID)',
            type: 'string'
        }
    */

    /*
        #swagger.parameters['keyWord'] = {
            in: 'query',
            description: '關鍵字模糊搜尋 (針對標題和內容)，若為空則搜尋全部資料。',
            type: 'string'
        }
    */

    /*
        #swagger.parameters['timeSort'] = {
            in: 'query',
            description: '公告時間排序方式。使用 "desc" 表示由遠到近，"asc" 表示由近到遠。',
            enum: ['asc', 'desc'],
            type: 'string'
        }
    */

    /*
        #swagger.parameters['limit'] = {
            in: 'query',
            description: '每頁顯示的資料筆數，預設值為 10。',
            type: 'number',
            default: 10
        }
    */

    /*
        #swagger.parameters['page'] = {
            in: 'query',
            description: '要顯示的頁數，預設值為 1。',
            type: 'number',
            default: 1
        }
    */

    /*
        #swagger.responses[200] = {
            description: '成功查詢常見問題清單。',
            schema: {
                status: true,
                message: '查詢成功',
                data: {
                    total: 100,
                    items: [
                        {
                            id: '123',
                            title: '常見問題標題',
                            content: '常見問題內容',
                            createdAt: '2024-11-30T10:00:00Z'
                        }
                    ]
                }
            }
        }
    */

    /*
        #swagger.responses[400] = {
            description: '請求參數錯誤。',
            schema: {
                status: false,
                message: '無效的參數。',
                errors: {
                    field: 'timeSort',
                    message: '無效的排序方式，僅支援 asc 或 desc。'
                }
            }
        }
    */

    /*
        #swagger.responses[500] = {
            description: '伺服器內部錯誤。',
            schema: {
                status: false,
                message: '伺服器錯誤，請稍後再試。'
            }
        }
    */

});

exports.createFaq = async (req, res) => {
    const updateData = req.body;
    const { plan_id } = req.params;

    if (!plan_id) {
        return next(appError("plan_id傳入格式異常!請查閱API文件", next, 400, 1002
        ));
    }

    if (!plan_id.trim()) {
        return next(appError("plan_id欄位不能為空值！", next, 400, 1002
        ));
    }
    const allowedFields = ["questions",
        "answers", "category", "order", "isActive"
    ]; // 前端提供的欄位名稱
    const filteredData = {};


    Object.keys(updateData).forEach((key) => {

        if (allowedFields.includes(key)) {
            filteredData[key] = updateData[key];
        }
        if (key === "isActive") {

            if (typeof updateData[key] !== 'boolean') {
                return next(appError("isActive必須是boolean", next));
            }
        }
        if (key === "questions" || key === "answers") {

            if (typeof updateData[key] === 'undefined' || updateData[key] === "") {
                return next(appError(`${key}不能是空值`, next, 400, 1002
                ));
            }
        }

    });

    const maxOrder = await PlanFaq.find({ plan_id: plan_id })
        .sort({ order: -1 }) // 按 order 降序排列
        .limit(1)
        .then((docs) => (docs[0]?.order ?? 0));

    // 创建新的文档并将 order 设置为 maxOrder + 1
    filteredData.order = maxOrder + 1;
    filteredData.plan_id = plan_id;
    const newPlan = await PlanFaq.create(filteredData);

    if (!newPlan) {
        return next(appError("建立失敗!", next, 400, 1002));
    }
    Success(res, "已建立貼文", newPlan, 201);

};

exports.updateFaqById = async (req, res) => {
    const { id, plan_id } = req.params;
    const updateData = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(appError("id格式無效!請使用系統加密過的_id參數", next, 400, 1002
        ));
    }
    if (!id) {
        return next(appError("id傳入格式異常!請查閱API文件", next, 400, 1002
        ));
    }

    if (!id.trim()) {
        return next(appError("id欄位不能為空值！", next, 400, 1002
        ));
    }
    const allowedFields = ["questions",
        "answers", "category", "order", "isActive"
    ]; // 前端提供的欄位名稱
    const filteredData = {};

    Object.keys(updateData).forEach((key) => {

        if (allowedFields.includes(key)) {
            filteredData[key] = updateData[key];
        }
        if (key === "isActive") {

            if (typeof updateData[key] !== 'boolean') {
                return next(appError("isActive必須是boolean", next));
            }
        }
        if (key === "questions" || key === "answers") {

            if (typeof updateData[key] === 'undefined' || updateData[key] === "") {
                return next(appError(`${key}不能是空值`, next, 400, 1002
                ));
            }
        }

    });
    filteredData.plan_id = plan_id;
    const resFaq = await PlanFaq.findByIdAndUpdate(
        id, filteredData,
        { new: true, useFindAndModify: true }
    );


    if (!resFaq) {
        return next(appError("找不到對應的常見問題資料，可能已被刪除或不存在！", next, 404, 1003
        ));
    }
    Success(res, `常見問題:${resFaq.questions}資料已更新`);

};


exports.deleteFaqById = handleErrorAsync(async (req, res, next) => {
    const { id, plan_id } = req.params;
    console.log('id:', id)
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(appError("id格式無效!請使用系統加密過的_id參數", next, 400, 1002
        ));
    }
    if (!id) {
        return next(appError("id傳入格式異常!請查閱API文件", next, 400, 1002
        ));
    }

    if (!id.trim()) {
        return next(appError("id欄位不能為空值！", next, 400, 1002
        ));
    }


    const resFaq = await PlanFaq.findByIdAndDelete(
        id,
        { new: true, useFindAndModify: true }
    );


    if (!resFaq) {
        return next(appError("找不到對應的常見問題資料，可能已被刪除或不存在！", next, 404, 1003
        ));
    }

    Success(res, `常見問題:${resFaq.questions}資料已刪除`);

    /*
    #swagger.tags =  ['計畫管理-常見問題']
    #swagger.path = '/v1/api/plan/{plan_id}/questionsAndAnswers/{id}'
    #swagger.method = 'delete'
    #swagger.summary='刪除單筆常見問題'
    #swagger.description = '刪除單筆常見問題'
    #swagger.produces = ["application/json"] 
  */
    /*
     #swagger.parameters['id'] = {
            in: 'path',
            description: '使用者id',
            type: 'string'
         } 
*/

});