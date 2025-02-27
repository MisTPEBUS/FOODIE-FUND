const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    intro: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: '',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endAt: {
      type: Date,
      default: Date.now,
    },
    updateAt: {
      type: Date,
      default: Date.now,
    },
    users_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required },
    publicAt: {
      type: Date,
      default: Date.now,
    },
    updateAt: {
      type: Date,
      default: Date.now,
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
