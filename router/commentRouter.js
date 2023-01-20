const express = require('express');
const commentController = require('../controllers/commentController');

const router = express.Router();

router.post('/', commentController.addComment);

router.get('/', commentController.getComments);

router.put('/', commentController.updateComments);

module.exports = router;