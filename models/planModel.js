const mongoose = require("mongoose");
const { convertToUTC8, convertActiveTime } = require("../utils/dateUtils");

const userSchema = new mongoose.Schema(
  {
    activeType: { type: String, enum: ['A', 'B'], default: 'A' },
    location: { type: String, default: '' },
    restaurantType: { type: String, default: '' },
    image: { type: String, default: '' },
    title: { type: String, required: [true, '標題為必填'] },
    proposer: { type: String, required: [true, '提案者為必填'] },
    email: { type: String, required: [true, '信箱為必填'], match: [/^\S+@\S+\.\S+$/, 'Email 格式不正確'] },
    phone: {
      type: String,
      validate: {
        validator: v => /^09\d{8}$/.test(v),
        message: props => `${props.value} 不是有效的手機號碼格式！`
      },
    },
    address: { type: String, default: '' },
    info: { type: String, default: '', maxlength: [300, '資訊不能超過 300 個字'] },
    endAt: {
      type: Date,
      validate: {
        validator: value => new Date(value) > new Date(),
        message: '結束日期必須大於今天',
      },
      default: () => Date.now() + 7 * 24 * 60 * 60 * 1000,
    },
    targetAmount: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, '使用者 ID 為必填'] },
    activeTime: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now, select: false },
    startedAt: { type: Date, default: Date.now, select: false },
  },
  {
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.updatedAt = convertToUTC8(ret.updatedAt);
        delete ret._id;
        delete ret.plan_id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        if (ret.createdAt) ret.createdAt = convertToUTC8(ret.createdAt);
        if (ret.updatedAt) ret.updatedAt = convertToUTC8(ret.updatedAt);
        if (ret.activeTime) ret.activeTime = convertActiveTime(ret.startedAt);
        if (ret.endAt) ret.endAt = convertToUTC8(ret.endAt);
        return ret;
      },
    },
  },
);

const Plans = mongoose.model("Plans", userSchema);
module.exports = Plans;
