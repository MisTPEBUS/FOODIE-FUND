
const mongoose = require("mongoose");
const {
    Success,
    appError,
} = require("../services/handleResponse.js");
const { handleErrorAsync } = require("../services/handleResponse.js");
const { isAuth, generateSendJWT, generateMailSendJWT } = require("../services/auth.js");


const Comment = require('../models/planCommentModel.js');

//all =>user
exports.getAllComments = handleErrorAsync(async (req, res, next) => {
    const { plan_id } = req.params;
    if (!plan_id) {
        return next(appError("plan_id傳入格式異常!請查閱API文件", next, 400, 1002));
    }
    if (!plan_id.trim()) {
        return next(appError("plan_id欄位不能為空值！", next, 400, 1002));
    }

    const commentData = await Comment.PlanComments.findOne({ plan_id }).populate("replies");
    console.log(commentData);


    Success(res, "讀取成功", commentData ?? [], 200);
});

// comment=> admin
exports.createComment = handleErrorAsync(async (req, res, next) => {
    const { content } = req.body;
    const { plan_id } = req.params;
    const user_id = req.user.id;

    const avatar = req.photo ?? '';
    const { name } = req.user;
    console.log(88)
    const commentRule = (req.user.name == 'lulume') ? '提案人' : '贊助人'
    // 檢查 plan_id 是否正確傳入
    if (!plan_id) {
        return next(appError("plan_id傳入格式異常!請查閱API文件", next, 400, 1002));
    }
    if (!plan_id.trim()) {
        return next(appError("plan_id欄位不能為空值！", next, 400, 1002));
    }
    if (!name.trim()) {
        return next(appError("name不能為空值！,請檢察會員資料", next, 400, 1002));
    }

    // 檢查必要欄位是否有值
    if (!name || !content) {
        return next(appError("name 或 content 不能為空", next, 400, 1002));
    }

    // 檢查是否已有相同 user_id 與 content 的留言存在
    const existingComment = await Comment.PlanComments.findOne({ user_id, content });
    if (existingComment) {
        return next(appError("已有相同內容的留言存在", next, 409, 1002));
    }

    // 建立完整的建立資料，包含 user_id 與 plan_id
    const createData = {
        name,
        avatar,
        content,
        plan_id,
        user_id,
        commentRule
    };
    console.log(createData);
    // 僅允許前端提供的欄位，並加入必填欄位
    const allowedFields = ["name", "avatar", "content", "plan_id", "user_id", "commentRule"];
    const filteredData = {};
    Object.keys(createData).forEach((key) => {
        if (allowedFields.includes(key)) {
            filteredData[key] = createData[key];
        }
    });

    const newComment = await Comment.PlanComments.create(filteredData);

    if (!newComment) {
        return next(appError("建立失敗!", next, 400, 1002));
    }

    const commentData = await Comment.PlanComments.findOne({ plan_id }).populate("replies");
    console.log(commentData);


    Success(res, "已建立留言", commentData, 201);
});
exports.createCommentReply = handleErrorAsync(async (req, res, next) => {
    const { content } = req.body;
    const { plan_id, comment_id } = req.params;
    const user_id = req.user.id;

    const avatar = req.photo ?? '';
    const { name } = req.user;

    const commentRule = (req.user.name == 'lulume') ? '提案人' : '贊助人'
    // 檢查 plan_id 是否正確傳入
    if (!comment_id) {
        return next(appError("plan_id傳入格式異常!請查閱API文件", next, 400, 1002));
    }
    if (!comment_id.trim()) {
        return next(appError("plan_id欄位不能為空值！", next, 400, 1002));
    }
    if (!name.trim()) {
        return next(appError("name不能為空值！,請檢察會員資料", next, 400, 1002));
    }

    // 檢查必要欄位是否有值
    if (!name || !content) {
        return next(appError("name 或 content 不能為空", next, 400, 1002));
    }
    if (!plan_id) {
        return next(appError("plan_id傳入格式異常!請查閱API文件", next, 400, 1002));
    }
    if (!plan_id.trim()) {
        return next(appError("plan_id欄位不能為空值！", next, 400, 1002));
    }

    // 檢查是否已有相同 user_id 與 content 的留言存在
    const existingComment = await Comment.PlanCommentsReply.findOne({ user_id, content, comment_id });
    console.log(12323213);
    if (existingComment) {
        return next(appError("已有相同內容的留言存在", next, 409, 1002));
    }

    // 建立完整的建立資料，包含 user_id 與 plan_id
    const createData = {
        comment_id,
        name,
        avatar,
        content,
        plan_id,
        user_id,
        commentRule
    };

    // 僅允許前端提供的欄位，並加入必填欄位
    const allowedFields = ["name", "avatar", "content", "plan_id", "user_id", "commentRule", "comment_id"];
    const filteredData = {};
    Object.keys(createData).forEach((key) => {
        if (allowedFields.includes(key)) {
            filteredData[key] = createData[key];
        }
    });

    const newComment = await Comment.PlanCommentsReply.create(filteredData);

    if (!newComment) {
        return next(appError("建立失敗!", next, 400, 1002));
    }

    const commentData = await Comment.PlanComments.findOne({ plan_id }).populate("replies");
    console.log(commentData);


    Success(res, "已建立留言", commentData, 201);
});

//comment => admin
exports.getCommentById = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


