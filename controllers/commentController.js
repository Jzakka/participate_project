const _ = require('lodash');
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const Sequelize = require('sequelize-values')();

module.exports.addComment = async (req, res, next) => {
    const postId = req.body.postId;
    const userId = req.userId;
    const commentId = req.body.commentId;
    const context = req.body.context;
    // const post = await Post.findByPk(postId);
    // const comment = await Comment.findByPk(commentId);

    const query = {
        UserId: userId,
        PostId: postId,
        context: context,
        deleted: 'N'
    };
    if (!(await User.findByPk(userId) && await Post.findByPk(postId))) {
        const err = new Error('Could not find user and post');
        err.statusCode = 404;
        next(err);
    }
    let createdComment;
    return Comment
        .create(query)
        .then(async result => {
            if (!result) {
                const err = new Error('Failed to create comment');
                throw err;
            }
            createdComment = result;
        })
        .then(result => {
            if (commentId) {
                Comment
                    .findByPk(commentId)
                    .then(parent => {
                        if (!parent) {
                            const err = new Error('No such comment');
                            err.statusCode = 404;
                            throw err;
                        }
                        parent.addComment(createdComment);
                    })
            }
        })
        .then(result => {
            res.status(201).json({
                CommentId: createdComment.getValuesDedup().id,
                message: 'Created comment successfull'
            });
        })
        .catch(err => {
            err.statusCode = err.statusCode || 500;
            next(err);
        });
};

module.exports.getComments = async (req, res, next) => {
    const postId = req.query.postId;
    const userId = req.query.userId;
    const commentId = req.query.commentId;
    const pageNumber = req.query.pageNumber ?? 0;
    const pageSize = req.query.pageSize ?? 10;
    const where = {};
    if (postId) {
        where.PostId = postId;
    }
    if (userId) {
        where.UserId = userId;
    }
    if (commentId) {
        where.ParentId = commentId;
    }

    return await Comment
        .findAll({
            include: {
                model: Comment,
            },
            where,
            offset: pageNumber,
            limit: pageSize
        })
        .then(result => {
            return res.status(200).json(Sequelize.getValues(result));
        })
        .catch(err => {
            err.statusCode = err.statusCode || 500;
            next(err);
        });
};

module.exports.getComment = async (req, res, next) => {
    const commentId = req.params.commentId;

    return await Comment
        .findByPk(commentId, {
            include: Comment
        })
        .then(result => {
            if (!result) {
                const err = new Error('No such comment');
                err.statusCode = 404;
                throw err;
            }
            return res.status(200).json(result.getValues());
        })
        .catch(err => {
            err.statusCode = err.statusCode || 500;
            next(err);
        });
};

module.exports.updateComment = async (req, res, next) => {
    const commentId = req.params.commentId;
    const context = req.body.context;
    const deleted = req.body.deleted;

    const query = {};
    if (context) {
        query.context = context;
    }
    if (deleted) {
        query.deleted = deleted;
    }

    Comment.findByPk(commentId)
        .then(result => {
            if (!result) {
                const err = new Error('No such commnet');
                err.statusCode = 404;
                throw err;
            }
            if(result.UserId !== req.userId){
                const err = new Error('Not Authorized');
                err.statusCode = 401;
                throw err;
            }
            return Comment.update(query, { where: { id: commentId } });
        })
        .then(result => {
            if (!result[0]) {
                const err = new Error('Update failed');
                throw err;
            }
            return res.status(200).json({
                message: 'Updated comment successfull'
            });
        })
        .catch(err => {
            err.statusCode = err.statusCode || 500;
            next(err);
        });
};