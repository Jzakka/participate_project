const express = require('express');
const boardController = require('../controllers/boardController');
const {isAuth} = require('../middleware/is-auth');

const router = express.Router();

router.get('/', boardController.getBoards);

router.post('/',isAuth, boardController.addBoard);

router.delete('/:boardId',isAuth, boardController.deleteBoard);

module.exports = router;