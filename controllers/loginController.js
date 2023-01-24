const bcrypt = require('bcrypt');
const User = require('../models/user');

module.exports.postLogin = async (req, res, next)=>{
    const email = req.body.email;
    const password = req.body.password;

    return await User.findOne({where: {
        email: email
    }})
    .then(foundUser => {
        if(!foundUser){
            throw new Error('No such user');
        }
        return bcrypt
            .compare(password, foundUser.password)
            .then(isMatch => {
                if(!isMatch){
                    throw new Error('Incorrect password');
                }
                req.session.user = foundUser;
                res.redirect('/');
            });
    })
    .catch(err => {
        console.log(err);
        return res.status(422).json({message: err});
    });
};

module.exports.postLogout = async (req,res, next)=>{
    req.session.destroy(err => {
        // console.log(err);
        res.redirect('/');
    });
};