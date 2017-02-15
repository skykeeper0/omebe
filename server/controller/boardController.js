const obj = require('./../model/models')
const Board = obj.Board;

const boardController = {

    // create boards table: assign board_id, owner_id, board_img
    // one user can create multiple white board therefore onwer_id is connect with user_id of user and
    // one multiple board with different board_id can have ssame owner_id
    createBoard(req, res) {

        // body contain owner_id and board_img FOR POSTMAN TESTING PURPOSE, may need to change
        const owner_id = req.body.owner_id;
        const board_img = req.body.board_img;

        Board
            .create({
                owner_id: owner_id,
                board_img: board_img,
            }).then( (user) => {
                res.send(' white board successfully created ');
                // res.end();
            }).catch( (err) => {
                console.log('This is an err: ' + err)
                res.status(500).end();
            })

        } 

}

module.exports = boardController;