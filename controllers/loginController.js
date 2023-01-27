const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const User = require('../models/user');

module.exports.postLogin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    let loadedUser;
    return await User.findOne({
        where: {
            email: email
        }
    })
        .then(foundUser => {
            if (!foundUser) {
                const error = new Error('No such user');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = foundUser;
            return bcrypt.compare(password, foundUser.password);
        })
        .then(isMatch => {
            if (!isMatch) {
                const error = new Error('Password is incorrect');
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign({
                email: loadedUser.email,
                username: loadedUser.username,
                userId: loadedUser.id
            }, process.env.TOKEN_KEY,
                { expiresIn: '1h' });
            return res.status(200).json({token: token, userId: loadedUser.id});
        })
        .catch(err => {
            err.statusCode = err.statusCode || 500;
            next(err);
        });
};