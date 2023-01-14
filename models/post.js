require('dotenv').config();
const { DataTypes } = require('sequelize');

const post = test => {
    let sequelize;
    if (test) {
        sequelize = require('../database/in-memory');
    } else {
        sequelize = require('../database/db');
    }

    return sequelize.define('Post', {
        title: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        context: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        maxParticipants: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
};

module.exports = post(process.env.TEST);