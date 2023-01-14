const { Sequelize, DataTypes} = require('sequelize');

const user = test => {
    let sequelize;
    if (test) {
        sequelize = require('../database/in-memory');
    } else {
        sequelize = require('../database/db');
    }

    return sequelize.define('User', {
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
};

module.exports = user;