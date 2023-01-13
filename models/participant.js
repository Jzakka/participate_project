const { Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../database/db');
// const sequelize = new Sequelize("sqlite::memory");

const participant = sequelize.define('Participant',{
    good: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = participant;