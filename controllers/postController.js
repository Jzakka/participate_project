const _ = require('lodash');
const { validationResult } = require('express-validator');

const Post = require('../models/post');
const Tag = require('../models/tag');
const Participant = require('../models/participant');
const Sequelize = require('sequelize-values')();

module.exports.getPosts = async (req, res, next) => {
    const userId = req.query.userId;
    const boardId = req.query.boardId;
    const title = req.query.title;
    const tags = req.query.tag;
    const pageNumber = req.query.pageNumber ?? 0;
    const pageSize = req.query.pageSize ?? 10;

    const where = {};
    if (userId) { where.UserId = +userId; }
    if (boardId) { where.BoardId = +boardId; }
    if (title) { where.title = title; }

    const query = {
        include: { model: Tag, attributes: ['tagName'] },
        attributes: ['id', 'title'],
        offset: pageNumber,
        limit: pageSize
    };
    if (!_.isEmpty(where)) {
        query.where = where;
    }

    const posts = await Post
        .findAll(query)
        .then(foundPosts => Sequelize.getValuesDedup(foundPosts))
        .catch(err => {
            err.statusCode ??= 500;
            return next(err);
        });

    let filtered = posts;
    if (tags) {
        filtered = posts.filter(post => {
            return tags.every(tag => {
                const converted = post.Tags
                    .map(tagObject => tagObject.tagName);
                return converted.includes(tag);
            });
        })
    }

    return res.status(200).json(filtered.map(element => {
        return {
            id: element.id, title: element.title
        };
    }));
};

module.exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    let foundPost;
    Post
        .findByPk(postId, {
            include: Tag
        })
        .then(foundOne => {
            if (!foundOne) {
                const err = new Error('No such post');
                err.statusCode = 404;
                throw err;
            }
            foundPost = foundOne;
            return foundOne.getValues().Tags.map(tag => {
                return tag.tagName;
            });
        })
        .then(converted => {
            res.status(200).json({
                ...foundPost.getValuesDedup(),
                Tags: converted
            });
        })
        .catch(err => {
            err.statusCode ??= 500;
            next(err);
        });
}

// TODO 태그와 연관 짓는 데에 너무 많은 쿼리가 나감
module.exports.addPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new Error('Input data is invalid');
        err.statusCode = 422;
        err.data = errors.array();
        next(err);
    }

    const userId = req.userId;
    const boardId = req.body.boardId;
    const title = req.body.title;
    const tags = req.body.tags;
    let dueDate = req.body.dueDate ?? new Date('2099-12-31');
    let maxParticipants = req.body.maxParticipants ?? 0;
    const context = req.body.context;

    const post = {
        title: title,
        UserId: userId,
        BoardId: boardId,
        context: context,
        dueDate: dueDate,
        maxParticipants: maxParticipants
    };

    const tagObjects = [];   
    Post
        .create(post)
        .then(newPost => {
            if (maxParticipants) {
                Participant.create({
                    UserId: userId,
                    PostId: newPost.id,
                    good: 0
                })
                    .then(result => {
                        return newPost;
                    });
            }
            return newPost;
        })
        .then(async result => {
            if (tags) {
                for (let tag of tags) {
                    await Tag
                        .findOrCreate({
                            where: { tagName: tag }
                        })
                        .then(([tagValue]) => {
                            tagObjects.push(tagValue);
                        });
                }
            }
            return result;
        })
        .then(async newPost => {
            await newPost.setTags(tagObjects);
            return newPost;
        })
        .then(newPost => {
            res.status(201).json({ PostId: newPost.id, message: 'Created post successfull' });
        })
        .catch(err => {
            err.statusCode ??= 500;
            next(err);
        });
};

