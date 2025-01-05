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
                // 格式化 publicAt 為 UTC+8
                if (ret.createdAt) {
                    ret.createdAt = convertDayToUTC8(ret.createdAt);
                }
                // 格式化 updateAt 為 UTC+8
                if (ret.updatedAt) {
                    ret.updatedAt = convertDayToUTC8(ret.updatedAt);
                }
                delete ret._id;
                return ret;
            },
        },
        toObject: { virtuals: true },
        timestamps: true,
    }
);
const UserQuestionsAndAnswers = mongoose.model("PlanFaqs", planFaqSchema);

module.exports = UserQuestionsAndAnswers;
