const mongoose = require("mongoose");
const { convertDayToUTC8, convertToUTC8 } = require("../utils/dateUtils");

const planFaqSchema = new mongoose.Schema(
    {
        plan_id: {
            type: String,
            select: false,
            /*   ref: "Plan", */
            required: [true, "PlanID 未填寫"],
        },

        questions: {
            type: String,
            required: true,
        },
        answers: {
            type: String,
            default: '',
        },
        category: {
            type: Array,
            default: [],
        },
        order: {
            type: Number,
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
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
                ret.updatedAt = convertToUTC8(ret.updatedAt);

                delete ret._id; // 隱藏 MongoDB 預設的 _id 欄位
                delete ret.plan_id; // 隱藏 plan_id
                return ret;
            },

        },
        toObject: {
            virtuals: true,
            transform: function (doc, ret) {
                if (ret.createdAt) ret.createdAt = convertToUTC8(ret.createdAt);
                if (ret.updatedAt) ret.updatedAt = convertToUTC8(ret.updatedAt);

                return ret;
            }

        },
        timestamps: true,
    }
);
const UserQuestionsAndAnswers = mongoose.model("PlanFaqs", planFaqSchema);

module.exports = UserQuestionsAndAnswers;
