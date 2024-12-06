const mongoose = require("mongoose");
const planNewsSchema = new mongoose.Schema(
    {
        plan_id: {
            type: mongoose.Schema.ObjectId,
            ref: "Plan",
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
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);
const PlanNews = mongoose.model("PlanNews", planNewsSchema);

module.exports = PlanNews;
