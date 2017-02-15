const express = require('express')
const app = express()
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const userController = require('./controller/userController')

let server = http.createServer(app);
let io = socketio.listen(server);
server.listen(8080);

app.use(bodyParser.urlencoded({ extended: true}));;
app.use(bodyParser.json());
app.use(cookieParser());

//set up cookie check on initial. THIS BEFORE express static is important!
app.get('/', userController.checkCookie)

app.use(express.static(path.join(__dirname, '../public')));
console.log("Server running on http://localhost:8080");


///////////////////////////////////////////

//set up post request to sign up
app.post('/signup', userController.createUser)

//set up post request for log in
app.post('/login', userController.verifyUser)


// array of all lines drawn
var line_history = [];

// event-handler for new incoming connections
io.on('connection', function (socket) {
  
   // send drawing history to the new client
   for (var i in line_history) {     
      socket.emit('draw_line', { line: line_history[i] });
   }

   // add handler for message type "draw_line".
   socket.on('draw_line', function (data) {
      // add received line to history 
      line_history.push(data.line);
      
      // send line to all clients
      io.emit('draw_line', { line: data.line });
   });
});
