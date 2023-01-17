const express = require('express');
const postController = require('../controllers/postController');

const router = express.Router();

router.get('/', postController.getPosts);

router.get('/:postId', postController.getPost);

router.post('/', postController.addPost);

router.put('/:postId', postController.updatePost);

module.exports = router;