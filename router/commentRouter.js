const express = require('express');
const commentController = require('../controllers/commentController');

const router = express.Router();

router.post('/', commentController.addComment);

router.get('/', commentController.getComments);

router.get('/:commentId', commentController.getComment);

router.put('/:commentId', commentController.updateComment);

module.exports = router;