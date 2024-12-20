
const PlanNews = require("../models/planNews");
const mongoose = require("mongoose");
const {
    Success,
    SuccessList,
    appError,
} = require("../services/handleResponse.js");
const { handleErrorAsync } = require("../services/handleResponse.js");
const { isAuth, generateSendJWT, generateMailSendJWT } = require("../services/auth.js");
const { v4: uuidv4 } = require("uuid");
const firebaseAdmin = require("../services/firebase.js");
const bucket = firebaseAdmin.storage().bucket();

exports.getAllNews = handleErrorAsync(async (req, res, next) => {
    const { timeSort, keyWord, page = 1/* , limit = 10  */ } = req.query;
    const { plan_id } = req.params;
    const tSort = "-publicAt";
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
    //  const currentPage = Math.max(parseInt(page) || 1, 1); // 確保 page 是正整數
    //const itemsPerPage = Math.max(parseInt(limit) || 10, 1); // 確保 limit 是正整數

    const totalCount = await PlanNews.countDocuments(query);

    //  const totalPages = Math.ceil(totalCount / itemsPerPage);

    let acties = await PlanNews.find(query)
        .sort(tSort);

    // 設定分頁信息
    /*   const pagination = {
          total: totalCount,
          total_pages: totalPages,
          current_page: currentPage,
          has_pre: currentPage > 1,
          has_next: currentPage < totalPages
      }; */
    /*   res.data =
      {
          add: '',
          pagination: pagination
      } */
    Success(res, "請求成功，回傳所需數據", { data: acties });
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
exports.getNewsByID = handleErrorAsync(async (req, res, next) => {

    const { plan_id, id } = req.params;

    let query = {};

    if (!plan_id || plan_id.trim() === '') {
        return next(appError("id欄位不能為空值！", next, 400, 1002
        ));
    }
    if (!id || id.trim() === '') {
        return next(appError("id欄位不能為空值！", next, 400, 1002
        ));
    }


    if (plan_id == 'ALL') {
        return next(appError("id欄位不能為ALL！", next, 400, 1003
        ));
    }


    const totalCount = await PlanNews.countDocuments(query);



    let acties = await PlanNews.findById(id);

    // 設定分頁信息

    Success(res, "請求成功，回傳所需數據", { data: acties });
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
const convertToBoolean = (value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value; // 如果不是布爾值字符串，保持原樣
};
const convertToDate = (value) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
    }
    return date;
};
exports.createNews = handleErrorAsync(async (req, res, next) => {
    const { plan_id } = req.params;
    const { updateData } = req;

    if (!plan_id || plan_id.trim() === '') {
        return next(appError("id欄位不能為空值！", next, 400, 1002
        ));
    }


    const allowedFields = ["title", "content", "isActive", "isTop", "publicAt"];
    const filteredData = {};
    if (typeof updateData.isTop !== 'undefined') { updateData.isTop = convertToBoolean(updateData.isTop); }
    if (typeof updateData.isActive !== 'undefined') { updateData.isActive = convertToBoolean(updateData.isActive); }
    if (typeof updateData.publicAt !== 'undefined') { updateData.publicAt = convertToDate(updateData.publicAt); }

    Object.keys(updateData).forEach((key) => {
        if (key === "isTop" || key === "isActive") {
            if (typeof updateData[key] !== "boolean") {
                return next(appError(`${key} 必須是 boolean`, next, 400, 1002));

            }
        }
        if ((key === "title") && !updateData[key].trim()) {
            return next(appError(`title 欄位不能為空值！`, next, 400, 1002));

        }
        if (key === "publicAt" && isNaN(Date.parse(updateData[key]))) {
            return next(appError(`publicAt 必須是日期格式！`, next, 400, 1002));

        }
        if (allowedFields.includes(key)) {
            filteredData[key] = updateData[key];
        }
    });
    console.log(req.files);
    // 檢查是否有圖片
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
                filteredData.plan_id = plan_id;

                // 儲存到 MongoDB
                const newNews = await PlanNews.create({ ...filteredData, ...updateData });

                if (!newNews) {
                    throw appError("建立失敗!", next, 400);
                }

                Success(res, "已建立貼文", newNews, 201);
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
        filteredData.plan_id = plan_id;

        try {
            const newNews = await PlanNews.create({ ...filteredData, ...updateData });

            if (!newNews) {
                throw appError("建立失敗!", next, 400);
            }

            Success(res, "已建立貼文", newNews, 201);
        } catch (error) {
            next(error);
        }
    }
});

exports.updateNewsById = handleErrorAsync(async (req, res, next) => {
    const { plan_id, id } = req.params;
    const { updateData } = req;

    if (!plan_id || plan_id.trim() === '') {
        return next(appError("id欄位不能為空值！", next, 400, 1002
        ));
    }

    const allowedFields = ["title", "content", "isActive", "isTop", "publicAt"];
    const filteredData = {};
    if (typeof updateData.isTop !== 'undefined') { updateData.isTop = convertToBoolean(updateData.isTop); }
    if (typeof updateData.isActive !== 'undefined') { updateData.isActive = convertToBoolean(updateData.isActive); }
    if (typeof updateData.publicAt !== 'undefined') { updateData.publicAt = convertToDate(updateData.publicAt); }

    Object.keys(updateData).forEach((key) => {
        if (key === "isTop" || key === "isActive") {
            if (typeof updateData[key] !== "boolean") {
                return next(appError(`${key} 必須是 boolean`, next, 400, 1002));

            }
        }
        if ((key === "title") && !updateData[key].trim()) {
            return next(appError(`title 欄位不能為空值！`, next, 400, 1002));

        }
        if (key === "publicAt" && isNaN(Date.parse(updateData[key]))) {
            return next(appError(`publicAt 必須是日期格式！`, next, 400, 1002));

        }
        if (allowedFields.includes(key)) {
            filteredData[key] = updateData[key];
        }
    });

    console.log(req.files);
    // 檢查是否有圖片
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
                filteredData.plan_id = plan_id;

                // 儲存到 MongoDB
                const newNews = await PlanNews.findByIdAndUpdate(
                    id,
                    { ...filteredData, ...updateData },
                    { new: true, useFindAndModify: true });

                if (!newNews) {
                    throw appError("建立失敗!", next, 400);
                }

                Success(res, "已建立貼文", newNews, 201);
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
        filteredData.plan_id = plan_id;

        try {
            const newNews = await PlanNews.findByIdAndUpdate(
                id,
                { ...filteredData, ...updateData },
                { new: true, useFindAndModify: true });

            if (!newNews) {
                throw appError("建立失敗!", next, 400);
            }

            Success(res, "已建立貼文", newNews, 201);
        } catch (error) {
            next(error);
        }
    }
});

exports.deleteNewsById = handleErrorAsync(async (req, res, next) => {
    const { id, plan_id } = req.params;

    if (!id) {
        return next(appError("id傳入格式異常!請查閱API文件", next, 400, 1002));
    }

    if (!id.trim()) {
        return next(appError("id欄位不能為空值！", next, 400, 1002));
    }


    const resFNews = await PlanNews.findByIdAndDelete(
        id,
        { new: true, useFindAndModify: false }
    );

    if (!resFNews) {
        return next(appError("找不到對應的常見問題資料，可能已被刪除或不存在！", next, 404, 1003
        ));
    }

    Success(res, `最新消息:${resFNews.questions}資料已刪除`);

});

