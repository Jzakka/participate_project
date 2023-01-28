require('dotenv').config();

const Board = require('../models/board');
const User = require('../models/user');

module.exports.getBoards = async (req, res, next) => {
    const boardName = req.query.boardName;
    const where = {};
    if (boardName) {
        where.boardName = boardName;
    }

    const boards = await Board.findAll({
        where
    });

    return res.status(200).json(boards);
};

module.exports.addBoard = (req, res, next) => {
    const boardName = req.body.boardName;

    User.findByPk(req.userId)
        .then(user=>{
            if(!user){
                const err = new Error('No such user');
                err.statusCode = 404;
                throw err;
            }
            if(process.env.ADMIN_ADDRESS !== user.email){
                const err = new Error('Not authorized');
                err.statusCode = 401;
                throw err;
            }
            return  Board.create({ boardName: boardName });
        })
        .then(newBoard => {
            if (!newBoard) {
                const err = new Error('Failed to create board');
                throw err;
            }
            res.status(201).json({ BoardId: newBoard.id, message: "Created board successfull" });
        })
        .catch(err => {
            err.statusCode = err.statusCode || 500;
            next(err);
        });
};

module.exports.deleteBoard = (req, res, next) => {
    const boardId = req.params.boardId;

    User.findByPk(req.userId)
        .then(user=>{
            if(!user){
                const err = new Error('No such user');
                err.statusCode = 404;
                throw err;
            }
            if(process.env.ADMIN_ADDRESS !== user.email){
                const err = new Error('Not authorized');
                err.statusCode = 401;
                throw err;
            }
            return Board.findByPk(boardId);
        })
        .then(board => {
            if (!board) {
                const err = new Error('Failed to delete board');
                err.statusCode = 404;
                throw err;
            }
        })
        .then(result => {
            return Board.destroy({ where: { id: boardId } });
        })
        .then(result => {
            if (!result) {
                const err = new Error('Failed to delete board');
                throw err;
            }
            return res.status(200).json({ message: 'Deleted board successfull' });
        })
        .catch(err => {
            err.statusCode = err.statusCode || 500;
            next(err);
        });
};