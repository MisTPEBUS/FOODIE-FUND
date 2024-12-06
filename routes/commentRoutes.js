// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');


router.get('/', uploadMiddleware, JWTHandler, commentController.getAllComments);


router.post('/', commentController.createComment);


router.get('/:id', commentController.getCommentById);




module.exports = router;
