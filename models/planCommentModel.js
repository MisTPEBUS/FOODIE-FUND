const mongoose = require("mongoose");
const { convertDayToUTC8, convertToUTC8 } = require("../utils/dateUtils");

// 定義獨立存放回覆的 schema
const replySchema = new mongoose.Schema({
    comment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PlanComments",
        required: [true, "commentId 未填寫"],
    },
    avatar: {
        type: String,
        default: "",
    },
    name: {
        type: String,
        required: [true, "name 未填寫"],
    },
    publicAt: {
        type: Date,
        default: Date.now,
    },
    content: {
        type: String,
        default: "",
    },
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "user_id 未填寫"],
    },
    commentRule: {
        type: String,
        required: [true, "commentRule 未填寫"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// 定義留言的 schema（不再直接嵌入 replies ）
const planCommentsSchema = new mongoose.Schema(
    {
        commentRule: {
            type: String,
            enum: ['贊助人', '提案人'],
            required: [true, "commentRule 未填寫"],
        },
        plan_id: {
            type: mongoose.Schema.ObjectId,
            ref: "Plans", // 請確認此名稱與你的 Plans 模型名稱一致
            required: [true, "PlanID 未填寫"],
        },
        avatar: {
            type: String,
            default: "",
        },
        name: {
            type: String,
            required: [true, "name 未填寫"],
        },
        content: {
            type: String,
            default: "",
        },
        user_id: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "user_id 未填寫"],
        },
        publicAt: {
            type: Date,
            default: Date.now,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                // 將日期轉換為 UTC+8 格式
                ret.createdAt = convertDayToUTC8(ret.createdAt);
                ret.publicAt = convertDayToUTC8(ret.publicAt);
                // 隱藏不必要的欄位
                delete ret._id;
                delete ret.plan_id;
                return ret;
            },
        },
        toObject: {
            virtuals: true,
            transform: (doc, ret) => {
                if (ret.createdAt) ret.createdAt = convertToUTC8(ret.createdAt);
                if (ret.publicAt) ret.publicAt = convertToUTC8(ret.publicAt);
                return ret;
            },
        },
        timestamps: true,
    }
);

// 使用 virtual populate 設定關聯：以留言的 _id 與回覆的 comment_id 連結
planCommentsSchema.virtual("replies", {
    ref: "PlanCommentsReply",
    localField: "_id",
    foreignField: "comment_id",
    justOne: false,
});

module.exports = {
    PlanComments: mongoose.model("PlanComments", planCommentsSchema),
    PlanCommentsReply: mongoose.model("PlanCommentsReply", replySchema),
};
