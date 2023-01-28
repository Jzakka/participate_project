const express = require('express');
const userController = require('../controllers/userController');
const {isAuth} = require('../middleware/is-auth');

const router = express.Router();

router.post('/', userController.addUser);

router.get('/:userId', userController.getUser);

router.get('/', userController.getUsers);

router.delete('/:userId', isAuth, userController.deleteUser);

router.put('/:userId',isAuth, userController.updateUser);

module.exports = router;