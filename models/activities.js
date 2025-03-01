const mongoose = require("mongoose");
const { convertToUTC8 } = require("../utils/dateUtils");
const newsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            default: '',
            required: true,
        },

        isEnabled: {
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
                ret.publicAt = convertDayToUTC8(ret.publicAt);
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
    },
);
const News = mongoose.model("News", newsSchema);

module.exports = News;
