require('dotenv').config();
const { DataTypes } = require('sequelize');

const postTag = test => {
    let sequelize;
    if (test) {
        sequelize = require('../database/in-memory');
    } else {
        sequelize = require('../database/db');
    }

    return sequelize.define('PostTag', {}, {timestamps: false});
};

module.exports = postTag(process.env.TEST);