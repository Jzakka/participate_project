const { Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../database/db');
// const sequelize = new Sequelize("sqlite::memory");

const board = sequelize.define('Board',{
    boardName: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
});

module.exports = board;