module.exports.updatePost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = new Error('Input data is invalid');
        err.statusCode = 422;
        err.data = errors.array();
        next(err);
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const tags = req.body.tags;
    let dueDate = req.body.dueDate ?? new Date('2099-12-31');
    const context = req.body.context;

    const post = {
        title: title,
        context: context,
        dueDate: dueDate,
    };

    const tagObjects = [];

    let foundPost;
    Post.findByPk(postId)
        .then(result => {
            if (!result) {
                const err = new Error('No such post');
                err.statusCode = 404;
                throw err;
            }
            if (result.UserId !== req.userId) {
                const err = new Error('Not authorized');
                err.statusCode = 401;
                throw err;
            }
            foundPost = result;
            return Post.update(post, { where: { id: postId } });
        })
        .then(async result => {
            if (!result[0]) {
                const err = new Error('Failed to update post');
                throw err;
            }
            if (tags) {
                for (let tag of tags) {
                    await Tag
                        .findOrCreate({
                            where: { tagName: tag }
                        })
                        .then(([tagValue]) => {
                            tagObjects.push(tagValue);
                        });
                }
            }
        })
        .then(result=>{
            foundPost
                .setTags(tagObjects)
                .then(() => {
                    res.status(200).json({ message: "Update post successfull" });
                });
        })
        .catch(err => {
            err.statusCode ??= 500;
            next(err);
        });
};

module.exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;

    Post.findByPk(postId)
        .then(result => {
            if (!result) {
                const err = new Error('No such post');
                err.statusCode = 404;
                throw err;
            }
            if (result.UserId !== req.userId) {
                const err = new Error('Not authorized');
                err.statusCode = 401;
                throw err;
            }
            return Post.destroy({ where: { id: postId } });
        })
        .then(result => {
            if (!result) {
                const err = new Error('Failed to delete post');
                throw err;
            }
            return res.status(200).json({ Message: 'Deleted post successful' });
        })
        .catch(err => {
            err.statusCode ??= 500;
            next(err);
        });
};

module.exports.participate = async (req, res, next) => {
    const postId = req.params.postId;
    const userId = req.userId;
    const joinOrCancel = req.query.join;

    if (!joinOrCancel) {
        const err = new Error("joinOrCancel is not defined");
        err.statusCode = 400;
        throw err;
    }

    let foundPost;
    return Post
        .findByPk(postId, {
            attributes: ['maxParticipants', 'dueDate']
        })
        .then(result => {
            if (!result) {
                const err = new Error('No such post');
                err.statusCode = 404;
                throw err;
            }
            foundPost = result;
            return Participant.findOne(
                {
                    where: {
                        PostId: postId,
                        UserId: userId
                    }
                }
            );
        })
        .then(exists => {
            // Cancel from gather
            if (joinOrCancel === '0') {
                if (!exists) {
                    const err = new Error('You are not in participated');
                    err.statusCode = 400;
                    throw err;
                }
                return Participant
                    .destroy({
                        where: { PostId: postId, UserId: userId }
                    })
                    .then(destroyed => {
                        if (!destroyed) {
                            throw new Error('Failed to cancel participate');
                        }
                        return res.status(200).json({ message: 'Canceled successfull' });
                    });
            } else {
                if (exists) {
                    const err = new Error('You are already participated');
                    err.statusCode = 400;
                    throw err;
                }
            }
        })
        .then(result => {
            if (joinOrCancel === '0') {
                return result;
            }
            if (new Date() > new Date(foundPost.getValuesDedup().dueDate)) {
                const err = new Error('The due date is over');
                err.statusCode = 400;
                throw err;
            }
            return Participant.findAndCountAll({
                where: { postId: postId }
            });
        })
        .then(result => {
            if (joinOrCancel === '0') {
                return result;
            }
            if (result === foundPost.getValuesDedup().maxParticipants) {
                const err = new Error('The party is full');
                err.statusCode = 400;
                throw err;
            }
            return Post.update({
                maxParticipants: foundPost.getValuesDedup().maxParticipants + 1
            }, { where: { id: postId } });
        })
        .then(result => {
            if (joinOrCancel === '0') {
                return result;
            }
            if (!result[0]) {
                const err = new Error('Faild to update participants');
                throw err;
            }
            return Participant.create({ PostId: postId, UserId: userId, good: 0 });
        })
        .then(result => {
            if (joinOrCancel === '0') {
                return result;
            }
            if (!result) {
                const err = new Error('Faild to participate');
                throw err;
            }
            return res.status(200).json({ message: 'Joined successfull' });
        })
        .catch(err => {
            err.statusCode ??= 500;
            next(err);
        });
};