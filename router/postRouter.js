const express = require('express');
const {body} = require('express-validator');

const postController = require('../controllers/postController');
const {isAuth} = require('../middleware/is-auth');

const router = express.Router();

router.get('/', postController.getPosts);

router.get('/:postId', postController.getPost);

router.post('/', isAuth, [
    body('boardId').not().isEmpty(),
    body('title').not().isEmpty(),
    body('context').not().isEmpty()
],postController.addPost);

router.put('/:postId', isAuth, [
    body('title').not().isEmpty(),
    body('context').not().isEmpty()
], postController.updatePost);

router.put('/:postId/join', isAuth, postController.participate);

router.delete('/:postId', isAuth, postController.deletePost);

module.exports = router;