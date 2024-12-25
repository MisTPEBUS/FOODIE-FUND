const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title 未填寫"],
    },
    description: {
      type: String,
      required: [true, "description 未填寫"],
    },
    image: {
      type: String,
      default: '',
    },
    proposer: {
      type: String,
      required: [true, "userID 未填寫"],
      select: false
    },
    title: {
      type: String,
      required: [true, "名字 未填寫"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      select: false,
    },


  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
/* userSchema.index({ email: 1, memberType: 1 }, { unique: true }); */
const User = mongoose.model("User", userSchema);
module.exports = User;
