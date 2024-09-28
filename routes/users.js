const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const validator = require("validator");
const mongoose = require("mongoose");
const User = require("../models/users.js");
const {
  Success,
  NotFound,
  appError,
} = require("../services/handleResponse.js");
const { handleErrorAsync } = require("../services/handleResponse.js");
const { isAuth, generateSendJWT, generateMailSendJWT } = require("../services/auth");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LineStrategy = require('passport-line').Strategy;
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
console.log(process.env.GOOGLE_AUTH_CLIENT_SECRET)

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_AUTH_CLIENTID,
  clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
  callbackURL: "http://localhost:2330/v1/api/auth/google/callback"
  /*   callbackURL: `${process.env.SWAGGER_HOST}/v1/api/auth/google/callback`  */
},
  async (accessToken, refreshToken, profile, cb) => {

    return cb(null, profile);
  }
));
passport.use(new LineStrategy({
  channelID: '2006309432',
  channelSecret: 'a0b71be06ffdb0a5edab1a54707f5751',
  callbackURL: "http://localhost:2330/v1/api/auth/line/callback"
},
  async (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));
router.get('/line',
  passport.authenticate('line'));

router.get('/line/callback', passport.authenticate('line', { session: false }), (req, res) => {
  const code = req.query.code;


  console.log('Authorization code:', code);

  res.redirect(`http://127.0.0.1:5500/success.html?token=${code}`);

});


router.get('/google', passport.authenticate('google', {
  scope: ['email', 'profile'],
}));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  //console.log(req.user._json)
  // const { _json } = req.user;
  /*  res.send({
     status: true,
     data: {
       id: req.user.id,
       name: req.user.displayName,
       provider: req.user.provider,
       email: _json?.email,
       photo: _json?.picture
     }
   }); */
  res.redirect(`http://127.0.0.1:5500/success.html?token=${req.user.id}`);
})


//註冊
router.post(
  "/sign_up",
  handleErrorAsync(async (req, res, next) => {
    let { name, email, password, photo, phone, address, date_of_birth, remarks } = req.body;
    if (!name || !email || !password) {
      return next(appError("傳入格式異常!請查閱API文件", next));
    }
    // Content cannot null
    if (!email.trim()) {
      return next(appError("Email欄位不能為空值！", next));
    }
    if (!password.trim()) {
      return next(appError("Password欄位不能為空值！", next));
    }
    if (!validator.isLength(password, { min: 8 })) {
      return next(appError("Password至少要8碼！", next));
    }
    if (!name.trim()) {
      return next(appError("Name欄位不能為空值！", next));
    }

    // isEmail Type
    if (!validator.isEmail(email)) {
      return next(appError("Email 格式不正確", next));
    }
    // find user

    const isUser = await User.findOne({ email: email });

    if (isUser) {
      return next(appError("使用者已經註冊", next, 409));
    }
    // pwd salt

    password = bcrypt.hash(password, 12);
    // 加密密碼
    password = await bcrypt.hash(req.body.password, 12);
    try {
      const newUser = await User.create({
        name,
        photo,
        email,
        password,
        phone,
        address,
        date_of_birth,
        remarks
      });
      generateSendJWT(newUser, 201, res);
    } catch (err) {
      return next(appError(err.message, next));
    }
    /*
      #swagger.tags =  ['使用者登入驗證']
      #swagger.path = '/v1/api/auth/sign_up'
      #swagger.method = 'post'
      #swagger.summary='會員註冊'
      #swagger.description = '會員註冊'
      #swagger.produces = ["application/json"] 
    */
    /*
    #swagger.requestBody = {
             required: true,
             description:"會員資料",
             content: {
                 "application/json": {
                 schema: {
                     type: "object",
                     properties: {
                         name: {
                             type: "string",
                              example: "Lobinda"
                         },
                          email: {
                             type: "string",
                              example: "Lobinda123@test.com"
                         },
                          photo: {
                             type: "string",
                              example: ""
                         },
                          password: {
                             type: "string",
                             description: "至少要8碼",
                              example: "1q2w3e4r"
                         },
                          phone: {
                             type: "string",
                             description: "可Null",
                              example: "0987654321"
                         },
                          address: {
                             type: "string",
                             description: "地址",
                              example: "地球某個角落"
                         }, remarks: {
                             type: "string",
                             description: "備註",
                              example: "FOODIE-FUND讚"
                         },
                          date_of_birth: {
                              type: "string",
                        format: "date",
                             description: "生日",
                              example: "2006-08-18"
                         },
                     },
                     required: ["name", "email",  "password"]
                 }  
             }
             }
         } 
  }
 */
  }),
);

