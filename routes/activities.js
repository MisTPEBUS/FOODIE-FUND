const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const validator = require("validator");
const mongoose = require("mongoose");

const Active = require("../models/activities.js");
const {
    Success,
    SuccessList,
    appError,
} = require("../services/handleResponse.js");
const { handleErrorAsync } = require("../services/handleResponse.js");
const { isAuth, generateSendJWT, generateMailSendJWT } = require("../services/auth.js");

//清單
router.get(
    "/",
    handleErrorAsync(async (req, res, next) => {
        const { timeSort, keyWord, page = 1, limit = 10 } = req.query;
        const tSort = timeSort == "asc" ? "publicAt" : "-publicAt";
        let query = {};

        if (keyWord) {
            const regex = new RegExp(keyWord, 'i');
            query.$or = [
                { title: { $regex: regex } },
                { content: { $regex: regex } }
            ];
        }

        const currentPage = Math.max(parseInt(page) || 1, 1); // 確保 page 是正整數
        const itemsPerPage = Math.max(parseInt(limit) || 10, 1); // 確保 limit 是正整數

        const totalCount = await Active.countDocuments(query);

        const totalPages = Math.ceil(totalCount / itemsPerPage);

        let acties = await Active.find(query)
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
        res.data = acties;
        SuccessList(res, "", pagination);


        /*
          #swagger.tags =  ['公告管理']
          #swagger.path = '/v1/api/Active'
          #swagger.method = 'get'
          #swagger.summary='公告清單查詢'
          #swagger.description = '公告清單查詢'
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
                description: '排序遠到近,進到遠default = desc',
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
    }),
);
//新增資料
router.post(
    "/admin",
    handleErrorAsync(async (req, res, next) => {
        const updateData = req.body;
        console.log(updateData)
        if (!updateData.title || !updateData.content) {
            return next(appError("傳入格式異常!請查閱API文件", next));
        }
        // Content cannot null
        if (!updateData.title.trim()) {
            return next(appError("title欄位不能為空值！", next));
        }
        if (!updateData.content.trim()) {
            return next(appError("content欄位不能為空值！", next));
        }

        try {
            const newActive = await Active.create({
                title: updateData.title,
                content: updateData.content,
                isEnabled: updateData.isEnabled,
                isTop: updateData.isTop

            });
            if (!newActive) {
                return next(appError("建立失敗!", next));
            }
            Success(res, "已建立貼文", newActive, 201);
        } catch (err) {
            return next(appError(err.message, next));
        }




        /*
        #swagger.tags =  ['公告管理']
        #swagger.path = '/v1/api/Active/admin'
        #swagger.method = 'post'
        #swagger.summary='新增公告'
        #swagger.description = '新增公告'
        #swagger.produces = ["application/json"] 
      */

        /*
           #swagger.requestBody = {
                required: true,
                description:"會員資料",
                content: {
                    "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            publicAt:{
                                type: Date,
                                 example: "2024-09-03"
                            },
                             title: {
                                type: "string",
                                 example: ""
                            },
                             content: {
                                type: "string",
                                 example: ""
                            },
                            
                             isTop: {
                                 type: "Boolean",
                                default: false
                            },
                            
                             isEnabled: {
                                 type: "Boolean",
                                default: true
                            }
                        },
                       
                    }  
                }
                }
            } 
     
     }
       
       */
    }),
);
//更新資料
router.put(
    "/admin/:id",
    handleErrorAsync(async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(appError("id格式無效!請使用系統加密過的參數", next));
        }
        if (!id) {
            return next(appError("id傳入格式異常!請查閱API文件", next));
        }

        if (!id.trim()) {
            return next(appError("id欄位不能為空值！", next));
        }
        const allowedFields = ["title",
            "content", "isEnabled", "isTop", "publicAt"
        ]; // 前端提供的欄位名稱
        const filteredData = {};


        Object.keys(updateData).forEach((key) => {
            if (!(updateData[key].trim()) && key !== "content") {
                return next(appError(`${key}欄位不能為空值！`, next));
            }

            if (allowedFields.includes(key)) {
                filteredData[key] = updateData[key];
            }
        });
        const newActive = await Active.findByIdAndUpdate(
            id,
            { $set: filteredData },
            { new: true, useFindAndModify: false }
        );

        if (!newActive) {
            return next(appError("使用者未註冊!", next));
        }
        Success(res, "", newActive);

        /*
        #swagger.tags =  ['公告管理']
        #swagger.path = '/v1/api/Active/admin/{id}'
        #swagger.method = 'put'
        #swagger.summary='更新基本資料'
        #swagger.description = '更新基本資料'
        #swagger.produces = ["application/json"] 
      */
        /*
         #swagger.parameters['id'] = {
                in: 'path',
                description: '使用者id',
                type: 'string'
             } 
    */
        /*
           #swagger.requestBody = {
                required: true,
                description:"會員資料",
                content: {
                    "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                             title: {
                                type: "string",
                                 example: ""
                            },
                             content: {
                                type: "string",
                                 example: ""
                            },
                            
                             isTop: {
                                 type: "Boolean",
                                default: true
                            },
                            
                             isEnabled: {
                                 type: "Boolean",
                                default: true
                            }, publicAt: {
                                type: "Date",
                                 example: ""
                            },
                             isEnabled: {
                                type: "Boolean",
                                default: true
                            },
                        },
                       
                    }  
                }
                }
            } 
     
     }
       
       */
    }),
);
//刪除資料
router.delete(
    "/admin/:id",
    handleErrorAsync(async (req, res, next) => {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(appError("id格式無效!請使用系統加密過的_id參數", next));
        }
        if (!id) {
            return next(appError("id傳入格式異常!請查閱API文件", next));
        }

        if (!id.trim()) {
            return next(appError("id欄位不能為空值！", next));
        }


        const newActive = await Active.findByIdAndDelete(
            id,
            { new: true, useFindAndModify: false }
        );

        if (!newActive) {
            return next(appError("資料不存在!", next));
        }
        Success(res, "資料已刪除");

        /*
        #swagger.tags =  ['公告管理']
        #swagger.path = '/v1/api/Active/admin/{id}'
        #swagger.method = 'delete'
        #swagger.summary='刪除單筆公告'
        #swagger.description = '刪除單筆公告'
        #swagger.produces = ["application/json"] 
      */
        /*
         #swagger.parameters['id'] = {
                in: 'path',
                description: '使用者id',
                type: 'string'
             } 
    */

    }),
);
module.exports = router;
