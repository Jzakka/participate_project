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
    // console.log(post);
    return Post
        .create(post)
        .then(async newPost => {
            console.log(tagObjects);
            return newPost
                .setTags(tagObjects)
                .then(()=>{
                    console.log(newPost);
                })
                .then(async ()=>{
                    console.log(await newPost.getTags());
                })
                .then(() => {
                    res.status(200).json({ ...newPost.dataValues, Tags: tagObjects });
                })
        })
        .catch(err => {
            console.log(err);
            res.status(400).json({ Error: 'Cannot feed post' })
        });
};