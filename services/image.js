// statusHandle/image.js
const multer = require("multer");
const path = require("path");
const { appError, handleErrorAsync } = require("../services/handleResponse.js");

//multer
const upload = multer({
  limits: {
    //限制檔案大小為3M
    fileSize: 3 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {

    const ext = path.extname(file.originalname).toLowerCase();

    if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg" && ext !== ".webp") {
      cb(new Error("檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。"));
    }
    cb(null, true);
  },
}).any();

const uploadMiddleware = handleErrorAsync(async (req, res, next) => {

  upload(req, res, (err) => {


    if (!req.files || req.files.length === 0) {
      return next(appError("檔案不能為空值", next));
    }
    if (req.files.length > 1) {
      return next(appError("只能上傳一個文件", next));
    }

    req.file = req.files[0];
    console.log(req.file);
    if (err) {
      return appError(err.message, next);
    }

    if (req.method === "PUT") {
      // PUT 請求可以不包含圖片
      if (!req.file) {
        return next(); // 沒有圖片，直接進入下一步
      }
    } else {
      // 其他請求（如 POST），要求圖片必須存在
      if (!req.file) {
        return next(appError("必須提供圖片", next));
      }
    }

    next();
  });
});

const uploadPlanNewsMiddleware = handleErrorAsync(async (req, res, next) => {

  upload(req, res, (err) => {
    req.updateData = req.body;

    if (err) {
      return next(appError(err.message, next));
    }

    if (req.method === "PUT") {
      // PUT 請求可以不包含圖片
      if (!req.files) {
        return next(); // 沒有圖片，直接進入下一步
      }
    } else {
      // 其他請求（如 POST），要求圖片必須存在
      if (!req.files) {
        return next();
        // return next(appError("必須提供圖片", next));
      }
    }



    if (req.files) {
      if (req.files.find((file) => file.fieldname !== "image")) {
        return next(appError("必須提供名稱為 'image' 的文件", next, 400, 4002));
      }
      if (req.files.length > 1) {
        return next(appError("只能上傳一個文件", next, 400, 4002));
      }
    }





    next();
  });
});
module.exports = { uploadMiddleware, uploadPlanNewsMiddleware };
