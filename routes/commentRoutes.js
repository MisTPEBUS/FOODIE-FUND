// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const planCommentReplyController = require('../controllers/planCommentReplyController');


/* router.get('/', uploadMiddleware, JWTHandler, commentController.getAllComments);


router.post('/', commentController.createComment);


router.get('/:id', commentController.getCommentById); */

router.get('plan/:plan_id/comment', isAuth, planCommentReplyController.createComment);


module.exports = router;
