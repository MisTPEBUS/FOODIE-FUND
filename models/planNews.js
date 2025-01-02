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
        updateAt: {
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
                if (ret.publicAt) {
                    ret.publicAt = convertDayToUTC8(ret.publicAt);
                }
                // 格式化 updateAt 為 UTC+8
                if (ret.updateAt) {
                    ret.updateAt = convertToUTC8(ret.updateAt);
                }
                delete ret._id;

                return ret;
            },
        },
        toObject: { virtuals: true },
    },
);
const PlanNews = mongoose.model("PlanNews", planNewsSchema);

module.exports = PlanNews;
