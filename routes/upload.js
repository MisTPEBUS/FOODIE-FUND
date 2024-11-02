// routes/upload.js
const express = require("express");
const router = express.Router();
const { appError, handleErrorAsync, Success } = require("../services/handleResponse.js");
const uploadMiddleware = require("../services/image");
const { v4: uuidv4 } = require("uuid");
const firebaseAdmin = require("../services/firebase");
const bucket = firebaseAdmin.storage().bucket(); // 取出存儲桶內容

const { isAuth } = require("../services/auth");

router.post(
  "/",
  uploadMiddleware,
  handleErrorAsync(async (req, res, next) => {
    if (!req.files.length) {
      return next(appError("尚未上傳檔案", next));
    }
    const file = req.files[0];
    const blob = bucket.file(
      `images/${uuidv4()}.${file.originalname.split(".").pop()}`,
    );
    const blobStream = blob.createWriteStream();

    // buffer 寫入 blobStream
    blobStream.end(file.buffer);

    // 監聽上傳狀態
    blobStream.on("finish", () => {
      // 設定檔案的存取權限
      const config = {
        action: "read", // 權限
        expires: "12-31-2500", // 網址的有效期限
      };
      // 取得檔案的網址
      blob.getSignedUrl(config, (err, fileUrl) => {
        console.log(err);
        if (err) {
          return next(appError(err, next));
        }
        res.status(200).json({
          status: true,
          imageUrl: fileUrl,
        });
      });
    });

    blobStream.on("error", (err) => {
      console.log(err);
      return next(appError("上傳失敗", next, 500));
    });
    /*
  #swagger.tags =  ['圖片上傳']
  #swagger.path = '/v1/api/admin/upload'
  #swagger.method = 'post'
  #swagger.summary='圖片上傳'
  #swagger.description = '圖片上傳'
  #swagger.security = [{
     "bearerAuth": []
 }]
 */

    /*
     #swagger.requestBody = {
             required: true,
             description:"貼文牆",
             content: {
                  "multipart/form-data": {
                   schema: {
                      type: "object",
                     properties: {
                       file: {
                           type: "file",
                         },
                     },
                       required: ["file"]
                   }
                  }
              
             }
         } 
 
  }*/

    /* 
 #swagger.responses[200] = { 
   schema: {
       "status": true,
       "imageUrl": "image URL(https)"
     
     }
   } 
 #swagger.responses[400] = { 
   schema: {
       "status": false,
       "message": "Error Msg",
     }
   } 
*/
  }),
);

//get
router.get('/list-files', handleErrorAsync(async (req, res, next) => {
  try {
    let [files] = await bucket.getFiles();

    // 根據更新時間排序，將最近更新的文件排在前面
    files.sort((a, b) => new Date(b.metadata.updated) - new Date(a.metadata.updated));

    let parsedFiles = await Promise.all(
      files.map(async (file) => {
        const filePath = file.name;
        const [folder, idWithExtension] = filePath.split('/');
        const [id] = idWithExtension.split('.');

        const config = {
          action: 'read',
          expires: '12-31-2500',
        };

        const [url] = await file.getSignedUrl(config);

        return {
          folder,
          id,
          name: idWithExtension,
          URL: url,
          updatedAt: file.metadata.updated // 新增更新時間欄位
        };
      })
    );

    // 過濾掉文件夾名稱以 "sodu" 開頭的文件
    parsedFiles = parsedFiles.filter(file => !file.folder.startsWith('sodu'));

    // 成功回應
    Success(res, "", files = parsedFiles, 200);

  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({
      message: 'Error retrieving files',
      error: error.message
    });
  }
  /*
    #swagger.tags =  ['圖片上傳']
    #swagger.path = '/v1/api/admin/upload/list-files'
    #swagger.method = 'get'
    #swagger.summary='圖片清單'
    #swagger.description = '圖片清單'
    #swagger.security = [{
       "bearerAuth": []
   }]
   */
}));
//delete

router.delete('/:name', handleErrorAsync(async (req, res, next) => {
  try {

    const { name } = req.params;
    console.log(name);
    if (!name) {
      return next(appError("name傳入格式異常!請查閱API文件", next));
    }

    if (!name.trim()) {
      return next(appError("name欄位不能為空值！", next));
    }

    const file = bucket.file(`images/${name}`);
    await file.delete(); // 刪除檔案
    Success(res, `已資料刪除name:${name}`);

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      message: 'Error deleting file',
      error: error.message,
    });
  }
  /*
    #swagger.tags =  ['圖片上傳']
    #swagger.path = '/v1/api/admin/upload/{name}'
    #swagger.method = 'delete'
    #swagger.summary='圖片清單'
    #swagger.description = '圖片清單'
    #swagger.security = [{
       "bearerAuth": []
   }]
   */
  /*
         #swagger.parameters['name'] = {
                in: 'path',
                description: '圖片name',
                type: 'string'
             } 
    */
}));

module.exports = router;
