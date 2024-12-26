const express = require('express');
const { appError } = require("../services/handleResponse");
const { uploadMiddleware, uploadPlanNewsMiddleware } = require("../services/image");
const router = express.Router();
const rateLimit = require("express-rate-limit");

// 設置限流
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 分鐘
    max: 5, // 每個 IP 限制最多 100 次請求
    message: {
        message: "請求次數過多，請稍後再試。",
    },
    handler: (req, res, next, options) => {
        // 自訂的錯誤處理
        next(
            appError(
                "請求過多，請稍後再試。",
                next,
                429, // HTTP 狀態碼
                4001 // 自定義錯誤代碼
            )
        );
    },
    standardHeaders: true, // 返回 RateLimit 相關資訊到 Headers
    legacyHeaders: false, // 停用舊版 Headers
});

const planController = require('../controllers/planController');
const planNewsController = require('../controllers/planNewsController');
const planFaqController = require('../controllers/planFaqController');
const planCommentController = require('../controllers/planCommentController');
const planCommentReplyController = require('../controllers/planCommentController');
const { isAuth } = require('../services/auth');

const validatePlanId = (req, res, next) => {
    console.log(req.params.plan_id)
    if (!req.params.plan_id) {
        return res.status(400).json({ error: 'Invalid or missing plan ID' });
    }
    next();
};

//提案計畫
//Admin
router.get('/admin/planList', isAuth, planController.getPlanList);
router.get('/', isAuth, planController.getAllPlans);

router.get('/:id', isAuth, planController.getPlanById);
router.post('/', isAuth, planController.createPlan);
router.put('/:id', isAuth, planController.updatePlanById);
router.delete('/:id', isAuth, planController.deletePlanById);

//蒐藏


//案讚

//最新消息


router.get('/:plan_id/news/:id', planNewsController.getNewsByID);
router.get('/:plan_id/news', planNewsController.getAllNews);
/* router.post('/:plan_id/news', isAuth, uploadPlanNewsMiddleware, planNewsController.createNews);
router.put('/:plan_id/news/:id', isAuth, uploadPlanNewsMiddleware, planNewsController.updateNewsById);
router.delete('/:plan_id/news/:id', isAuth, planNewsController.deleteNewsById); */
//常見問題
router.get('/:plan_id/faqs', validatePlanId, planFaqController.getAllFaqs);
router.get('/:plan_id/faqs/:id', validatePlanId, planFaqController.getFaqsByID);
/* router.post('/:plan_id/faqs', isAuth, planFaqController.createFaq);
router.put('/:plan_id/faqs/:id', isAuth, planFaqController.updateFaqById);
router.delete('/:plan_id/faqs/:id', isAuth, planFaqController.deleteFaqById); */

//留言
router.get('/:plan_id/comment', isAuth, planCommentController.createComment);
router.post('/:plan_id/comment', isAuth, planCommentController.deleteComment);
//回復
router.get('/:plan_id/commentReply/:comment_id', isAuth, planCommentReplyController.createComment);
router.post('/:plan_id/commentReply/:comment_id', isAuth, planCommentReplyController.deleteComment);


module.exports = router;
