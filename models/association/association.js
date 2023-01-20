// imports models
const User = require('../user');
const Post = require('../post');
const Comment = require('../comment');
const Tag = require('../tag');
const Board = require('../board');
const Participant = require('../participant');
const PostTag = require('../postTag');

// association
const association = async () => {
    User.hasMany(Post);
    Post.belongsTo(User, { constraints: true, delete: 'CASCADE' });
    User.belongsToMany(Post, {through: Participant});
    User.hasMany(Comment);
    Comment.belongsTo(User, { constraints: true, delete: 'CASCADE' });
    User.belongsToMany(Tag, { through: 'UserTag' });

    Post.belongsToMany(Tag, { through: 'PostTag' });
    Post.hasMany(Comment);
    Comment.belongsTo(Post, { constraints: true, delete: 'CASCADE' });
    Post.belongsToMany(User, {through: Participant});
    Participant.belongsTo(Post, { constraints: true, delete: 'CASCADE' });

    Board.hasMany(Post);
    Post.belongsTo(Board, { constraints: true, delete: 'CASCADE' });
    Board.belongsToMany(Tag, { through: 'BoardTag' });

    Comment.hasMany(Comment, {
        foreignKey: 'ParentId', useJunctionTable: false
    });

    Tag.belongsToMany(Post, { through: PostTag });
    Tag.belongsToMany(User, { through: 'UserTag' });
    Tag.belongsToMany(Board, { through: 'BoardTag' });
};

module.exports =  association;