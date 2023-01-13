const { Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../database/db');
// const sequelize = new Sequelize("sqlite::memory");

const comment = sequelize.define('Comment', {
    context: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
});

module.exports = comment;