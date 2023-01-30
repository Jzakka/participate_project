const express = require('express');
const {body} = require('express-validator');

const commentController = require('../controllers/commentController');
const {isAuth} = require('../middleware/is-auth');

const router = express.Router();

router.post('/', isAuth,[
    body('postId').not().isEmpty(),
    body('context').not().isEmpty()
], commentController.addComment);

router.get('/', commentController.getComments);

router.get('/:commentId', commentController.getComment);

router.put('/:commentId', isAuth, commentController.updateComment);

module.exports = router;