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
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
console.log(process.env.GOOGLE_AUTH_CLIENT_SECRET)
/*   callbackURL: `${process.env.SWAGGER_HOST}/v1/api/auth/google/callback`  */
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_AUTH_CLIENTID,
  clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
  callbackURL: "https://foodiefund.onrender.com/v1/api/auth/google/callback"

},
  async (accessToken, refreshToken, profile, cb) => {

    return cb(null, profile);
  }
));
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_SECRET_KEY,
  callbackURL: "https://foodiefund.onrender.com/v1/api/auth/facebook/callback"

},
  async (accessToken, refreshToken, profile, cb) => {
    console.log(profile);
    const user = await User.findOne({
      email: profile.id,
      memberType: 'facebook',
    });
    if (!user) {
      console.log('Adding new facebook user to DB..');
      const user = new User({
        accountId: profile.id,
        name: profile.displayName,
        provider: profile.provider,
      });
      //await user.save();
      // console.log(user);
      return cb(null, profile);
    } else {
      console.log('Facebook User already exist in DB..');
      // console.log(profile);
      return cb(null, profile);
    }

  }
));
router.get(
  '/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/auth/facebook/error',
  }),
  function (req, res) {
    // Successful authentication, redirect to success screen.
    res.redirect('/auth/facebook/success');
  }
);

router.get('/success', async (req, res) => {
  const userInfo = {
    id: req.session.passport.user.id,
    displayName: req.session.passport.user.displayName,
    provider: req.session.passport.user.provider,
  };
  res.render('fb-github-success', { user: userInfo });
});

router.get('/error', (req, res) => res.send('Error logging in via Facebook..'));


/* passport.use(new LineStrategy({
  channelID: '2006309432',
  channelSecret: 'a0b71be06ffdb0a5edab1a54707f5751',
  callbackURL: "http://localhost:2330/v1/api/auth/line/callback"
},
  async (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
)); */
/* router.get('/line',
  passport.authenticate('line')); */

/* router.get('/line/callback', passport.authenticate('line', { session: false }), (req, res) => {


  // res.redirect(`http://127.0.0.1:5500/success.html?token=${code}`);

}); */


router.get('/google', passport.authenticate('google', {
  scope: ['email', 'profile'],
}));

router.get('/google/callback', passport.authenticate('google', { session: false }),
  handleErrorAsync(async (req, res, next) => {
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
    console.log('8989', req.user)
    const user = await User.findOne({ email: req.user.email, memberType: 'google' });
    //JWT

    if (!user) {

      const tmp = {
        name: req.user.displayName,
        photo: (req.user.photos.length > 0) ? req.user.photos[0].value : '',
        email: (req.user.emails.length > 0) ? req.user.emails[0] : '',
        password: req.user.id,
      };
      const newUser = await User.create(tmp);

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_DAY
      });

      const params = new URLSearchParams({
        token: token,
        name: tmp.name,
        email: tmp.email,
        photo: tmp.photo,
      });
      res.redirect(`https://tomchen102.github.io/foodiefund/index?${params.toString()}`);

    }
    else {
      //create
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_DAY
      });
      const params = new URLSearchParams({
        token: token,
        name: user.name,
        email: user.email,
        photo: user.photo,
      });
      res.redirect(`https://tomchen102.github.io/foodiefund/login?${params.toString()}`);

    }
  }))



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

    const isUser = await User.findOne({ email: email, memberType: 'system' });

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

    const user = await User.findOne({ email: email, memberType: 'system' }).select("+password");
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
