const Board = require('../models/board');

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

module.exports.addBoard = async (req, res, next) => {
    const boardName = req.body.boardName;

    Board.create({ boardName: boardName })
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

module.exports.deleteBoard = async (req, res, next) => {
    const boardId = req.params.boardId;

    Board.findByPk(boardId)
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