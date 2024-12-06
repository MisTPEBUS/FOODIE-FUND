const mongoose = require("mongoose");


const replySchema = new mongoose.Schema({
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true },
    avatar: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        required: [true, "name 未填寫"]
    },
    publicAt: {
        type: Date,
        default: Date.now,
    },
    content: {
        type: String,
        default: '',
    },
    commentRule: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});
const PlanCommentsSchema = new mongoose.Schema(
    {
        plan_id: {
            type: mongoose.Schema.ObjectId,
            ref: "Plan",
            required: [true, "PlanID 未填寫"],
        },
        commentRule: { type: String, required: true },
        avatar: {
            type: String,
            default: '',
        },
        name: {
            type: String,
            required: [true, "name 未填寫"],
        },
        content: {
            type: String,
            default: '',
        },
        replies: {
            type: String,
            default: '',
        },

        createdAt: {
            type: Date,
            default: Date.now,
        }
    },
    {
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);


module.exports = {
    PlanComments: mongoose.model("PlanComments", PlanCommentsSchema),
};