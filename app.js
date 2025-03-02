const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const swaggerUI = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

const dashboardRouter = require("./routes/_dashboard");
const usersRouter = require("./routes/users");
const AccountRouter = require("./routes/Account");
const UploadRouter = require("./routes/upload");
const newsRouter = require("./routes/news");
const dotenv = require("dotenv");

const plansRoute = require("./routes/plansRoute");


dotenv.config({ path: "./config.env" });
const crypto = require('crypto');

const HASH_KEY = process.env.HASH_KEY || '';
const HASH_IV = process.env.HASH_IV || '';
const MERCHANT_ID = process.env.MERCHANT_ID || '';



const mongoose = require("mongoose");

// 程式出現重大錯誤時
process.on("uncaughtException", (err) => {
  console.error("Uncaughted Exception！");
  console.error(err);
  process.exit(1);
});

const constr = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD,
);

mongoose.set("strictQuery", false);

mongoose.connect(constr).then(() => console.log("連線資料成功"));

const app = express();


/**
 * 將參數轉換成 URL 查詢字串，再用 AES-256-CBC 加密產生 TradeInfo
 */
function createTradeInfo(params) {
  // 將物件轉換為 URL query 字串，注意參數排序請參考藍新科技文件
  const queryString = new URLSearchParams(params).toString();
  const cipher = crypto.createCipheriv('aes-256-cbc', HASH_KEY, HASH_IV);
  let encrypted = cipher.update(queryString, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * 依據加密後的 TradeInfo 與參數，產生 TradeSha
 */
function createTradeSha(tradeInfo) {
  const rawString = `HashKey=${HASH_KEY}&${tradeInfo}&HashIV=${HASH_IV}`;
  const sha = crypto.createHash('sha256').update(rawString).digest('hex');
  return sha.toUpperCase();
}

// 建立一個建立訂單的 API 範例
app.post('/create-order', (req, res) => {
  // 可根據需求調整參數，以下為範例參數
  console.log(123);
  const params = {
    MerchantID: MERCHANT_ID,
    RespondType: 'JSON',
    TimeStamp: Math.floor(Date.now() / 1000).toString(),
    Version: '1.5',
    MerchantOrderNo: 'ORDER' + Date.now(), // 訂單編號須唯一
    Amt: 1000, // 交易金額
    ItemDesc: '測試商品'
    // 其他參數請依藍新科技文件補充
  };

  const tradeInfo = createTradeInfo(params);
  const tradeSha = createTradeSha(tradeInfo);

  // 回傳資料給前端，前端可依此組成 HTML 表單並提交到藍新科技金流平台
  res.json({
    MerchantID: params.MerchantID,
    TradeInfo: tradeInfo,
    TradeSha: tradeSha,
    Version: params.Version
    // 如有其他必要欄位，請依照文件補充
  });
});

const session = require('express-session');
app.use(session({ secret: 'a0b71be06ffdb0a5edab1a54707f5751', resave: true, saveUninitialized: true }));
app.use(cors({
  origin: 'https://mistpebus.github.io'
}));


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerFile));

app.use("/v1/api/auth", usersRouter);

app.use("/v1/api/admin/account", AccountRouter);
app.use("/v1/api/admin/upload", UploadRouter);
app.use("/v1/api/news", newsRouter);
app.use("/v1/api/plan", plansRoute);
app.use("/v1/api/dashboard", dashboardRouter);

// 404 錯誤
app.use(function (req, res, next) {
  res.status(404).json({
    status: "error",
    message: "查無此路由，請確認API格式!",
  });
});
// 自己設定的 err 錯誤
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: false,
      message: err.message,
      success: false,
      data: {},
      code: err.code,
    });
  } else {
    console.error("出現重大錯誤", err);
    res.status(500).json({
      status: false,
      message: err.message,
      success: false,
      data: {},
      code: err.code,
    });
  }
};
// 開發環境錯誤
const resErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
// 錯誤處理
app.use(function (err, req, res, next) {
  // dev

  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === "dev") {
    return resErrorDev(err, res);
  }

  // production
  else if (process.env.NODE_ENV === "production") {
    if (err.name === "ValidationError") {
      err.message = "欄位未填寫正確";
      err.isOperational = true;
      return resErrorProd(err, res);
    }
    resErrorProd(err, res);
  }
});

// 未捕捉到的 catch
process.on("unhandledRejection", (reason, promise) => {
  console.error("未捕捉到的 rejection：", promise, "原因：", reason);
});

module.exports = app;
