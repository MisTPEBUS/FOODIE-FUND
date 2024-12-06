const mongoose = require("mongoose");
const planFaqSchema = new mongoose.Schema(
    {
        plan_id: {
            type: mongoose.Schema.ObjectId,
            ref: "Plan",
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
