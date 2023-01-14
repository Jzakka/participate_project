require('dotenv').config();
const { DataTypes} = require('sequelize');

const participant = test => {
    let sequelize;
    if(test){
        sequelize = require('../database/in-memory');
    }else{
        sequelize = require('../database/db');
    }
    
    return sequelize.define('Participant',{
        good: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
};

module.exports = participant(process.env.TEST);