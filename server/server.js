const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const registerEvents = require('./sockets/Draw');

app.use('/', express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(__dirname, '/index.html');
});

io.on('connection', (socket) => {
  console.log(`a user connected at socket ${socket.id}`);
  registerEvents(io, socket);
})

const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});