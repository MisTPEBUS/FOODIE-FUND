const mongoose = require("mongoose");
const planFaqSchema = new mongoose.Schema(
    {
        plan_id: {
            type: String,
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
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    }
);
const UserQuestionsAndAnswers = mongoose.model("PlanFaqs", planFaqSchema);

module.exports = UserQuestionsAndAnswers;
