const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');
const User = require('../models/user');
const Tag = require('../models/tag');

module.exports.getUsers = async (req, res, next) => {
    const email = req.query.email;
    const username = req.query.username;
    const where = {};

    if (email) {
        where.email = email;
    }
    if (username) {
        where.username = username;
    }
    const users = await User.findAll({
        where: where,
        attributes: ['id', 'email', 'username']
    });

    return res.status(200).json(users);
};

module.exports.getUser = async (req, res, next) => {
    const userId = req.params.userId;

    return await User.findByPk(userId, {
        include: Tag,
        attributes: ['id', 'email', 'username']
    })
        .then(user => {
            if (!user) {
                const err = new Error('No such user');
                err.statusCode = 404;
                throw err;
            }
            return res.status(200).json(user);
        })
        .catch(err => {
            err.statusCode = err.statusCode || 500;
            next(err);
        });
};

module.exports.addUser = (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        const err= new Error('Input data is invalid');
        err.statusCode = 422;
        err.data= error.array();
        throw err;
    }

    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            return User.create({
                username: username,
                email: email,
                password: hashedPassword
            })
        })
        .then(newUser => {
            return res.status(201).json({ UserId: newUser.id, message: "Created user successfull" });
        })
        .catch(err => {
            err.statusCode = err.statusCode || 500;
            next(err);
        });
};

module.exports.deleteUser = (req, res, next) => {
    const userId = req.params.userId;

    if (userId !== req.userId.toString()) {
        const err = new Error('Not authorized');
        err.statusCode = 401;
        throw err;
    }

    return User.findByPk(userId)
        .then(user => {
            if (!user) {
                const err = new Error('No such user');
                err.statusCode = 404;
                throw err;
            }
        })
        .then(result => {
            return User.destroy({
                where: { id: userId }
            });
        })
        .then(result => {
            if (!result) {
                const err = new Error('Failed to delete user');
                throw err;
            }
            return res.status(200).json({ message: 'Deleted user successfull' });
        })
        .catch(err => {
            err.statusCode = err.statusCode || 500;
            next(err);
        });
};

module.exports.updateUser = (req, res, next) => {
    const userId = req.params.userId;

    if (userId !== req.userId.toString()) {
        const err = new Error('Not authorized');
        err.statusCode = 401;
        throw err;
    }

    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    const updatedUserInfo = {};
    if (email) {
        updatedUserInfo.email = email;
    }
    if (username) {
        updatedUserInfo.username = username;
    }
    if (password) {
        updatedUserInfo.password = password;
    }

    return User.findByPk(userId)
        .then(user => {
            if (!user) {
                const err = new Error('No such user');
                err.statusCode = 404;
                throw err;
            }
        })
        .then(result => {
            return User
                .update(updatedUserInfo, {
                    where: {
                        id: userId
                    }
                })
        })
        .then(result => {
            if (!result[0]) {
                const err = new Error('Update failed');
                throw err;
            }
            return res.status(200).json({ message: 'Updated user successfull' });
        })
        .catch(err => {
            err.statusCode = err.statusCode || 500;
            next(err);
        });
};