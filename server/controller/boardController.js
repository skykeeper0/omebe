const obj = require('./../model/models')
const Board = obj.Board;

const boardController = {

    // create boards table: assign board_id, owner_id, board_img
    // one user can create multiple white board therefore onwer_id is connect with user_id of user and
    // one multiple board with different board_id can have ssame owner_id
    createBoard(req, res, next) {
        console.log('IN createBoard');
        // body contain owner_id and board_img FOR POSTMAN TESTING PURPOSE, may need to change
        const owner_id = req.body.user_id;
        const board_img = req.body.boardData;

        Board
            .create({
                owner_id,
                board_img
            }).then((user) => {
                next();
                // res.end();
            }).catch((err) => {
                console.log('This is an err: ' + err)
                res.status(500).end();
            })
        
    },
    loadBoards (req, res, next) {
        console.log('IN loadBoard');
        const owner_id = req.body.user_id;

        Board
            .findAll({
                where: {
                    owner_id
                }
            }).then((boards) => {
                if(!boards[0]){
                    req.noBoards = true;
                    next();
                }
                req.boards = boards.map((board) => {
                  return board.board_id;
                });
                next();
            }).catch((err) => {
                req.noBoards = true;
                next()
            })
    },
    selectBoard (req, res, next) {
        console.log('In selectBoard');
        const board_id = req.body.board_id;

        Board
            .findOne({
                where: {
                    board_id
                }
            }).then((board) => {
                req.board_id = board.board_id;
                req.board_data = board.board_img;
                next()
            }).catch((err) => {
                console.log(err);
                req.noBoardFound = true;
                next()
            })
    }

}

module.exports = boardController;