const mongoose = require("mongoose");
const { convertToUTC8 } = require("../utils/dateUtils");
const orderSchema = new mongoose.Schema(
    {
        id: {
            typs: String
        },
        order_no: {
            type: String,
            required: true,
        },
        order_date: {
            type: Date,
            default: Date.now,
            required: true,
        },
        discount: {
            type: Number,
            default: 0
        },
        subtotal: {
            type: Number,
            default: 0
        },
        shipping_fee: {
            type: Number,
            default: 0
        },
        total_amount: {
            type: Number,
            default: 0
        },
        currency: {
            type: Number,
            default: 0
        },
        payment_method: {
            type: Number,
            default: 0
        },
        status: {
            type: Number,
            default: 0
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

                ret.updatedAt = convertToUTC8(ret.updatedAt);

                delete ret._id; // 隱藏 MongoDB 預設的 _id 欄位
                delete ret.plan_id; // 隱藏 plan_id
                return ret;
            },

        },
        toObject: {
            virtuals: true,
            transform: function (doc, ret) {

                if (ret.updatedAt) ret.updatedAt = convertToUTC8(ret.updatedAt);

                return ret;
            }

        },
    },
);
const Orders = mongoose.model("Orders", orderSchema);

module.exports = Orders;
