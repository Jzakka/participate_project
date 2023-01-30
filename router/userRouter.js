const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { isAuth } = require('../middleware/is-auth');
const User = require('../models/user');

const router = express.Router();

router.post('/', [
    body('email').isEmail().custom(value => {
        return User
            .findOne({
                where: { email: value }
            })
            .then(user => {
                if (user) {
                    return Promise.reject('The email is already registered');
                }
                return true;
            });
    }).normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).isAlphanumeric().trim(),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password length should be at leaset 8 and combination of alphabet and number');
        }
        return true;
    })
], userController.addUser);

router.get('/:userId', userController.getUser);

router.get('/', userController.getUsers);

router.delete('/:userId', isAuth, userController.deleteUser);

router.put('/:userId', isAuth, userController.updateUser);

module.exports = router;