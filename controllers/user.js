const User = require('../models/user');

module.exports.addUser = async (req,res,next)=>{
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