const express = require('express')
const app = express()
const http = require('http')
const socketio = require('socket.io')

let server = http.createServer(app);
let io = socketio.listen(server);
server.listen(8080);

app.use(express.static(__dirname + '/public'));
console.log("Server running on http://localhost:8080");

///////////////////////////////////////////

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