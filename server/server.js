const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userController = require('./controller/userController');
const boardController = require('./controller/boardController');

let server = http.createServer(app);
let io = require('socket.io').listen(server);

server.listen(8080);
console.log("Server running on http://localhost:8080");


app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true}));;

app.use(cookieParser());

////////////////////////////////////////////////////

//set up post request to sign up
app.post('/signup', userController.createUser, (req, res) => {
  //res.status(200).json({rType: 'registered', rData: {username: 'test'}});

  let username = req.body.username;
  setup_namespace(username,[]);

  res.cookie('session', req.encryptedCookie, {'maxAge': 3000000 }) //
  res.send({success: true});
});

//set up post request for log in
app.post('/login', userController.verifyUser, (req, res) => {
  //res.status(200).json({rType: 'registered', rData: {username: 'tsest'}});

  let username = req.body.username;
  setup_namespace(username,[]);

  res.cookie('session', req.encryptedCookie, {'maxAge': 3000000});
  res.send({success: true});
});

app.post('/logout', userController.logOut, (req, res) => {
  res.cookie('session', 'deleted', {'maxAge': -1});
  res.send({success: true});
});

app.post('/saveboard', boardController.createBoard, (req, res) => {
  res.send({success: true})
})

app.post('/loadboards', boardController.loadBoards, (req, res) => {
  if (req.noBoards) res.send({success: false})
  else res.status(200).render('../public/loadBoardsModal.ejs', {boards: req.boards});
})

app.post('/selectboard', boardController.selectBoard, (req,res) => {
  if (req.noBoardFound) res.send({success: false})
  else res.send({success: true, board_id: req.board_id, board_data: req.board_data})
})

//set up get request
app.get('/', userController.checkCookie, (req, res) => {
  //req.verifiedUser will be the name of the user
  //that will not exist if the check is not passed
  if(req.verifiedUser) {
    console.log(req.user_id);
    res.render('../public/loggedIn.ejs', {username: req.verifiedUser, user_id: req.user_id});
  }
  else {
    res.render('../public/index.ejs');
  }

});

// //================TESTING =============================
// //share request to sign up
// app.post('/share', (req, res) => {
//   //res.status(200).json({rType: 'registered', rData: {username: 'test'}});

//   let sharedname = req.body.username;
//   setup_namespace(username,[]);

//   res.cookie('session', req.encryptedCookie, {'maxAge': 3000000 }) //
//   res.send({success: true});
// });

//=====================================================


function setup_namespace(namespace = "", lineHistory) {
    var socketio = io.of('/' + namespace);
    socketio.on('connection', function (socket) {

      // send drawing history to the new client
      for (var i in lineHistory) {
        socket.emit('draw_line', { line: lineHistory[i] });
      }

      // add handler for message type "draw_line".
      socket.on('draw_line', function (data) {
        // add received line to history
        lineHistory.push(data.line);

        // send line to all clients
        socketio.emit('draw_line', { line: data.line });
      });
    });
    // return nsp;
}

setup_namespace("", []); // set up public namemspace


