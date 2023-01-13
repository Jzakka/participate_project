const { Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../database/db');
// const sequelize = new Sequelize("sqlite::memory");

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
});

module.exports = User;