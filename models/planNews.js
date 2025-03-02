const mongoose = require("mongoose");
const { convertDayToUTC8, convertToUTC8 } = require("../utils/dateUtils");
const planNewsSchema = new mongoose.Schema(
    {
        plan_id: {
            type: String,
            select: false,
            required: [true, "PlanID 未填寫"],
        },
        intro: {
            type: String,
            default: '',
        },

        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isTop: {
            type: Boolean,
            default: false,
        },
        image: {
            type: String,
            default: '',
        },
        publicAt: {
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
                ret.publicAt = convertDayToUTC8(ret.publicAt);
                ret.updatedAt = convertToUTC8(ret.updatedAt);
                ret.startedAt = convertToUTC8(ret.startedAt);


                return ret;
            },

        },
        toObject: {
            virtuals: true,
            transform: function (doc, ret) {
                if (ret.createdAt) ret.createdAt = convertToUTC8(ret.createdAt);
                if (ret.updatedAt) ret.updatedAt = convertToUTC8(ret.updatedAt);
                if (ret.startedAt) ret.startedAt = convertToUTC8(ret.startedAt);

                return ret;
            }

        },
    },
);
const PlanNews = mongoose.model("PlanNews", planNewsSchema);

module.exports = PlanNews;
