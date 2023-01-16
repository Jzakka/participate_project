const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/', userController.addUser);

router.get('/:userId', userController.getUser);

router.get('/', userController.getUsers);

router.delete('/:userId', userController.deleteUser);

router.put('/:userId', userController.updateUser);

module.exports = router;