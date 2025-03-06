const mongoose = require("mongoose");
const { convertToUTC8, convertDayToUTC8 } = require("../utils/dateUtils");
const userSchema = new mongoose.Schema(
  {
    //A一班募資 B 群眾募資
    activeType: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    restaurantType: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
    },
    proposer: {
      type: String,
      required: true,
    },


    email: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },

    address: {
      type: String,
      default: '',
    },
    info: {
      type: String,
      default: '',
    },

    endAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    users_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required },
    activeTime: {
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
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        // 將日期轉換為 UTC+8 格式
        ret.publicAt = convertDayToUTC8(ret.publicAt);
        ret.updatedAt = convertToUTC8(ret.updatedAt);
        ret.startedAt = convertToUTC8(ret.startedAt);

        delete ret._id; // 隱藏 MongoDB 預設的 _id 欄位
        delete ret.plan_id; // 隱藏 plan_id
        return ret;
      },

    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        if (ret.createdAt) ret.createdAt = convertToUTC8(ret.createdAt);
        if (ret.updatedAt) ret.updatedAt = convertToUTC8(ret.updatedAt);
        if (ret.startedAt) ret.startedAt = convertToUTC8(ret.startedAt);

        return ret;
      }

    },
  },
);
/* userSchema.index({ email: 1, memberType: 1 }, { unique: true }); */
const User = mongoose.model("Plans", userSchema);
module.exports = User;
