const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "名字 未填寫"],
    },
    photo: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      required: [true, "Email 未填寫"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "密碼 未填寫"],
      minlength: 8,
      select: false,
    },
    phone: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    },
    dateOfBirth: {
      type: Date
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isBlackListed: {
      type: Boolean,
      default: false
    },
    memberType: {
      type: String,
      select: false,
      required: true,
      default: 'system'
    },
    confirmedToken: {
      type: String,
      select: false,
    },
    confirmedAt: {
      type: Date,
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    remarks: {
      type: String,
      trim: true,
      default: ""
    },
    oAuthID: {
      type: String,
      select: false,
      default: ""
    }
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
userSchema.index({ email: 1, memberType: 1 }, { unique: true });
const User = mongoose.model("User", userSchema);
module.exports = User;
