const express = require('express');
const app = express();
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userController = require('./controller/userController');

let server = http.createServer(app);
let io = socketio.listen(server);
server.listen(8080);

app.use(express.static(path.join(__dirname, '../public')));

console.log("Server running on http://localhost:8080");

app.use(bodyParser.urlencoded({ extended: true}));;
app.use(bodyParser.json());
app.use(cookieParser());

///////////////////////////////////////////

//set up post request to sign up
app.post('/signup', userController.createUser);

//set up post request for log in
app.post('/login', userController.verifyUser);

//set up get request
app.get('/', userController.checkCookie, (req, res) => {
    res.render('../public/index.ejs');
  });

// array of all lines drawn
var lineHistory = [];

// event-handler for new incoming connections
io.on('connection', function (socket) {

  // send drawing history to the new client
  for (var i in lineHistory) {
    socket.emit('draw_line', { line: lineHistory[i] });
  }

  // add handler for message type "draw_line".
  socket.on('draw_line', function (data) {
    // add received line to history
    lineHistory.push(data.line);

    // send line to all clients
    io.emit('draw_line', { line: data.line });
  });
});
