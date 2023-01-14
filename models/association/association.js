// imports models
const User = require('../user');
const Post = require('../post');
const Comment = require('../comment');
const Tag = require('../tag');
const Board = require('../board');
const Participant = require('../participant');

// association
const association = () => {
    User.hasMany(Post);
    Post.belongsTo(User, { constraints: true, delete: 'CASCADE' });
    User.hasMany(Participant);
    Participant.belongsTo(User, { constraints: true, delete: 'CASCADE' });
    User.hasMany(Comment);
    Comment.belongsTo(User, { constraints: true, delete: 'CASCADE' });
    User.belongsToMany(Tag, { through: 'UserTag' });

    Post.belongsToMany(Tag, { through: 'PostTag' });
    Post.hasMany(Comment);
    Comment.belongsTo(Post, { constraints: true, delete: 'CASCADE' });
    Post.hasMany(Participant);
    Participant.belongsTo(Post, { constraints: true, delete: 'CASCADE' });

    Board.hasMany(Post);
    Post.belongsTo(Board, { constraints: true, delete: 'CASCADE' });
    Board.belongsToMany(Tag, { through: 'BoardTag' });

    Comment.hasMany(Comment);
    Comment.belongsTo(Comment);

    Tag.belongsToMany(Post, { through: 'PostTag' });
    Tag.belongsToMany(User, { through: 'UserTag' });
    Tag.belongsToMany(Board, { through: 'BoardTag' });
};

module.exports =  association;