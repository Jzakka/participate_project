const express = require('express');

const app = express();

const sequelize = require('./database/in-memory');

const { association, User } = require('./models/association/association');

association();

const user = async () => {
    await User.create({
        email: "test@test.com",
        username: "testuser",
        password: "1234"
    });
};

sequelize
    .sync({force: true})
    .then(()=>{
        console.log('Model Sync Complete');
        user();
        app.listen(3000);
    })
    .catch(err=>{
        console.log(err);
    });