const express = require('express');
const commentController = require('../controllers/commentController');
const {isAuth} = require('../middleware/is-auth');

const router = express.Router();

router.post('/', isAuth, commentController.addComment);

router.get('/', commentController.getComments);

router.get('/:commentId', commentController.getComment);

router.put('/:commentId', isAuth, commentController.updateComment);

module.exports = router;