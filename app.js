const express = require('express');

const app = express();

const sequelize = require('./database/db');

// imports models
const user = require('./models/user');
const post = require('./models/post');
const comment = require('./models/comment');
const tag = require('./models/tag');
const board = require('./models/board');
const participant = require('./models/participant');
const e = require('express');

// association
user.hasMany(post);
post.belongsTo(user, {constraints: true, delete: 'CASCADE'});
user.hasMany(participant);
participant.belongsTo(user, {constraints: true, delete: 'CASCADE'});
user.hasMany(comment);
comment.belongsTo(user, {constraints: true, delete: 'CASCADE'});

post.belongsToMany(tag, {through: 'postTag'});
post.hasMany(comment);
comment.belongsTo(post, {constraints: true, delete: 'CASCADE'});
post.hasMany(participant);
participant.belongsTo(post, {constraints: true, delete: 'CASCADE'});

board.hasMany(post);
post.belongsTo(board, {constraints: true, delete: 'CASCADE'});

comment.hasMany(comment);
comment.belongsTo(comment);

tag.belongsToMany(post, {through: 'PostTag'});

sequelize
    .sync({force: true})
    .then(()=>{
        console.log('Model Sync Complete');
        app.listen(3000);
    })
    .catch(err=>{
        console.log(err);
    });