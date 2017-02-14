const express = require('express');
const app = express();
const http = require('http');
const socketio = require('socket.io');

let server = http.createServer(app);
let io = socketio.listen(server);
const port = process.env.PORT || 8080;
server.listen(port);

app.use(express.static(__dirname + '/public'));
console.log('Server running!');



///////////////////////////////////////////

// array of all lines drawn
const lineHistory = [];

// event-handler for new incoming connections
io.on('connection', function (socket) {

  // send drawing history to the new client
  for (let i in lineHistory) {
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
