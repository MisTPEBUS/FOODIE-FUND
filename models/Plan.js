const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "名字 未填寫"],
    },

    createdAt: {
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
