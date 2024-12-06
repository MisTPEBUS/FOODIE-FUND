const express = require('express');
const router = express.Router();

const planController = require('../controller/planController');
const planNewsController = require('../controller/planNewsController');
const planFaqController = require('../controller/planFaqController');
const planCommentController = require('../controller/planCommentController');
const planCommentReplyController = require('../controller/planCommentReplyControlle');
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
router.get('/', isAuth, planController.getAllPlans);
router.get('/:id', planController.getPlanById);
router.post('/', planController.createPlan);
router.put('/:id', planController.updatePlanById);
router.delete('/:id', planController.deletePlanById);

//最新消息
router.get('/:plan_id/news', isAuth, planNewsController.getAllNews);
router.post('/:plan_id/news', isAuth, planNewsController.createNews);
router.put('/:plan_id/news/:id', isAuth, planNewsController.updateNewsById);
router.delete('/:plan_id/news/:id', isAuth, planNewsController.deleteNewsById);
//常見問題
router.get('/:plan_id/faqs', isAuth, validatePlanId, planFaqController.getAllFaqs);
router.post('/:plan_id/faqs', isAuth, planFaqController.createFaq);
router.put('/:plan_id/faqs/:id', isAuth, planFaqController.updateFaqById);
router.delete('/:plan_id/faqs/:id', isAuth, planFaqController.deleteFaqById);

//留言
router.get('/:plan_id/comment', isAuth, planCommentController.createComment);
router.post('/:plan_id/comment', isAuth, planCommentController.deleteComment);
//回復
router.get('/:plan_id/commentReply', isAuth, planCommentReplyController.createComment);
router.post('/:plan_id/commentReply/:comment_id', isAuth, planCommentReplyController.deleteComment);


module.exports = router;
