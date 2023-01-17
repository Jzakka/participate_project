const User = require('../models/user');

module.exports.postLogin = async (req, res, next)=>{
    const email = req.body.email;
    const password = req.body.password;

    return await User.findOne({where: {
        email: email
    }})
    .then(foundUser => {
        if(!foundUser){
            return new Error('No such user');
        }
        if(foundUser.password !== password){
            return new Error('Incorrect password');
        }
        req.session.user = foundUser;
        return res.status(200).json({message: 'Login success'});
    })
    .catch(err => {
        console.log(err);
        return res.status(422).json({message: err});
    });
};