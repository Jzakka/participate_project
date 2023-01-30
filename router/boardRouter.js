const express = require('express');
const {body} = require('express-validator/check');
const boardController = require('../controllers/boardController');
const {isAuth} = require('../middleware/is-auth');

const router = express.Router();

router.get('/', boardController.getBoards);

router.post('/',isAuth,[
    body('boardName').trim().isLength({min:3})
] ,boardController.addBoard);

router.delete('/:boardId',isAuth, boardController.deleteBoard);

module.exports = router;