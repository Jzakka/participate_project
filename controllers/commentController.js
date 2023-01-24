const _ = require('lodash');
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const Sequelize = require('sequelize-values')();

module.exports.addComment = async (req, res, next) => {
    const postId = req.body.postId;
    const userId = req.body.userId;
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
    if (await User.findByPk(userId) && await Post.findByPk(postId)) {
        let parent;
        if (commentId) {
            parent = await Comment.findByPk(commentId);
        }
        return await Comment
            .create(query)
            .then(async result => {
                // console.log(result.getValuesDedup());
                if (!result) {
                    return res.status(400).json({ message: 'Failed to create comment' });
                }
                if (parent) {
                    await parent.addComment(result)
                        .then(async addedResult => {
                            // console.log(addedResult);
                            // console.log(Sequelize.getValues((await parent.getComments())));
                        });
                }
                return res.status(201).json({
                    CommentId: result.getValuesDedup().id,
                    message: 'Created comment successfull'
                });
            })
    }
    return res.status(400).json({ message: 'Failed to create comment' });
};

module.exports.getComments = async (req, res, next) => {
    const postId = req.query.postId;
    const userId = req.query.userId;
    const commentId = req.query.commentId;
    const pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
    const pageSize = req.query.pageSize ? req.query.pageSize : 10;
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
            console.log(err);
            return res.status(400).json({
                message: 'An error occured'
            });
        });
};

module.exports.getComment = async (req, res, next) => {
    const commentId  = req.params.commentId;

    return await Comment
        .findByPk(commentId,{
            include: Comment
        })
        .then(result => {
            if(!result) throw new Error();
            return res.status(200).json(result.getValues());
        })
        .catch(err=>res.status(404).json({message: 'No such comment'}));
};

module.exports.updateComment = async (req,res,next)=>{
    const commentId = req.params.commentId;
    const context = req.body.context;
    const deleted = req.body.deleted;

    const query = {};
    if(context){
        query.context = context;
    }
    if(deleted){
        query.deleted = deleted;
    }

    return await Comment
        .update(query, {
            where:{
                id:commentId
            }
        })
        .then(result => {
            if(!result) throw new Error();
            return res.status(200).json({
                message: 'Updated comment successfull'
            });
        })
        .catch(err=>{
            console.log(err);
            return res.status(400).json({
                message: 'Failed to update comment'
            });
        });
};