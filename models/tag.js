const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database/db');
// const sequelize = new Sequelize("sqlite::memory");

const tag = sequelize.define('Tag', {
    tagName: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = tag;