//登入
router.post(
  "/sign_in",
  handleErrorAsync(async (req, res, next) => {

    let { email, password } = req.body;
    if (!email || !password) {
      return next(appError("傳入格式異常!請查閱API文件", next));
    }
    // Content cannot null

    if (!email.trim() || !validator.isEmail(email)) {
      return next(appError("Email欄位格式異常！", next));
    }
    if (!password.trim()) {
      return next(appError("Password欄位不能為空值！", next));
    }

    const user = await User.findOne({ email }).select("+password");
    console.log(user)
    if (!user) {
      return next(appError("使用者未註冊!", next));
    }

    /*  if (!user.confirmedAt) {
       return next(appError("email未驗證!", next, 403));
     } */


    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return next(appError("帳號密碼錯誤!", next));
    }

    generateSendJWT(user, 200, res);

    /*
    #swagger.tags =  ['使用者登入驗證']
    #swagger.path = '/v1/api/auth/sign_in'
    #swagger.method = 'post'
    #swagger.summary='會員登入'
    #swagger.description = '會員登入'
    #swagger.produces = ["application/json"] 
  */
    /*
 #swagger.requestBody = {
             required: true,
             content: {
                 "application/json": {
                 schema: {
                     type: "object",
                     properties: {
                          email: {
                             type: "string",
                             example: "Lobinda123@test.com"
                         },
                          password: {
                             type: "string",
                             example: "1q2w3e4r"
                         },
                     },
                     required: ["email", "password"]
                 }  
             }
             }
         } 
  }
  #swagger.responses[200] = { 
    schema: {
        "status": "true",
        "data": {
             "user": {
                 "token": "eyJhbGciOiJ..........mDWPvJZSxu98W4",
                 "name": "Lobinda",
                  "photo":""
             }
        }
      }
    } 
  #swagger.responses[400] = { 
    schema: {
        "status": false,
        "message": "Error Msg",
      }
    } 
    #swagger.responses[403] = { 
    schema: {
        "status": false,
        "message": "e-mail尚未驗證",
      }
    } 
 */
  }),
);

//更新密碼
router.patch(
  "/updatePassword",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return next(appError("傳入格式異常!請查閱API文件", next));
    }

    if (!password.trim()) {
      return next(appError("password不得為空值!", next));
    }
    if (!confirmPassword.trim()) {
      return next(appError("confirmPassword不得為空值!", next));
    }

    if (!validator.isLength(password, { min: 8 })) {
      return next(appError("密碼至少8碼", next));
    }

    if (password !== confirmPassword) {
      return next(appError("密碼不一致！", next));
    }

    // 將新密碼加密
    newPwd = await bcrypt.hash(password, 12);

    // 更新資料庫
    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPwd,
    });

    // JWT
    generateSendJWT(user, 200, res);

    /*
      #swagger.tags =  ['使用者登入驗證']
      #swagger.path = '/v1/api/auth/updatePassword'
      #swagger.method = 'patch'
      #swagger.summary='更新密碼'
      #swagger.description = '更新密碼'
      #swagger.produces = ["application/json"] 
      #swagger.security = [{
        "bearerAuth": []
    }]
    */
    /*
 #swagger.requestBody = {
             required: true,
             content: {
                 "application/json": {
                 schema: {
                     type: "object",
                     properties: {
                          password: {
                             type: "string",
                             description: "至少要8碼",
                             example: "1q2w3e4r"
                         },
                         confirmPassword: {
                             type: "string",
                             description: "至少要8碼",
                             example: "1q2w3e4r"
                         },
                     },
                     required: [ "password", "confirmPassword"]
                 }  
             }
             }
         } 
 
  }
  #swagger.responses[200] = { 
    schema: {
        "status": "true",
        "data": {
             "user": {
                 "token": "eyJhbGciOiJ..........mDWPvJZSxu98W4",
                 "name": "Lobinda"
             }
        }
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



module.exports = router;
