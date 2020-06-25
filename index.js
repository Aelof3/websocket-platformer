
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

//const playerdata = [];

function onConnection(socket){
  socket.on('playermove', (data) => socket.broadcast.emit('playermove', data));
  //socket.on('playerenter', (data) => socket.broadcast.emit('playerenter', data));
  //socket.on('playerleave', (data) => socket.broadcast.emit('playerleave', data));
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));

