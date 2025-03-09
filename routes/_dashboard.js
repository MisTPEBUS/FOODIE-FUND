const express = require('express');
const { appError } = require("../services/handleResponse");
const planRewardsController = require("../controllers/planRewardsController");
const { uploadMiddleware, uploadPlanNewsMiddleware } = require("../services/image");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const planController = require('../controllers/planController');
const planNewsController = require('../controllers/planNewsController');
const planFaqController = require('../controllers/planFaqController');

const { isAuth } = require('../services/auth');


const validatePlanId = (req, res, next) => {
    console.log(req.params.plan_id)
    if (!req.params.plan_id) {
        return res.status(400).json({ error: 'Invalid or missing plan ID' });
    }
    next();
};

router.get('/plan/:plan_id', isAuth, planController.getPlanAdmin);
router.get('/plan/:plan_id/detail', isAuth, planController.getPlanAdminByID);
router.put('/plan/:plan_id/detail', isAuth, uploadPlanNewsMiddleware, planController.updatePlanAdminByID);

//計畫回饋
router.get('/plan/:plan_id/rewards', planRewardsController.getAllRewards);
router.get('/plan/:plan_id/rewards/:id', planRewardsController.getRewardByID);
router.post('/plan/:plan_id/rewards', isAuth, uploadPlanNewsMiddleware, planRewardsController.createReward);
router.put('/plan/:plan_id/rewards/:id', isAuth, uploadPlanNewsMiddleware, planRewardsController.updateRewardByID);
router.delete('/plan/:plan_id/rewards/:id', planRewardsController.deleteRewardByID);

//Admin
/* router.get('/admin/planList', isAuth, planController.getPlanList);
router.get('/', isAuth, planController.getAllPlans);
router.get('/:id', isAuth, planController.getPlanById);
router.post('/', isAuth, planController.createPlan);
router.put('/:id', isAuth, planController.updatePlanById);
router.delete('/:id', isAuth, planController.deletePlanById); */

//蒐藏


//案讚

//最新消息


router.get('/plan/:plan_id/news/:id', isAuth, planNewsController.getNewsByID);
router.get('/plan/:plan_id/news', isAuth, planNewsController.getAllNews);
router.post('/plan/:plan_id/news', isAuth, uploadPlanNewsMiddleware, planNewsController.createNews);
router.put('/plan/:plan_id/news/:id', isAuth, uploadPlanNewsMiddleware, planNewsController.updateNewsById);
router.delete('/plan/:plan_id/news/:id', isAuth, planNewsController.deleteNewsById);
//常見問題

router.get('/plan/:plan_id/faqs', isAuth, planFaqController.getAllFaqs);
router.get('/plan/:plan_id/faqs/:id', isAuth, planFaqController.getFaqsByID);
router.post('/plan/:plan_id/faqs', isAuth, planFaqController.createFaq);
router.put('/plan/:plan_id/faqs/:id', isAuth, planFaqController.updateFaqById);
router.delete('/plan/:plan_id/faqs/:id', isAuth, planFaqController.deleteFaqById);




module.exports = router;
