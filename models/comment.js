require('dotenv').config();
const { DataTypes} = require('sequelize');

const comment = test => {
    let sequelize;
    if(test){
        sequelize = require('../database/in-memory');
    }else{
        sequelize = require('../database/db');
    }
    
    return  sequelize.define('Comment', {
        context: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        ParentId: {
            type: DataTypes.INTEGER
        }
    });
};


module.exports = comment(process.env.TEST);