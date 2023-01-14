require('dotenv').config();
const { DataTypes } = require('sequelize');

const board = test => {
    let sequelize;
    if (test) {
        sequelize = require('../database/in-memory');
    } else {
        sequelize = require('../database/db');
    }

    return sequelize.define('Board', {
        boardName: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    });
};


module.exports = board(process.env.TEST);