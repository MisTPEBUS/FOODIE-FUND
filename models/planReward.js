const mongoose = require("mongoose");
const { convertToUTC8, convertDayToUTC8 } = require("../utils/dateUtils");
const planRewardSchema = new mongoose.Schema(
    {
        plan_id: {
            type: String,
            select: false,
            required: [true, "PlanID 未填寫"],
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
        unit: {
            type: String,
            default: '',
        },

        price: {
            type: Number,
            default: 0,
        },
        qty: {
            type: Number,
            default: 0,
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
                // 將日期轉換為 UTC+8 格式
                ret.publicAt = convertDayToUTC8(ret.publicAt);
                ret.updateAt = convertToUTC8(ret.updateAt);

                delete ret._id; // 隱藏 MongoDB 預設的 _id 欄位
                delete ret.plan_id; // 隱藏 plan_id
                return ret;
            },
        },
        toObject: { virtuals: true },
    },
);

// Middleware for `save` (update `updateAt` field)
planRewardSchema.pre('save', function (next) {
    this.updateAt = Date.now(); // 確保更新的時間是 UTC+0
    next();
});

// 增加 purchased_qty 固定值虛擬欄位
planRewardSchema.virtual('purchased_qty').get(function () {
    return 20; // 固定為 20
});

// 增加 remain_qty 動態計算虛擬欄位
planRewardSchema.virtual('remain_qty').get(function () {
    return this.qty - 20; // 動態計算：qty - purchased_qty
});

const PlanReward = mongoose.model("PlanRewards", planRewardSchema);

module.exports = PlanReward;