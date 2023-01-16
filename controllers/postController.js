const Post = require('../models/post');
const Tag = require('../models/tag');

module.exports.getPosts = async (req, res, next) => {
    const userId = req.query.userId;
    const boardId = req.query.boardId;
    const title = req.query.title;
    const tag = req.query.tag;
    const pageNumber = req.query.pageNumber ? req.query.pageNumber : 0;
    const pageSize = req.query.pageSize ? req.query.pageSize : 10;

    const where = {};
    if (userId) { where.UserId = +userId; }
    if (boardId) { where.BoardId = +boardId; }
    if (title) { where.title = title; }

    console.log(where);

    const posts = await Post.findAll({
        include: [{
            model: Tag,
        }],
        attributes: ['id'],
        where,
        offset: pageNumber,
        limit: pageSize
    });

    return res.status(200).json(posts);
};

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

    const tagObjects = tags.map(tag => {
        return {tagName: tag};
    });
    console.log(tagObjects);
    
    const post = {
        title: title,
        UserId: userId,
        BoardId: boardId,
        context: context,
        dueDate: dueDate,
        Tags: tagObjects,
        maxParticipants: maxParticipants
    };

    return await Post
        .create( post, {
            include: Tag
        })
        .then(async newPost => {
            // newPost.setTags(tagObjects);
            // console.log(await newPost.getTags());
            return res.status(200).json(newPost);
        })
        .catch(err => {
            console.log(err);
            res.status(400).json({ Error: 'Cannot feed post' })
        });
};