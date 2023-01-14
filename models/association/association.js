require('dotenv').config();

// imports models
const User = require('../user')(process.env.TEST);
const Post = require('../post')(process.env.TEST);
const Comment = require('../comment')(process.env.TEST);
const Tag = require('../tag')(process.env.TEST);
const Board = require('../board')(process.env.TEST);
const Participant = require('../participant')(process.env.TEST);

// association
const association = () => {
    User.hasMany(Post);
    Post.belongsTo(User, { constraints: true, delete: 'CASCADE' });
    User.hasMany(Participant);
    Participant.belongsTo(User, { constraints: true, delete: 'CASCADE' });
    User.hasMany(Comment);
    Comment.belongsTo(User, { constraints: true, delete: 'CASCADE' });

    Post.belongsToMany(Tag, { through: 'postTag' });
    Post.hasMany(Comment);
    Comment.belongsTo(Post, { constraints: true, delete: 'CASCADE' });
    Post.hasMany(Participant);
    Participant.belongsTo(Post, { constraints: true, delete: 'CASCADE' });

    Board.hasMany(Post);
    Post.belongsTo(Board, { constraints: true, delete: 'CASCADE' });

    Comment.hasMany(Comment);
    Comment.belongsTo(Comment);

    Tag.belongsToMany(Post, { through: 'PostTag' });
};

module.exports = { association, User, Post, Comment, Tag, Board, Participant };