
const PlanNews = require("../models/planNews");
const mongoose = require("mongoose");
const {
    Success,
    SuccessList,
    appError,
} = require("../services/handleResponse.js");
const { handleErrorAsync } = require("../services/handleResponse.js");
const { isAuth, generateSendJWT, generateMailSendJWT } = require("../services/auth.js");


exports.getAllNews = handleErrorAsync(async (req, res, next) => {
    const { timeSort, keyWord, page = 1, limit = 10 } = req.query;
    const { plan_id } = req.params;
    const tSort = timeSort == "asc" ? "publicAt" : "-publicAt";
    let query = {};


    if (!plan_id || plan_id.trim() === '') {
        return next(appError("id欄位不能為空值！", next, 400, 1002
        ));
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

    const totalCount = await PlanNews.countDocuments(query);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    let acties = await PlanNews.find(query)
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
    res.data =
    {
        add: '',
        pagination: pagination
    }
    Success(res, "請求成功，回傳所需數據", { planNews: acties, pagination: pagination });
    /*
      #swagger.tags =  ['計畫管理']
      #swagger.path = '/v1/api/news'
      #swagger.method = 'get'
      #swagger.summary='計畫留言清單查詢'
      #swagger.description = '計畫留言清單查詢'
      #swagger.produces = ["application/json"] 
    */
    /* 
        #swagger.parameters['keyWord'] = {
            in: 'query',
            description: '關鍵字fuzzy[tittle,content], 預設空直為搜尋全部',
            type: 'string'
         } 
         #swagger.parameters['timeSort'] = {
            in: 'query',
           description: '公告時間排序遠到近desc,asc進到遠',
           enum: ['asc', 'desc'],
            type: 'string'
         } 
        #swagger.parameters['limit'] = {
            in: 'query',
            description: '清單顯示比數,default=10',
            type: 'number'
         } 
        #swagger.parameters['page'] = {
            in: 'query',
            description: '顯示第幾頁資料default=1',
            type: 'number'
         } 
    */
});
exports.createNews = handleErrorAsync(async (req, res, next) => {
    const updateData = req.body;
    const plan_id = req.params;

    const allowedFields = ["plan_id", "title",
        "content", "isEnabled", "isTop", "publicAt"
    ]; // 前端提供的欄位名稱
    const filteredData = {};

    Object.keys(updateData).forEach((key) => {

        if (allowedFields.includes(key)) {
            filteredData[key] = updateData[key];
        }
        if (key === "isTop") {

            if (typeof updateData[key] !== 'boolean') {
                return next(appError("isTop必須是boolean", next, 400, 1002));
            }
        }
        if (key === "isEnabled") {

            if (typeof updateData[key] !== 'boolean') {
                return next(appError("isEnabled必須是boolean", next, 400, 1002));
            }
        }
        if (key === "title") {
            if (!updateData[key].trim()) {
                return next(appError("title欄位不能為空值！", next, 400, 1002));
            }
        }
        if (key === "publicAt") {
            if (isNaN(Date.parse(updateData[key]))) {
                return next(appError("publicAt必須是日期格式！", next, 400, 1002));
            }
        }
    });
    const newNews = await News.create(filteredData);
    if (!newNews) {
        return next(appError("建立失敗!", next, 400, 2001));
    }


    Success(res, "已建立貼文", newNews, 201);


    /*
      #swagger.tags =  ['計畫管理']
      #swagger.path = '/v1/api/news'
      #swagger.method = 'get'
      #swagger.summary='計畫留言清單查詢'
      #swagger.description = '計畫留言清單查詢'
      #swagger.produces = ["application/json"] 
    */
    /* 
        #swagger.parameters['keyWord'] = {
            in: 'query',
            description: '關鍵字fuzzy[tittle,content], 預設空直為搜尋全部',
            type: 'string'
         } 
         #swagger.parameters['timeSort'] = {
            in: 'query',
           description: '公告時間排序遠到近desc,asc進到遠',
           enum: ['asc', 'desc'],
            type: 'string'
         } 
        #swagger.parameters['limit'] = {
            in: 'query',
            description: '清單顯示比數,default=10',
            type: 'number'
         } 
        #swagger.parameters['page'] = {
            in: 'query',
            description: '顯示第幾頁資料default=1',
            type: 'number'
         } 
    */
});





exports.updateNewsById = handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;

});

exports.deleteNewsById = handleErrorAsync(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(appError("id格式無效!請使用系統加密過的_id參數", next));
    }
    if (!id) {
        return next(appError("id傳入格式異常!請查閱API文件", next));
    }

    if (!id.trim()) {
        return next(appError("id欄位不能為空值！", next));
    }


    const newNews = await News.findByIdAndDelete(
        id,
        { new: true, useFindAndModify: false }
    );

    if (!newNews) {
        return next(appError("資料不存在!", next));
    }
    Success(res, "資料已刪除");

});

