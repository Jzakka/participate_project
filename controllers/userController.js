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
        attributes:['id', 'email', 'username']
    });

    return res.status(200).json(users);
};

module.exports.getUser = async (req, res, next) => {
    const userId = req.params.userId;

    return await User.findByPk(userId,{
        include: Tag,
        attributes: ['id', 'email', 'username']
    })
    .then(user=>{
        if (!user) {
            throw new Error();
        }
        return res.status(200).json(user);
    })
    .catch(err => {
        console.log(err);
        return res.status(404).json({message: "No such User"});
    });
    
};

module.exports.addUser = async (req, res, next) => {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if(await User.findOne({where: {email:email}})){
        return res.status(400).json({message: 'The email is already used'});
    }

    if(password !== confirmPassword){
        return res.status(400).json({message: 'Passwords are not match'});
    }

    const newUser = await User.create({
        username: username,
        email: email,
        password: password
    });

    // console.log(newUser);

    return res.status(200).json({UserId: newUser.id, message: "Created user successfull"});
};

module.exports.deleteUser = async (req, res, next) => {
    const userId = req.params.userId;

    return await User
        .destroy({
            where: { id: userId }
        })
        .then(result => {
            // console.log(result);
            if (!result) throw new Error('Delete failed');
            return res.status(200).json({ Message: 'Deleted user successfull' });
        })
        .catch(err => {
            // console.log(err);
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
            // console.log(result);
            if (!result[0]) throw new Error('Update failed');
            return res.status(200).json({ Message: 'Updated user successfull' });
        })
        .catch(err => {
            // console.log(err);
            return res.status(404).json({ Error: 'No such user' });
        });
};