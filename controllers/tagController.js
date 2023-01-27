const User = require('../models/user');
const Board = require('../models/board');
const Post = require('../models/post');
const Tag = require('../models/tag');

module.exports.getTags = async (req, res, next) => {
    const userId = req.query.userId;
    const boardId = req.query.boardId;
    const postId = req.query.postId;

    const query = {
        // logging: true,
        include: [{
            model: User,
            attributes: ['id'],
        }, {
            model: Board,
            attributes: ['id'],
        }, {
            model: Post,
            attributes: ['id'],
        }],
    };
    if (userId) {
        query.include[0].where = { id: userId };
    }
    if (boardId) {
        query.include[1].where = { id: boardId };
    }
    if (postId) {
        query.include[2].where = { id: postId };
    }

    Tag
        .findAll(query)
        .then(found => {
            return res.status(200).json(found.map(tag => tag.tagName));
        })
        .catch(err => {
            err.statusCode ??= 500;
            next(err);
        });
};

module.exports.addTag = async (req, res, next) => {
    const tagName = req.body.tagName;
    const userId = req.body.userId;
    const boardId = req.body.boardId;

    let createdTag;
    Tag
        .create({ tagName: tagName })
        .then(created => {
            if (!created) {
                const err = new Error('Failed to create tag');
                throw err;
            }
            createdTag = created;
        })
        .then(result => {
            if (userId) {
                return User
                    .findByPk(userId, { include: Tag })
                    .then(async foundUser => {
                        if (!foundUser) {
                            const err = new Error('No such user');
                            err.statusCode = 404;
                            throw err;
                        }
                        foundUser.addTag(createdTag);
                    });
            }
        })
        .then(result => {
            if (boardId) {
                return Board
                    .findByPk(boardId, { include: Tag })
                    .then(foundBoard => {
                        if (!foundBoard) {
                            const err = new Error('No such user');
                            err.statusCode = 404;
                            throw err;
                        }
                        foundBoard.addTag(createdTag);
                    });
            }
        })
        .then(result => {
            console.log(4);
            return res.status(201).json({ message: 'Created Tag successfull' });
        })
        .catch(err => {
            err.statusCode ??= 500;
            next(err);
        });
};