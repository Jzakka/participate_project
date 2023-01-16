const express = require('express');
const boardController = require('../controllers/boardController');

const router = express.Router();

router.get('/', boardController.getBoards);

router.post('/', boardController.addBoard);

router.delete('/:boardId', boardController.deleteBoard);

module.exports = router;