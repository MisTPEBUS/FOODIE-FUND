// controllers/commentController.js
const Comment = require('../models/planCommentModel');
const { handleErrorAsync } = require('../services/handleResponse');

exports.getPlanList = handleErrorAsync(async (req, res, next) => {
    console.log(req.user);
    if (!plan_id || plan_id.trim() === '') {
        return next(appError("id欄位不能為空值！", next, 400, 1002
        ));
    }
});

exports.getPlanList = async (req, res) => {
    console.log(req.user);
    res.status(200);
};
exports.getAllPlans = async (req, res) => {

    console.log(req.user);
    res.status(200);
};


exports.createPlan = async (req, res) => {
    res.status(200);
};


exports.getPlanById = async (req, res) => {
    res.status(200);
};


exports.updatePlanById = async (req, res) => {
    res.status(200);
};


exports.deletePlanById = async (req, res) => {
    res.status(200);
};
