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
        include:[ {
            model: User,
            attributes: ['id'],
        },{
            model: Board,
            attributes: ['id'],
        },{
            model: Post,
            attributes: ['id'],
        }],
    };
    if(userId){
        query.include[0].where = {id: userId};
    }
    if(boardId){
        query.include[1].where = {id: boardId};
    }
    if(postId){
        query.include[2].where = {id: postId};
    }

    return await Tag
        .findAll()
        .then(found => {
            return res.status(200).json(found.map(tag => tag.tagName));
        })
        .catch(err => {
            console.log(err);
            return res.status(400).json({message: "An error occured"});
        });
};

module.exports.addTag = async (req,res,next)=>{
    const tagName =  req.body.tagName; 

    return await Tag
        .findOrCreate()
};