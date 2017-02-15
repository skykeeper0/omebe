const obj = require('./../model/models')
const SharedBoard = obj.SharedBoard;

const sharedBoardController = {

    createSharedBoard(req, res) {
        // body contain board_id and user_id FOR POSTMAN TESTING PURPOSE, may need to change
        const board_id = req.body.board_id;
        const user_id = req.body.user_id;

        SharedBoard
            .create({
                board_id: board_id,
                user_id: user_id,
            }).then( (user) => {
                res.send(' shared board successfully created ');
                // res.end();
            }).catch( (err) => {
                console.log('This is an err: ' + err)
                res.status(500).end();
            })

        } 
}

module.exports = sharedBoardController;