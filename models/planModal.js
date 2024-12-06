const mongoose = require("mongoose");
const newsSchema = new mongoose.Schema(
    {
        titile: {
            type: String,
            required: true,
        },
        followers: [
            {
                user: {
                    type: mongoose.Schema.ObjectId,
                    ref: "User",
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);
const Plans = mongoose.model("Plans", newsSchema);

module.exports = Plans;
