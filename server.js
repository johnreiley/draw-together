const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
let canvasState = {};

app.use('/', express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(__dirname, '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('join', canvasState);

  socket.on('draw', (state) => {
    canvasState = state;
    socket.broadcast.emit('draw', state);
  });

  socket.on('clear', () => {
    canvasState = {};
    io.emit('clear');
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  })
})

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});