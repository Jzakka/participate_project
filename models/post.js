const { Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../database/db');
// const sequelize = new Sequelize("sqlite::memory");

const post = sequelize.define('Post',{
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
    },
);

module.exports = post;