const express = require('express');
const postController = require('../controllers/postController');
const {isAuth} = require('../middleware/is-auth');

const router = express.Router();

router.get('/', postController.getPosts);

router.get('/:postId', postController.getPost);

router.post('/', isAuth, postController.addPost);

router.put('/:postId', isAuth, postController.updatePost);

router.put('/:postId/join', isAuth, postController.participate);

router.delete('/:postId', isAuth, postController.deletePost);

module.exports = router;