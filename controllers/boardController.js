const Board = require('../models/board');

module.exports.getBoards = async (req, res, next) => {
    const boardName = req.query.boardName;
    const where = {};
    if(boardName){
        where.boardName = boardName;
    }

    const boards = await Board.findAll({
        where
    });

    return res.status(200).json(boards);
};

module.exports.addBoard = async (req, res, next) => {
    const boardName = req.body.boardName;
    // console.log(boardName);

    const newBoard =  await Board.create({boardName: boardName});

    if(!newBoard){
        return res.status(400).json({Error: 'Cannot create board'});
    }
    return res.status(200).json(newBoard);
};

module.exports.deleteBoard = async (req, res, next) => {
    const boardId = req.params.boardId;

    return await Board
    .destroy({boardId: boardId})
    .then(result => {
        if(!result){
            throw new Error('No Such boardId');
        }
        return res.status(200).json({Message: 'Deleted Successfull'});
    })
    .catch(err => {
        return res.status(404).json({Error: 'Cannot delete board'});
    });
};