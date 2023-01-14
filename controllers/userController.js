const User = require('../models/user');

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
        where: where
    });

    return res.status(200).json(users);
};

module.exports.getUser = async (req, res, next) => {
    const userId = req.params.userId;

    const user = await User.findByPk(userId);

    if (!user) {
        // console.log('Not found');
        return res.status(404).json({ Error: 'No such user' });
    }

    // console.log('Found');
    return res.status(200).json(user);
};

module.exports.addUser = async (req, res, next) => {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    const newUser = await User.create({
        username: username,
        email: email,
        password: password
    });

    return res.status(200).json(newUser);
};

module.exports.deleteUser = async (req, res, next) => {
    const userId = req.params.userId;

    return await User
        .destroy({
            where: { id: userId }
        })
        .then(result => {
            console.log(result);
            if (!result) throw new Error('Delete failed');
            return res.status(200).json({ Message: `user ${userId} was deleted` });
        })
        .catch(err => {
            console.log(err);
            return res.status(404).json({ Error: 'No such user' });
        });
};

module.exports.updateUser = async (req, res, next) => {
    const userId = req.params.userId;
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

    return await User
        .update(updatedUserInfo, {
            where: {
                id: userId
            }
        })
        .then(result => {
            console.log(result);
            if (!result[0]) throw new Error('Update failed');
            return res.status(200).json({ Message: `user ${userId} was updated` });
        })
        .catch(err => {
            console.log(err);
            return res.status(404).json({ Error: 'No such user' });
        });
};