require('dotenv').config();
const { DataTypes } = require('sequelize');

const tag = test => {
    let sequelize;
    if (test) {
        sequelize = require('../database/in-memory');
    } else {
        sequelize = require('../database/db');
    }

    return sequelize.define('Tag', {
        tagName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
    }, {
        timestamps: false
    });
};

module.exports = tag(process.env.TEST);