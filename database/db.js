const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    'community', process.env.USERNAME, process.env.PASSWORD, {
        host: 'localhost',
        dialect: 'mysql'
    }
);

module.exports = sequelize;