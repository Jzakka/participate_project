const _ = require('lodash');
const Post = require('../models/post');
const Tag = require('../models/tag');
const Participant = require('../models/participant');
const tag = require('../models/tag');
const postTag = require('../models/postTag');
const Sequelize = require('sequelize-values')();

module.exports.getPosts = async (req, res, next) => {
    const userId = req.query.userId;
    const boardId = req.query.boardId;
    const title = req.query.title;
    const tags = req.query.tag;
    const pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
    const pageSize = req.query.pageSize ? req.query.pageSize : 10;

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
        .then(foundPosts => Sequelize.getValuesDedup(foundPosts));

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

    await Post
        .findByPk(postId, {
            include: Tag
        })
        .then(foundOne => {
            const converted = foundOne.getValues().Tags.map(tag => {
                return tag.tagName;
            });
            return res.status(200).json({
                ...foundOne.getValuesDedup(), 
                Tags: converted
            });
        })
        .catch(err => {
            // console.log(err);
            return res.status(404).json({ Error: 'No such post' })
        });
}

// TODO 태그와 연관 짓는 데에 너무 많은 쿼리가 나감
module.exports.addPost = async (req, res, next) => {
    const userId = req.body.userId;
    const boardId = req.body.boardId;
    const title = req.body.title;
    const tags = req.body.tags;
    let dueDate = req.body.dueDate;
    let maxParticipants = req.body.maxParticipants;
    const context = req.body.context;

    if (!dueDate) {
        dueDate = new Date('2099-12-31');
    }
    if (!maxParticipants) {
        maxParticipants = 0;
    }

    const post = {
        title: title,
        UserId: userId,
        BoardId: boardId,
        context: context,
        dueDate: dueDate,
        maxParticipants: maxParticipants
    };

    const tagObjects = [];
    if (tags) {
        for (let tag of tags) {
            await Tag.findOrCreate({
                where: { tagName: tag }
            })
                .then(([tagValue]) => {
                    tagObjects.push(tagValue);
                });
        }
    }
    return Post
        .create(post)
        .then(async newPost => {
            if (maxParticipants) {
                await Participant.create({
                    UserId: userId,
                    PostId: newPost.id,
                    good: 0
                });
            }
            return newPost
                .setTags(tagObjects)
                .then(() => {
                    res.status(200).json({ PostId: newPost.id,message: 'Created post successfull'});
                })
        })
        .catch(err => {
            // console.log(err);
            res.status(400).json({ message: 'Failed to create post' });
        });
};

module.exports.updatePost = async (req, res, next) => {
    const postId = req.params.postId;
    const title = req.body.title;
    const tags = req.body.tags;
    let dueDate = req.body.dueDate;
    const context = req.body.context;

    if (!dueDate) {
        dueDate = new Date('2099-12-31');
    }

    const post = {
        title: title,
        context: context,
        dueDate: dueDate,
    };

    const tagObjects = [];
    if (tags) {
        for (let tag of tags) {
            await Tag.findOrCreate({
                where: { tagName: tag }
            })
                .then(([tagValue]) => {
                    tagObjects.push(tagValue);
                });
        }
    }
    
    return await Post
        .update(post, {
            where: { id: postId }
        })
        .then(() => {
            return Post
                .findByPk(postId)
                .then(async newPost => {
                    return newPost
                        .setTags(tagObjects)
                        .then(() => {
                            res.status(200).json({message: "Update post successfull"});
                        });
                })
                .catch(err => { throw err });
        })
        .catch(err => {
            // console.log(err);
            res.status(400).json({ message: 'Failed to update post' });
        });
};

module.exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;

    return await Post
        .destroy({ where: { id: postId } })
        .then(result => {
            if (!result) {
                throw new Error('No such post');
            }
            return res.status(200).json({ Message: 'Deleted post successful' });
        })
        .catch(err => {
            console.log(err);
            return res.status(404).json({ Error: 'No such post' });
        });
};